import React, { useState, useEffect } from 'react';
import { flagsAPI } from '../services/api.js';
import { Trash2, Flag, Plus, Shield, Link as LinkIcon, Layers } from 'lucide-react'; 

const FlagManagement = () => {
  const [flags, setFlags] = useState([]);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    link: '', 
    code: '', 
    points: '', 
    setNumber: '1' 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const data = await flagsAPI.getAll();
      setFlags(data);
    } catch (err) {
      console.error('Failed to load flags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedFlags = await flagsAPI.create(
        formData.title,
        formData.description,
        formData.link,
        formData.code, 
        parseInt(formData.points),
        parseInt(formData.setNumber)
      );
      setFlags(updatedFlags);
      // Clear form but keep set number
      setFormData(prev => ({ 
        title: '', description: '', link: '', code: '', points: '', setNumber: prev.setNumber 
      }));
    } catch (err) {
      alert('Failed to create flag. Check if code is unique.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        const updatedFlags = await flagsAPI.delete(id);
        setFlags(updatedFlags);
      } catch (err) {
        alert('Failed to delete flag');
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3 mb-2">
          <Flag className="text-ctf-red-500 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Task & Flag Manager</h2>
        </div>
        <p className="text-gray-400 text-sm">Add challenges to specific sets (1-6).</p>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto flex-1">
        <form onSubmit={handleSubmit} className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Set Selection */}
            <div>
              <label className="block text-sm font-medium text-ctf-red-400 mb-1">Select Set</label>
              <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-600">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, setNumber: num.toString() })}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                      formData.setNumber === num.toString()
                        ? 'bg-ctf-red-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Challenge Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Protocol Droid"
                className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:border-ctf-red-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              required
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:border-ctf-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Resource Link</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                className="w-full bg-gray-800 text-white rounded pl-10 pr-3 py-2 border border-gray-600 focus:border-ctf-red-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Flag Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="CTF{...}"
                className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:border-ctf-red-500 outline-none font-mono"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">Points</label>
                <input
                  type="number"
                  required
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:border-ctf-red-500 outline-none"
                />
              </div>
              <button type="submit" className="mt-6 bg-ctf-red-600 hover:bg-ctf-red-700 text-white p-2 rounded w-12 flex items-center justify-center">
                <Plus />
              </button>
            </div>
          </div>
        </form>

        {/* List */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map(setNum => {
            const setFlags = flags.filter(f => f.setNumber === setNum);
            if (setFlags.length === 0) return null;
            
            return (
              <div key={setNum} className="border border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-900 px-4 py-2 text-sm font-bold text-gray-400 border-b border-gray-700 flex items-center gap-2">
                  <Layers size={14} /> SET {setNum} ({setFlags.length} tasks)
                </div>
                <div className="divide-y divide-gray-700">
                  {setFlags.map(flag => (
                    <div key={flag._id} className="p-4 bg-gray-800/50 flex justify-between items-center group hover:bg-gray-800 transition-colors">
                      <div>
                        <div className="font-bold text-white">{flag.title}</div>
                        <div className="text-xs text-gray-500 font-mono">{flag.code}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-green-400 font-mono text-sm">{flag.points}pts</span>
                        <button onClick={() => handleDelete(flag._id)} className="text-gray-600 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlagManagement;
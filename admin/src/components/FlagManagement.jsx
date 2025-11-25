import React, { useState, useEffect } from 'react';
import { flagsAPI } from '../../../backend/src/services/api.js';
import { Trash2, Flag, Plus, Shield } from 'lucide-react'; 

const FlagManagement = () => {
  const [flags, setFlags] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '', points: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const data = await flagsAPI.getAll();
      setFlags(data);
    } catch (err) {
      console.error('Failed to load flags:', err);
      // Optional: Handle error state visibly if needed
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.code || !formData.points) {
      setError('All fields are required');
      return;
    }

    try {
      // Create the flag using the API
      const updatedFlags = await flagsAPI.create(
        formData.name, 
        formData.code, 
        parseInt(formData.points)
      );
      // The backend returns the sorted list of flags
      setFlags(updatedFlags);
      // Reset form
      setFormData({ name: '', code: '', points: '' });
    } catch (err) {
      setError(err.message || 'Failed to create flag');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flag?')) {
      try {
        const updatedFlags = await flagsAPI.delete(id);
        setFlags(updatedFlags);
      } catch (err) {
        alert('Failed to delete flag');
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden h-full">
      <div className="p-6 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3 mb-2">
          <Flag className="text-ctf-red-500 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Capture Flags</h2>
        </div>
        <p className="text-gray-400 text-sm">Create secret codes and assign points for capturing them.</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Create Flag Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">Challenge Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Root Access"
                className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:border-ctf-red-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-400 mb-1">Flag Code (Secret)</label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CTF{s3cr3t_c0d3}"
                  className="w-full bg-gray-800 text-white rounded pl-10 pr-3 py-2 border border-gray-600 focus:border-ctf-red-500 focus:outline-none font-mono text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Points</label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                placeholder="100"
                className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:border-ctf-red-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full bg-ctf-red-600 hover:bg-ctf-red-700 text-white p-2 rounded flex items-center justify-center transition-colors h-[42px]"
                title="Add Flag"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </form>

        {/* Flags List */}
        <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900/30 max-h-[400px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-900 text-gray-400 text-sm sticky top-0">
              <tr>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Flag Code</th>
                <th className="p-4 font-semibold">Points</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading flags...</td></tr>
              ) : flags.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">No flags created yet</td></tr>
              ) : (
                flags.map((flag) => (
                  <tr key={flag._id} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="p-4 font-medium text-white">{flag.name}</td>
                    <td className="p-4">
                      <code className="text-yellow-500 bg-gray-900 rounded px-2 py-1 text-sm font-mono border border-gray-700">
                        {flag.code}
                      </code>
                    </td>
                    <td className="p-4 text-green-400 font-bold">{flag.points} pts</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(flag._id)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded hover:bg-gray-800"
                        title="Delete Flag"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FlagManagement;
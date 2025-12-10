import React, { useState, useEffect } from 'react';
import { roundsAPI, groupsAPI } from '../services/api.js';
import { Play, Square, Clock, Key } from 'lucide-react';

const RoundControl = () => {
  const [currentRound, setCurrentRound] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSet, setSelectedSet] = useState('1'); 
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    try {
      const [roundData, groupsData] = await Promise.all([
        roundsAPI.getCurrent(),
        groupsAPI.getAll()
      ]);
      setCurrentRound(roundData);
      setGroups(groupsData || []);
    } catch (err) {
      console.error("Failed to load round data");
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartRound = async () => {
    if (!selectedGroup) return alert("Select a team first");
    setLoading(true);
    try {
      await roundsAPI.start(selectedGroup, parseInt(selectedSet));
      refreshData();
    } catch (error) {
      alert("Failed to start round");
    } finally {
      setLoading(false);
    }
  };

  const handleEndRound = async () => {
    if (!window.confirm("End current round?")) return;
    setLoading(true);
    try {
      await roundsAPI.end();
      refreshData();
    } catch (error) {
      alert("Failed to end round");
    } finally {
      setLoading(false);
    }
  };

  const availableGroups = groups.filter(g => !g.roundCompleted && !g.currentRound);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="text-ctf-red-500" /> Round Control
        </h3>
        {currentRound && currentRound.active && (
          <span className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-xs border border-green-800 animate-pulse">
            LIVE SET {currentRound.flagSet}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        {currentRound && currentRound.active ? (
          <div className="text-center space-y-4">
            
            {/* Session ID Display */}
            <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg animate-in zoom-in duration-300">
                <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                    <Key size={18} /> <span className="text-sm font-bold uppercase">Session Key</span>
                </div>
                <div className="text-4xl font-mono font-black text-white tracking-widest select-all cursor-pointer">
                    {currentRound.sessionId || "----"}
                </div>
                <div className="text-xs text-blue-500 mt-2">Share this code with players to unlock portal</div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">Active Team</div>
              <div className="text-2xl font-bold text-white">
                {currentRound.groupId?.name || "Unknown Team"}
              </div>
            </div>
            
            <button
              onClick={handleEndRound}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"
            >
              <Square fill="currentColor" size={20} /> TERMINATE ROUND
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">1. Select Team</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-3 focus:border-ctf-red-500 outline-none transition-colors"
              >
                <option value="">-- Choose Team from Queue --</option>
                {availableGroups.map(g => (
                  <option key={g._id} value={g._id}>
                    {g.name} ({g.players.length} players)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">2. Select Flag Set</label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(num => (
                  <button
                    key={num}
                    onClick={() => setSelectedSet(num.toString())}
                    className={`py-3 rounded-lg text-sm font-bold border transition-all ${
                      selectedSet === num.toString()
                        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                        : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    Set {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartRound}
              disabled={loading || !selectedGroup}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 mt-4"
            >
              <Play fill="currentColor" size={20} /> INITIATE ROUND
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundControl;
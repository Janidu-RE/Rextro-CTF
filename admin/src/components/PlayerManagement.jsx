import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Trash, UserPlus, Users, Search, RefreshCw, Smartphone, Clock } from 'lucide-react';
import { groupsAPI, roundsAPI } from '../services/api';

const PlayerManagement = () => {
  const { queue, groups, addPlayer, removePlayer, updateGroupTime, addPlayerToGroup, removePlayerFromGroup, createGroup } = useData();
  const { addToast } = useToast();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerWhatsapp, setNewPlayerWhatsapp] = useState('');
  const [activeTab, setActiveTab] = useState('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroups, setOpenGroups] = useState({});

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName || !newPlayerWhatsapp) {
      addToast('Please enter both player name and WhatsApp number', 'warning');
      return;
    }
    
    try {
      await addPlayer(newPlayerName, newPlayerWhatsapp);
      setNewPlayerName('');
      setNewPlayerWhatsapp('');
      addToast('Player Added Successfully', 'success');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        addToast(error.response.data.message || 'User already registered', 'error');
      } else {
        addToast('Failed to create player', 'error');
      }
    }
  };

  // Collapse state for groups
  const toggleGroup = (id) => {
    setOpenGroups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Sync time across all groups via backend
  const handleTimeSync = async (changedGroupId, newTime) => {
    try {
      const response = await fetch(
        `http://10.38.29.187:5001/api/groups/update-times/${changedGroupId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('ctf_token')}`
          },
          body: JSON.stringify({ startTime: newTime })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update group times');
      }
      addToast('Group times synced successfully', 'success');
    } catch (error) {
      console.error('Error updating group times:', error);
      addToast('Failed to update group times', 'error');
    }
  };

  // timezone-safe formatter
  const formatDateTimeLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const notificationMessages = {
    welcome: (playerName, startTime) =>
      `Welcome ${playerName}, Game will start at ${new Date(startTime).toLocaleTimeString()}`,
    reminder: (playerName, startTime) =>
      `Reminder ${playerName}: Your game will start in 15 minutes at ${new Date(startTime).toLocaleTimeString()}`,
    delay: (playerName, newTime) =>
      `Update ${playerName}: Game time changed to ${new Date(newTime).toLocaleTimeString()}`
  };

  const copyMessageToClipboard = (message) => {
    navigator.clipboard.writeText(message).then(() => {
      addToast('Message copied to clipboard!', 'success');
    });
  };

  // Helper to filter valid queue players (Not in group AND Not played yet)
  const validQueue = queue.filter(p => !p.groupId && !p.alreadyPlayed);

  return (
    <div className="space-y-6">

      {/* Add Player */}
      <div className="bg-gray-750 p-6 rounded-2xl border border-ctf-red-700">
        <h3 className="text-2xl font-bold text-ctf-red-400 mb-4">Add Player to Queue</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm font-medium mb-1 pl-1 uppercase tracking-wider">Operator Codename</label>
              <div className="relative">
                <Users className="absolute left-3 top-3.5 text-gray-500" size={18} />
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="e.g. Cipher"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm font-medium mb-1 pl-1 uppercase tracking-wider">Secure Comms (WhatsApp)</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3.5 text-gray-500" size={18} />
                <input
                  type="text"
                  value={newPlayerWhatsapp}
                  onChange={(e) => setNewPlayerWhatsapp(e.target.value)}
                  placeholder="077xxxxxxx"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500 font-mono"
                />
              </div>
            </div>
          </div>
        <button
          onClick={handleCreatePlayer}
          className="bg-ctf-red-600 hover:bg-ctf-red-700 px-6 py-3 rounded-lg text-white font-semibold text-lg w-full"
        >
          Add Player to Queue
        </button>
      </div>

      {/* Player Queue */}
      <div className="bg-gray-750 p-6 rounded-2xl border border-ctf-red-700">
        <h3 className="text-2xl font-bold text-ctf-red-400 mb-4">
          Player Queue ({validQueue.length} players)
        </h3>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {validQueue.map(player => (
            <div key={player._id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
              <div>
                <div className="text-white font-medium text-lg">{player.name}</div>
                <div className="text-gray-400 text-sm">{player.whatsapp}</div>
              </div>
              <button
                onClick={() => removePlayer(player._id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
          {validQueue.length === 0 && (
            <div className="text-gray-400 text-center py-8 text-lg">No players in queue</div>
          )}
        </div>
      </div>

      {/* Groups */}
      <div className="bg-gray-750 p-6 rounded-2xl border border-ctf-red-700">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-ctf-red-400">
            Teams ({groups.filter(g => !g.roundCompleted).length} active teams)
            </h3>
            <button
                onClick={() => {
                    if (window.confirm('Create a new empty team?')) {
                        createGroup();
                    }
                }}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2"
            >
                <span>+</span> Create New Team
            </button>
        </div>

        <div className="grid gap-6">
          {groups.filter(g => !g.roundCompleted).map((group, index) => (
            <div key={group._id} className="bg-gray-700 rounded-xl border border-ctf-red-800">

              {/* Header */}
              <button
                onClick={() => toggleGroup(group._id)}
                className="w-full flex justify-between items-center p-4 bg-gray-600 rounded-xl cursor-pointer"
              >
                <h4 className="text-white font-bold text-xl">{group.name}</h4>
                <span className="text-gray-300 text-sm">{group.players.length}/6 players</span>
                <span className="text-gray-300 text-xl">
                  {openGroups[group._id] ? "▲" : "▼"}
                </span>
              </button>

              {/* Collapsible Content */}
              {openGroups[group._id] && (
                <div className="p-6 space-y-6">

                  {/* GROUP TIME CONTROLS */}
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                      <label className="block text-gray-300 text-sm font-medium mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={16} /> Manage Team Timer
                      </label>
                      <div className="flex items-center gap-2">
                          <input 
                              type="number" 
                              placeholder="Min" 
                              id={`min-group-${group._id}`}
                              className="w-20 px-3 py-2 bg-gray-700 border border-gray-500 rounded text-white"
                          />
                          <span className="text-gray-400">:</span>
                          <input 
                              type="number" 
                              placeholder="Sec" 
                              id={`sec-group-${group._id}`}
                              className="w-20 px-3 py-2 bg-gray-700 border border-gray-500 rounded text-white"
                          />
                          <button 
                              onClick={async () => {
                                  const m = document.getElementById(`min-group-${group._id}`).value || 0;
                                  const s = document.getElementById(`sec-group-${group._id}`).value || 0;
                                  if(m == 0 && s == 0) return;
                                  
                                  try {
                                      await roundsAPI.addTime('group', group._id, m, s);
                                      addToast(`Added ${m}m ${s}s to Team`, 'success');
                                      document.getElementById(`min-group-${group._id}`).value = '';
                                      document.getElementById(`sec-group-${group._id}`).value = '';
                                  } catch(e) {
                                      addToast('Failed to add time', 'error');
                                  }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold"
                          >
                              ADD TO TEAM
                          </button>
                      </div>
                  </div>

                  {/* Start Time (Scheduling) - Keeping purely for reference or future scheduling features */}
                  {/* <div>...</div> */}

                  {/* Add Player ... */}
                  {group.players.length < 6 && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Add Player from Queue
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addPlayerToGroup(group._id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded text-white text-lg"
                      >
                        <option value="">Select player...</option>
                        {validQueue.map(player => (
                          <option key={player._id} value={player._id}>
                            {player.name} ({player.whatsapp})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Notifications ... (kept same) */}
                  

                  {/* Players */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Players in Team
                    </label>
                    <div className="space-y-2">
                      {group.players.map(player => (
                        <div key={player._id} className="flex justify-between items-center bg-gray-600 p-3 rounded">
                          <div>
                            <div className="text-white text-lg">{player.name}</div>
                            <div className="text-gray-400 text-sm">{player.whatsapp}</div>
                          </div>
                          <div className="flex items-center gap-2">
                              {/* Player Time Add */}
                              <div className="flex items-center gap-1 bg-gray-800 p-1 rounded">
                                  <input 
                                      type="number" 
                                      placeholder="M" 
                                      className="w-12 px-1 py-1 bg-gray-700 text-center text-white text-sm"
                                      id={`min-p-${player._id}`}
                                  />
                                  <input 
                                      type="number" 
                                      placeholder="S" 
                                      className="w-12 px-1 py-1 bg-gray-700 text-center text-white text-sm"
                                      id={`sec-p-${player._id}`}
                                  />
                                  <button
                                      onClick={async () => {
                                           const m = document.getElementById(`min-p-${player._id}`).value || 0;
                                           const s = document.getElementById(`sec-p-${player._id}`).value || 0;
                                           if(m == 0 && s == 0) return;
                                           
                                           try {
                                               await roundsAPI.addTime('player', player._id, m, s);
                                               addToast(`+${m}m ${s}s for ${player.name}`, 'success');
                                                document.getElementById(`min-p-${player._id}`).value = '';
                                                document.getElementById(`sec-p-${player._id}`).value = '';
                                           } catch(e) {
                                               addToast('Failed', 'error');
                                           }
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold"
                                  >
                                      ADD
                                  </button>
                              </div>

                              <button
                                onClick={() => removePlayerFromGroup(group._id, player._id)}
                                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white font-semibold"
                              >
                                Remove
                              </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))}

          {groups.filter(g => !g.roundCompleted).length === 0 && (
            <div className="text-gray-400 text-center py-8 text-lg">No active teams</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerManagement;
import React from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const RoundControl = () => {
  const { groups, currentRound, startRoundForGroup, endRound } = useData();
  const navigate = useNavigate();

  const activeGroups = groups.filter(g => !g.roundCompleted);

  const handleStartRound = (groupId) => {
    startRoundForGroup(groupId);
    navigate('/countdown');
  };

  return (
    <div className="space-y-6">
      {/* Round Status */}
      <div className="bg-gray-750 p-6 rounded-2xl border border-ctf-red-700">
        <h3 className="text-2xl font-bold text-ctf-red-400 mb-4">Round Status</h3>
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold mb-2 ${currentRound ? 'text-green-500' : 'text-red-500'}`}>
            {currentRound ? 'ROUND ACTIVE' : 'ROUND INACTIVE'}
          </div>
          {currentRound && (
            <div className="text-2xl text-white">
              Team {activeGroups.findIndex(g => g.id === currentRound.groupId) + 1} is playing
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/countdown')}
            disabled={!currentRound}
            className={`py-4 rounded-lg font-semibold text-lg ${
              !currentRound 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-ctf-red-600 hover:bg-ctf-red-700'
            } text-white`}
          >
            VIEW COUNTDOWN
          </button>
          <button
            onClick={endRound}
            disabled={!currentRound}
            className={`py-4 rounded-lg font-semibold text-lg ${
              !currentRound 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            END ROUND
          </button>
        </div>
      </div>

      {/* Team Selection */}
      <div className="bg-gray-750 p-6 rounded-2xl border border-ctf-red-700">
        <h3 className="text-2xl font-bold text-ctf-red-400 mb-4">Start Round for Team</h3>
        <div className="grid gap-4">
          {activeGroups.map((group, index) => (
            <div key={group.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
              <div>
                <div className="text-white font-bold text-xl">Team {index + 1}</div>
                <div className="text-gray-400">
                  {group.players.length} players • Starts at {new Date(group.startTime).toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={() => handleStartRound(group._id)}
                disabled={currentRound}
                className={`px-6 py-3 rounded-lg font-semibold text-lg ${
                  currentRound 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                START ROUND
              </button>
            </div>
          ))}
          {activeGroups.length === 0 && (
            <div className="text-gray-400 text-center py-8 text-lg">
              No teams available. Add players to form teams.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-750 p-6 rounded-2xl border border-ctf-red-700">
        <h3 className="text-2xl font-bold text-ctf-red-400 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/leaderboard')}
            className="bg-blue-600 hover:bg-blue-700 py-4 rounded-lg font-semibold text-lg text-white"
          >
            VIEW LEADERBOARD
          </button>
          <button
            onClick={() => {
              if (confirm('Clear all teams and queue? This cannot be undone.')) {
                // This would need to be implemented in the DataContext
                alert('Clear functionality to be implemented');
              }
            }}
            className="bg-red-600 hover:bg-red-700 py-4 rounded-lg font-semibold text-lg text-white"
          >
            CLEAR ALL DATA
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundControl;
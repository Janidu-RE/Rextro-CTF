import React, { useEffect, useState } from 'react';
import { gameAPI } from '../../../backend/src/services/api.js';
import { Trophy, Medal, Target } from 'lucide-react';

const Leaderboard = ({ minimal = false }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const result = await gameAPI.getLeaderboard();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error("Leaderboard fetch error", error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getRankStyle = (index) => {
    switch (index) {
      case 0: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 1: return 'bg-gray-400/20 text-gray-300 border-gray-400/50';
      case 2: return 'bg-amber-700/20 text-amber-600 border-amber-700/50';
      default: return 'bg-gray-800/50 text-gray-400 border-gray-700';
    }
  };

  const getIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-300" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 text-center font-mono font-bold">{index + 1}</span>;
  };

  if (loading && data.length === 0) {
    return <div className="text-center text-ctf-red-500 animate-pulse py-8">Loading rankings...</div>;
  }

  return (
    <div className={`w-full ${minimal ? '' : 'p-4'}`}>
      {!minimal && (
        <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-ctf-red-500 to-red-800 uppercase tracking-tighter filter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            Leaderboard
          </h1>
          <div className="h-1 w-24 bg-ctf-red-600 mx-auto mt-2 rounded-full"></div>
        </div>
      )}

      <div className="space-y-3 max-w-4xl mx-auto">
        {data.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-xl">
            No active or past round data found.
          </div>
        ) : (
          data.map((player, index) => (
            <div 
              key={player._id}
              className={`
                relative flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm transition-all duration-300
                hover:scale-[1.02] hover:bg-gray-800/80
                ${getRankStyle(index)}
              `}
            >
              {/* Rank & Name */}
              <div className="flex items-center gap-4 md:gap-6">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full bg-black/40 border border-white/10 shrink-0
                  ${index < 3 ? 'shadow-[0_0_15px_rgba(0,0,0,0.5)]' : ''}
                `}>
                  {getIcon(index)}
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className={`font-bold text-lg md:text-xl truncate ${index === 0 ? 'text-white' : 'text-gray-200'}`}>
                    {player.name}
                  </span>
                  <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                    <Target size={12} />
                    {player.solvedFlags?.length || 0} Flags Captured
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-2xl md:text-3xl text-white tracking-tight">
                  {player.score.toFixed(2)}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500">PTS</div>
              </div>

              {/* Glowing effect for top 3 */}
              {index < 3 && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
import React, { useEffect, useState } from 'react';
import { gameAPI } from '../services/api';
import { Trophy, Clock, Medal, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OverallLeaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverallLeaderboard();
  }, []);

  const fetchOverallLeaderboard = async () => {
    try {
      const data = await gameAPI.getOverallLeaderboard();
      setPlayers(data || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index) => {
    switch (index) {
      case 0: return "bg-yellow-500/20 border-yellow-500/50 text-yellow-500";
      case 1: return "bg-gray-400/20 border-gray-400/50 text-gray-400";
      case 2: return "bg-orange-600/20 border-orange-600/50 text-orange-600";
      default: return "bg-gray-800 border-gray-700 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
            <ArrowLeft size={20} /> Back
        </button>

        <div className="flex items-center justify-center gap-4 mb-12">
            <div className="bg-yellow-500/10 p-4 rounded-full border border-yellow-500/30">
                <Trophy size={48} className="text-yellow-500" />
            </div>
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tight">Hall of Fame</h1>
                <p className="text-gray-400 mt-1">Overall Rankings Across All Rounds</p>
            </div>
        </div>

        {loading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">Scanning Archives...</div>
        ) : (
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-800 text-left">
                                <th className="p-6 text-gray-400 font-bold uppercase text-sm tracking-wider">Rank</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-sm tracking-wider">Operator</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-sm tracking-wider">Score</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-sm tracking-wider">Flags</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-sm tracking-wider">Last Sync</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {players.map((player, index) => (
                                <tr key={player._id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-6">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border ${getRankStyle(index)}`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-bold text-lg">{player.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{player.whatsapp}</div>
                                        {player.alreadyPlayed && <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-red-900/30 text-red-400 border border-red-900/50">COMPLETED</span>}
                                    </td>
                                    <td className="p-6">
                                        <div className="font-mono text-2xl font-bold text-green-400">
                                            {player.score?.toFixed(2) || '0.00'}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Medal size={16} className="text-blue-500" />
                                            {player.solvedFlags?.length || 0}
                                        </div>
                                    </td>
                                    <td className="p-6 text-gray-500 font-mono text-sm">
                                        {player.lastSubmissionTime ? new Date(player.lastSubmissionTime).toLocaleString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {players.length === 0 && (
                    <div className="text-center py-20 text-gray-500">No records found</div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default OverallLeaderboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoundControl from '../components/RoundControl';
import { Clock, Trophy } from 'lucide-react';

const RoundManager = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-ctf-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-ctf-red-500">Round Manager</h1>
              <p className="text-gray-400">Round control access only</p>
            </div>
            <div className="flex items-center space-x-4">
              
              {/* Navigation Buttons */}
              <button 
                onClick={() => navigate('/countdown')}
                className="hidden md:flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm text-white transition-colors"
              >
                <Clock size={16} /> Countdown
              </button>
              <button 
                onClick={() => navigate('/leaderboard')}
                className="hidden md:flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm text-white transition-colors"
              >
                <Trophy size={16} /> Leaderboard
              </button>

              <div className="h-6 w-px bg-gray-700 mx-2 hidden sm:block"></div>

              <span className="text-gray-300 font-medium hidden sm:block">{user?.name}</span>
              <button
                onClick={logout}
                className="bg-ctf-red-600 hover:bg-ctf-red-700 px-4 py-2 rounded-lg text-white font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6">
          <div className="text-yellow-200 font-medium text-center">
            ⚡ Round Control Features Only - Player Management Disabled
          </div>
        </div>
        <RoundControl />
      </main>
    </div>
  );
};

export default RoundManager;
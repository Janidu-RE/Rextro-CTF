import React from 'react';
import { useAuth } from '../context/AuthContext';
import PlayerManagement from '../components/PlayerManagement';

const PlayerManager = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-ctf-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-ctf-red-500">Player Manager</h1>
              <p className="text-gray-400">Player management access only</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
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
            ⚡ Player Management Features Only - Round Control Disabled
          </div>
        </div>
        <PlayerManagement />
      </main>
    </div>
  );
};

export default PlayerManager;
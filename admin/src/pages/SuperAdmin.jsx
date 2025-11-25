import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PlayerManagement from '../components/PlayerManagement';
import RoundControl from '../components/RoundControl';
import FlagManagement from '../components/FlagManagement';
import { Flag, ArrowLeft } from 'lucide-react';

const SuperAdmin = () => {
  const { user, logout } = useAuth();
  const [showFlags, setShowFlags] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      {/* Header */}
      <header className="bg-gray-800 border-b border-ctf-red-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-ctf-red-500">CTF Super Admin</h1>
              <p className="text-gray-400 text-sm">System Command Center</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Toggle View Button */}
              <button
                onClick={() => setShowFlags(!showFlags)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors border border-gray-600"
              >
                {showFlags ? (
                  <>
                    <ArrowLeft size={18} />
                    <span>Back to Dashboard</span>
                  </>
                ) : (
                  <>
                    <Flag size={18} className="text-ctf-red-500" />
                    <span>Manage Flags</span>
                  </>
                )}
              </button>
              
              <div className="h-6 w-px bg-gray-700 mx-2 hidden sm:block"></div>

              <span className="text-gray-300 font-medium hidden sm:block">{user?.name}</span>
              <button
                onClick={logout}
                className="bg-ctf-red-600 hover:bg-ctf-red-700 border border-ctf-red-500 px-4 py-2 rounded-lg text-white text-sm transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {showFlags ? (
          /* Flag Management View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
             <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white pl-4 border-l-4 border-ctf-red-500">
                  Flag Configuration
                </h2>
             </div>
             <FlagManagement />
          </div>
        ) : (
          /* Dashboard View - Reverted to Original Layout */
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Player Management Section */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Player Management</h2>
                <PlayerManagement />
              </div>

              {/* Round Control Section */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Round Control</h2>
                <RoundControl />
              </div>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
};

export default SuperAdmin;
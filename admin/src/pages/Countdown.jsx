import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

import Leaderboard from './Leaderboard';

const Countdown = () => {
  const navigate = useNavigate();
  const { currentRound, groups, endRound, refreshData } = useData();
  const [timeLeft, setTimeLeft] = useState(currentRound?.remainingTime || 0);
  const [isLoading, setIsLoading] = useState(true);
  const countdownRef = useRef(null);

  // 1. FIXED: Force immediate data fetch on mount to get correct time
  useEffect(() => {
    const initData = async () => {
      try {
        await refreshData();
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to refresh data:", error);
        setIsLoading(false);
      }
    };
    initData();
  }, []); // Empty dependency array = runs once on mount

  // 2. Update timeLeft whenever currentRound changes (from the refresh above)
  useEffect(() => {
    if (currentRound?.remainingTime) {
      setTimeLeft(currentRound.remainingTime);
    }
  }, [currentRound]);

  // Smooth countdown timer
  useEffect(() => {
    if (!currentRound || currentRound.remainingTime <= 0) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    // Start countdown
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [currentRound]); // Re-runs if currentRound updates

  // Background Sync (keep this to fix drift)
  useEffect(() => {
    if (!currentRound) return;

    const syncInterval = setInterval(() => {
      refreshData();
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [currentRound, refreshData]);

  // Auto-navigate when round ends
  useEffect(() => {
    if (!isLoading && timeLeft === 0 && currentRound) {
      const timer = setTimeout(() => {
        refreshData();
        navigate('/leaderboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, currentRound, navigate, refreshData, isLoading]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopRound = async () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    await endRound();
    setTimeout(() => navigate('/leaderboard'), 1000);
  };

  const currentGroup = groups.find(g => g.id === currentRound?.groupId);
  const progress = currentRound ? (timeLeft / (20 * 60)) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-ctf-red-500 text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!currentRound) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl font-bold mb-4">No Active Round</div>
          <button
            onClick={() => navigate('/super-admin')}
            className="bg-ctf-red-600 hover:bg-ctf-red-700 px-6 py-3 rounded-lg text-white font-semibold text-lg"
          >
            Go to Control Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 flex flex-col">
      {/* Control Buttons - Fixed Top */}
      <div className="flex justify-between z-20 mb-4 px-4">
        <button
          onClick={() => navigate('/super-admin')}
          className="bg-ctf-red-600 hover:bg-ctf-red-700 px-6 py-2 rounded-lg text-white font-semibold text-lg"
        >
          ← Control Panel
        </button>
        <button
          onClick={handleStopRound}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-white font-semibold text-lg"
        >
          Stop Round
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto w-full">
          
          {/* LEFT: Countdown */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center w-full">
                <div className="text-ctf-red-500 text-3xl font-bold mb-6 uppercase tracking-widest animate-pulse">
                Round in Progress
                </div>
                
                {currentGroup && (
                <div className="text-white text-xl mb-6 bg-gray-800/50 py-2 px-6 rounded-full inline-block border border-gray-700">
                    Team {groups.findIndex(g => g.id === currentGroup.id) + 1} • {currentGroup.players.length} Players
                </div>
                )}

                <div className="text-white text-[10rem] leading-none font-mono font-bold mb-8 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                {formatTime(timeLeft)}
                </div>

                <div className="w-full max-w-md bg-gray-800 rounded-full h-4 mb-8 mx-auto overflow-hidden border border-gray-700">
                <div 
                    className="bg-ctf-red-600 h-4 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_#ef4444]"
                    style={{ width: `${progress}%` }}
                ></div>
                </div>
            </div>
          </div>

          {/* RIGHT: Live Leaderboard */}
          <div className="h-full bg-gray-900/30 rounded-2xl border border-gray-800 p-6 overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                Live Standings
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <Leaderboard minimal={true} />
            </div>
          </div>

      </div>

      {timeLeft === 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-green-500 text-6xl font-bold mb-4 animate-bounce">
              ROUND COMPLETED!
            </div>
            <div className="text-white text-2xl animate-pulse">
              Redirecting to final results...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Countdown;
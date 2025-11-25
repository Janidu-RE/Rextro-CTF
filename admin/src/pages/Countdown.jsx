import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Control Buttons */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <button
          onClick={() => navigate('/super-admin')}
          className="bg-ctf-red-600 hover:bg-ctf-red-700 px-6 py-3 rounded-lg text-white font-semibold text-lg"
        >
          ← Control Panel
        </button>
        <button
          onClick={handleStopRound}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-semibold text-lg"
        >
          Stop Round
        </button>
      </div>

      {/* Countdown Display */}
      <div className="text-center w-full max-w-4xl">
        <div className="text-ctf-red-500 text-4xl font-bold mb-8 uppercase tracking-widest">
          Round in Progress
        </div>
        
        {currentGroup && (
          <div className="text-white text-2xl mb-8">
            Team {groups.findIndex(g => g.id === currentGroup.id) + 1} - {currentGroup.players.length} Players
          </div>
        )}

        <div className="text-white text-9xl font-mono font-bold mb-8 transition-all duration-1000">
          {formatTime(timeLeft)}
        </div>

        <div className="w-96 bg-gray-800 rounded-full h-6 mb-8 mx-auto overflow-hidden">
          <div 
            className="bg-ctf-red-600 h-6 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {timeLeft === 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="text-green-500 text-6xl font-bold mb-4 animate-pulse">
              ROUND COMPLETED!
            </div>
            <div className="text-white text-2xl">
              Redirecting to leaderboard...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Countdown;
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
  return (
    <div className="min-h-screen bg-black flex flex-col p-4 overflow-hidden relative">
      {/* Control Buttons */}
      <div className="flex justify-between z-10 mb-4 px-4">
        <button
          onClick={() => navigate('/super-admin')}
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors border border-gray-700"
        >
          ← Control Panel
        </button>
        <button
          onClick={handleStopRound}
          className="bg-red-900/80 hover:bg-red-800 px-4 py-2 rounded-lg text-red-100 font-semibold border border-red-800 backdrop-blur-sm"
        >
          Stop Round
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-7xl mx-auto w-full">
        {/* Left Column: Countdown Timer */}
        <div className="flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-left duration-700">
            <div className="text-center">
                <div className="text-ctf-red-500 text-2xl font-bold mb-2 uppercase tracking-[0.2em] animate-pulse">
                Round in Progress
                </div>
                
                {currentGroup && (
                <div className="text-gray-400 text-xl font-medium tracking-wide">
                    Team {groups.findIndex(g => g.id === currentGroup.id) + 1} • {currentGroup.players.length} Operators
                </div>
                )}
            </div>

            {/* Timer Big Display */}
            <div className="relative">
                <div className="absolute -inset-10 bg-ctf-red-600/20 blur-[100px] rounded-full animate-pulse pointer-events-none"></div>
                <div className="text-white text-[150px] leading-none font-mono font-black tracking-tighter drop-shadow-[0_0_30px_rgba(220,38,38,0.6)] tabular-nums">
                {formatTime(timeLeft)}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md bg-gray-900 rounded-full h-4 overflow-hidden border border-gray-800 shadow-inner">
                <div 
                    className="bg-gradient-to-r from-ctf-red-600 to-red-500 h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            
            <div className="text-gray-500 font-mono text-sm mt-4">
                SESSION ID: <span className="text-white font-bold">{currentRound?.sessionId || "----"}</span>
            </div>
        </div>

        {/* Right Column: Live Leaderboard */}
        <div className="h-full max-h-[80vh] bg-gray-900/30 border border-gray-800 rounded-2xl p-6 backdrop-blur-md overflow-hidden flex flex-col animate-in slide-in-from-right duration-700 delay-100 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-yellow-500">🏆</span> Live Rankings
                </h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-green-400 font-mono uppercase tracking-widest">Real-time</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <Leaderboard minimal={true} />
            </div>
        </div>
      </div>

      {timeLeft === 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 animate-in fade-in duration-500">
          <div className="text-center scale-110">
            <div className="text-green-500 text-7xl font-bold mb-6 animate-bounce drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]">
              MISSION COMPLETE
            </div>
            <div className="text-white/80 text-2xl font-light tracking-widest animate-pulse">
              CALCULATING FINAL SCORES...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Countdown;
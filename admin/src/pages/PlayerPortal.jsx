import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { gameAPI } from '../services/api.js'; 
import Leaderboard from '../pages/Leaderboard.jsx';
import { Flag, LogIn, Trophy, AlertCircle, CheckCircle, LogOut, Clock, WifiOff, LayoutGrid, ArrowRight, Lock, Key } from 'lucide-react';

const PlayerPortal = () => {
  const navigate = useNavigate(); 

  // Try to recover session from localStorage
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('ctf_player');
    return saved ? JSON.parse(saved) : null;
  });

  const [sessionToken, setSessionToken] = useState(() => localStorage.getItem('ctf_session'));
  const [sessionInput, setSessionInput] = useState('');

  const [whatsapp, setWhatsapp] = useState('');
  const [flagCode, setFlagCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // --- COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // --- 1. VERIFY SESSION ON LOAD ---
  useEffect(() => {
    if (sessionToken) {
        verifySession(sessionToken);
    }
  }, []);

  const verifySession = async (token) => {
      try {
          // If verifySession endpoint exists, use it. 
          // Otherwise rely on login flow or implement verifySession in gameAPI
          if (gameAPI.verifySession) {
             await gameAPI.verifySession(token);
          }
      } catch (err) {
          console.error("Session Invalid");
          localStorage.removeItem('ctf_session');
          setSessionToken(null);
          setPlayer(null); 
      }
  };

  const handleSessionSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage({ type: '', text: '' });
      try {
          if (gameAPI.verifySession) {
            await gameAPI.verifySession(sessionInput.trim());
          }
          localStorage.setItem('ctf_session', sessionInput.trim());
          setSessionToken(sessionInput.trim());
      } catch (err) {
          setMessage({ type: 'error', text: 'Invalid or Expired Session ID' });
      } finally {
          setLoading(false);
      }
  };

  // --- 2. TIMER LOGIC ---
  useEffect(() => {
    if (!player || !sessionToken) return;

    const fetchGameStatus = async () => {
      try {
        if (!gameAPI.getStatus) {
          throw new Error("gameAPI.getStatus is undefined.");
        }

        const status = await gameAPI.getStatus();
        
        setConnectionError(false);

        if (status && status.active) {
          setRoundActive(true);
          setTimeLeft(prev => Math.abs(prev - status.remainingTime) > 2 ? status.remainingTime : prev);
        } else {
          setRoundActive(false);
          setTimeLeft(0);
        }
      } catch (error) {
        console.error("Timer Sync Failed:", error);
        setConnectionError(true);
        setRoundActive(false);
      }
    };

    fetchGameStatus();
    const syncInterval = setInterval(fetchGameStatus, 5000);
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(timerInterval);
    };
  }, [player, sessionToken]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!whatsapp.trim()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const playerData = await gameAPI.login(whatsapp);
      
      setPlayer(playerData);
      localStorage.setItem('ctf_player', JSON.stringify(playerData));
      setMessage({ type: 'success', text: 'Access Granted. Welcome, Operator.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Access Denied: Number not registered or server error.' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Flag Handler
  const handleSubmitFlag = async (e) => {
    e.preventDefault();
    if (!flagCode.trim()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await gameAPI.submitFlag(player._id, flagCode);
      
      const updatedPlayer = { ...player, score: response.newScore };
      setPlayer(updatedPlayer);
      localStorage.setItem('ctf_player', JSON.stringify(updatedPlayer));
      
      setMessage({ type: 'success', text: response.message });
      setFlagCode(''); 
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Invalid Flag' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if(window.confirm('Terminate session?')) {
      localStorage.removeItem('ctf_player');
      setPlayer(null);
      setWhatsapp('');
      setFlagCode('');
      setMessage({ type: '', text: '' });
    }
  };

  const renderTimerStatus = () => {
    if (connectionError) {
      return <span className="text-red-500 font-bold flex items-center gap-2 text-lg"><WifiOff size={20}/> CONNECTION LOST</span>;
    }
    if (roundActive) {
      return formatTime(timeLeft);
    }
    return "ROUND OFFLINE";
  };

  // --- RENDER 1: SESSION GATE (LOCKED) ---
  if (!sessionToken) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-red-900/10"></div>
            
            <div className="relative w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-red-900/50 rounded-2xl p-8 shadow-2xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-900/20 p-4 rounded-full border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.3)] animate-pulse">
                        <Lock size={48} className="text-red-500" />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">SYSTEM LOCKED</h1>
                <p className="text-gray-400 mb-8">Enter the session key provided by the administrator to access the mission portal.</p>

                <form onSubmit={handleSessionSubmit} className="space-y-6">
                    <div className="relative">
                        <Key className="absolute left-4 top-3.5 text-gray-500" size={20} />
                        <input 
                            type="text" 
                            value={sessionInput}
                            onChange={(e) => setSessionInput(e.target.value.toUpperCase())}
                            placeholder="SESSION KEY (e.g. X9J-22K)"
                            className="w-full bg-black/50 border border-gray-600 text-white text-xl pl-12 pr-4 py-3 rounded-lg focus:border-red-500 focus:outline-none transition-colors font-mono tracking-widest placeholder-gray-700"
                            required
                        />
                    </div>
                    {message.text && (
                        <div className="p-3 bg-red-900/30 text-red-400 rounded-lg text-sm font-bold border border-red-900/50">
                            {message.text}
                        </div>
                    )}
                    <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-red-900/20">
                        {loading ? 'VERIFYING...' : 'AUTHENTICATE SESSION'}
                    </button>
                </form>
            </div>
        </div>
      );
  }

  // --- RENDER 2: LOGIN SCREEN (SESSION UNLOCKED) ---
  if (!player) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-blue-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-black to-black"></div>

        <div className="relative w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">CTF PORTAL</h1>
            <p className="text-green-400 font-mono text-xs uppercase tracking-widest">SESSION VERIFIED • SECURE CONNECTION</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ctf-red-500 mb-2 uppercase tracking-widest text-center">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="077xxxxxxx"
                className="w-full bg-black/50 border border-gray-600 text-white text-xl px-4 py-3 rounded-lg focus:border-ctf-red-500 focus:outline-none transition-colors text-center font-mono placeholder-gray-700"
                required
              />
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg text-sm text-center font-medium animate-in fade-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'bg-green-900/30 text-green-400 border border-green-900/50'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ctf-red-600 hover:bg-ctf-red-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <span className="animate-pulse">Authenticating...</span> : <><LogIn size={20} /> INITIALIZE UPLINK</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER 3: GAME DASHBOARD ---
  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans">
      
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-gradient-to-br from-ctf-red-600 to-red-800 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center font-bold text-xl md:text-2xl shadow-lg shadow-red-900/20">
              {player.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg md:text-xl leading-none">{player.name}</div>
              <div className="text-[10px] md:text-xs text-ctf-red-500 font-mono mt-1 tracking-wider">OPERATOR STATUS: ACTIVE</div>
            </div>
          </div>
          
          {/* Desktop Timer Display */}
          <div className={`hidden md:flex items-center gap-3 bg-black/60 px-6 py-3 rounded-full border border-red-900/30 shadow-[0_0_15px_rgba(220,38,38,0.2)] ${connectionError ? 'border-red-500' : ''}`}>
             <Clock className={`w-6 h-6 ${roundActive ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
             <span className={`font-mono text-3xl font-black tracking-widest ${roundActive ? 'text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]' : 'text-gray-500'}`}>
               {renderTimerStatus()}
             </span>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-gray-500 text-[10px] uppercase tracking-widest">Current Score</div>
              <div className="font-mono text-2xl font-bold text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                {typeof player.score === 'number' ? player.score.toFixed(2) : '0.00'}
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-700 p-2 md:px-4 md:py-2 rounded-lg text-gray-400 hover:text-white transition-colors border border-gray-700"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Timer Bar */}
      <div className="md:hidden bg-gray-900/95 border-b border-red-900/30 py-3 sticky top-[73px] z-40 flex justify-center items-center gap-3 backdrop-blur transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
         <Clock className={`w-5 h-5 ${roundActive ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
         <span className={`font-mono text-2xl font-black tracking-widest ${roundActive ? 'text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]' : 'text-gray-500'}`}>
            {renderTimerStatus()}
         </span>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-12">
        <div className="sm:hidden bg-gray-900 rounded-xl p-4 border border-gray-800 flex justify-between items-center">
            <span className="text-gray-400 text-sm uppercase">Your Score</span>
            <span className="font-mono text-2xl font-bold text-green-400">{typeof player.score === 'number' ? player.score.toFixed(2) : '0.00'}</span>
        </div>

        {/* --- MAIN INTERACTION AREA: 2 COLUMNS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* 1. Flag Submission Section */}
          <div className={`bg-gray-900/50 border border-gray-700 rounded-2xl p-1 overflow-hidden relative group shadow-2xl transition-all duration-500 h-full ${!roundActive ? 'opacity-75 grayscale' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-ctf-red-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="bg-black/90 backdrop-blur rounded-xl p-6 md:p-8 relative z-10 h-full flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-white">
                <Flag className="text-ctf-red-500 w-6 h-6 md:w-8 md:h-8" /> 
                Submit Flag
              </h2>

              <form onSubmit={handleSubmitFlag} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={flagCode}
                    onChange={(e) => setFlagCode(e.target.value)}
                    placeholder={roundActive ? "CTF{...}" : "WAITING FOR ROUND START..."}
                    disabled={!roundActive}
                    className="w-full bg-gray-800 border-2 border-gray-700 text-white text-lg px-5 py-4 rounded-xl focus:border-ctf-red-500 focus:outline-none transition-all font-mono placeholder-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    autoComplete="off"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs font-mono hidden sm:block">
                    ENCRYPTED INPUT
                  </div>
                </div>

                {message.text && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 border ${message.type === 'error' ? 'text-red-400 bg-red-900/20 border-red-900/50' : 'text-green-400 bg-green-900/20 border-green-900/50'}`}>
                    {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !flagCode || !roundActive}
                  className="w-full bg-gradient-to-r from-ctf-red-600 to-red-800 hover:from-ctf-red-500 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 transition-all transform hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide"
                >
                  {loading ? 'Verifying Hash...' : (roundActive ? 'EXECUTE SUBMISSION' : 'SYSTEM OFFLINE')}
                </button>
              </form>
            </div>
          </div>

          {/* 2. CHALLENGES CARD - NEW HIGHLIGHTED SECTION */}
          <div 
            onClick={() => navigate('/challenges')}
            className="relative group bg-gray-900/50 border border-gray-700 rounded-2xl p-1 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all duration-300 shadow-2xl h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="bg-black/90 backdrop-blur rounded-xl h-full p-8 relative z-10 flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-6 bg-blue-900/20 rounded-full border border-blue-500/30 group-hover:border-blue-400 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500">
                    <LayoutGrid size={64} className="text-blue-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">MISSION FILES</h2>
                    <p className="text-gray-400 max-w-sm mx-auto">Access active challenge details, download artifacts, and view mission objectives.</p>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 group-hover:gap-4 transform group-hover:scale-105">
                    ACCESS CHALLENGES <ArrowRight size={20} />
                </button>
            </div>
          </div>

        </div>

        {/* Live Leaderboard Section */}
        <div className="pb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Trophy className="text-yellow-500 w-8 h-8 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            <h2 className="text-3xl font-bold text-white tracking-tight">Global Leaderboard</h2>
          </div>
          <Leaderboard />
        </div>

      </main>
    </div>
  );
};

export default PlayerPortal;
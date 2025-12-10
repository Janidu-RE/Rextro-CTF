import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'super_admin':
          navigate('/super-admin');
          break;
        case 'player_manager':
          navigate('/player-manager');
          break;
        case 'round_manager':
          navigate('/round-manager');
          break;
        default:
          navigate('/ctf-admin-portal');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userData = await login(username, password);
      
      // Redirect based on role
      switch (userData.role) {
        case 'super_admin':
          navigate('/super-admin');
          break;
        case 'player_manager':
          navigate('/player-manager');
          break;
        case 'round_manager':
          navigate('/round-manager');
          break;
        default:
          navigate('/ctf-admin-portal');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-ctf-red-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ctf-red-500 mb-2">CTF ADMIN</h1>
          <p className="text-gray-400 text-lg">Competition Control Panel</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-ctf-red-900 border border-ctf-red-700 text-ctf-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-ctf-red-500 focus:ring-1 focus:ring-ctf-red-500 text-lg"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-ctf-red-500 focus:ring-1 focus:ring-ctf-red-500 text-lg"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ctf-red-600 hover:bg-ctf-red-700 disabled:bg-ctf-red-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
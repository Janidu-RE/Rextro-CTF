import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import PlayerManager from './pages/PlayerManager';
import RoundManager from './pages/RoundManager';
import Countdown from './pages/Countdown';
import Leaderboard from './pages/Leaderboard';
import PlayerPortal from './pages/PlayerPortal';
import Challenges from './pages/Challenges';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider> 
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/ctf-admin-portal" element={<Login />} />

              <Route path="/challenges" element={<Challenges />} />
              
              {/* Protected Routes */}
              <Route 
                path="/super-admin" 
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SuperAdmin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/player-manager" 
                element={
                  <ProtectedRoute requiredRole="player_manager">
                    <PlayerManager />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/round-manager" 
                element={
                  <ProtectedRoute requiredRole="round_manager">
                    <RoundManager />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/countdown" 
                element={<Countdown />} 
              />
              <Route 
                path="/leaderboard" 
                element={<Leaderboard />} 
              />

              <Route
                path='/'
                element = {<PlayerPortal/>}
                />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
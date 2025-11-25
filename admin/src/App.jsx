import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import PlayerManager from './pages/PlayerManager';
import RoundManager from './pages/RoundManager';
import Countdown from './pages/Countdown';
import Leaderboard from './pages/Leaderboard';
import PlayerPortal from './pages/PlayerPortal';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
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
                path='player'
                element = {<PlayerPortal/>}
                />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
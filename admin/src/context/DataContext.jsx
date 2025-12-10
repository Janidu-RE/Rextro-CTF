import React, { createContext, useContext, useState, useEffect } from 'react';
import { playersAPI, groupsAPI, roundsAPI, setAuthToken } from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);
  const [loading, setLoading] = useState(false);

  // Set auth token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('ctf_token');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [playersData, groupsData, roundData] = await Promise.all([
        playersAPI.getAll(),
        groupsAPI.getAll(),
        roundsAPI.getCurrent()
      ]);

      setQueue(playersData.filter(p => !p.groupId));
      setGroups(groupsData);
      setCurrentRound(roundData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add player to queue
  const addPlayer = async (name, whatsapp) => {
    try {
      const players = await playersAPI.create(name, whatsapp);
      setQueue(players.filter(p => !p.groupId));
      
      // Reload groups to get any auto-assigned groups
      const updatedGroups = await groupsAPI.getAll();
      setGroups(updatedGroups);
    } catch (error) {
      throw error;
    }
  };

  // Remove player from queue or group
  const removePlayer = async (playerId) => {
    try {
      const players = await playersAPI.delete(playerId);
      setQueue(players.filter(p => !p.groupId));
      
      const updatedGroups = await groupsAPI.getAll();
      setGroups(updatedGroups);
    } catch (error) {
      throw error;
    }
  };

  // Update group start time
  const updateGroupTime = async (groupId, newTime) => {
    try {
      await groupsAPI.update(groupId, { startTime: newTime });
      const updatedGroups = await groupsAPI.getAll();
      setGroups(updatedGroups);
    } catch (error) {
      throw error;
    }
  };

  // Add player to existing group
  const addPlayerToGroup = async (groupId, playerId) => {
    try {
      const updatedGroups = await groupsAPI.addPlayer(groupId, playerId);
      setGroups(updatedGroups);
      
      // Update queue
      const players = await playersAPI.getAll();
      setQueue(players.filter(p => !p.groupId));
    } catch (error) {
      throw error;
    }
  };

  // Remove player from group (back to queue)
  const removePlayerFromGroup = async (groupId, playerId) => {
    try {
      const updatedGroups = await groupsAPI.removePlayer(groupId, playerId);
      setGroups(updatedGroups);
      
      // Update queue
      const players = await playersAPI.getAll();
      setQueue(players.filter(p => !p.groupId));
    } catch (error) {
      throw error;
    }
  };

  // Create a new manual group
  const createGroup = async () => {
    try {
      const updatedGroups = await groupsAPI.create();
      setGroups(updatedGroups);
    } catch (error) {
      throw error;
    }
  };

  // Start a round for a specific group
  const startRoundForGroup = async (groupId) => {
    try {
      const round = await roundsAPI.start(groupId);
      setCurrentRound(round);
    } catch (error) {
      throw error;
    }
  };

  // End current round
  const endRound = async () => {
    try {
      await roundsAPI.end();
      setCurrentRound(null);
      
      // Reload groups to update roundCompleted status
      const updatedGroups = await groupsAPI.getAll();
      setGroups(updatedGroups);
    } catch (error) {
      throw error;
    }
  };

  // Update round time
  const updateRoundTime = async (remainingTime) => {
    try {
      await roundsAPI.updateTime(remainingTime);
      setCurrentRound(prev => prev ? { ...prev, remainingTime } : null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    queue,
    groups,
    currentRound,
    loading,
    addPlayer,
    removePlayer,
    createGroup,
    updateGroupTime,
    addPlayerToGroup,
    removePlayerFromGroup,
    startRoundForGroup,
    endRound,
    updateRoundTime,
    refreshData: loadData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
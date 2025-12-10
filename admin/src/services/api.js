const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

let authToken = localStorage.getItem('token') || null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return authToken;
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const authAPI = {
  login: async (username, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) setAuthToken(data.token);
    return data;
  },
  logout: () => setAuthToken(null)
};

export const playersAPI = {
  getAll: () => apiRequest('/players'),
  create: (name, whatsapp) => apiRequest('/players', { method: 'POST', body: JSON.stringify({ name, whatsapp }) }),
  delete: (id) => apiRequest(`/players/${id}`, { method: 'DELETE' }),
};

export const groupsAPI = {
  getAll: () => apiRequest('/groups'),
  update: (id, data) => apiRequest(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateBulkTimes: (groupId, startTime) => apiRequest(`/groups/update-times/${groupId}`, { method: 'PUT', body: JSON.stringify({ startTime }) }),
  addPlayer: (groupId, playerId) => apiRequest(`/groups/${groupId}/players/${playerId}`, { method: 'POST' }),
  removePlayer: (groupId, playerId) => apiRequest(`/groups/${groupId}/players/${playerId}`, { method: 'DELETE' }),
};

export const roundsAPI = {
  getCurrent: () => apiRequest('/rounds/current'),
  start: (groupId, flagSet) => apiRequest('/rounds/start', { method: 'POST', body: JSON.stringify({ groupId, flagSet }) }),
  end: () => apiRequest('/rounds/end', { method: 'POST' }),
  updateTime: (remainingTime) => apiRequest('/rounds/update-time', { method: 'PUT', body: JSON.stringify({ remainingTime }) }),
};

export const flagsAPI = {
  getAll: () => apiRequest('/flags'),
  create: (title, description, link, code, points, setNumber) => 
    apiRequest('/flags', { method: 'POST', body: JSON.stringify({ title, description, link, code, points, setNumber }) }),
  delete: (id) => apiRequest(`/flags/${id}`, { method: 'DELETE' }),
};

export const gameAPI = {
  login: (whatsapp) => apiRequest('/game/login', { method: 'POST', body: JSON.stringify({ whatsapp }) }),
  submitFlag: (playerId, flagCode) => apiRequest('/game/submit', { method: 'POST', body: JSON.stringify({ playerId, flagCode }) }),
  getLeaderboard: () => apiRequest('/game/leaderboard'),
  getStatus: () => apiRequest('/game/status'),
  getChallenges: () => apiRequest('/game/challenges'),
  verifySession: (sessionId) => apiRequest('/game/verify-session', { method: 'POST', body: JSON.stringify({ sessionId }) }), // New
};
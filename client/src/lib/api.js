import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Redirect to login if on admin route
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API - removed /api prefix since it's in baseURL
export const authAPI = {
  login: (email, password) => api.post('/admin/login', { email, password }),
  getProfile: () => api.get('/admin/me'),
  changePassword: (currentPassword, newPassword) =>
    api.put('/admin/password', { currentPassword, newPassword }),
  register: (email, password, name) =>
    api.post('/admin/register', { email, password, name }),
};

// Candidates API
export const candidatesAPI = {
  getAll: () => api.get('/candidates'),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
};

// Vote API
export const voteAPI = {
  submit: (kingId, queenId, fingerprint) => 
    api.post('/vote', { kingId, queenId, fingerprint }),
  check: (fingerprint) => 
    api.get('/check', { params: { fingerprint } }),
};

// Results API
export const resultsAPI = {
  getAll: () => api.get('/results'),
  getSummary: () => api.get('/results/summary'),
};

// Settings API
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  getResultsAnnounced: () => api.get('/settings/results-announced'),
  setResultsAnnounced: (announced) => api.put('/settings/results-announced', { announced }),
  getVotingOpen: () => api.get('/settings/voting-open'),
  setVotingOpen: (open) => api.put('/settings/voting-open', { open }),
};

// Upload API
export const uploadAPI = {
  uploadPhoto: (file, candidateId) => {
    const formData = new FormData();
    formData.append('photo', file);
    if (candidateId) {
      formData.append('candidateId', candidateId);
    }
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;

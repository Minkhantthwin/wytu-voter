import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
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

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/admin/login', { email, password }),
  getProfile: () => api.get('/api/admin/me'),
  changePassword: (currentPassword, newPassword) =>
    api.put('/api/admin/password', { currentPassword, newPassword }),
  register: (email, password, name) =>
    api.post('/api/admin/register', { email, password, name }),
};

// Candidates API
export const candidatesAPI = {
  getAll: () => api.get('/api/candidates'),
  getById: (id) => api.get(`/api/candidates/${id}`),
  create: (data) => api.post('/api/candidates', data),
  update: (id, data) => api.put(`/api/candidates/${id}`, data),
  delete: (id) => api.delete(`/api/candidates/${id}`),
};

// Vote API
export const voteAPI = {
  submit: (kingId, queenId) => api.post('/api/vote', { kingId, queenId }),
  check: () => api.get('/api/check'),
};

// Results API
export const resultsAPI = {
  getAll: () => api.get('/api/results'),
  getSummary: () => api.get('/api/results/summary'),
};

// Settings API
export const settingsAPI = {
  getAll: () => api.get('/api/settings'),
  getResultsAnnounced: () => api.get('/api/settings/results-announced'),
  setResultsAnnounced: (announced) => api.put('/api/settings/results-announced', { announced }),
  getVotingOpen: () => api.get('/api/settings/voting-open'),
  setVotingOpen: (open) => api.put('/api/settings/voting-open', { open }),
};

// Upload API
export const uploadAPI = {
  uploadPhoto: (file, candidateId) => {
    const formData = new FormData();
    formData.append('photo', file);
    if (candidateId) {
      formData.append('candidateId', candidateId);
    }
    return api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;

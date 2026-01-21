import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Tests API
export const testsAPI = {
  getAll: () => api.get('/tests'),
  getById: (id) => api.get(`/tests/${id}`),
  getQuestions: (id) => api.get(`/tests/${id}/questions`),
  startTest: (id) => api.post(`/tests/${id}/start`),
  submitAnswer: (attemptId, data) => api.post(`/tests/attempts/${attemptId}/answer`, data),
  completeTest: (attemptId) => api.post(`/tests/attempts/${attemptId}/complete`),
  getHistory: () => api.get('/tests/user/history'),
};

// Reports API
export const reportsAPI = {
  generate: (data) => api.post('/reports/generate', data),
  getUserReports: () => api.get('/reports/user'),
  download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
};

// Payments API
export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getReports: () => api.get('/admin/reports'),
  getQuestions: () => api.get('/admin/questions'),
  addQuestion: (data) => api.post('/admin/questions', data),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (key, value) => api.put(`/admin/settings/${key}`, { value }),
  getStatistics: () => api.get('/admin/statistics'),
};

export default api;

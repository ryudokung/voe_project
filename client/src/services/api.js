import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Return standardized error format
    const errorMessage = error.response?.data?.message || 'An error occurred';
    const errorDetails = error.response?.data?.errors || [];
    
    return Promise.reject({
      message: errorMessage,
      errors: errorDetails,
      status: error.response?.status,
    });
  }
);

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Ideas API functions
export const ideasAPI = {
  getIdeas: (params) => api.get('/ideas', { params }),
  getIdea: (id) => api.get(`/ideas/${id}`),
  createIdea: (ideaData) => api.post('/ideas', ideaData),
  updateIdea: (id, ideaData) => api.put(`/ideas/${id}`, ideaData),
  voteIdea: (id, voteType) => api.post(`/ideas/${id}/vote`, { vote_type: voteType }),
  addComment: (id, comment) => api.post(`/ideas/${id}/comments`, comment),
};

// Categories and Departments API (temporary endpoints)
export const categoriesAPI = {
  getCategories: () => api.get('/admin/categories'),
};

export const departmentsAPI = {
  getDepartments: () => api.get('/admin/departments'),
};

// Dashboard API functions
export const dashboardAPI = {
  getOverview: (period = '30d') => api.get('/dashboard/overview', { params: { period } }),
  getDepartmentStats: (period = '30d') => api.get('/dashboard/departments', { params: { period } }),
};

// Admin API functions
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
};

export default api;

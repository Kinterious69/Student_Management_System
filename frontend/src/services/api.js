import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally - redirect to login
API.interceptors.response.use(
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

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  createAdmin: (data) => API.post('/auth/create-admin', data),
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentAPI = {
  getAll: (params) => API.get('/students', { params }),
  getOne: (id) => API.get(`/students/${id}`),
  create: (data) => API.post('/students', data),
  update: (id, data) => API.put(`/students/${id}`, data),
  delete: (id) => API.delete(`/students/${id}`),
  getEnrollments: (id) => API.get(`/students/${id}/enrollments`),
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getOne: (id) => API.get(`/courses/${id}`),
  create: (data) => API.post('/courses', data),
  update: (id, data) => API.put(`/courses/${id}`, data),
  delete: (id) => API.delete(`/courses/${id}`),
  getEnrollments: (id) => API.get(`/courses/${id}/enrollments`),
};

// ─── Enrollments ──────────────────────────────────────────────────────────────
export const enrollmentAPI = {
  getAll: (params) => API.get('/enrollments', { params }),
  getOne: (id) => API.get(`/enrollments/${id}`),
  create: (data) => API.post('/enrollments', data),
  update: (id, data) => API.put(`/enrollments/${id}`, data),
  delete: (id) => API.delete(`/enrollments/${id}`),
  getStats: () => API.get('/enrollments/stats'),
};

export default API;

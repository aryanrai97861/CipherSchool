import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Assignments ────────────────────────────────────────────
export const getAssignments = () => api.get('/assignments');
export const getAssignment = (id: string) => api.get(`/assignments/${id}`);

// ─── Query Execution ────────────────────────────────────────
export const executeQuery = (query: string) =>
  api.post('/query/execute', { query });

// ─── Hints ──────────────────────────────────────────────────
export interface HintRequest {
  question: string;
  userQuery?: string;
  errorMessage?: string;
  tableSchemas?: string;
}

export const getHint = (data: HintRequest) => api.post('/hints', data);

// ─── Auth ───────────────────────────────────────────────────
export const register = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export default api;

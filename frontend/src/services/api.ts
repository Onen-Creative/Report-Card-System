import axios from 'axios';
import type { AuthResponse, LoginRequest, TokenPair } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post<TokenPair>(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  refresh: async (refreshToken: string): Promise<TokenPair> => {
    const { data } = await api.post<TokenPair>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },
};

// Classes API
export const classesApi = {
  list: async (params?: { year?: number; term?: string }) => {
    const { data } = await api.get('/classes', { params });
    return data;
  },

  getLevels: async () => {
    const { data } = await api.get('/classes/levels');
    return data;
  },

  get: async (id: string) => {
    const { data } = await api.get(`/classes/${id}`);
    return data;
  },

  create: async (classData: unknown) => {
    const { data } = await api.post('/classes', classData);
    return data;
  },
};

// Students API
export const studentsApi = {
  list: async (params?: { class_id?: string; class_level?: string; term?: string; year?: number }) => {
    const { data } = await api.get('/students', { params });
    return data;
  },

  get: async (id: string) => {
    const { data } = await api.get(`/students/${id}`);
    return data;
  },

  create: async (studentData: any) => {
    const { data } = await api.post('/students', studentData);
    return data;
  },

  update: async (id: string, studentData: any) => {
    const { data } = await api.put(`/students/${id}`, studentData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/students/${id}`);
    return data;
  },
};

// Marks API
export const marksApi = {
  batchUpdate: async (marks: unknown[]) => {
    const { data } = await api.post('/marks/batch', { marks });
    return data;
  },

  getByClass: async (classId: string, params: { term: string; year: number }) => {
    const { data } = await api.get(`/classes/${classId}/marks`, { params });
    return data;
  },

  getByStudent: async (studentId: string) => {
    const { data } = await api.get(`/students/${studentId}/marks`);
    return data;
  },

  update: async (id: string, markData: any) => {
    const { data } = await api.put(`/marks/${id}`, markData);
    return data;
  },
};

// Reports API
export const reportsApi = {
  generate: async (params: { student_id?: string; class_id?: string; term: string; year: number }) => {
    const { data } = await api.post('/reports/generate', params);
    return data;
  },

  get: async (id: string) => {
    const { data } = await api.get(`/reports/${id}`);
    return data;
  },

  getByStudent: async (studentId: string) => {
    const { data } = await api.get(`/students/${studentId}/reports`);
    return data;
  },
};

// Users API
export const usersApi = {
  list: async () => {
    const { data } = await api.get('/users');
    return data;
  },

  create: async (userData: any) => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  update: async (id: string, userData: any) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};

// Schools API
export const schoolsApi = {
  list: async () => {
    const { data } = await api.get('/schools');
    return data;
  },

  get: async (id: string) => {
    const { data } = await api.get(`/schools/${id}`);
    return data;
  },

  create: async (schoolData: any) => {
    const { data } = await api.post('/schools', schoolData);
    return data;
  },

  update: async (id: string, schoolData: any) => {
    const { data } = await api.put(`/schools/${id}`, schoolData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/schools/${id}`);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/stats');
    return data;
  },
};

// Subjects API
export const subjectsApi = {
  list: async (params?: { level?: string }) => {
    const { data } = await api.get('/subjects', { params });
    return data;
  },

  create: async (subjectData: any) => {
    const { data } = await api.post('/subjects', subjectData);
    return data;
  },

  update: async (id: string, subjectData: any) => {
    const { data } = await api.put(`/subjects/${id}`, subjectData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/subjects/${id}`);
    return data;
  },
};

// Results API
export const resultsApi = {
  getByStudent: async (studentId: string, params?: { term?: string; year?: string }) => {
    const { data } = await api.get(`/students/${studentId}/results`, { params });
    return data;
  },

  createOrUpdate: async (resultData: any) => {
    const { data } = await api.post('/results', resultData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/results/${id}`);
    return data;
  },
};

// Audit Logs API
export const auditApi = {
  getRecentActivity: async (limit: number = 20) => {
    const { data } = await api.get('/audit/recent', { params: { limit } });
    return data;
  },
};

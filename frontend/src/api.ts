import axios from 'axios';
import { supabase } from './supabase';

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      
    }
    return Promise.reject(error);
  }
);

export default api;

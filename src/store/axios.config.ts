import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.params = { ...config.params, token };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if(response.data.success == false && response.data.message == "Unauthorized token" ){
      useAuthStore.getState().logout();
    }

    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 unauthorized
      if (error.response.status === 401) {
        useAuthStore.getState().logout();
      }
      
      // Handle other client errors (4xx)
      if (error.response.status >= 400 && error.response.status < 500) {
        console.error(`Client error: ${error.response.status}`, error.response.data);
      }
      
      // Handle server errors (5xx)
      if (error.response.status >= 500) {
        console.error(`Server error: ${error.response.status}`, error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
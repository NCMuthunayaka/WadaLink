import axios from 'axios';

// Base API URL with environment fallback
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  async (config) => {
    // In production: pull token from SecureStore
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with graceful fallback
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return custom error message
    const message =
      error.response?.data?.message || error.message || 'Network request failed';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

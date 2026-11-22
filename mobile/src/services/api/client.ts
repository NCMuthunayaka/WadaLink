import axios from 'axios';
import { env } from '@/config/env';
import { authToken, notifyUnauthorized } from './session';

// Keep the legacy client on the same configured URL as the primary HTTP client.
export const apiClient = axios.create({
  baseURL: env.apiUrl,
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

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request (unless the caller set its own header).
http.interceptors.request.use((config) => {
  const token = authToken.get();
  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// A 401 while we hold a token means it expired or was revoked. A wrong password
// on the login screen has no token yet, so it is not treated as an expiry.
http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && authToken.get()) {
      notifyUnauthorized();
    }
    return Promise.reject(error);
  },
);

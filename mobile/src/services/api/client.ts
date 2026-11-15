import axios from 'axios';
import { env } from '@/config/env';
import { authToken, notifyUnauthorized } from './session';

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
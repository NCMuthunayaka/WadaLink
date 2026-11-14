import axios from 'axios';
import { env } from '@/config/env';

// Used by the real (non-mock) gateways. Auth token handling is added in Step 5.
export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiError } from '@/services/api/helpers';

// One RTK Query API for the whole app. Each feature adds its endpoints with
// api.injectEndpoints(...) in src/services/api/<feature>.ts.
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: [
    'Equipment',
    'Provider',
    'Request',
    'Quotation',
    'Booking',
    'Reservation',
    'Notification',
    'Chat',
    'Review',
  ],
  endpoints: () => ({}),
});
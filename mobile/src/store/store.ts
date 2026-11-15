import { configureStore } from '@reduxjs/toolkit';
import { setUnauthorizedHandler } from '@/services/api/session';
import { api } from './api';
import equipmentReducer from './equipmentSlice';
import sessionReducer, { logout } from './sessionSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    equipment: equipmentReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

// A rejected token (expired or revoked) signs the user out everywhere.
setUnauthorizedHandler(() => {
  void store.dispatch(logout());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
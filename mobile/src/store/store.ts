import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import equipmentReducer from './equipmentSlice';

export const store = configureStore({
  reducer: {
    equipment: equipmentReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
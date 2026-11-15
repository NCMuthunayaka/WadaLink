import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { authGateway } from '@/services/api/auth';
import { toApiError, type ApiError } from '@/services/api/helpers';
import { authToken } from '@/services/api/session';
import { tokenStorage } from '@/services/tokenStorage';
import type { LoginInput, RegisterInput } from '@/types/auth';
import type { User } from '@/types/user';
import { api } from './api';

type SessionStatus = 'restoring' | 'signedOut' | 'signedIn';

interface SessionState {
  status: SessionStatus;
  user: User | null;
}

const initialState: SessionState = { status: 'restoring', user: null };

type ThunkConfig = { rejectValue: ApiError };

async function startSession(token: string): Promise<void> {
  authToken.set(token);
  await tokenStorage.set(token);
}

/** App start: reuse the stored JWT if there is one and it still works. */
export const restoreSession = createAsyncThunk<User | null, void, ThunkConfig>(
  'session/restore',
  async (_, { rejectWithValue }) => {
    const token = await tokenStorage.get();
    if (!token) return null;

    authToken.set(token);
    try {
      return await authGateway.me();
    } catch (e) {
      const error = toApiError(e);
      if (error.status === 401) {
        // Expired or revoked: forget it.
        authToken.set(null);
        await tokenStorage.clear();
      }
      return rejectWithValue(error);
    }
  },
);

export const login = createAsyncThunk<User, LoginInput, ThunkConfig>(
  'session/login',
  async (input, { rejectWithValue }) => {
    try {
      const { token, user } = await authGateway.login(input);
      await startSession(token);
      return user;
    } catch (e) {
      return rejectWithValue(toApiError(e));
    }
  },
);

export const register = createAsyncThunk<User, RegisterInput, ThunkConfig>(
  'session/register',
  async (input, { rejectWithValue }) => {
    try {
      const { token, user } = await authGateway.register(input);
      await startSession(token);
      return user;
    } catch (e) {
      return rejectWithValue(toApiError(e));
    }
  },
);

/** Re-read the user, e.g. to see whether a pending provider was approved. */
export const refreshUser = createAsyncThunk<User, void, ThunkConfig>(
  'session/refreshUser',
  async (_, { rejectWithValue }) => {
    try {
      return await authGateway.me();
    } catch (e) {
      return rejectWithValue(toApiError(e));
    }
  },
);

export const logout = createAsyncThunk<void, void>('session/logout', async (_, { dispatch }) => {
  authToken.set(null);
  await tokenStorage.clear();
  // Drop cached server data so the next account never sees the previous one's.
  dispatch(api.util.resetApiState());
});

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? 'signedIn' : 'signedOut';
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.status = 'signedOut';
      })
      // Sign out instantly; clearing storage finishes in the background.
      .addCase(logout.pending, (state) => {
        state.user = null;
        state.status = 'signedOut';
      })
      .addMatcher(
        isAnyOf(login.fulfilled, register.fulfilled, refreshUser.fulfilled),
        (state, action) => {
          state.user = action.payload;
          state.status = 'signedIn';
        },
      );
  },
});

type SessionRoot = { session: SessionState };
export const selectUser = (state: SessionRoot) => state.session.user;
export const selectSessionStatus = (state: SessionRoot) => state.session.status;

export default sessionSlice.reducer;
import type { ApiError } from '@/services/api/helpers';

type AuthAction = 'login' | 'register' | 'other';

/** Turns an ApiError into text a person can act on. */
export function authErrorMessage(error: unknown, action: AuthAction = 'other'): string {
  const e = error as Partial<ApiError> | undefined;

  if (e?.status === 'NETWORK') return 'Cannot reach the server. Check your connection and try again.';
  if (action === 'login' && e?.status === 401) return 'Email or password is incorrect. If you do not have an account, please register first.';
  if (action === 'register' && e?.status === 409) return 'Email already registered. Please use another email or log in.';
  // Everything else: show what the server said (FastAPI "detail"), if anything.
  return e?.message || 'Something went wrong. Please try again.';
}

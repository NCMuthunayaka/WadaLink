import type { ApiError } from '@/services/api/helpers';

type AuthAction = 'login' | 'register' | 'other';

/** Turns an ApiError into text a person can act on. */
export function authErrorMessage(error: unknown, action: AuthAction = 'other'): string {
  const e = error as Partial<ApiError> | undefined;

  if (e?.status === 'NETWORK') return 'Cannot reach the server. Check your connection and try again.';
  if (action === 'login' && (e?.status === 401 || e?.status === 400 || e?.status === 422)) {
    return 'Incorrect email or password.';
  }
  if (action === 'register' && e?.status === 409) return 'An account with this email already exists.';
  if (e?.status === 403) return e.message || 'This account cannot sign in right now.';
  return e?.message || 'Something went wrong. Please try again.';
}
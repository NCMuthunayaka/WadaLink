import type { User } from '@/types/user';

/** Which part of the app a signed-in user is allowed to see. */
export type AccessState = 'customer' | 'provider' | 'provider_pending' | 'suspended' | 'admin';

export function getAccessState(user: User): AccessState {
  if (user.accountStatus === 'suspended') return 'suspended';
  if (user.role === 'admin') return 'admin';
  if (user.role === 'customer') return 'customer';

  // The API does not expose providers.approval_status yet, so a provider whose
  // account_status is still "pending" is treated as waiting for approval.
  return user.accountStatus === 'pending' ? 'provider_pending' : 'provider';
}
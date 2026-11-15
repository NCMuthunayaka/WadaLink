import type { User } from '@/types/user';

/** Which part of the app a signed-in user is allowed to see. */
export type AccessState =
  | 'customer'
  | 'provider'
  | 'provider_setup'
  | 'provider_pending'
  | 'provider_rejected'
  | 'suspended'
  | 'admin';

export function getAccessState(user: User): AccessState {
  if (user.accountStatus === 'suspended') return 'suspended';
  if (user.role === 'admin') return 'admin';
  if (user.role === 'customer') return 'customer';

  // Providers: finish the profile first, then wait for admin approval.
  const profile = user.providerProfile;
  if (!profile || !profile.businessName) return 'provider_setup';
  if (profile.approvalStatus === 'pending') return 'provider_pending';
  if (profile.approvalStatus === 'rejected') return 'provider_rejected';
  return 'provider';
}
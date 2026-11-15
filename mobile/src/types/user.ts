import type { ID, ISODate } from './common';

// Mirrors users.role in the backend. One account has exactly one role.
export type Role = 'customer' | 'provider' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'pending';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

/** Provider-only data (providers table). */
export interface ProviderProfile {
  businessName?: string;
  bio?: string;
  experienceYears: number;
  hourlyRate?: number;
  serviceRadiusKm: number;
  approvalStatus: ApprovalStatus;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  accountStatus: AccountStatus;
  /** Present for providers once the backend returns it. */
  providerProfile?: ProviderProfile;
  createdAt: ISODate;
}
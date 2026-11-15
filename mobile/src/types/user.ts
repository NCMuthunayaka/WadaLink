import type { ID } from './common';

// Mirrors users.role and users.account_status in the backend.
// One account has exactly one role.
export type Role = 'customer' | 'provider' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'pending';

export interface User {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  accountStatus: AccountStatus;
}
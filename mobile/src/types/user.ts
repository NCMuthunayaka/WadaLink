import type { ID, ISODate } from './common';

export type Role = 'customer' | 'provider' | 'equipment_owner';

export interface User {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  /** One account can hold several roles (the profile hub lets you switch). */
  roles: Role[];
  activeRole: Role;
  createdAt: ISODate;
}
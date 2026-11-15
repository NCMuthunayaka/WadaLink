import type { User } from './user';

/** Roles a person can sign up as in the mobile app (admins are created elsewhere). */
export type AuthRole = 'customer' | 'provider';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: AuthRole;
}

export interface AuthSession {
  token: string;
  user: User;
}
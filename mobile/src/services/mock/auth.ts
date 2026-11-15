import type { AuthGateway } from '@/services/api/auth';
import { authToken } from '@/services/api/session';
import type { User } from '@/types/user';
import { clone, delay, mockError } from './utils';

// Demo accounts (all use the password "Password1!"):
//   customer@wedalink.test   customer
//   provider@wedalink.test   approved provider
//   pending@wedalink.test    provider waiting for approval
//   suspended@wedalink.test  suspended customer
//   admin@wedalink.test      admin (not supported in the mobile app)
interface MockAccount {
  user: User;
  password: string;
}

const CREATED = '2026-01-01T00:00:00Z';
const PASSWORD = 'Password1!';

const approvedProfile = {
  businessName: 'EcoVolt Solutions LLC',
  bio: 'Master electrician, 8+ years in residential and light industrial work.',
  experienceYears: 8,
  hourlyRate: 85,
  serviceRadiusKm: 15,
  approvalStatus: 'approved' as const,
};

const accounts: MockAccount[] = [
  {
    password: PASSWORD,
    user: {
      id: '1',
      name: 'Alex Morgan',
      email: 'customer@wedalink.test',
      phone: '+1 555-0184',
      role: 'customer',
      accountStatus: 'active',
      createdAt: CREATED,
    },
  },
  {
    password: PASSWORD,
    user: {
      id: '2',
      name: 'Marcus Rodriguez',
      email: 'provider@wedalink.test',
      role: 'provider',
      accountStatus: 'active',
      providerProfile: approvedProfile,
      createdAt: CREATED,
    },
  },
  {
    password: PASSWORD,
    user: {
      id: '3',
      name: 'Pending Provider',
      email: 'pending@wedalink.test',
      role: 'provider',
      accountStatus: 'active',
      providerProfile: { ...approvedProfile, businessName: 'Pending Pro Co', approvalStatus: 'pending' },
      createdAt: CREATED,
    },
  },
  {
    password: PASSWORD,
    user: {
      id: '4',
      name: 'Site Admin',
      email: 'admin@wedalink.test',
      role: 'admin',
      accountStatus: 'active',
      createdAt: CREATED,
    },
  },
  {
    password: PASSWORD,
    user: {
      id: '5',
      name: 'Suspended Customer',
      email: 'suspended@wedalink.test',
      role: 'customer',
      accountStatus: 'suspended',
      createdAt: CREATED,
    },
  },
];

let nextId = 100;
const TOKEN_PREFIX = 'mock-token-';

function accountFromToken(token: string | null): MockAccount {
  const id = token?.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : undefined;
  const account = accounts.find((a) => a.user.id === id);
  if (!account) throw mockError(401, 'Invalid or expired token');
  return account;
}

export const mockAuthGateway: AuthGateway = {
  async login({ email, password }) {
    await delay(400);
    const account = accounts.find((a) => a.user.email.toLowerCase() === email.trim().toLowerCase());
    if (!account || account.password !== password) {
      throw mockError(401, 'Incorrect email or password');
    }
    return { token: TOKEN_PREFIX + account.user.id, user: clone(account.user) };
  },

  async register(input) {
    await delay(500);
    const email = input.email.trim().toLowerCase();
    if (accounts.some((a) => a.user.email.toLowerCase() === email)) {
      throw mockError(409, 'Email already registered');
    }
    const user: User = {
      id: String(nextId++),
      name: input.name.trim(),
      email,
      phone: input.phone,
      role: input.role,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
    };
    accounts.push({ user, password: input.password });
    return { token: TOKEN_PREFIX + user.id, user: clone(user) };
  },

  async me() {
    await delay(250);
    return clone(accountFromToken(authToken.get()).user);
  },

  async saveProviderProfile(input) {
    await delay(400);
    const account = accountFromToken(authToken.get());
    if (account.user.role !== 'provider') throw mockError(403, 'Only providers have a provider profile');
    account.user.providerProfile = {
      ...input,
      // New providers start as pending until an admin approves them.
      approvalStatus: account.user.providerProfile?.approvalStatus ?? 'pending',
    };
    return clone(account.user);
  },
};
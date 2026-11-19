import type { AuthGateway } from '@/services/api/auth';
import { authToken } from '@/services/api/session';
import type { User } from '@/types/user';
import { clone, delay, mockError } from './utils';

// Demo accounts (all use the password "Password1!"):
//   customer@wedalink.test   customer
//   provider@wedalink.test   active provider
//   pending@wedalink.test    provider whose account_status is still "pending"
//   suspended@wedalink.test  suspended customer
//   admin@wedalink.test      admin (not supported in the mobile app)
interface MockAccount {
  user: User;
  password: string;
}

const PASSWORD = 'Password1!';

const accounts: MockAccount[] = [
  {
    password: PASSWORD,
    user: { id: '1', name: 'Alex Morgan', email: 'customer@wedalink.test', phone: '+1 555-0184', role: 'customer', accountStatus: 'active' },
  },
  {
    password: PASSWORD,
    user: { id: '2', name: 'Marcus Rodriguez', email: 'provider@wedalink.test', role: 'provider', accountStatus: 'active' },
  },
  {
    password: PASSWORD,
    user: { id: '3', name: 'Pending Provider', email: 'pending@wedalink.test', role: 'provider', accountStatus: 'pending' },
  },
  {
    password: PASSWORD,
    user: { id: '4', name: 'Site Admin', email: 'admin@wedalink.test', role: 'admin', accountStatus: 'active' },
  },
  {
    password: PASSWORD,
    user: { id: '5', name: 'Suspended Customer', email: 'suspended@wedalink.test', role: 'customer', accountStatus: 'suspended' },
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

  // Like the real API, register returns a token and the user straight away.
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
      // Mirrors the DB default: new providers wait for approval.
      accountStatus: input.role === 'provider' ? 'pending' : 'active',
    };
    accounts.push({ user, password: input.password });
    return { token: TOKEN_PREFIX + user.id, user: clone(user) };
  },

  async me() {
    await delay(250);
    return clone(accountFromToken(authToken.get()).user);
  },
};

/** Id of the signed-in mock user, so other mock services can scope data to them. */
export function mockCurrentUserId(): string | null {
  const token = authToken.get();
  return token?.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : null;
}
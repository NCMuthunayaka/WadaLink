import type { AuthSession } from '@/types/auth';
import type { AccountStatus, Role, User } from '@/types/user';

// Backend shapes, copied from the OpenAPI spec (UserResponse / AuthResponse).
// Keep them next to the mappers so a backend change only touches this file.
export interface UserDto {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  account_status: string;
}

export interface AuthResponseDto {
  access_token: string;
  token_type?: string;
  user: UserDto;
}

const ROLES: readonly string[] = ['customer', 'provider', 'admin'];
const ACCOUNT_STATUSES: readonly string[] = ['active', 'suspended', 'pending'];

// The API types role and account_status as plain strings, so check them here.
// An unknown value is a backend change we want to hear about, not silently accept.
function parseRole(value: string): Role {
  if (!ROLES.includes(value)) throw new Error(`Unexpected account role "${value}" from the server.`);
  return value as Role;
}

function parseAccountStatus(value: string): AccountStatus {
  if (!ACCOUNT_STATUSES.includes(value)) {
    throw new Error(`Unexpected account status "${value}" from the server.`);
  }
  return value as AccountStatus;
}

/** BIGINT ids become strings so the rest of the app has one ID type. */
export function mapUser(dto: UserDto): User {
  return {
    id: String(dto.user_id),
    name: dto.full_name,
    email: dto.email,
    phone: dto.phone ?? undefined,
    role: parseRole(dto.role),
    accountStatus: parseAccountStatus(dto.account_status),
  };
}

export function mapAuthResponse(dto: AuthResponseDto): AuthSession {
  return { token: dto.access_token, user: mapUser(dto.user) };
}

/** PostgreSQL NUMERIC values may reach JSON as strings ("85.00"). */
export function toNumber(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}
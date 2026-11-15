import type { AccountStatus, ApprovalStatus, ProviderProfile, Role, User } from '@/types/user';

// Backend (snake_case) shapes. Keep these next to the mappers so a backend
// change only touches this file.
export interface ProviderDto {
  business_name: string | null;
  bio: string | null;
  experience_years: number;
  hourly_rate: number | string | null;
  service_radius_km: number | string;
  approval_status: ApprovalStatus;
}

export interface UserDto {
  user_id: number | string;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  account_status: AccountStatus;
  created_at: string;
  provider?: ProviderDto | null;
}

/** MySQL DECIMAL columns usually reach JSON as strings ("85.00"). */
export function toNumber(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function mapProvider(dto: ProviderDto): ProviderProfile {
  return {
    businessName: dto.business_name ?? undefined,
    bio: dto.bio ?? undefined,
    experienceYears: dto.experience_years,
    hourlyRate: toNumber(dto.hourly_rate),
    serviceRadiusKm: toNumber(dto.service_radius_km) ?? 10,
    approvalStatus: dto.approval_status,
  };
}

/** BIGINT ids become strings so the rest of the app has one ID type. */
export function mapUser(dto: UserDto): User {
  return {
    id: String(dto.user_id),
    name: dto.full_name,
    email: dto.email,
    phone: dto.phone ?? undefined,
    role: dto.role,
    accountStatus: dto.account_status,
    providerProfile: dto.provider ? mapProvider(dto.provider) : undefined,
    createdAt: dto.created_at,
  };
}
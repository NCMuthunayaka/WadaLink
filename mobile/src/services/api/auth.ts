import { env } from '@/config/env';
import { mockAuthGateway } from '@/services/mock/auth';
import type { AuthSession, LoginInput, ProviderProfileInput, RegisterInput } from '@/types/auth';
import type { User } from '@/types/user';
import { http } from './client';
import { mapUser, type UserDto } from './mappers';

export interface AuthGateway {
  login(input: LoginInput): Promise<AuthSession>;
  register(input: RegisterInput): Promise<AuthSession>;
  me(): Promise<User>;
  saveProviderProfile(input: ProviderProfileInput): Promise<User>;
}

interface TokenDto {
  access_token: string;
  token_type?: string;
}

// `token` is passed explicitly right after login, before it is stored.
async function fetchMe(token?: string): Promise<User> {
  const { data } = await http.get<UserDto>(
    '/auth/me',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );
  return mapUser(data);
}

async function httpLogin(input: LoginInput): Promise<AuthSession> {
  const { data } = await http.post<TokenDto>('/auth/login', {
    email: input.email,
    password: input.password,
  });
  const user = await fetchMe(data.access_token);
  return { token: data.access_token, user };
}

const httpAuthGateway: AuthGateway = {
  login: httpLogin,

  async register(input) {
    await http.post('/auth/register', {
      full_name: input.name,
      email: input.email,
      password: input.password,
      phone: input.phone ?? null,
      role: input.role,
    });
    return httpLogin({ email: input.email, password: input.password });
  },

  me: () => fetchMe(),

  async saveProviderProfile(input) {
    await http.put('/providers/me', {
      business_name: input.businessName,
      bio: input.bio ?? null,
      experience_years: input.experienceYears,
      hourly_rate: input.hourlyRate ?? null,
      service_radius_km: input.serviceRadiusKm,
    });
    return fetchMe();
  },
};

export const authGateway: AuthGateway = env.useMock ? mockAuthGateway : httpAuthGateway;
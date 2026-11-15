import { env } from '@/config/env';
import { mockAuthGateway } from '@/services/mock/auth';
import type { AuthSession, LoginInput, RegisterInput } from '@/types/auth';
import type { User } from '@/types/user';
import { http } from './client';
import { mapAuthResponse, mapUser, type AuthResponseDto, type UserDto } from './mappers';

export interface AuthGateway {
  login(input: LoginInput): Promise<AuthSession>;
  register(input: RegisterInput): Promise<AuthSession>;
  me(): Promise<User>;
}

// Real backend: POST /api/auth/login, POST /api/auth/register, GET /api/auth/me.
// Login and register both return { access_token, token_type, user }.
const httpAuthGateway: AuthGateway = {
  async login(input) {
    const { data } = await http.post<AuthResponseDto>('/auth/login', {
      email: input.email,
      password: input.password,
    });
    return mapAuthResponse(data);
  },

  async register(input) {
    const { data } = await http.post<AuthResponseDto>('/auth/register', {
      full_name: input.name,
      email: input.email,
      password: input.password,
      phone: input.phone ?? null,
      role: input.role,
    });
    return mapAuthResponse(data);
  },

  async me() {
    const { data } = await http.get<UserDto>('/auth/me');
    return mapUser(data);
  },
};

export const authGateway: AuthGateway = env.useMock ? mockAuthGateway : httpAuthGateway;
import type { AuthRole } from '@/types/auth';

export type AuthStackParamList = {
  RoleSelection: undefined;
  Login: { role: AuthRole };
  Register: { role: AuthRole };
};

export type RootStackParamList = {
  // Signed out
  Auth: undefined;
  // Signed in (which one appears depends on getAccessState)
  CustomerTabs: undefined;
  ProviderTabs: undefined;
  AccountGate: undefined;
  // Development only
  UIKit: undefined;
};
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthRole } from '@/types/auth';

export type AuthStackParamList = {
  RoleSelection: undefined;
  Login: { role: AuthRole };
  Register: { role: AuthRole };
};

export type CustomerTabParamList = {
  Home: undefined;
  Jobs: undefined;
  Messages: undefined;
  Profile: undefined;
};

// The customer area is a stack so the request flow can cover the tab bar.
export type CustomerStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList> | undefined;
  CreateRequest: { requestId?: string; categoryId?: string } | undefined;
  AIResult: { requestId: string };
  MatchingProviders: { requestId: string };
};

export type RootStackParamList = {
  // Signed out
  Auth: undefined;
  // Signed in (which one appears depends on getAccessState)
  CustomerApp: undefined;
  ProviderTabs: undefined;
  AccountGate: undefined;
  // Development only
  UIKit: undefined;
};

export type CustomerStackScreenProps<T extends keyof CustomerStackParamList> = NativeStackScreenProps<
  CustomerStackParamList,
  T
>;

export type CustomerTabScreenProps<T extends keyof CustomerTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, T>,
  NativeStackScreenProps<CustomerStackParamList>
>;
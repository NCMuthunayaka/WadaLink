import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoadingState from '@/components/common/LoadingState';
import AccountGateScreen from '@/features/auth/screens/AccountGateScreen';
import ProviderSetupScreen from '@/features/auth/screens/ProviderSetupScreen';
import UIKitScreen from '@/features/dev/screens/UIKitScreen';
import AuthNavigator from '@/navigation/AuthNavigator';
import CustomerTabs from '@/navigation/CustomerTabs';
import ProviderTabs from '@/navigation/ProviderTabs';
import type { RootStackParamList } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreSession, selectSessionStatus, selectUser } from '@/store/sessionSlice';
import { getAccessState } from '@/utils/access';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectSessionStatus);
  const user = useAppSelector(selectUser);

  // On launch, try to resume the saved session.
  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  if (status === 'restoring') return <LoadingState label="Loading…" />;

  const access = user ? getAccessState(user) : null;
  const showGate =
    access === 'provider_pending' ||
    access === 'provider_rejected' ||
    access === 'suspended' ||
    access === 'admin';

  // Only the screens for the current state exist, so people can never navigate
  // to an area they are not allowed in.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {access === null ? <Stack.Screen name="Auth" component={AuthNavigator} /> : null}
      {access === 'customer' ? <Stack.Screen name="CustomerTabs" component={CustomerTabs} /> : null}
      {access === 'provider' ? <Stack.Screen name="ProviderTabs" component={ProviderTabs} /> : null}
      {access === 'provider_setup' ? <Stack.Screen name="ProviderSetup" component={ProviderSetupScreen} /> : null}
      {showGate ? <Stack.Screen name="AccountGate" component={AccountGateScreen} /> : null}
      {__DEV__ && access !== null ? <Stack.Screen name="UIKit" component={UIKitScreen} /> : null}
    </Stack.Navigator>
  );
}
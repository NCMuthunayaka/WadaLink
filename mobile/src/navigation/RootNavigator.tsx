import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountGateScreen from '@/features/auth/screens/AccountGateScreen';
import UIKitScreen from '@/features/dev/screens/UIKitScreen';
import AuthNavigator from '@/navigation/AuthNavigator';
import CustomerNavigator from '@/navigation/CustomerNavigator';
import ProviderTabs from '@/navigation/ProviderTabs';
import LoadingState from '@/components/common/LoadingState';
import type { RootStackParamList } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreSession, selectSessionStatus, selectUser } from '@/store/sessionSlice';
import { getAccessState } from '@/utils/access';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const sessionStatus = useAppSelector(selectSessionStatus);

  // On launch, try to resume the saved session.
  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  // Do not choose a navigator until persisted auth has been checked. This
  // prevents a stale/unknown session from flashing the protected app at boot.
  if (sessionStatus === 'restoring') {
    return <LoadingState label="Loading WedaLink…" />;
  }

  const access = user ? getAccessState(user) : null;
  const showGate = access === 'suspended' || access === 'admin';

  // Only the screens for the current state exist, so people can never navigate
  // to an area they are not allowed in.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {access === null ? <Stack.Screen name="Auth" component={AuthNavigator} /> : null}
      {access === 'customer' ? <Stack.Screen name="CustomerApp" component={CustomerNavigator} /> : null}
      {access === 'provider' ? <Stack.Screen name="ProviderTabs" component={ProviderTabs} /> : null}
      {showGate ? <Stack.Screen name="AccountGate" component={AccountGateScreen} /> : null}
      {__DEV__ && access !== null ? <Stack.Screen name="UIKit" component={UIKitScreen} /> : null}
    </Stack.Navigator>
  );
}

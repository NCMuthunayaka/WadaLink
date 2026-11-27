import QuotationSubmissionScreen from '@/features/quotations/screens/QuotationSubmissionScreen';
import NotificationsScreen from '@/features/notifications/screens/NotificationCenterScreen';
import ReviewsScreen from '@/features/reviews/screens/ReviewsScreen';
import ChatScreen from '@/features/chat/screens/ChatScreen';
import JobDetailScreen from '@/features/jobs/screens/JobDetailScreen';
import React, { useEffect } from 'react';
import MatchingProvidersScreen from '@/features/matching/screens/MatchingProvidersScreen';
import QuotationComparisonScreen from '@/features/quotations/screens/QuotationComparisonScreen';
import { EquipmentCatalogScreen, EquipmentDetailScreen } from '@/features/equipment/screens/EquipmentFlowScreens';
import EquipmentFormScreen from '@/features/equipment/screens/EquipmentFormScreen';
import ReservationsScreen from '@/features/equipment/screens/ReservationsScreen';
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
      {access !== null && !showGate && <Stack.Group>
        <Stack.Screen name="MatchingProviders" component={MatchingProvidersScreen} />
        <Stack.Screen name="QuotationComparison" component={QuotationComparisonScreen} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="QuotationSubmission" component={QuotationSubmissionScreen} />
        <Stack.Screen name="EquipmentCatalog" component={EquipmentCatalogScreen} />
        <Stack.Screen name="EquipmentDetail" component={EquipmentDetailScreen} />
        <Stack.Screen name="EquipmentForm" component={EquipmentFormScreen} />
        <Stack.Screen name="Reservations" component={ReservationsScreen} />
      </Stack.Group>}
{__DEV__ && access !== null ? <Stack.Screen name="UIKit" component={UIKitScreen} /> : null}
    </Stack.Navigator>
  );
}

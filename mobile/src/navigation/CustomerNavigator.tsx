import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MatchingProvidersScreen from '@/features/matching/screens/MatchingProvidersScreen';
import QuotationComparisonScreen from '@/features/quotations/screens/QuotationComparisonScreen';
import AIResultScreen from '@/features/requests/screens/AIResultScreen';
import CreateRequestScreen from '@/features/requests/screens/CreateRequestScreen';
import CustomerTabs from '@/navigation/CustomerTabs';
import type { CustomerStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

// Tabs plus the request flow screens, which cover the tab bar.
export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
      <Stack.Screen name="AIResult" component={AIResultScreen} />
      <Stack.Screen name="MatchingProviders" component={MatchingProvidersScreen} />
      <Stack.Screen name="QuotationComparison" component={QuotationComparisonScreen} />
    </Stack.Navigator>
  );
}

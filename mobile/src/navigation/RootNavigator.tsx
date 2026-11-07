import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProviderTabs from './ProviderTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Provider tab bar is the default root */}
      <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
    </Stack.Navigator>
  );
}

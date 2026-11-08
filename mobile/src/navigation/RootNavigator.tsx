import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UIKitScreen from '@/features/dev/screens/UIKitScreen';
import ProviderTabs from '@/navigation/ProviderTabs';
import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Temporary: open the UI kit preview first. Set to false once Step 3 is checked.
const SHOW_UI_KIT = true;

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={SHOW_UI_KIT ? 'UIKit' : 'ProviderTabs'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="UIKit" component={UIKitScreen} />
      <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
    </Stack.Navigator>
  );
}
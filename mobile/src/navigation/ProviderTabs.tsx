import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PlaceholderScreen from '@/components/common/PlaceholderScreen';
import type { IconName } from '@/components/ui/Icon';
import EquipmentManagementScreen from '@/features/equipment/screens/EquipmentManagementScreen';
import TabIcon from '@/navigation/TabIcon';
import { tabBarScreenOptions } from '@/navigation/tabBarOptions';

const Tab = createBottomTabNavigator();

const tabIcon =
  (name: IconName) =>
  ({ focused, color }: { focused: boolean; color: string }) => (
    <TabIcon name={name} focused={focused} color={color} />
  );

export default function ProviderTabs() {
  return (
    <Tab.Navigator screenOptions={tabBarScreenOptions}>
      <Tab.Screen name="Home" options={{ tabBarIcon: tabIcon('home') }}>
        {() => <PlaceholderScreen title="Home" icon="home" />}
      </Tab.Screen>

      <Tab.Screen name="Jobs" options={{ tabBarIcon: tabIcon('work') }}>
        {() => <PlaceholderScreen title="Jobs" icon="work" />}
      </Tab.Screen>

      <Tab.Screen
        name="Equipment"
        component={EquipmentManagementScreen}
        options={{ tabBarIcon: tabIcon('handyman') }}
      />

      <Tab.Screen name="Messages" options={{ tabBarIcon: tabIcon('chat-bubble-outline') }}>
        {() => <PlaceholderScreen title="Messages" icon="chat-bubble-outline" />}
      </Tab.Screen>

      <Tab.Screen name="Profile" options={{ tabBarIcon: tabIcon('account-circle') }}>
        {() => <PlaceholderScreen title="Profile" icon="account-circle" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
import JobsScreen, { ProviderHomeScreen, ConversationsScreen } from '@/features/jobs/screens/JobsScreen';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { FleetScreen as EquipmentManagementScreen } from '@/features/equipment/screens/EquipmentFlowScreens';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import { tabIcon } from '@/navigation/TabIcon';
import { tabBarScreenOptions } from '@/navigation/tabBarOptions';

const Tab = createBottomTabNavigator();

export default function ProviderTabs() {
  return (
    <Tab.Navigator screenOptions={tabBarScreenOptions}>
      <Tab.Screen name="Home" options={{ tabBarIcon: tabIcon('home') }}>
        {() => <ProviderHomeScreen/>}
      </Tab.Screen>

      <Tab.Screen name="Jobs" options={{ tabBarIcon: tabIcon('work') }}>
        {() => <JobsScreen/>}
      </Tab.Screen>

      <Tab.Screen
        name="Equipment"
        component={EquipmentManagementScreen}
        options={{ tabBarIcon: tabIcon('handyman') }}
      />

      <Tab.Screen name="Messages" options={{ tabBarIcon: tabIcon('chat-bubble-outline') }}>
        {() => <ConversationsScreen/>}
      </Tab.Screen>

      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: tabIcon('account-circle') }} />
    </Tab.Navigator>
  );
}

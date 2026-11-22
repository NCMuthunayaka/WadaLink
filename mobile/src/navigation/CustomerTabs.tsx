import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotificationCenterScreen from '@/features/notifications/screens/NotificationCenterScreen';
import CustomerHomeScreen from '@/features/requests/screens/CustomerHomeScreen';
import MyRequestsScreen from '@/features/requests/screens/MyRequestsScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import { tabIcon } from '@/navigation/TabIcon';
import { tabBarScreenOptions } from '@/navigation/tabBarOptions';
import type { CustomerTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

export default function CustomerTabs() {
  return (
    <Tab.Navigator screenOptions={tabBarScreenOptions}>
      <Tab.Screen name="Home" component={CustomerHomeScreen} options={{ tabBarIcon: tabIcon('home') }} />
      <Tab.Screen name="Jobs" component={MyRequestsScreen} options={{ tabBarIcon: tabIcon('work') }} />
      <Tab.Screen name="Messages" component={NotificationCenterScreen} options={{ title: 'Updates', tabBarIcon: tabIcon('notifications') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: tabIcon('account-circle') }} />
    </Tab.Navigator>
  );
}

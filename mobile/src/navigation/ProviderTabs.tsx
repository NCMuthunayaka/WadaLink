import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, shadow } from '../constants/theme';
import EquipmentManagementScreen from '../features/equipment/screens/EquipmentManagementScreen';

const Tab = createBottomTabNavigator();

// ── Stub screens ────────────────────────────────────────────────────────────

function StubScreen({ label, icon }: { label: string; icon: string }) {
  return (
    <View style={stub.container}>
      <Text style={stub.icon}>{icon}</Text>
      <Text style={stub.label}>{label}</Text>
      <Text style={stub.sub}>Coming soon</Text>
    </View>
  );
}

const stub = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6FA' },
  icon: { fontSize: 48, marginBottom: 12 },
  label: { fontSize: 20, fontWeight: '700' as const, color: '#111827' },
  sub: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
});

// ── Tab icon component ───────────────────────────────────────────────────────

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Text style={tabStyles.emoji}>{emoji}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconWrapActive: {
    backgroundColor: colors.primaryLight,
  },
  emoji: {
    fontSize: 18,
  },
});

// ── Provider Bottom Tab Navigator ────────────────────────────────────────────

export default function ProviderTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
          ...shadow.sm,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.semibold,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      >
        {() => <StubScreen label="Home" icon="🏠" />}
      </Tab.Screen>

      <Tab.Screen
        name="Jobs"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💼" focused={focused} />,
        }}
      >
        {() => <StubScreen label="Jobs" icon="💼" />}
      </Tab.Screen>

      <Tab.Screen
        name="Equipment"
        component={EquipmentManagementScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔧" focused={focused} />,
          tabBarLabel: 'Equipment',
        }}
      />

      <Tab.Screen
        name="Messages"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} />,
        }}
      >
        {() => <StubScreen label="Messages" icon="💬" />}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      >
        {() => <StubScreen label="Profile" icon="👤" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

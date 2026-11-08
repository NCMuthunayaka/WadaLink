import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { colors, fontFamily, fontSize, shadow } from '@/constants/theme';

// Shared by CustomerTabs, ProviderTabs and EquipmentOwnerTabs.
// No fixed height: React Navigation adds the bottom safe-area inset itself.
export const tabBarScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    ...shadow.sm,
  },
  tabBarLabelStyle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
  },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
};
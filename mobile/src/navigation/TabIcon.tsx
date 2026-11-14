import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon, { type IconName } from '@/components/ui/Icon';
import { colors, radius } from '@/constants/theme';

interface TabIconProps {
  name: IconName;
  focused: boolean;
  color: string;
}

export default function TabIcon({ name, focused, color }: TabIconProps) {
  return (
    <View style={[styles.wrap, focused && styles.wrapActive]}>
      <Icon name={name} size={22} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 48,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  wrapActive: { backgroundColor: colors.primaryLight },
});
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { radius, spacing, statusColors, statusLabels } from '@/constants/theme';
import type { EquipmentStatus } from '@/types/equipment';

interface StatusBadgeProps {
  status: EquipmentStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const palette = statusColors[status];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, isSmall && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: palette.dot }, isSmall && styles.dotSm]} />
      <Text variant="labelSm" color={palette.text} style={isSmall && styles.labelSm}>
        {statusLabels[status].toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    gap: 6,
  },
  badgeSm: { paddingHorizontal: 6, paddingVertical: 2, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotSm: { width: 5, height: 5, borderRadius: 2.5 },
  labelSm: { fontSize: 9 },
});
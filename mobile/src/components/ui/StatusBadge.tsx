import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing, statusColors, statusLabels } from '../../constants/theme';
import type { EquipmentStatus } from '../../types/equipment';

interface StatusBadgeProps {
  status: EquipmentStatus;
  size?: 'sm' | 'md';
}

const STATUS_ICONS: Record<EquipmentStatus, string> = {
  available: '●',
  reserved: '◉',
  in_rent: '◈',
  return_pending: '↩',
  maintenance: '⚙',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const palette = statusColors[status];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.bg },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text style={[styles.dot, { color: palette.dot }, isSmall && styles.dotSm]}>
        {STATUS_ICONS[status]}
      </Text>
      <Text style={[styles.label, { color: palette.text }, isSmall && styles.labelSm]}>
        {statusLabels[status].toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    gap: 4,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    fontSize: 7,
  },
  dotSm: {
    fontSize: 6,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
  },
  labelSm: {
    fontSize: 9,
  },
});

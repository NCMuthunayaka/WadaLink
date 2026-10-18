import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing, shadow } from '../../../constants/theme';
import type { EquipmentStats } from '../../../types/equipment';

interface StatsRowProps {
  stats: EquipmentStats;
}

export default function StatsRow({ stats }: StatsRowProps) {
  const revenueColor =
    stats.revenueChange >= 0 ? colors.revenuePositive : colors.revenueNegative;
  const revenueSign = stats.revenueChange >= 0 ? '+' : '';

  return (
    <View style={styles.row}>
      {/* Total Fleet */}
      <View style={styles.card}>
        <View style={styles.labelRow}>
          <Text style={styles.iconText}>🔧</Text>
          <Text style={styles.label}>Total Fleet</Text>
        </View>
        <Text style={styles.value}>{stats.totalItems}</Text>
        <Text style={styles.sublabel}>Items listed</Text>
      </View>

      <View style={styles.divider} />

      {/* In Rent */}
      <View style={styles.card}>
        <View style={styles.labelRow}>
          <Text style={styles.iconText}>📋</Text>
          <Text style={styles.label}>In Rent</Text>
        </View>
        <Text style={styles.value}>{stats.inRent}</Text>
        <Text style={styles.sublabel}>Active lease</Text>
      </View>

      <View style={styles.divider} />

      {/* M-T-D Revenue */}
      <View style={[styles.card, styles.cardWide]}>
        <View style={styles.labelRow}>
          <Text style={styles.iconText}>💰</Text>
          <Text style={styles.label}>M-T-D</Text>
        </View>
        <Text style={[styles.value, styles.revenue]}>${stats.mtdRevenue}</Text>
        <Text style={[styles.sublabel, { color: revenueColor }]}>
          {revenueSign}{stats.revenueChange}% vs avg
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    ...shadow.sm,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  cardWide: {
    flex: 1.2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  iconText: {
    fontSize: 11,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  revenue: {
    color: colors.textPrimary,
  },
  sublabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  divider: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../../../constants/theme';

interface SmartLockboxStripProps {
  lockboxId?: string;
  batteryPct?: number;
  onViewCode?: () => void;
}

export default function SmartLockboxStrip({
  lockboxId = 'Smart Lockbox #04 (Downtown...)',
  batteryPct = 94,
  onViewCode,
}: SmartLockboxStripProps) {
  const batteryColor =
    batteryPct >= 50 ? colors.revenuePositive : batteryPct >= 20 ? colors.warning : colors.danger;

  return (
    <View style={styles.strip}>
      <Text style={styles.lockIcon}>🔒</Text>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {lockboxId}
        </Text>
        <Text style={[styles.battery, { color: batteryColor }]}>
          Battery: {batteryPct}% · Code generated for 5 PM return
        </Text>
      </View>
      <TouchableOpacity onPress={onViewCode} style={styles.codeBtn}>
        <Text style={styles.codeBtnText}>View Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
    marginBottom: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  lockIcon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  battery: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: 1,
  },
  codeBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 8,
  },
  codeBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});

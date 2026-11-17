import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';

interface ScoreBarProps {
  label: string;
  /** 0 to 100 */
  value: number;
  /** 0 to 1, shown as a percentage next to the label */
  weight?: number;
}

export default function ScoreBar({ label, value, weight }: ScoreBarProps) {
  const pct = Math.round(Math.min(100, Math.max(0, value)));
  const width = `${pct}%` as `${number}%`;

  return (
    <View style={styles.row} accessibilityLabel={`${label}: ${pct} out of 100`}>
      <Text variant="labelMd" color={colors.textSecondary} style={styles.label}>
        {label}
        {weight !== undefined ? ` · ${Math.round(weight * 100)}%` : ''}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width }]} />
      </View>
      <Text variant="labelMd" style={styles.value}>
        {pct}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { width: 120 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surfaceContainer, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },
  value: { width: 28, textAlign: 'right' },
});
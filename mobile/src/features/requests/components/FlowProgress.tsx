import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';

interface FlowProgressProps {
  step: number;
  label: string;
  total?: number;
}

/** "Step 2 of 3 · AI Diagnosis" with a segmented bar. */
export default function FlowProgress({ step, label, total = 3 }: FlowProgressProps) {
  return (
    <View accessibilityLabel={`Step ${step} of ${total}: ${label}`}>
      <View style={styles.bars}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.bar, i < step && styles.barOn]} />
        ))}
      </View>
      <Text variant="labelMd" color={colors.textMuted} style={styles.text}>
        Step {step} of {total} · {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', gap: spacing.xs },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surfaceContainer },
  barOn: { backgroundColor: colors.primary },
  text: { marginTop: spacing.xs },
});
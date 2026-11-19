import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';

interface StepperProps {
  steps: string[];
  /** Zero-based index of the current step. */
  current: number;
}

const CIRCLE = 28;

export default function Stepper({ steps, current }: StepperProps) {
  return (
    <View style={styles.row} accessibilityLabel={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const on = done || active;

        return (
          <React.Fragment key={label}>
            <View style={styles.step}>
              <View style={[styles.circle, on && styles.circleOn]}>
                {done ? (
                  <Icon name="check" size={16} color={colors.onPrimary} />
                ) : (
                  <Text variant="labelSm" color={active ? colors.onPrimary : colors.textMuted}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                variant="labelSm"
                color={on ? colors.textPrimary : colors.textMuted}
                numberOfLines={1}
                style={styles.label}
              >
                {label}
              </Text>
            </View>
            {index < steps.length - 1 ? <View style={[styles.line, done && styles.lineOn]} /> : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  step: { width: 64, alignItems: 'center' },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  circleOn: { backgroundColor: colors.primary },
  label: { marginTop: spacing.xs, textAlign: 'center' },
  line: {
    flex: 1,
    height: 2,
    marginTop: CIRCLE / 2 - 1,
    backgroundColor: colors.surfaceContainer,
  },
  lineOn: { backgroundColor: colors.primary },
});
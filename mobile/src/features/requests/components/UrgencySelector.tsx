import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';
import type { Urgency } from '@/types/request';
import { URGENCY_OPTIONS } from '../urgencyOptions';

interface UrgencySelectorProps {
  value: Urgency;
  onChange: (value: Urgency) => void;
}

export default function UrgencySelector({ value, onChange }: UrgencySelectorProps) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {URGENCY_OPTIONS.map((option) => {
        const selected = option.value === value;
        const isEmergency = option.value === 'emergency';
        const tone = isEmergency ? colors.danger : colors.primary;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label}. ${option.description}`}
            style={[
              styles.option,
              selected && {
                borderColor: tone,
                backgroundColor: isEmergency ? colors.dangerLight : colors.primaryLight,
              },
            ]}
          >
            <Icon name={option.icon} size={22} color={selected ? tone : colors.textMuted} />
            <View style={styles.text}>
              <Text variant="labelLg" color={isEmergency ? colors.danger : colors.textPrimary}>
                {option.label}
              </Text>
              <Text variant="bodySm" color={colors.textSecondary}>
                {option.description}
              </Text>
            </View>
            <Icon
              name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={selected ? tone : colors.borderStrong}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  text: { flex: 1 },
});
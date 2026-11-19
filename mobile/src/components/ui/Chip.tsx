import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Icon, { type IconName } from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, sizes, spacing } from '@/constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  count?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Chip({ label, selected = false, onPress, icon, count, style }: ChipProps) {
  const fg = selected ? colors.onPrimary : colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipIdle,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={16} color={fg} style={styles.icon} /> : null}
      <Text variant="labelLg" color={fg}>
        {label}
        {count !== undefined ? ` (${count})` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: sizes.chip,
    paddingHorizontal: spacing.base,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipIdle: { backgroundColor: colors.surface, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.85 },
  icon: { marginRight: spacing.xs },
});
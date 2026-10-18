import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.textInverse },
  },
  secondary: {
    container: { backgroundColor: colors.primaryLight },
    text: { color: colors.primary },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
    text: { color: colors.textSecondary },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
  },
  danger: {
    container: { backgroundColor: colors.dangerLight },
    text: { color: colors.danger },
  },
};

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.sm },
    text: { fontSize: fontSize.sm },
  },
  md: {
    container: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm + 2, borderRadius: radius.md },
    text: { fontSize: fontSize.base },
  },
  lg: {
    container: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md },
    text: { fontSize: fontSize.lg },
  },
};

// FIX 1: styles defined before the component so the reference order is explicit
const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    // FIX 5: added default fontSize so Android doesn't silently drop the style
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  // FIX 4: cast width as a number-safe value via flex rather than '100%' string
  fullWidth: {
    alignSelf: 'stretch' as const,
  },
  disabled: {
    opacity: 0.5,
  },
  iconText: {
    marginRight: 6,
  },
});

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      // FIX 2: guard onPress so it never fires when disabled
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        v.container,
        s.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.textInverse : colors.primary}
        />
      ) : (
        // FIX 3: icon and label rendered as separate <Text> nodes for independent styling
        <>
          {icon && (
            <Text style={[styles.baseText, v.text, s.text, styles.iconText, textStyle]}>
              {icon}
            </Text>
          )}
          <Text style={[styles.baseText, v.text, s.text, textStyle]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

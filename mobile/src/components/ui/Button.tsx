import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon, { type IconName } from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, gradients, radius, sizes, spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; color: string }> = {
  primary: { container: { backgroundColor: colors.primary }, color: colors.onPrimary },
  secondary: { container: { backgroundColor: colors.primaryLight }, color: colors.primary },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
    color: colors.textSecondary,
  },
  ghost: { container: { backgroundColor: 'transparent' }, color: colors.primary },
  danger: { container: { backgroundColor: colors.dangerLight }, color: colors.danger },
  // AI Assist: gradient is drawn behind the content, AI features only
  ai: { container: { overflow: 'hidden' }, color: colors.onPrimary },
};

// lg = main CTA (48px), md = card actions (40px), sm = inline actions (32px)
const sizeStyles: Record<
  ButtonSize,
  { container: ViewStyle; iconSize: number; text: 'labelMd' | 'labelLg' }
> = {
  sm: {
    container: { minHeight: 32, paddingHorizontal: spacing.md, borderRadius: radius.sm },
    iconSize: 16,
    text: 'labelMd',
  },
  md: {
    container: { minHeight: sizes.buttonCompact, paddingHorizontal: spacing.base, borderRadius: radius.md },
    iconSize: 18,
    text: 'labelLg',
  },
  lg: {
    container: { minHeight: sizes.button, paddingHorizontal: spacing.xl, borderRadius: radius.md },
    iconSize: 20,
    text: 'labelLg',
  },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
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
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        v.container,
        s.container,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {variant === 'ai' ? (
        <LinearGradient
          colors={gradients.ai.colors}
          start={gradients.ai.start}
          end={gradients.ai.end}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {loading ? (
        <ActivityIndicator size="small" color={v.color} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={s.iconSize} color={v.color} style={styles.iconLeft} /> : null}
          <Text variant={s.text} color={v.color} style={textStyle}>
            {label}
          </Text>
          {trailingIcon ? (
            <Icon name={trailingIcon} size={s.iconSize} color={v.color} style={styles.iconRight} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  iconLeft: { marginRight: 6 },
  iconRight: { marginLeft: 6 },
});
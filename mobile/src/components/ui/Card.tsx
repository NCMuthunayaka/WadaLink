import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '@/constants/theme';

type CardVariant = 'default' | 'ai' | 'dark';

interface CardProps extends Omit<ViewProps, 'style'> {
  variant?: CardVariant;
  padded?: boolean;
  /** Selected state: primary border and a Level 2 shadow (e.g. chosen provider). */
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export default function Card({
  variant = 'default',
  padded = true,
  selected = false,
  onPress,
  style,
  children,
  ...rest
}: CardProps) {
  const cardStyle = [
    styles.base,
    variant === 'ai' && styles.ai,
    variant === 'dark' && styles.dark,
    padded && styles.padded,
    selected && styles.selected,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  // AI Match Card: faint cyan tint with a 4px accent edge
  ai: {
    backgroundColor: colors.accentTint,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  // Dispatch tracking / inverted panels
  dark: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  padded: { padding: spacing.base },
  selected: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadow.md,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
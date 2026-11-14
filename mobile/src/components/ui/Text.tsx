import React from 'react';
import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';
import { colors, fontFamily, typography } from '@/constants/theme';

export type TextVariant = keyof typeof typography;

export interface TextProps extends RNTextProps {
  /** Semantic style from DESIGN.md, e.g. 'headlineSm', 'bodyMd', 'labelSm'. */
  variant?: TextVariant;
  color?: string;
}

// Android needs one font family per weight, so fontWeight is mapped to Inter.
const WEIGHT_TO_FAMILY: Record<string, string> = {
  '100': fontFamily.regular,
  '200': fontFamily.regular,
  '300': fontFamily.regular,
  '400': fontFamily.regular,
  normal: fontFamily.regular,
  '500': fontFamily.medium,
  '600': fontFamily.semibold,
  '700': fontFamily.bold,
  bold: fontFamily.bold,
  '800': fontFamily.bold,
  '900': fontFamily.bold,
};

function familyForWeight(weight: TextStyle['fontWeight']): string | undefined {
  return weight ? WEIGHT_TO_FAMILY[String(weight)] : undefined;
}

export default function Text({ variant, color, style, ...rest }: TextProps) {
  const { fontWeight, ...flat } = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const family =
    flat.fontFamily ??
    familyForWeight(fontWeight) ??
    (variant ? typography[variant].fontFamily : fontFamily.regular);

  return (
    <RNText
      {...rest}
      style={[
        { color: colors.textPrimary },
        variant ? typography[variant] : null,
        color ? { color } : null,
        flat,
        { fontFamily: family },
      ]}
    />
  );
}
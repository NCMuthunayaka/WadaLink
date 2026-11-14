// WedaLink Design Tokens
// Single source of truth for all visual constants.
// Source: precision_utility/DESIGN.md + the Stitch screens.
//
// Where DESIGN.md's prose and the generated screens disagree (e.g. primary is
// #2563EB in the prose but #004AC6 in the screens' Tailwind config), the
// SCREENS win, because they are what we compare against while building.
//
// Existing keys (primary, bg, textMuted, spacing.base, ...) are kept so current
// components keep working. New tokens are additive.

import type { TextStyle } from 'react-native';

// ─── Colors ──────────────────────────────────────────────────────────────────

export const colors = {
  // Brand: Primary Blue. Reserved for definitive forward progress
  // (booking, submit, active states).
  primary: '#004AC6',
  primaryDark: '#003EA8',
  primaryContainer: '#2563EB', // hover / lighter brand fill
  primaryLight: '#DBE1FF', // tinted chips, secondary buttons, active tab pill
  onPrimary: '#FFFFFF',

  // Secondary: Teal. Verified badges, credentials, equipment readiness.
  secondary: '#006A63',
  secondaryContainer: '#99EFE5',
  onSecondaryContainer: '#006F67',

  // Accent: Cyan. AI-assisted features ONLY (matching, diagnostics, estimates).
  accent: '#06B6D4',
  accentDark: '#0F766E', // gradient start for AI actions
  accentTint: 'rgba(6, 182, 212, 0.04)', // AI Match Card surface tint

  // System states
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningText: '#B45309',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#06B6D4',
  infoLight: '#CFFAFE',

  // Surfaces
  bg: '#FAF8FF', // app canvas (Level 0)
  surface: '#FFFFFF', // cards and sheets (Level 1)
  surfaceElevated: '#FFFFFF',
  surfaceLow: '#F2F3FF',
  surfaceContainer: '#EAEDFF',
  surfaceHigh: '#E2E7FF',
  surfaceHighest: '#DAE2FD',
  dark: '#0F172A', // dispatch tracking bar, inverted panels

  // Borders
  border: '#E2E8F0', // hairline
  borderStrong: '#CBD5E1', // hover / selected (Level 2)
  borderLight: '#EAEDFF', // dividers inside cards

  // Text
  textPrimary: '#131B2E',
  textSecondary: '#434655',
  textMuted: '#737686',
  textDisabled: '#94A3B8',
  textInverse: '#FFFFFF',

  // Utility
  overlay: 'rgba(15, 23, 42, 0.45)', // modal backdrop
  shadow: 'rgba(15, 23, 42, 0.08)',
  verified: '#006A63', // verified badge = teal

  // Revenue
  revenuePositive: '#16A34A',
  revenueNegative: '#DC2626',
};

// AI Assist action gradient (135deg). Use with expo-linear-gradient:
//   <LinearGradient colors={gradients.ai.colors} start={gradients.ai.start} end={gradients.ai.end} />
export const gradients = {
  ai: {
    colors: ['#0F766E', '#06B6D4'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// ─── Spacing / layout ────────────────────────────────────────────────────────

// 4pt / 8pt grid. (Keys unchanged from the previous theme.)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Mobile layout constants from DESIGN.md
export const layout = {
  screenMargin: 16,
  gutter: 16,
  marginTablet: 24,
  marginDesktop: 40,
};

// Fixed control sizes (touch accuracy)
export const sizes = {
  button: 48,
  buttonCompact: 40,
  input: 48,
  chip: 36,
  badge: 24,
  avatar: 48,
  tabBar: 62,
  mediaHeader: 140, // equipment card image
};

// ─── Shape ───────────────────────────────────────────────────────────────────

export const radius = {
  xs: 4,
  sm: 8, // inputs, dropdowns, micro badges
  md: 12, // buttons, small cards, alerts, thumbnails
  lg: 16, // primary cards, equipment modules, sheets
  xl: 24,
  pill: 999, // status chips, avatars
};

// ─── Typography ──────────────────────────────────────────────────────────────

// Loaded in App.tsx via @expo-google-fonts/inter. On Android a custom font needs
// one family per weight, so use these instead of fontWeight on new components.
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

// Raw scale (unchanged keys; xs aligned to DESIGN.md label-sm = 11)
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Semantic text styles from DESIGN.md. letterSpacing is em converted to px.
export const typography = {
  displayLg: { fontFamily: fontFamily.bold, fontSize: 40, lineHeight: 48, letterSpacing: -0.8 },
  displayLgMobile: { fontFamily: fontFamily.bold, fontSize: 32, lineHeight: 40, letterSpacing: -0.64 },
  headlineLg: { fontFamily: fontFamily.semibold, fontSize: 28, lineHeight: 36, letterSpacing: -0.42 },
  headlineMd: { fontFamily: fontFamily.semibold, fontSize: 22, lineHeight: 28, letterSpacing: -0.22 },
  headlineSm: { fontFamily: fontFamily.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.09 },
  bodyLg: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  bodyMd: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  bodySm: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16, letterSpacing: 0.12 },
  labelLg: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 20, letterSpacing: 0.07 },
  labelMd: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.24 },
  labelSm: { fontFamily: fontFamily.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.33 },
} satisfies Record<string, TextStyle>;

// Tabular numbers for prices, ETAs, serials. Spread into a text style.
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

// ─── Elevation ───────────────────────────────────────────────────────────────

// DESIGN.md levels. Aliases keep the old names: sm = Level 1, md = Level 2, lg = Level 3.
const shadowColor = '#0F172A';

export const shadow = {
  // Level 1: cards and modules
  sm: {
    shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  // Level 2: interactive / selected containers
  md: {
    shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  // Level 3: floating controls, sticky booking bars, FABs
  lg: {
    shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
  },
  // Level 4: modals, drawers, system sheets
  xl: {
    shadowColor,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 25,
    elevation: 12,
  },
};

// ─── Equipment status (existing) ─────────────────────────────────────────────

export const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  available: { bg: colors.successLight, text: colors.revenuePositive, dot: colors.success },
  reserved: { bg: colors.dangerLight, text: '#B91C1C', dot: colors.danger },
  in_rent: { bg: colors.primaryLight, text: colors.primaryDark, dot: colors.primary },
  return_pending: { bg: colors.warningLight, text: colors.warningText, dot: colors.warning },
  maintenance: { bg: colors.borderLight, text: colors.textSecondary, dot: colors.textMuted },
};

export const statusLabels: Record<string, string> = {
  available: 'Available',
  reserved: 'Reserved',
  in_rent: 'In Rent',
  return_pending: 'Return Pending',
  maintenance: 'Maintenance',
};

// ─── Bundle ──────────────────────────────────────────────────────────────────

export const theme = {
  colors,
  gradients,
  spacing,
  layout,
  sizes,
  radius,
  fontFamily,
  fontSize,
  fontWeight,
  typography,
  shadow,
};

export type Theme = typeof theme;

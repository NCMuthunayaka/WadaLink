// WadaLink Design Tokens
// Single source of truth for all visual constants

export const colors = {
  // Brand
  primary: '#1B6FEB',
  primaryLight: '#EBF2FF',
  primaryDark: '#1358C4',

  // Status
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#06B6D4',
  infoLight: '#CFFAFE',

  // Neutrals
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Utility
  overlay: 'rgba(0,0,0,0.4)',
  shadow: 'rgba(0,0,0,0.08)',
  verified: '#3B82F6',

  // Revenue
  revenuePositive: '#16A34A',
  revenueNegative: '#DC2626',
};

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

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const fontSize = {
  xs: 10,
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

export const shadow = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  available: { bg: colors.successLight, text: colors.revenuePositive, dot: colors.success },
  reserved: { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
  in_rent:  { bg: colors.primaryLight, text: colors.primaryDark, dot: colors.primary },
  return_pending: { bg: colors.warningLight, text: '#92400E', dot: colors.warning },
  maintenance: { bg: colors.borderLight, text: colors.textSecondary, dot: colors.textMuted },
};

export const statusLabels: Record<string, string> = {
  available: 'Available',
  reserved: 'Reserved',
  in_rent: 'In Rent',
  return_pending: 'Return Pending',
  maintenance: 'Maintenance',
};

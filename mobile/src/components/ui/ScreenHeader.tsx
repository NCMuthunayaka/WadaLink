import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon, { type IconName } from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Right slot: notification bell, profile avatar, actions. */
  right?: React.ReactNode;
}

function iconForTitle(title: string): IconName {
  const normalized = title.toLowerCase();
  if (normalized.includes('provider') || normalized.includes('matching')) return 'engineering';
  if (normalized.includes('quotation')) return 'receipt-long';
  if (normalized.includes('notification')) return 'notifications';
  if (normalized.includes('chat') || normalized.includes('conversation') || normalized.includes('message')) {
    return 'chat-bubble-outline';
  }
  if (normalized.includes('review')) return 'star';
  if (normalized.includes('equipment') || normalized.includes('rental') || normalized.includes('reservation')) {
    return 'handyman';
  }
  if (normalized.includes('profile')) return 'account-circle';
  if (normalized.includes('job')) return 'work';
  if (normalized.includes('request') || normalized.includes('service')) return 'home-repair-service';
  return 'auto-awesome';
}

export default function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.back}
          >
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        ) : null}
        <View style={styles.titleIcon}>
          <Icon name={iconForTitle(title)} size={19} color={colors.primary} />
        </View>
        <View style={styles.titleWrap}>
          <Text variant="headlineSm" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySm" color={colors.textMuted} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.base,
  },
  back: { marginRight: spacing.md },
  titleIcon: {
    width: 36,
    height: 36,
    marginRight: spacing.sm,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  titleWrap: { flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', marginLeft: spacing.md },
});
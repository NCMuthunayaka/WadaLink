import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Icon name="handyman" size={22} color={colors.onPrimary} />
          </View>
          <Text variant="headlineSm">WedaLink</Text>
        </View>

        <View style={styles.imageWrap}>
          <Image
            source={require('../../../../assets/wedalink-hero.png')}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="A WedaLink home-service professional"
          />
          <View style={styles.imageBadge}>
            <Icon name="verified" size={15} color={colors.secondary} />
            <Text variant="labelSm" color={colors.secondary}>TRUSTED LOCAL PROFESSIONALS</Text>
          </View>
        </View>

        <View style={styles.trustRow}>
          <View style={styles.trustItem}><Icon name="verified-user" size={17} color={colors.secondary} /><Text variant="labelMd" color={colors.textSecondary}>Trusted local help</Text></View>
          <View style={styles.trustItem}><Icon name="auto-awesome" size={17} color={colors.accent} /><Text variant="labelMd" color={colors.textSecondary}>Guided step by step</Text></View>
        </View>

        <Text variant="headlineLg" style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodyLg" color={colors.textSecondary} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}

        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** "Don't have an account? Sign Up" row. */
export function AuthFooter({
  text,
  action,
  onPress,
}: {
  text: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.footer}>
      <Text variant="bodyMd" color={colors.textSecondary}>
        {text}
      </Text>
      <Button label={action} onPress={onPress} variant="ghost" size="sm" />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.xl, gap: spacing.base },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.base },
  logo: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  imageWrap: {
    height: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLow,
    marginBottom: spacing.xs,
  },
  heroImage: { width: '100%', height: '100%' },
  imageBadge: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  trustRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', paddingHorizontal: spacing.xs },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  title: { marginTop: spacing.sm },
  subtitle: { marginTop: -spacing.sm },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

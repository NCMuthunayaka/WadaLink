import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon, { type IconName } from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import type { AuthRole } from '@/types/auth';
import AuthLayout, { AuthFooter } from '../components/AuthLayout';

interface RoleOption {
  role: AuthRole;
  icon: IconName;
  title: string;
  subtitle: string;
  description: string;
  features: { icon: IconName; label: string }[];
  cta: string;
}

const OPTIONS: RoleOption[] = [
  {
    role: 'customer',
    icon: 'home-repair-service',
    title: 'Need a Service',
    subtitle: 'Homeowners & Businesses',
    description: 'Request on-demand repairs, get instant AI diagnostics, compare quotes, and hire vetted pros.',
    features: [
      { icon: 'auto-awesome', label: 'AI diagnostic matching' },
      { icon: 'near-me', label: 'Real-time tracking' },
    ],
    cta: 'Continue as Service Needer',
  },
  {
    role: 'provider',
    icon: 'engineering',
    title: 'Service Provider',
    subtitle: 'Tradespeople & Equipment Owners',
    description: 'Receive customer requests, quote on local jobs, and rent out your tools and equipment.',
    features: [
      { icon: 'work', label: 'Quote on local jobs' },
      { icon: 'handyman', label: 'Equipment rental access' },
    ],
    cta: 'Continue as Service Provider',
  },
];

export default function RoleSelectionScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>) {
  const [selected, setSelected] = useState<AuthRole>('customer');
  const current = OPTIONS.find((o) => o.role === selected) ?? OPTIONS[0];

  return (
    <AuthLayout title="Choose Your Role" subtitle="Select how you want to use WedaLink.">
      {OPTIONS.map((option) => {
        const active = option.role === selected;
        return (
          <Card key={option.role} selected={active} onPress={() => setSelected(option.role)}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Icon name={option.icon} size={26} color={active ? colors.secondary : colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text variant="headlineSm">{option.title}</Text>
                <Text variant="bodySm" color={colors.textMuted}>
                  {option.subtitle}
                </Text>
              </View>
              {active ? <Icon name="check-circle" size={24} color={colors.secondary} /> : null}
            </View>
            <Text variant="bodyMd" color={colors.textSecondary} style={styles.description}>
              {option.description}
            </Text>
            {option.features.map((feature) => (
              <View key={feature.label} style={styles.feature}>
                <Icon name={feature.icon} size={16} color={colors.secondary} />
                <Text variant="labelMd" color={colors.textSecondary} style={styles.featureLabel}>
                  {feature.label}
                </Text>
              </View>
            ))}
          </Card>
        );
      })}

      <Button
        label={current.cta}
        size="lg"
        fullWidth
        trailingIcon="arrow-forward"
        onPress={() => navigation.navigate('Register', { role: selected })}
      />
      <AuthFooter
        text="Already have an account?"
        action="Sign In"
        onPress={() => navigation.navigate('Login', { role: selected })}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  headerText: { flex: 1, marginLeft: spacing.md },
  description: { marginTop: spacing.md, marginBottom: spacing.sm },
  feature: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  featureLabel: { marginLeft: spacing.sm },
});

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '@/components/ui/Button';
import Icon, { type IconName } from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, refreshUser, selectUser } from '@/store/sessionSlice';
import { getAccessState, type AccessState } from '@/utils/access';

interface Gate {
  icon: IconName;
  title: string;
  message: string;
}

const GATES: Partial<Record<AccessState, Gate>> = {
  provider_pending: {
    icon: 'hourglass-top',
    title: 'Application under review',
    message: 'Your provider account is waiting for approval. You can start taking jobs as soon as it is approved.',
  },
  suspended: {
    icon: 'lock',
    title: 'Account suspended',
    message: 'This account is suspended. Contact WedaLink support to restore access.',
  },
  admin: {
    icon: 'admin-panel-settings',
    title: 'Admin account',
    message: 'Admin accounts are managed from the web console and cannot use the mobile app.',
  },
};

export default function AccountGateScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [checking, setChecking] = useState(false);

  const access = user ? getAccessState(user) : null;
  const gate = access ? GATES[access] : undefined;
  if (!gate) return null;

  const checkStatus = async () => {
    setChecking(true);
    try {
      await dispatch(refreshUser()).unwrap();
      // If the account was approved, the root navigator moves on by itself.
    } catch {
      // Keep showing the gate; the person can try again.
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name={gate.icon} size={36} color={colors.primary} />
      </View>
      <Text variant="headlineMd" style={styles.center}>
        {gate.title}
      </Text>
      <Text variant="bodyLg" color={colors.textSecondary} style={styles.center}>
        {gate.message}
      </Text>

      <View style={styles.actions}>
        {access === 'provider_pending' ? (
          <Button label="Check status" icon="refresh" size="lg" fullWidth loading={checking} onPress={checkStatus} />
        ) : null}
        <Button label="Sign out" variant="outline" size="lg" fullWidth onPress={() => dispatch(logout())} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.lg },
});
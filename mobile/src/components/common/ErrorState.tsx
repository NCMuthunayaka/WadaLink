import React from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this right now. Check your connection and try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.errorIcon}>
        <Icon name="error-outline" size={34} color={colors.danger} />
      </View>
      <Text variant="headlineSm" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMd" color={colors.textMuted} style={styles.message}>
        {message}
      </Text>
      {onRetry ? <Button label="Try again" onPress={onRetry} icon="refresh" style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  title: { marginTop: spacing.base },
  errorIcon: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dangerLight },
  message: { marginTop: spacing.xs, textAlign: 'center' },
  button: { marginTop: spacing.xl },
});

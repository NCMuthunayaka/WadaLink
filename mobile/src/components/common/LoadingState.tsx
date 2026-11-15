import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';

export default function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="bodyMd" color={colors.textMuted} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  label: { marginTop: spacing.md },
});
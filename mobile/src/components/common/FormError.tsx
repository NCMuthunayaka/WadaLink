import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';

/** Banner for errors that belong to the whole form (e.g. wrong password). */
export default function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <View style={styles.box} accessibilityRole="alert">
      <Icon name="error-outline" size={18} color={colors.danger} />
      <Text variant="bodyMd" color={colors.danger} style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  text: { flex: 1, marginLeft: spacing.sm },
});
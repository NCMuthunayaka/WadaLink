import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../../../constants/theme';

export default function DemandBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚡</Text>
      <Text style={styles.text} numberOfLines={1}>
        High local demand: Trenching units averaging 1.4x daily rate this week · Book early to secure premium pricing
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  icon: {
    fontSize: fontSize.base,
  },
  text: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: '#92400E',
  },
});

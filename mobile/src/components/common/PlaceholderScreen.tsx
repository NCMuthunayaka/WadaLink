import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon, { type IconName } from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';

interface PlaceholderScreenProps {
  title: string;
  icon: IconName;
}

export default function PlaceholderScreen({ title, icon }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={32} color={colors.primary} />
      </View>
      <Text variant="headlineMd">{title}</Text>
      <Text variant="bodyMd" color={colors.textMuted} style={styles.sub}>
        Coming soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.base,
  },
  sub: { marginTop: spacing.xs },
});
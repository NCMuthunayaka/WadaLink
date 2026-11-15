import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';
import type { ServiceCategory } from '@/types/request';
import { categoryIcon } from '../categoryIcon';

interface CategoryTileProps {
  category: ServiceCategory;
  onPress: () => void;
}

export default function CategoryTile({ category, onPress }: CategoryTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Request ${category.name}`}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={styles.iconBox}>
        <Icon name={categoryIcon(category.name)} size={26} color={colors.primary} />
      </View>
      <Text variant="labelMd" numberOfLines={2} style={styles.label}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { width: '23%', alignItems: 'center' },
  pressed: { opacity: 0.8 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  label: { marginTop: spacing.xs, textAlign: 'center' },
});
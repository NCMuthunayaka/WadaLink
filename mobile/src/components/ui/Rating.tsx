import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';

interface RatingProps {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
  /** When provided, stars become tappable (review form). */
  onChange?: (value: number) => void;
}

const STARS = [1, 2, 3, 4, 5];

export default function Rating({ value, count, size = 16, showValue = true, onChange }: RatingProps) {
  return (
    <View style={styles.row} accessibilityLabel={`Rated ${value.toFixed(1)} out of 5`}>
      {STARS.map((star) => {
        const name = value >= star ? 'star' : value >= star - 0.5 ? 'star-half' : 'star-border';
        const color = value >= star - 0.5 ? colors.warning : colors.borderStrong;
        const icon = <Icon name={name} size={size} color={color} />;

        return onChange ? (
          <Pressable
            key={star}
            onPress={() => onChange(star)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${star} ${star === 1 ? 'star' : 'stars'}`}
          >
            {icon}
          </Pressable>
        ) : (
          <View key={star}>{icon}</View>
        );
      })}
      {showValue ? (
        <Text variant="labelLg" style={styles.value}>
          {value.toFixed(1)}
        </Text>
      ) : null}
      {count !== undefined ? (
        <Text variant="bodySm" color={colors.textMuted} style={styles.count}>
          ({count})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  value: { marginLeft: spacing.xs },
  count: { marginLeft: spacing.xs },
});
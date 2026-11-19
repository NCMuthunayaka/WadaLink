import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors } from '@/constants/theme';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  /** Teal verified badge for credentialed providers. */
  verified?: boolean;
}

function initials(name?: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Avatar({ uri, name, size = 48, verified = false }: AvatarProps) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image source={{ uri }} style={dimension} accessibilityLabel={name} />
      ) : (
        <View style={[styles.fallback, dimension]}>
          <Text variant="labelLg" color={colors.primary} style={{ fontSize: size * 0.38 }}>
            {initials(name)}
          </Text>
        </View>
      )}
      {verified ? (
        <View style={styles.badge}>
          <Icon name="verified" size={Math.max(14, size * 0.34)} color={colors.secondary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: colors.surface,
    borderRadius: 999,
  },
});
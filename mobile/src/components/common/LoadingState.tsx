import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';

export default function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <View style={styles.skeletons}>{[1, 2, 3].map((item) => <View key={item} style={styles.skeletonCard}><Animated.View style={[styles.skeletonAvatar, { opacity: 0.55 }]} /><View style={styles.skeletonLines}><Animated.View style={[styles.skeletonLine, styles.long, { opacity: 0.55 }]} /><Animated.View style={[styles.skeletonLine, { opacity: 0.55 }]} /></View></View>)}</View>
      <Text variant="bodyMd" color={colors.textMuted} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.base },
  skeletons: { width: '100%', gap: spacing.md },
  skeletonCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight },
  skeletonAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight },
  skeletonLines: { flex: 1, gap: spacing.sm },
  skeletonLine: { height: 10, width: '62%', borderRadius: 8, backgroundColor: colors.primaryLight },
  long: { width: '88%' },
  label: { marginTop: spacing.md },
});

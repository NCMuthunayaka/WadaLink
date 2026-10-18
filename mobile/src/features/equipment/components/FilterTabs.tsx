import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../constants/theme';
import type { FilterCount, FilterTab } from '../../../types/equipment';

interface FilterTabsProps {
  tabs: FilterCount[];
  active: FilterTab;
  onSelect: (filter: FilterTab) => void;
}

export default function FilterTabs({ tabs, active, onSelect }: FilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => {
        const isActive = tab.filter === active;
        return (
          <TouchableOpacity
            key={tab.filter}
            onPress={() => onSelect(tab.filter)}
            activeOpacity={0.7}
            style={[styles.pill, isActive && styles.pillActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            <View style={[styles.badge, isActive && styles.badgeActive]}>
              <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 5,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textInverse,
  },
  badge: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  badgeTextActive: {
    color: colors.textInverse,
  },
});

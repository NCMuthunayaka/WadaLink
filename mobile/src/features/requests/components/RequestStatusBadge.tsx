import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';
import type { RequestStatus } from '@/types/request';

const STYLES: Record<RequestStatus, { bg: string; fg: string; label: string }> = {
  open: { bg: colors.primaryLight, fg: colors.primary, label: 'Open' },
  assigned: { bg: colors.secondaryContainer, fg: colors.onSecondaryContainer, label: 'Assigned' },
  in_progress: { bg: colors.warningLight, fg: colors.warningText, label: 'In Progress' },
  completed: { bg: colors.successLight, fg: colors.success, label: 'Completed' },
  cancelled: { bg: colors.surfaceContainer, fg: colors.textMuted, label: 'Cancelled' },
};

export default function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const style = STYLES[status];
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text variant="labelSm" color={style.fg}>
        {style.label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(19, 27, 46, 0.06)',
  },
});

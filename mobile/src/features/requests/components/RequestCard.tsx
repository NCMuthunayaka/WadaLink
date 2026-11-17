import React from 'react';
import { StyleSheet, View } from 'react-native';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';
import type { ServiceRequest } from '@/types/request';
import { formatShortDate } from '@/utils/format';
import { categoryIcon } from '../categoryIcon';
import { URGENCY_LABELS } from '../urgencyOptions';
import RequestStatusBadge from './RequestStatusBadge';

interface RequestCardProps {
  request: ServiceRequest;
  categoryName?: string;
  onPress?: () => void;
}

export default function RequestCard({ request, categoryName, onPress }: RequestCardProps) {
  return (
    <Card onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Icon name={categoryIcon(categoryName ?? '')} size={22} color={colors.primary} />
        </View>
        <View style={styles.titleWrap}>
          <Text variant="labelLg" numberOfLines={2}>
            {request.title}
          </Text>
          <Text variant="bodySm" color={colors.textMuted}>
            {[categoryName, formatShortDate(request.createdAt)].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <RequestStatusBadge status={request.status} />
      </View>

      <View style={styles.meta}>
        <Icon name="location-on" size={14} color={colors.textMuted} />
        <Text variant="bodySm" color={colors.textSecondary} numberOfLines={1} style={styles.address}>
          {request.address}
        </Text>
        <Text
          variant="labelSm"
          color={request.urgency === 'emergency' ? colors.danger : colors.textMuted}
        >
          {URGENCY_LABELS[request.urgency].toUpperCase()}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  titleWrap: { flex: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.xs },
  address: { flex: 1 },
});
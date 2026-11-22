import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import Icon, { type IconName } from '@/components/ui/Icon';
import Rating from '@/components/ui/Rating';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { colors, radius, spacing } from '@/constants/theme';
import type { MatchComponent, MatchedProvider } from '@/types/provider';
import { formatCurrency, formatDistance, formatResponse } from '@/utils/format';
import { matchPercent } from '../filters';
import { COMPONENT_LABELS, COMPONENT_ORDER } from '../labels';
import ScoreBar from './ScoreBar';

interface ProviderMatchCardProps {
  provider: MatchedProvider;
  weights: Record<MatchComponent, number>;
  badges?: string[];
  onSelect?: () => void;
}

function Metric({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricHead}>
        <Icon name={icon} size={14} color={colors.textMuted} />
        <Text variant="labelSm" color={colors.textMuted}>
          {' '}
          {label}
        </Text>
      </View>
      <Text variant="labelLg">{value}</Text>
    </View>
  );
}

export default function ProviderMatchCard({ provider, weights, badges = [], onSelect }: ProviderMatchCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card variant={provider.rank === 1 ? 'ai' : 'default'}>
      <View style={styles.topRow}>
        <View style={styles.matchPill}>
          <Icon name="bolt" size={14} color={colors.accentDark} />
          <Text variant="labelSm" color={colors.accentDark}>
            {matchPercent(provider)}/100 MATCH SCORE
          </Text>
        </View>
        {badges.map((badge) => (
          <Text key={badge} variant="labelMd" color={colors.textSecondary}>
            • {badge}
          </Text>
        ))}
      </View>

      <View style={styles.identity}>
        <Avatar name={provider.name} verified={provider.verified} />
        <View style={styles.identityText}>
          <Text variant="headlineSm" numberOfLines={1}>
            {provider.name}
          </Text>
          <Text variant="bodySm" color={colors.textMuted} numberOfLines={1}>
            {provider.businessName ?? `${provider.experienceYears} years experience`}
          </Text>
          <Rating value={provider.rating} count={provider.reviewCount} size={14} />
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric icon="location-on" label="Distance" value={formatDistance(provider.distanceKm)} />
        <Metric icon="timer" label="Response" value={formatResponse(provider.responseMinutes)} />
        {provider.hourlyRate != null ? (
          <Metric icon="payments" label="Rate" value={`${formatCurrency(provider.hourlyRate)}/hr`} />
        ) : null}
      </View>

      {provider.estimatedPrice != null ? (
        <View style={styles.estimate}>
          <Text variant="bodyMd" color={colors.textSecondary}>
            Estimated total
          </Text>
          <Text variant="headlineSm">{formatCurrency(provider.estimatedPrice)}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Why ${provider.name} is recommended`}
        style={styles.expandRow}
      >
        <Icon name="auto-awesome" size={16} color={colors.accentDark} />
        <Text variant="labelLg" color={colors.accentDark} style={styles.expandLabel}>
          Why this provider?
        </Text>
        <Icon name={expanded ? 'expand-less' : 'expand-more'} size={20} color={colors.accentDark} />
      </Pressable>

      {expanded ? (
        <View style={styles.breakdown}>
          <Text variant="bodySm" color={colors.textSecondary}>Each factor contributes according to its weight. Missing information can affect the score.</Text>
          {COMPONENT_ORDER.map((component) => (
            <ScoreBar
              key={component}
              label={COMPONENT_LABELS[component]}
              value={provider.score[component]}
              weight={weights[component]}
            />
          ))}
        </View>
      ) : null}
      {onSelect ? <Button label="Compare quotations" variant="secondary" fullWidth onPress={onSelect} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.infoLight,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  identityText: { flex: 1, gap: 2 },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginTop: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metric: { gap: spacing.xs, minWidth: 80 },
  metricHead: { flexDirection: 'row', alignItems: 'center' },
  estimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceLow,
  },
  expandRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, marginTop: spacing.md },
  expandLabel: { flex: 1, marginLeft: spacing.xs },
  breakdown: { gap: spacing.sm, marginTop: spacing.md },
});

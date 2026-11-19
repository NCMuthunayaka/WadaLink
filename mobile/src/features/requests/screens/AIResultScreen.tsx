import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon, { type IconName } from '@/components/ui/Icon';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';
import type { CustomerStackScreenProps } from '@/navigation/types';
import { useGetClassificationQuery, useGetMatchesQuery } from '@/services/api/requests';
import { formatCurrencyRange, formatDistance, formatDurationRange, formatResponse } from '@/utils/format';
import { categoryIcon } from '../categoryIcon';
import FlowProgress from '../components/FlowProgress';

function AssessmentRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.assessmentRow}>
      <Icon name={icon} size={18} color={colors.secondary} />
      <View style={styles.assessmentText}>
        <Text variant="labelMd" color={colors.textMuted}>
          {label}
        </Text>
        <Text variant="bodyMd">{value}</Text>
      </View>
    </View>
  );
}

function Stat({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <Card style={styles.stat}>
      <Icon name={icon} size={20} color={colors.primary} />
      <Text variant="labelMd" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="headlineSm">{value}</Text>
    </Card>
  );
}

export default function AIResultScreen({ navigation, route }: CustomerStackScreenProps<'AIResult'>) {
  const { requestId } = route.params;
  const insets = useSafeAreaInsets();
  const classification = useGetClassificationQuery(requestId);
  const matches = useGetMatchesQuery(requestId);

  const header = <ScreenHeader title="AI Classification Result" onBack={() => navigation.goBack()} />;

  if (classification.isLoading) {
    return (
      <View style={styles.root}>
        {header}
        <LoadingState label="Analysing your request…" />
      </View>
    );
  }

  if (classification.isError || !classification.data) {
    return (
      <View style={styles.root}>
        {header}
        <ErrorState title="Analysis failed" onRetry={() => void classification.refetch()} />
      </View>
    );
  }

  const c = classification.data;
  const providers = matches.data?.providers ?? [];
  const highPriority = c.predictedUrgency === 'high' || c.predictedUrgency === 'emergency';
  const continueLabel = matches.data
    ? `Continue to Matching Providers (${providers.length} Available)`
    : 'Continue to Matching Providers';

  return (
    <View style={styles.root}>
      {header}

      <ScrollView contentContainerStyle={styles.content}>
        <FlowProgress step={2} label="AI Diagnosis" />

        <Card variant="ai" style={styles.hero}>
          <View style={styles.heroTag}>
            <Icon name="auto-awesome" size={16} color={colors.accentDark} />
            <Text variant="labelSm" color={colors.accentDark}>
              WEDALINK AI DIAGNOSTIC COMPLETED
            </Text>
          </View>

          <View style={styles.heroMain}>
            <View style={styles.categoryIcon}>
              <Icon name={categoryIcon(c.categoryName)} size={26} color={colors.primary} />
            </View>
            <View style={styles.heroText}>
              <Text variant="headlineMd">{c.categoryName}</Text>
              <Text variant="labelLg" color={colors.secondary}>
                {Math.round(c.confidence * 100)}% Match Confidence
              </Text>
            </View>
          </View>

          {highPriority ? (
            <View style={styles.priority}>
              <Icon name="warning" size={18} color={colors.danger} />
              <View style={styles.priorityText}>
                <Text variant="labelLg" color={colors.danger}>
                  High Priority Detected
                </Text>
                {c.details.riskHeadline ? (
                  <Text variant="bodyMd" color={colors.textSecondary}>
                    {c.details.riskHeadline}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {c.status !== 'success' ? (
            <Text variant="bodySm" color={colors.textMuted}>
              Low confidence: no specific symptoms were recognised, so we used the category you chose.
            </Text>
          ) : null}
        </Card>

        <Card>
          <Text variant="headlineSm" style={styles.cardTitle}>
            Technical Assessment
          </Text>
          <View style={styles.assessment}>
            {c.details.anomaly ? (
              <AssessmentRow icon="check-circle" label="Identified Anomaly" value={c.details.anomaly} />
            ) : null}
            {c.details.rootCause ? (
              <AssessmentRow icon="check-circle" label="Root Cause Suspect" value={c.details.rootCause} />
            ) : null}
            {c.details.credentials ? (
              <AssessmentRow icon="check-circle" label="Credential Requirements" value={c.details.credentials} />
            ) : null}
          </View>
        </Card>

        <View style={styles.stats}>
          {c.details.durationHours ? (
            <Stat
              icon="schedule"
              label="Est. Duration"
              value={formatDurationRange(c.details.durationHours.min, c.details.durationHours.max)}
            />
          ) : null}
          {c.details.costRange ? (
            <Stat
              icon="payments"
              label="Benchmark Cost"
              value={formatCurrencyRange(c.details.costRange.min, c.details.costRange.max)}
            />
          ) : null}
        </View>

        {c.details.safetyTips.length > 0 ? (
          <Card style={styles.safety}>
            <View style={styles.safetyHead}>
              <Icon name="warning" size={18} color={colors.warningText} />
              <Text variant="labelLg" color={colors.warningText}>
                Safety Alert
              </Text>
            </View>
            {c.details.safetyTips.map((tip) => (
              <Text key={tip} variant="bodyMd" color={colors.textSecondary}>
                • {tip}
              </Text>
            ))}
          </Card>
        ) : null}

        {providers.length > 0 ? (
          <Card>
            <Text variant="headlineSm" style={styles.cardTitle}>
              Top Matched Specialists
            </Text>
            {providers.slice(0, 2).map((p) => (
              <View key={p.providerId} style={styles.specialist}>
                <Avatar name={p.name} size={40} verified={p.verified} />
                <View style={styles.specialistText}>
                  <Text variant="labelLg">{p.name}</Text>
                  <Text variant="bodySm" color={colors.textMuted}>
                    {formatDistance(p.distanceKm)} · responds {formatResponse(p.responseMinutes)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={continueLabel}
          size="lg"
          fullWidth
          trailingIcon="arrow-forward"
          onPress={() => navigation.navigate('MatchingProviders', { requestId })}
        />
        <Button
          label="Edit Details"
          variant="ghost"
          icon="tune"
          fullWidth
          onPress={() => navigation.navigate('CreateRequest', { requestId })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.base, paddingBottom: spacing.xl, gap: spacing.base },
  hero: { gap: spacing.md },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  heroMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  heroText: { flex: 1 },
  priority: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
  },
  priorityText: { flex: 1 },
  cardTitle: { marginBottom: spacing.md },
  assessment: { gap: spacing.md },
  assessmentRow: { flexDirection: 'row', gap: spacing.sm },
  assessmentText: { flex: 1 },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, gap: spacing.xs },
  safety: { backgroundColor: colors.warningLight, borderColor: colors.warning, gap: spacing.xs },
  safetyHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  specialist: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  specialistText: { flex: 1 },
  footer: {
    padding: spacing.base,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
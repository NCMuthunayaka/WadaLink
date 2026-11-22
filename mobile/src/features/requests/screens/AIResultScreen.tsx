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
import { useGetCategoriesQuery, useGetClassificationQuery, useGetMatchesQuery } from '@/services/api/requests';
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
  const categories = useGetCategoriesQuery();
  const resolved = classification.data?.status === 'success' && !!classification.data?.categoryId;
  const matches = useGetMatchesQuery(requestId, { skip: !resolved });

  const header = <ScreenHeader title="Review your service" onBack={() => navigation.goBack()} />;

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
        <Button label="Choose a category manually" size="lg" variant="outline" onPress={() => navigation.navigate('CreateRequest', { requestId })} />
      </View>
    );
  }

  const c = classification.data;
  const unavailable = c.details.reason === 'Service not available yet';
  const manual = c.layer === 'user' && resolved;
  const suggestions = (c.details.categories ?? []).map(name => categories.data?.find(category => category.name === name)).filter(category => category !== undefined).slice(0, 4);
  const providers = matches.data?.providers ?? [];
  const highPriority = c.predictedUrgency === 'high' || c.predictedUrgency === 'emergency';
  const continueLabel = matches.data
    ? `View providers (${providers.length})`
    : 'View matching providers';

  return (
    <View style={styles.root}>
      {header}

      <ScrollView contentContainerStyle={styles.content}>
        <FlowProgress step={2} label="Review category" />

        <Card variant="ai" style={styles.hero}>
          <View style={styles.heroTag}>
            <Icon name="auto-awesome" size={16} color={colors.accentDark} />
            <Text variant="labelSm" color={colors.accentDark}>
              {manual ? 'YOUR SELECTION' : resolved ? 'AI SUGGESTION' : 'YOUR INPUT NEEDED'}
            </Text>
          </View>

          <View style={styles.heroMain}>
            <View style={styles.categoryIcon}>
              <Icon name={resolved ? categoryIcon(c.categoryName) : unavailable ? 'search-off' : 'help-outline'} size={26} color={colors.accentDark} />
            </View>
            <View style={styles.heroText}>
              <Text variant="headlineMd">{resolved ? c.categoryName : unavailable ? 'Service not available yet' : 'Let’s choose a category'}</Text>
              {resolved ? <Text variant="labelLg" color={colors.secondary}>
                {manual ? 'Selected by you' : `${Math.round(c.confidence * 100)}% classification confidence`}
              </Text> : null}
            </View>
          </View>

          {highPriority ? (
            <View style={styles.priority}>
              <Icon name="warning" size={18} color={colors.warningText} />
              <View style={styles.priorityText}>
                <Text variant="labelLg" color={colors.warningText}>
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

          {!resolved ? (
            <Text variant="bodyMd" color={colors.textSecondary}>
              {c.details.reason === 'Service not available yet' ? "We don't have this service yet. You can choose another category or edit your request." : 'We could not confidently identify a service. Choose a category using Not right? Change below.'}
            </Text>
          ) : null}
          {resolved && !manual ? <Text variant="bodyMd" color={colors.textSecondary}>Based on your description. Please confirm the category before viewing providers.</Text> : null}
        </Card>

        {!resolved && suggestions.length > 0 ? <Card style={styles.hero}>
          <Text variant="headlineSm">Suggested categories</Text>
          <Text variant="bodySm" color={colors.textSecondary}>Tap a suggestion to review and save your choice.</Text>
          {suggestions.map(category => <Button key={category.id} label={category.name} size="lg" variant="outline" fullWidth onPress={() => navigation.navigate('CreateRequest', { requestId, categoryId: category.id })} />)}
        </Card> : null}

        {resolved && (c.details.anomaly || c.details.rootCause || c.details.credentials) ? <Card>
          <Text variant="headlineSm" style={styles.cardTitle}>
            Before you book
          </Text>
          <View style={styles.assessment}>
            {c.details.anomaly ? (
              <AssessmentRow icon="info-outline" label="Possible issue" value={c.details.anomaly} />
            ) : null}
            {c.details.rootCause ? (
              <AssessmentRow icon="info-outline" label="Initial guidance" value={c.details.rootCause} />
            ) : null}
            {c.details.credentials ? (
              <AssessmentRow icon="check-circle" label="Credential Requirements" value={c.details.credentials} />
            ) : null}
          </View>
          <Text variant="bodySm" color={colors.textSecondary}>A provider should inspect the issue and confirm the work required.</Text>
        </Card> : null}

        {resolved ? <View style={styles.stats}>
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
              label="Indicative cost · not a quote"
              value={formatCurrencyRange(c.details.costRange.min, c.details.costRange.max)}
            />
          ) : null}
        </View> : null}

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
          label={resolved ? continueLabel : 'Choose a category'}
          size="lg"
          fullWidth
          trailingIcon="arrow-forward"
          onPress={() => resolved ? navigation.navigate('MatchingProviders', { requestId }) : navigation.navigate('CreateRequest', { requestId })}
        />
        <Button
          label="Not right? Change"
          variant="ghost"
          size="lg"
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
    backgroundColor: colors.infoLight,
  },
  heroText: { flex: 1 },
  priority: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningLight,
  },
  priorityText: { flex: 1 },
  cardTitle: { marginBottom: spacing.md },
  assessment: { gap: spacing.md },
  assessmentRow: { flexDirection: 'row', gap: spacing.sm },
  assessmentText: { flex: 1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: { flex: 1, minWidth: 140, gap: spacing.xs },
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

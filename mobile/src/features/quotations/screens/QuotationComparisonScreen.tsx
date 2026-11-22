import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';
import type { CustomerStackScreenProps } from '@/navigation/types';
import type { Quotation } from '@/types/quotation';
import { useGetQuotationsQuery, useSelectQuotationMutation } from '@/services/api/quotations';

export default function QuotationComparisonScreen({ navigation, route }: CustomerStackScreenProps<'QuotationComparison'>) {
  const { requestId } = route.params;
  const query = useGetQuotationsQuery(requestId);
  const [selectQuotation, selection] = useSelectQuotationMutation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const quotes = useMemo(() => [...(query.data ?? [])].sort((a, b) => a.amount - b.amount), [query.data]);

  if (query.isLoading) return <View style={styles.root}><ScreenHeader title="Compare quotations" onBack={() => navigation.goBack()} /><LoadingState label="Loading quotations…" /></View>;
  if (query.isError) return <View style={styles.root}><ScreenHeader title="Compare quotations" onBack={() => navigation.goBack()} /><ErrorState onRetry={() => void query.refetch()} /></View>;

  const choose = async (quote: Quotation) => {
    setSelectedId(quote.id);
    await selectQuotation({ requestId, quotationId: quote.id }).unwrap();
  };

  return <View style={styles.root}>
    <ScreenHeader title="Compare quotations" onBack={() => navigation.goBack()} />
    <FlatList
      data={quotes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<View style={styles.intro}><Text variant="headlineMd">Choose the right fit</Text><Text variant="bodyMd" color={colors.textSecondary}>Compare price, arrival time, and provider notes before you book.</Text><View style={styles.summary}><Icon name="verified" size={18} color={colors.secondary} /><Text variant="labelMd" color={colors.secondary}>{quotes.length} verified quotations</Text></View></View>}
      ListEmptyComponent={<Card style={styles.empty}><Icon name="request-quote" size={32} color={colors.secondary} /><Text variant="headlineSm">No quotations yet</Text><Text variant="bodyMd" color={colors.textMuted}>Providers will appear here when they respond to your request.</Text></Card>}
      renderItem={({ item }) => <QuotationCard quote={item} selected={selectedId === item.id} busy={selection.isLoading && selectedId === item.id} onSelect={() => void choose(item)} />}
    />
  </View>;
}

function QuotationCard({ quote, selected, busy, onSelect }: { quote: Quotation; selected: boolean; busy: boolean; onSelect: () => void }) {
  return <Card style={[styles.quote, selected && styles.selected]}>
    <View style={styles.quoteTop}><View style={styles.avatar}><Icon name="engineering" size={22} color={colors.primary} /></View><View style={styles.provider}><Text variant="headlineSm">Provider #{quote.providerId}</Text><Text variant="bodySm" color={colors.textMuted}>{quote.pricingType === 'hourly' ? 'Hourly estimate' : 'Fixed price'} · {quote.estimatedDurationMinutes} min</Text></View><Text variant="headlineMd" color={colors.primary}>${quote.amount.toFixed(0)}</Text></View>
    <View style={styles.metrics}><Metric icon="schedule" label="Arrival" value={new Date(quote.arrivalWindow.from).toLocaleDateString()} /><Metric icon="payments" label="Pricing" value={quote.pricingType === 'hourly' ? `$${quote.hourlyRate ?? quote.amount}/hr` : 'Fixed total'} /></View>
    {quote.notes ? <Text variant="bodyMd" color={colors.textSecondary} style={styles.notes}>{quote.notes}</Text> : null}
    <Button label={selected ? 'Provider selected' : 'Select provider'} loading={busy} disabled={selected} fullWidth onPress={onSelect} />
  </Card>;
}

function Metric({ icon, label, value }: { icon: 'schedule' | 'payments'; label: string; value: string }) { return <View style={styles.metric}><Icon name={icon} size={16} color={colors.textMuted} /><Text variant="labelSm" color={colors.textMuted}>{label}</Text><Text variant="labelMd">{value}</Text></View>; }

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg }, list: { padding: spacing.base, paddingBottom: spacing.xxxl, gap: spacing.md }, intro: { gap: spacing.sm, marginBottom: spacing.sm }, summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }, quote: { gap: spacing.md }, selected: { borderColor: colors.secondary, borderWidth: 2 }, quoteTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, avatar: { width: 46, height: 46, borderRadius: radius.pill, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, provider: { flex: 1, gap: 2 }, metrics: { flexDirection: 'row', gap: spacing.xl, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderLight, paddingVertical: spacing.md }, metric: { gap: 3 }, notes: { lineHeight: 21 }, empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl } });

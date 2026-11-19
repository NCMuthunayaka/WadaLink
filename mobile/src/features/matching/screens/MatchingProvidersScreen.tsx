import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Icon from '@/components/ui/Icon';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';
import FlowProgress from '@/features/requests/components/FlowProgress';
import type { CustomerStackScreenProps } from '@/navigation/types';
import { useGetMatchesQuery } from '@/services/api/requests';
import ProviderMatchCard from '../components/ProviderMatchCard';
import { applyMatchFilters, badgesFor, DEFAULT_FILTERS, type MatchFilters } from '../filters';
import { describeWeights } from '../labels';

type ToggleKey = 'within5km' | 'topRated' | 'verifiedOnly';

export default function MatchingProvidersScreen({
  navigation,
  route,
}: CustomerStackScreenProps<'MatchingProviders'>) {
  const { requestId } = route.params;
  const { data, isLoading, isError, isFetching, refetch } = useGetMatchesQuery(requestId);
  const [filters, setFilters] = useState<MatchFilters>(DEFAULT_FILTERS);

  const visible = useMemo(() => applyMatchFilters(data?.providers ?? [], filters), [data, filters]);
  const badges = useMemo(() => badgesFor(data?.providers ?? []), [data]);

  const toggle = (key: ToggleKey) => setFilters((f) => ({ ...f, [key]: !f[key] }));

  const header = <ScreenHeader title="Matching Providers" onBack={() => navigation.goBack()} />;

  if (isLoading) {
    return (
      <View style={styles.root}>
        {header}
        <LoadingState label="Finding the best matches…" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.root}>
        {header}
        <ErrorState onRetry={() => void refetch()} />
      </View>
    );
  }

  const filtersActive = filters.within5km || filters.topRated || filters.verifiedOnly;

  const listHeader = (
    <View style={styles.listHeader}>
      <FlowProgress step={3} label="Matching" />

      <View>
        <Text variant="headlineMd">Recommended Providers</Text>
        <Text variant="bodyMd" color={colors.textSecondary}>
          {data.providers.length} {data.providers.length === 1 ? 'provider matches' : 'providers match'} your
          request and location
        </Text>
      </View>

      <Card variant="ai">
        <View style={styles.formula}>
          <Icon name="auto-awesome" size={18} color={colors.accentDark} />
          <View style={styles.formulaText}>
            <Text variant="labelLg">Transparent AI Dispatch Formula</Text>
            <Text variant="bodySm" color={colors.textSecondary}>
              Ranked by AI score: {describeWeights(data.weights)}.
            </Text>
          </View>
        </View>
      </Card>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Chip
          label="Best Match"
          selected={filters.sort === 'best'}
          onPress={() => setFilters((f) => ({ ...f, sort: 'best' }))}
        />
        <Chip
          label="Price: Low to High"
          selected={filters.sort === 'price'}
          onPress={() => setFilters((f) => ({ ...f, sort: 'price' }))}
        />
        <Chip label="< 5 km" icon="near-me" selected={filters.within5km} onPress={() => toggle('within5km')} />
        <Chip label="4.5+ ★" selected={filters.topRated} onPress={() => toggle('topRated')} />
        <Chip label="Verified Only" icon="verified" selected={filters.verifiedOnly} onPress={() => toggle('verifiedOnly')} />
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.root}>
      {header}
      <FlatList
        data={visible}
        keyExtractor={(provider) => provider.providerId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={isFetching && !isLoading}
        onRefresh={() => void refetch()}
        renderItem={({ item }) => (
          <ProviderMatchCard
            provider={item}
            weights={data.weights}
            badges={badges.get(item.providerId)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="search-off" size={40} color={colors.borderStrong} />
            <Text variant="headlineSm">
              {data.providers.length === 0 ? 'No providers yet' : 'No providers match these filters'}
            </Text>
            <Text variant="bodyMd" color={colors.textMuted} style={styles.emptyText}>
              {data.providers.length === 0
                ? 'We do not have verified providers for this category in your area yet.'
                : 'Try removing a filter to see more providers.'}
            </Text>
            {filtersActive ? (
              <Button label="Clear filters" variant="outline" onPress={() => setFilters(DEFAULT_FILTERS)} />
            ) : null}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.base, paddingBottom: spacing.xxxl },
  listHeader: { gap: spacing.base, marginBottom: spacing.base },
  formula: { flexDirection: 'row', gap: spacing.md },
  formulaText: { flex: 1, gap: 2 },
  filters: { gap: spacing.sm, paddingRight: spacing.base },
  separator: { height: spacing.md },
  empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  emptyText: { textAlign: 'center', marginBottom: spacing.sm },
});
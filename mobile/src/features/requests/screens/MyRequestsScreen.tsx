import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';
import type { CustomerTabScreenProps } from '@/navigation/types';
import { useGetCategoriesQuery, useGetMyRequestsQuery } from '@/services/api/requests';
import RequestCard from '../components/RequestCard';

export default function MyRequestsScreen({ navigation }: CustomerTabScreenProps<'Jobs'>) {
  const categories = useGetCategoriesQuery();
  const { data, isLoading, isError, isFetching, refetch } = useGetMyRequestsQuery();

  const categoryName = (id?: string) => categories.data?.find((c) => c.id === id)?.name;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="My Requests"
        right={
          <Button label="New" size="sm" icon="add" onPress={() => navigation.navigate('CreateRequest')} />
        }
      />

      {isLoading ? (
        <LoadingState label="Loading your requests…" />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(request) => request.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={isFetching && !isLoading}
          onRefresh={() => void refetch()}
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              categoryName={categoryName(item.categoryId)}
              onPress={() => navigation.navigate('MatchingProviders', { requestId: item.id })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}><Icon name="assignment" size={32} color={colors.secondary} /></View>
              <Text variant="headlineSm">No requests yet</Text>
              <Text variant="bodyMd" color={colors.textMuted} style={styles.emptyText}>
                Describe a problem and we will match you with verified providers.
              </Text>
              <Button
                label="Create Service Request"
                variant="ai"
                onPress={() => navigation.navigate('CreateRequest')}
              />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.base, flexGrow: 1 },
  separator: { height: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  emptyIcon: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondaryContainer, marginBottom: spacing.sm },
  emptyText: { textAlign: 'center', marginBottom: spacing.base },
});

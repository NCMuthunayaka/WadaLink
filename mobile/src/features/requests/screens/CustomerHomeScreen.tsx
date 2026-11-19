import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormError from '@/components/common/FormError';
import SectionHeader from '@/components/common/SectionHeader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, spacing } from '@/constants/theme';
import type { CustomerTabScreenProps } from '@/navigation/types';
import { useGetCategoriesQuery, useGetMyRequestsQuery } from '@/services/api/requests';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';
import CategoryTile from '../components/CategoryTile';
import RequestCard from '../components/RequestCard';

export default function CustomerHomeScreen({ navigation }: CustomerTabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const user = useAppSelector(selectUser);
  const categories = useGetCategoriesQuery();
  const requests = useGetMyRequestsQuery();

  const firstName = user?.name.split(' ')[0] ?? 'there';
  const recent = (requests.data ?? []).slice(0, 3);
  const categoryName = (id?: string) => categories.data?.find((c) => c.id === id)?.name;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.base }]}
      refreshControl={
        <RefreshControl
          refreshing={requests.isFetching && !requests.isLoading}
          onRefresh={() => {
            void requests.refetch();
          }}
        />
      }
    >
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeIcon}><Icon name="home-repair-service" size={22} color={colors.primary} /></View>
        <View style={styles.welcomeText}>
          <Text variant="headlineMd">Hello, {firstName} 👋</Text>
          <Text variant="bodyMd" color={colors.textSecondary}>What do you need help with today?</Text>
        </View>
      </View>

      <Card variant="dark" style={styles.dispatch}>
        <View style={styles.dispatchHead}>
          <View style={styles.dispatchIcon}>
            <Icon name="bolt" size={22} color={colors.warning} />
          </View>
          <View style={styles.dispatchText}>
            <Text variant="headlineSm" color={colors.textInverse}>
              Instant Dispatch
            </Text>
            <Text variant="bodyMd" color={colors.textDisabled}>
              Need an urgent repair? AI matches verified technicians in minutes.
            </Text>
          </View>
        </View>
        <Button
          label="Create Service Request"
          variant="ai"
          size="lg"
          fullWidth
          icon="add-circle-outline"
          onPress={() => navigation.navigate('CreateRequest')}
        />
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Popular Categories" />
        {categories.isError ? (
          <FormError message="Could not load categories. Pull down to try again." />
        ) : (
          <View style={styles.grid}>
            {(categories.data ?? []).map((category) => (
              <CategoryTile
                key={category.id}
                category={category}
                onPress={() => navigation.navigate('CreateRequest', { categoryId: category.id })}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Your Requests"
          actionLabel={recent.length > 0 ? 'See all' : undefined}
          onActionPress={() => navigation.navigate('Jobs')}
        />
        {recent.length === 0 && !requests.isLoading ? (
          <Text variant="bodyMd" color={colors.textMuted}>
            No requests yet. Create your first one above.
          </Text>
        ) : null}
        {recent.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            categoryName={categoryName(request.categoryId)}
            onPress={() => navigation.navigate('MatchingProviders', { requestId: request.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl, gap: spacing.xl },
  dispatch: { gap: spacing.base },
  dispatchHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dispatchIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warningLight,
  },
  dispatchText: { flex: 1 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  welcomeIcon: { width: 46, height: 46, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  welcomeText: { flex: 1, gap: spacing.xs },
  section: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.base },
});

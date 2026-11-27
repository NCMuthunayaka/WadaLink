import React from 'react';
import { ImageBackground, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormError from '@/components/common/FormError';
import SectionHeader from '@/components/common/SectionHeader';
import Button from '@/components/ui/Button';
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
        <View style={styles.welcomeText}>
          <Text variant="bodySm" color={colors.textMuted}>WELCOME BACK</Text>
          <Text variant="headlineMd">Hello, {firstName}</Text>
        </View>
      </View>

      <ImageBackground
        source={require('../../../../assets/wedalink-hero.png')}
        resizeMode="cover"
        imageStyle={styles.heroImage}
        style={styles.hero}
        accessibilityLabel="A home-service professional ready to help"
      >
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.02)', 'rgba(15, 23, 42, 0.88)']}
          locations={[0.2, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <Text variant="labelSm" color={colors.textInverse}>WEDALINK HOME SERVICES</Text>
          <Text variant="headlineMd" color={colors.textInverse}>Home repairs, made easy.</Text>
          <Text variant="bodySm" color={colors.textInverse}>
            Describe the problem. We’ll help you find the right professional.
          </Text>
          <Button
            label="Describe your issue"
            variant="ai"
            size="md"
            fullWidth
            icon="add-circle-outline"
            onPress={() => navigation.navigate('CreateRequest')}
          />
        </View>
      </ImageBackground>

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
          <View style={styles.emptyState}>
            <Text variant="headlineSm">No requests yet</Text>
            <Text variant="bodySm" color={colors.textSecondary}>
              Your service requests and provider updates will appear here.
            </Text>
          </View>
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
  welcomeRow: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: { gap: spacing.xs },
  hero: {
    height: 250,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.dark,
    justifyContent: 'flex-end',
  },
  heroImage: { borderRadius: radius.xl },
  heroContent: { padding: spacing.lg, gap: spacing.sm },
  section: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.base },
  emptyState: {
    padding: spacing.lg,
    gap: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

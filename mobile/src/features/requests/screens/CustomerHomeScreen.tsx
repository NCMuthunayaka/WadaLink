import React from 'react';
import { ImageBackground, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormError from '@/components/common/FormError';
import SectionHeader from '@/components/common/SectionHeader';
import Button from '@/components/ui/Button';
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
        <View style={styles.welcomeText}>
          <Text variant="bodySm" color={colors.textMuted}>WELCOME BACK</Text>
          <Text variant="headlineMd">Hello, {firstName}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open your profile"
          onPress={() => navigation.navigate('Profile')}
          style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
        >
          <Text variant="labelLg" color={colors.primary}>{firstName.charAt(0).toUpperCase()}</Text>
          <Icon name="chevron-right" size={18} color={colors.primary} />
        </Pressable>
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

      <View style={styles.quickActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start a new service request"
          onPress={() => navigation.navigate('CreateRequest')}
          style={({ pressed }) => [styles.quickCard, styles.quickCardBlue, pressed && styles.pressed]}
        >
          <View style={styles.quickIcon}><Icon name="add-circle-outline" size={22} color={colors.primary} /></View>
          <View style={styles.quickCopy}><Text variant="labelLg">Request a service</Text><Text variant="bodySm" color={colors.textSecondary}>Tell us what needs fixing</Text></View>
          <Icon name="chevron-right" size={18} color={colors.primary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Browse equipment rentals"
          onPress={() => navigation.navigate('Jobs')}
          style={({ pressed }) => [styles.quickCard, styles.quickCardTeal, pressed && styles.pressed]}
        >
          <View style={[styles.quickIcon, styles.quickIconTeal]}><Icon name="handyman" size={22} color={colors.secondary} /></View>
          <View style={styles.quickCopy}><Text variant="labelLg">Rent equipment</Text><Text variant="bodySm" color={colors.textSecondary}>Get the right tools</Text></View>
          <Icon name="chevron-right" size={18} color={colors.secondary} />
        </Pressable>
      </View>

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

      <View style={styles.howItWorks}>
        <View style={styles.sectionHeadingRow}>
          <View><Text variant="headlineSm" color={colors.textInverse}>How WedaLink helps</Text><Text variant="bodySm" color={colors.borderStrong}>Three simple steps to get moving</Text></View>
          <Icon name="auto-awesome" size={22} color={colors.accent} />
        </View>
        <View style={styles.stepsRow}>
          {[
            ['1', 'Describe', 'Share the problem'],
            ['2', 'Choose', 'Compare trusted help'],
            ['3', 'Relax', 'Track it in one place'],
          ].map(([number, title, description]) => (
            <View style={styles.step} key={number}>
              <View style={styles.stepNumber}><Text variant="labelLg" color={colors.primary}>{number}</Text></View>
              <Text variant="labelLg" color={colors.textInverse}>{title}</Text>
              <Text variant="bodySm" color={colors.borderStrong}>{description}</Text>
            </View>
          ))}
        </View>
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
  profileButton: { marginLeft: 'auto', minHeight: 44, paddingLeft: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  welcomeText: { gap: spacing.xs },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  hero: {
    height: 250,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.dark,
    justifyContent: 'flex-end',
  },
  heroImage: { borderRadius: radius.xl },
  heroContent: { padding: spacing.lg, gap: spacing.sm },
  quickActions: { gap: spacing.sm },
  quickCard: { minHeight: 72, padding: spacing.md, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1 },
  quickCardBlue: { backgroundColor: colors.primaryLight, borderColor: colors.borderStrong },
  quickCardTeal: { backgroundColor: colors.surfaceLow, borderColor: colors.secondaryContainer },
  quickIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  quickIconTeal: { backgroundColor: colors.surface },
  quickCopy: { flex: 1, gap: 2 },
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
  howItWorks: { padding: spacing.lg, gap: spacing.lg, minHeight: 218, borderRadius: radius.xl, backgroundColor: colors.dark },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepsRow: { flexDirection: 'row', gap: spacing.md },
  step: { flex: 1, gap: spacing.xs, minWidth: 0 },
  stepNumber: { width: 32, height: 32, borderRadius: radius.pill, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
});

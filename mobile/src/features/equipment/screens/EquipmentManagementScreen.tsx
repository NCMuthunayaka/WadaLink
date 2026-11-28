import React from 'react';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import {
  View,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { setFilter } from '@/store/equipmentSlice';
import { useAppDispatch } from '@/store/hooks';
import { useUpdateEquipmentStatusMutation } from '@/services/api/equipment';
import { useEquipmentFleet } from '@/features/equipment/hooks/useEquipmentFleet';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import Text from '@/components/ui/Text';
import { colors, fontSize, fontWeight, radius, spacing, shadow } from '../../../constants/theme';
import StatsRow from '../components/StatsRow';
import FilterTabs from '../components/FilterTabs';
import DemandBanner from '../components/DemandBanner';
import EquipmentCard from '../components/EquipmentCard';
import SmartLockboxStrip from '../components/SmartLockboxStrip';
import Button from '../../../components/ui/Button';
import type { Equipment, FilterTab } from '../../../types/equipment';
import type { RootStackParamList } from '@/navigation/types';

export default function EquipmentManagementScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [feedback, setFeedback] = React.useState('');
    const dispatch = useAppDispatch();
  const {
    items: equipment,
    stats,
    filterCounts,
    activeFilter,
    status,
    isRefreshing,
    refetch,
  } = useEquipmentFleet();
  const [updateStatus] = useUpdateEquipmentStatusMutation();

  const handleFilterSelect = (filter: FilterTab) => {
    dispatch(setFilter(filter));
  };

  const handleManageRental = (id: string) => {
    navigation.navigate('Reservations');
  };

  const handleViewContract = (id: string) => {
    navigation.navigate('EquipmentDetail', { equipmentId: id });
  };

  const handleEditListing = (id: string) => {
    navigation.navigate('EquipmentForm', { equipmentId: id });
  };


  const handleBookings = (id: string) => {
    navigation.navigate('Reservations');
  };

    const changeStatus = async (
    id: string,
    next: Equipment['status'],
    successTitle: string,
    successMessage: string,
  ) => {
    try {
      await updateStatus({ id, status: next }).unwrap();
      setFeedback(`${successTitle}: ${successMessage}`);
    } catch {
      setFeedback('The change could not be saved. Please try again.');
    }
  };

  const handlePauseListing = (id: string) =>
    changeStatus(id, 'maintenance', 'Paused', 'Listing has been paused.');

  const handleCheckIn = (id: string) =>
    changeStatus(id, 'available', 'Checked In ✅', 'Equipment marked as available.');

  const handleAddEquipment = () => {
    navigation.navigate('EquipmentForm');
  };

  const renderItem = ({ item }: { item: Equipment }) => (
    <EquipmentCard
      item={item}
      onManageRental={handleManageRental}
      onViewContract={handleViewContract}
      onEditListing={handleEditListing}
      onPauseListing={handlePauseListing}
      onBookings={handleBookings}
      onCheckIn={handleCheckIn}
    />
  );

  const ListHeader = () => (
    <>
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      {/* ── Profile Bar ─────────────────────────── */}
      <View style={styles.profileBar}>
        <View style={styles.profileLeft}>
          <View style={styles.onlineDot} />
          <Text style={styles.profileLabel}>
            FLEET HUB · <Text style={styles.profileName}>MARCUS RODRIGUEZ</Text>
          </Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedIcon}>✓</Text>
          <Text style={styles.verifiedText}>Verified Lender</Text>
        </View>
      </View>

      <ImageBackground
        source={require('../../../../assets/rental-equipment.png')}
        resizeMode="cover"
        imageStyle={styles.fleetImage}
        style={styles.fleetHero}
        accessibilityLabel="Rental equipment including a ladder, drill, pressure washer and safety helmet"
      >
        <View style={styles.fleetHeroOverlay}>
          <Text style={styles.fleetHeroTitle}>Tools for the job</Text>
          <Text style={styles.fleetHeroText}>Keep every rental ready, visible and easy to manage.</Text>
        </View>
      </ImageBackground>

      {/* ── Stats ───────────────────────────────── */}
      <StatsRow stats={stats} />

      {/* ── Add Equipment CTA ────────────────────── */}
      <View style={styles.ctaWrapper}>
        <Button
          label="Add New Equipment"
          icon="add-circle-outline"
          onPress={handleAddEquipment}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>

      {/* ── Demand Banner ───────────────────────── */}
      <DemandBanner />

      {/* ── Filter Tabs ─────────────────────────── */}
      <FilterTabs
        tabs={filterCounts}
        active={activeFilter}
        onSelect={handleFilterSelect}
      />
    </>
  );

  const ListFooter = () => (
    <SmartLockboxStrip
      lockboxId="Smart Lockbox #04 (Downtown...)"
      batteryPct={94}
      onViewCode={() => setFeedback('Lockbox code is available in the secure handover flow.')}
    />
  );

  if (status === 'loading') return <LoadingState label="Loading your fleet…" />;
  if (status === 'error') return <ErrorState onRetry={refetch} />;

  return (
    
    <SafeAreaView style={styles.safeArea}>
      
      <StatusBar style="dark" />

      {/* ── App Header ─────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Equipment Management</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn}>
            <Text style={styles.avatarInitials}>MR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Equipment List ─────────────────────── */}
      <FlatList
        data={equipment}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        refreshing={isRefreshing}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No equipment found</Text>
            <Text style={styles.emptySubtitle}>
              No items match the selected filter.
            </Text>
          </View>
        }
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  feedback: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  iconBtnText: {
    fontSize: 18,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textInverse,
  },

  // Profile Bar
  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  fleetHero: {
    height: 164,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.dark,
  },
  fleetImage: { borderRadius: radius.xl },
  fleetHeroOverlay: { padding: spacing.lg, width: '68%', backgroundColor: 'rgba(15,23,42,0.68)', borderTopRightRadius: radius.xl },
  fleetHeroTitle: { color: colors.textInverse, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  fleetHeroText: { color: colors.borderStrong, fontSize: fontSize.sm, lineHeight: 18 },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  profileLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  profileName: {
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  verifiedIcon: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  verifiedText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },

  // CTA
  ctaWrapper: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },

  // List
  listContent: {
    paddingBottom: spacing.xxl,
  },

  // Empty State
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

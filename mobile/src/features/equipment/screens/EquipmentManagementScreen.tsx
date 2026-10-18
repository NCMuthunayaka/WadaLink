import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectFilteredEquipment,
  selectStats,
  selectFilterCounts,
  selectActiveFilter,
  setFilter,
  updateEquipmentStatus,
} from '../../../store/equipmentSlice';
import type { RootState } from '../../../store/store';
import { colors, fontSize, fontWeight, radius, spacing, shadow } from '../../../constants/theme';
import StatsRow from '../components/StatsRow';
import FilterTabs from '../components/FilterTabs';
import DemandBanner from '../components/DemandBanner';
import EquipmentCard from '../components/EquipmentCard';
import SmartLockboxStrip from '../components/SmartLockboxStrip';
import Button from '../../../components/ui/Button';
import type { Equipment, FilterTab } from '../../../types/equipment';

export default function EquipmentManagementScreen() {
  const dispatch = useDispatch();
  const equipment = useSelector(selectFilteredEquipment);
  const stats = useSelector(selectStats);
  const filterCounts = useSelector(selectFilterCounts);
  const activeFilter = useSelector(selectActiveFilter);

  const handleFilterSelect = (filter: FilterTab) => {
    dispatch(setFilter(filter));
  };

  const handleManageRental = (id: string) => {
    Alert.alert('Manage Rental', `Opening rental management for item ${id}`);
  };

  const handleViewContract = (id: string) => {
    Alert.alert('View Contract', `Opening contract for item ${id}`);
  };

  const handleEditListing = (id: string) => {
    Alert.alert('Edit Listing', `Editing listing for item ${id}`);
  };

  const handlePauseListing = (id: string) => {
    dispatch(updateEquipmentStatus({ id, status: 'maintenance' }));
    Alert.alert('Paused', 'Listing has been paused.');
  };

  const handleBookings = (id: string) => {
    Alert.alert('Bookings', `Viewing bookings for item ${id}`);
  };

  const handleCheckIn = (id: string) => {
    dispatch(updateEquipmentStatus({ id, status: 'available' }));
    Alert.alert('Checked In ✅', 'Equipment marked as available.');
  };

  const handleAddEquipment = () => {
    Alert.alert('Add Equipment', 'Opening equipment creation form…');
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

      {/* ── Stats ───────────────────────────────── */}
      <StatsRow stats={stats} />

      {/* ── Add Equipment CTA ────────────────────── */}
      <View style={styles.ctaWrapper}>
        <Button
          label="Add New Equipment"
          icon="⊕"
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
      onViewCode={() => Alert.alert('Lockbox Code', '🔒 Code: 4829\nValid until 5 PM')}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

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

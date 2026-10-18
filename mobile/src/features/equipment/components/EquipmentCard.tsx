import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadow,
  spacing,
} from '../../../constants/theme';
import StatusBadge from '../../../components/ui/StatusBadge';
import Button from '../../../components/ui/Button';
import type { Equipment } from '../../../types/equipment';

interface EquipmentCardProps {
  item: Equipment;
  onManageRental?: (id: string) => void;
  onViewContract?: (id: string) => void;
  onEditListing?: (id: string) => void;
  onPauseListing?: (id: string) => void;
  onBookings?: (id: string) => void;
  onCheckIn?: (id: string) => void;
}

// Fallback placeholder image (data URI for a grey box)
const PLACEHOLDER =
  'https://via.placeholder.com/80x80/E5E7EB/9CA3AF?text=IMG';

export default function EquipmentCard({
  item,
  onManageRental,
  onViewContract,
  onEditListing,
  onPauseListing,
  onBookings,
  onCheckIn,
}: EquipmentCardProps) {
  const { id, name, category, pricePerDay, deposit, deliveryFee, deliveryRadius, status, tags, description, activeRental } = item;
  const imageUri = item.imageUrl ?? PLACEHOLDER;

  return (
    <View style={styles.card}>
      {/* ── Top row: image + details ─────────────────────────── */}
      <View style={styles.topRow}>
        {/* Equipment image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Tags on image */}
          {tags && tags.length > 0 && (
            <View style={styles.tagOverlay}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.details}>
          {/* Status badge */}
          <View style={styles.badgeRow}>
            <StatusBadge status={status} size="sm" />
            {activeRental?.dueTime && (
              <Text style={styles.dueTime}>{activeRental.dueTime}</Text>
            )}
          </View>

          {/* Name */}
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

          {/* Category */}
          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${pricePerDay}</Text>
            <Text style={styles.perDay}>/day</Text>
            {deposit != null && (
              <Text style={styles.deposit}> ${deposit} hold</Text>
            )}
          </View>
        </View>
      </View>

      {/* ── Context row (renter info / description) ──────────── */}
      {activeRental?.renterName && (
        <View style={styles.contextRow}>
          <Text style={styles.contextIcon}>👤</Text>
          <Text style={styles.contextText}>
            Rented by{' '}
            <Text style={styles.contextBold}>{activeRental.renterName}</Text>
            {activeRental.dueTime ? ` · Active until ${activeRental.dueTime} today` : ''}
          </Text>
          {activeRental.renterPhone && (
            <TouchableOpacity>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {activeRental?.pickupLocation && status === 'reserved' && (
        <View style={styles.contextRow}>
          <Text style={styles.contextIcon}>📍</Text>
          <Text style={styles.contextText}>
            Pickup {activeRental.pickupLocation} · Same-day return
          </Text>
        </View>
      )}

      {status === 'return_pending' && activeRental?.returnLocation && (
        <View style={styles.contextRow}>
          <Text style={styles.contextIcon}>📦</Text>
          <Text style={styles.contextText}>
            Renter in transit to Drop-off Location{'\n'}
            <Text style={styles.contextBold}>
              ETA: {activeRental.eta} ({activeRental.returnLocation})
            </Text>
          </Text>
        </View>
      )}

      {description && !activeRental && (
        <View style={styles.descRow}>
          <Text style={styles.descText} numberOfLines={2}>
            {description}
          </Text>
        </View>
      )}

      {deliveryFee != null && deliveryRadius != null && (
        <View style={styles.contextRow}>
          <Text style={styles.contextIcon}>🚛</Text>
          <Text style={styles.contextText}>
            Trailer delivery available within {deliveryRadius} miles (${deliveryFee})  ✅
          </Text>
        </View>
      )}

      {/* ── Action buttons ───────────────────────────────────── */}
      <View style={styles.actions}>
        {status === 'reserved' && (
          <>
            <Button
              label="Manage Rental"
              icon="☰"
              onPress={() => onManageRental?.(id)}
              variant="secondary"
              size="sm"
              style={styles.actionBtn}
            />
            <Button
              label="View Contract"
              icon="📄"
              onPress={() => onViewContract?.(id)}
              variant="outline"
              size="sm"
              style={styles.actionBtn}
            />
          </>
        )}

        {status === 'available' && (
          <>
            <Button
              label="Edit Listing"
              icon="✏"
              onPress={() => onEditListing?.(id)}
              variant="outline"
              size="sm"
              style={styles.actionBtn}
            />
            <Button
              label="Pause Listing"
              icon="⏸"
              onPress={() => onPauseListing?.(id)}
              variant="outline"
              size="sm"
              style={styles.actionBtn}
            />
          </>
        )}

        {status === 'return_pending' && (
          <Button
            label="Inspect & Check In"
            icon="🔍"
            onPress={() => onCheckIn?.(id)}
            variant="primary"
            size="sm"
            fullWidth
            style={styles.singleBtn}
          />
        )}

        {status === 'in_rent' && (
          <>
            <Button
              label="Edit Listing"
              icon="✏"
              onPress={() => onEditListing?.(id)}
              variant="outline"
              size="sm"
              style={styles.actionBtn}
            />
            <Button
              label="Bookings"
              icon="📅"
              onPress={() => onBookings?.(id)}
              variant="outline"
              size="sm"
              style={styles.actionBtn}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    padding: spacing.base,
    ...shadow.md,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  imageWrapper: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.borderLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    gap: 2,
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tagText: {
    fontSize: 9,
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dueTime: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  price: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  perDay: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    marginLeft: 1,
  },
  deposit: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginLeft: spacing.sm,
    textDecorationLine: 'line-through',
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  contextIcon: {
    fontSize: 13,
    marginTop: 1,
  },
  contextText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  contextBold: {
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  callIcon: {
    fontSize: 15,
  },
  descRow: {
    marginBottom: spacing.sm,
  },
  descText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  singleBtn: {
    flex: 1,
  },
});

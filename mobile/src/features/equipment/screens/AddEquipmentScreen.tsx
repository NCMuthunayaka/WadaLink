import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addEquipment } from '../../../store/equipmentSlice';
import { colors, fontSize, fontWeight, radius, spacing, shadow } from '../../../constants/theme';
import Button from '../../../components/ui/Button';
import type { Equipment, EquipmentCondition } from '../../../types/equipment';

const CATEGORIES = [
  'Diagnostic Tools',
  'Power Tools',
  'Heavy Machinery',
  'Conduit Benders',
];

const CONDITIONS: { key: EquipmentCondition; label: string; sub: string; icon: string }[] = [
  { key: 'like_new', label: 'Like New', sub: 'Calibrated', icon: '✓' },
  { key: 'good', label: 'Good', sub: 'Minor Wear', icon: '👍' },
  { key: 'worksite', label: 'Worksite', sub: 'Field Ready', icon: '⚙' },
];

const MIN_PERIODS = ['1 Day', '2 Days', '3 Days', '1 Week'];

interface AddEquipmentScreenProps {
  navigation?: any;
}

export default function AddEquipmentScreen({ navigation }: AddEquipmentScreenProps) {
  const dispatch = useDispatch();

  // Form State
  const [title, setTitle] = useState('FLIR E8-XT Infrared Thermal Imaging Camera');
  const [selectedCategory, setSelectedCategory] = useState('Diagnostic Tools');
  const [condition, setCondition] = useState<EquipmentCondition>('like_new');
  const [dailyRate, setDailyRate] = useState('45.00');
  const [securityDeposit, setSecurityDeposit] = useState('150.00');
  const [minPeriod, setMinPeriod] = useState('1 Day');
  const [mandatoryInsurance, setMandatoryInsurance] = useState(true);
  const [pickupStation, setPickupStation] = useState('Austin Downtown Workshop (742 E 6th St)');
  const [description, setDescription] = useState(
    'Professional 320×240 IR resolution thermal imaging camera. Fully calibrated. Includes hard case, 2 batteries, and charging dock.'
  );
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80',
  ]);

  const handleEnhanceWithAI = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setDescription(
        'Professional 320×240 IR resolution thermal imaging camera with MSX detail. Fully calibrated for electrical panel diagnostics, HVAC air leaks, and moisture boundary tracing. Includes rugged hard case, 2 batteries, and charging dock.'
      );
      setIsEnhancing(false);
      Alert.alert('AI TradeAssist', 'Description enhanced with high-conversion technical specifications!');
    }, 600);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddPhoto = () => {
    // Add sample high-res tool photo
    const samplePhotos = [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&q=80',
    ];
    if (images.length < 5) {
      setImages([...images, samplePhotos[images.length % samplePhotos.length]]);
      Alert.alert('Photo Added', 'High-res image attached to listing.');
    } else {
      Alert.alert('Limit Reached', 'Maximum 5 photos allowed.');
    }
  };

  const handleSaveDraft = () => {
    Alert.alert('Draft Saved', 'Your equipment listing has been saved to drafts.');
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an equipment title.');
      return;
    }

    const rate = parseFloat(dailyRate) || 45;
    const deposit = parseFloat(securityDeposit) || 150;

    const newEquipment: Equipment = {
      id: `eq-${Date.now()}`,
      assetTag: `#EQ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: title,
      category: selectedCategory,
      imageUrl: images[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80',
      condition,
      conditionLabel:
        condition === 'like_new'
          ? 'Like New / Calibrated'
          : condition === 'good'
          ? 'Good / Minor Wear'
          : 'Worksite / Field Ready',
      calibratedYear: 'Calibrated 2025',
      pricePerDay: rate,
      deposit,
      minRentalPeriod: minPeriod,
      mandatoryInsurance,
      pickupLocation: pickupStation,
      status: 'available',
      statusDetail: 'Ready for dispatch • Instant Booking On',
      tags: ['Ready', condition === 'like_new' ? 'Calibrated' : 'Field Ready'],
      specs: `${selectedCategory} • Calibrated • Escrow Backed`,
      rating: 5.0,
      reviewCount: 0,
      distanceKm: 1.2,
      description,
      owner: {
        id: 'lender-1',
        name: 'Marcus Rodriguez',
        initials: 'MR',
        role: 'Master Electrician',
        isVerified: true,
        isProPartner: true,
        rating: 4.8,
        reviewCount: 38,
        avgResponseTime: '~8 mins',
        location: 'Austin Downtown Workshop',
        distance: '1.4 miles away',
      },
      isInstantBooking: true,
      isBookmarked: false,
    };

    dispatch(addEquipment(newEquipment));

    Alert.alert(
      'Listing Published! 🎉',
      `${title} is now active and listed in the WadaLink Equipment Marketplace.`,
      [
        {
          text: 'View Fleet',
          onPress: () => {
            if (navigation) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Equipment</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MR</Text>
          </View>
        </View>
      </View>

      {/* ── Progress Bar ───────────────────────────────────── */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.stepText}>STEP 1 OF 2</Text>
          <Text style={styles.pctText}>50% Completed</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={styles.progressBarFill} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeading}>Equipment Details & Rental Terms</Text>

        {/* ── Visuals Upload ───────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.fieldLabel}>Equipment Visuals</Text>
          <Text style={styles.fieldSubLabel}>{images.length} of 5 Added</Text>
        </View>

        <View style={styles.visualsRow}>
          {images.map((imgUrl, idx) => (
            <View key={idx} style={styles.thumbnailWrapper}>
              <Image source={{ uri: imgUrl }} style={styles.thumbnail} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => handleRemoveImage(idx)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.imageNameLabel} numberOfLines={1}>
                • Thermal_Camera...
              </Text>
            </View>
          ))}

          {images.length < 5 && (
            <TouchableOpacity style={styles.uploadBox} onPress={handleAddPhoto}>
              <Text style={styles.uploadCameraIcon}>📷</Text>
              <Text style={styles.uploadTitle}>+ Upload Equipment Photos</Text>
              <Text style={styles.uploadSub}>High-res PNG, JPG up to 10MB</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Equipment Title ──────────────────────────────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Equipment Title</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. CAT 301.5 Mini Excavator"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.helperText}>
            Include brand, model, and primary function for faster matching.
          </Text>
        </View>

        {/* ── Category Selection ───────────────────────────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.pillsRow}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  {active && <Text style={styles.categoryCheck}>✓ </Text>}
                  <Text
                    style={[
                      styles.categoryPillText,
                      active && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Equipment Condition ──────────────────────────── */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Equipment Condition</Text>
          <View style={styles.conditionsRow}>
            {CONDITIONS.map((c) => {
              const active = condition === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.conditionCard, active && styles.conditionCardActive]}
                  onPress={() => setCondition(c.key)}
                >
                  <Text style={[styles.conditionIcon, active && styles.conditionIconActive]}>
                    {c.icon}
                  </Text>
                  <Text
                    style={[styles.conditionLabel, active && styles.conditionLabelActive]}
                  >
                    {c.label}
                  </Text>
                  <Text
                    style={[styles.conditionSub, active && styles.conditionSubActive]}
                  >
                    {c.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Rental Pricing & Deposit ─────────────────────── */}
        <View style={styles.cardSection}>
          <View style={styles.cardSectionHeader}>
            <View style={styles.pricingTitleRow}>
              <Text style={styles.cardSectionIcon}>💳</Text>
              <Text style={styles.cardSectionTitle}>Rental Pricing & Deposit</Text>
            </View>
            <View style={styles.escrowBadge}>
              <Text style={styles.escrowBadgeText}>Escrow Backed</Text>
            </View>
          </View>

          <View style={styles.pricingInputsRow}>
            {/* Daily Rate */}
            <View style={styles.priceInputBox}>
              <Text style={styles.priceInputLabel}>Daily Rate</Text>
              <View style={styles.currencyRow}>
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  value={dailyRate}
                  onChangeText={setDailyRate}
                  keyboardType="decimal-pad"
                />
              </View>
              <Text style={styles.priceInputSub}>Per 24h calendar slot</Text>
            </View>

            {/* Security Deposit */}
            <View style={styles.priceInputBox}>
              <Text style={styles.priceInputLabel}>Security Deposit</Text>
              <View style={styles.currencyRow}>
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
                  keyboardType="decimal-pad"
                />
              </View>
              <Text style={styles.priceInputSub}>Refundable on return</Text>
            </View>
          </View>
        </View>

        {/* ── Rental Terms & Requirements ──────────────────── */}
        <View style={styles.termsSection}>
          <Text style={styles.fieldLabel}>Rental Terms & Requirements</Text>

          {/* Min rental period */}
          <View style={styles.termRow}>
            <View style={styles.termLeft}>
              <View style={styles.termIconWrap}>
                <Text style={styles.termIcon}>🕒</Text>
              </View>
              <View>
                <Text style={styles.termTitle}>Minimum Rental Period</Text>
                <Text style={styles.termSub}>Shortest contract accepted</Text>
              </View>
            </View>
            <View style={styles.termSelectorPill}>
              <Text style={styles.termSelectorValue}>{minPeriod} ⌄</Text>
            </View>
          </View>

          {/* Mandatory Insurance */}
          <View style={styles.termRow}>
            <View style={styles.termLeft}>
              <View style={styles.termIconWrap}>
                <Text style={styles.termIcon}>🛡</Text>
              </View>
              <View>
                <Text style={styles.termTitle}>Mandatory Insurance</Text>
                <Text style={styles.termSub}>Renter must hold active COI</Text>
              </View>
            </View>
            <Switch
              value={mandatoryInsurance}
              onValueChange={setMandatoryInsurance}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          {/* Pickup & Return Station */}
          <View style={styles.stationBlock}>
            <View style={styles.termLeft}>
              <View style={styles.termIconWrap}>
                <Text style={styles.termIcon}>📍</Text>
              </View>
              <View>
                <Text style={styles.termTitle}>Pickup & Return Station</Text>
                <Text style={styles.termSub}>Primary yard or locker</Text>
              </View>
            </View>
            <View style={styles.stationInputBox}>
              <Text style={styles.stationInputText}>{pickupStation}</Text>
              <Text style={styles.stationTargetIcon}>🎯</Text>
            </View>
          </View>
        </View>

        {/* ── Equipment Description ────────────────────────── */}
        <View style={styles.inputGroup}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.fieldLabel}>Equipment Description</Text>
            <Text style={styles.fieldSubLabel}>{description.length} / 500 chars</Text>
          </View>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.aiAssistBtn}
            onPress={handleEnhanceWithAI}
            disabled={isEnhancing}
          >
            <Text style={styles.aiAssistIcon}>✨</Text>
            <Text style={styles.aiAssistText}>
              {isEnhancing ? 'Optimizing with AI...' : 'Enhance description with AI TradeAssist'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── ServiceLink Protection Callout ───────────────── */}
        <View style={styles.protectionCallout}>
          <View style={styles.protectionIconWrap}>
            <Text style={styles.protectionIcon}>🛡</Text>
          </View>
          <View style={styles.protectionTextWrap}>
            <Text style={styles.protectionTitle}>
              ServiceLink Equipment Protection •
            </Text>
            <Text style={styles.protectionDesc}>
              Up to $5,000 comprehensive damage protection and automated security deposit hold. Verified escrow payout within 2 hours of checkout inspection.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Sticky Bar ───────────────────────────────── */}
      <View style={styles.bottomBar}>
        <Button
          label="Save Draft"
          variant="outline"
          onPress={handleSaveDraft}
          style={styles.saveDraftBtn}
        />
        <Button
          label="List Equipment Now →"
          variant="primary"
          onPress={handleSubmit}
          style={styles.listNowBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuButton: {
    padding: spacing.xs,
  },
  menuIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  progressContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  stepText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  pctText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '50%',
    height: '100%',
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.base,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  fieldSubLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  visualsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  thumbnailWrapper: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#000',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  imageNameLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    color: '#FFF',
    fontSize: 9,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  uploadBox: {
    flex: 1,
    height: 100,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C7D2FE',
    backgroundColor: '#F5F8FF',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  uploadCameraIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  uploadTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  uploadSub: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: spacing.base,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  helperText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  categoryPillActive: {
    backgroundColor: '#1E293B',
  },
  categoryCheck: {
    color: '#FFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  categoryPillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFF',
    fontWeight: fontWeight.bold,
  },
  conditionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  conditionCard: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  conditionCardActive: {
    backgroundColor: '#EBF3FF',
    borderColor: colors.primary,
  },
  conditionIcon: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  conditionIconActive: {
    color: colors.primary,
  },
  conditionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  conditionLabelActive: {
    color: colors.primary,
  },
  conditionSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  conditionSubActive: {
    color: colors.primary,
  },
  cardSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pricingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardSectionIcon: {
    fontSize: 18,
  },
  cardSectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  escrowBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  escrowBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: '#0D9488',
  },
  pricingInputsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  priceInputBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceInputLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginRight: 4,
  },
  priceInput: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    padding: 0,
    flex: 1,
  },
  priceInputSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  termsSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  termRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  termLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  termIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termIcon: {
    fontSize: 16,
  },
  termTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  termSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  termSelectorPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  termSelectorValue: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  stationBlock: {
    paddingTop: spacing.md,
  },
  stationInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  stationInputText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  stationTargetIcon: {
    fontSize: 16,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    minHeight: 90,
  },
  aiAssistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  aiAssistIcon: {
    fontSize: 14,
    color: colors.primary,
  },
  aiAssistText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  protectionCallout: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  protectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  protectionIcon: {
    fontSize: 16,
    color: '#16A34A',
  },
  protectionTextWrap: {
    flex: 1,
  },
  protectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: '#166534',
    marginBottom: 2,
  },
  protectionDesc: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadow.md,
  },
  saveDraftBtn: {
    flex: 1,
  },
  listNowBtn: {
    flex: 2,
  },
});

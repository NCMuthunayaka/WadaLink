import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Avatar,
  BottomSheet,
  Button,
  Card,
  Chip,
  Input,
  Rating,
  ScreenHeader,
  StatusBadge,
  Stepper,
  Text,
} from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { EquipmentStatus } from '@/types/equipment';

const STATUSES: EquipmentStatus[] = ['available', 'reserved', 'in_rent', 'return_pending', 'maintenance'];
const FILTERS = ['All', 'Electrical', 'Plumbing', 'HVAC'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="labelSm" color={colors.textMuted} style={styles.sectionTitle}>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

export default function UIKitScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'UIKit'>) {
  const [filter, setFilter] = useState('All');
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState(4);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState('');

  return (
    <View style={styles.root}>
      <ScreenHeader title="UI Kit" subtitle="Step 3 preview" right={<Avatar name="Marcus Reed" size={32} />} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Section title="Typography">
          {(Object.keys(typography) as Array<keyof typeof typography>).map((variant) => (
            <Text key={variant} variant={variant}>
              {variant}: Emergency electrical
            </Text>
          ))}
        </Section>

        <Section title="Buttons">
          <View style={styles.stack}>
            <Button label="Confirm Booking" onPress={() => {}} size="lg" fullWidth />
            <Button label="Find & Claim Jobs" onPress={() => {}} size="lg" fullWidth trailingIcon="arrow-forward" />
            <Button label="AI Assist" onPress={() => {}} variant="ai" size="lg" fullWidth icon="auto-awesome" />
            <View style={styles.row}>
              <Button label="Open Tracker" onPress={() => {}} icon="navigation" />
              <Button label="Call" onPress={() => {}} variant="secondary" icon="call" />
              <Button label="Outline" onPress={() => {}} variant="outline" />
            </View>
            <View style={styles.row}>
              <Button label="Ghost" onPress={() => {}} variant="ghost" size="sm" />
              <Button label="Decline" onPress={() => {}} variant="danger" size="sm" />
              <Button label="Loading" onPress={() => {}} loading size="sm" />
              <Button label="Disabled" onPress={() => {}} disabled size="sm" />
            </View>
          </View>
        </Section>

        <Section title="Chips">
          <View style={styles.row}>
            {FILTERS.map((item) => (
              <Chip key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />
            ))}
            <Chip label="Nearby" icon="near-me" count={14} />
          </View>
        </Section>

        <Section title="Status badges">
          <View style={styles.row}>
            {STATUSES.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </View>
        </Section>

        <Section title="Inputs">
          <View style={styles.stack}>
            <Input label="Full name" placeholder="Marcus Reed" value={name} onChangeText={setName} leftIcon="person-outline" />
            <Input label="Address" placeholder="742 Evergreen Terrace" helper="We only share this after booking." leftIcon="place" />
            <Input label="Email" value="not-an-email" error="Enter a valid email address" rightIcon="close" />
            <Input label="Describe the problem" placeholder="What needs fixing?" multiline />
            <Input label="Locked" value="Read only" editable={false} />
          </View>
        </Section>

        <Section title="Cards">
          <View style={styles.stack}>
            <Card>
              <Text variant="headlineSm">Default card</Text>
              <Text variant="bodyMd" color={colors.textSecondary}>Level 1 shadow, 16px radius.</Text>
            </Card>
            <Card variant="ai">
              <Text variant="labelSm" color={colors.accentDark}>AI MATCH · 96%</Text>
              <Text variant="bodyMd" color={colors.textSecondary}>Cyan tint and 4px accent edge, AI features only.</Text>
            </Card>
            <Card variant="dark">
              <Text variant="headlineSm" color={colors.textInverse}>Dispatch panel</Text>
              <Text variant="bodyMd" color={colors.textDisabled}>Inverted surface for live tracking.</Text>
            </Card>
            <Card selected onPress={() => {}}>
              <Text variant="headlineSm">Selected card</Text>
              <Text variant="bodyMd" color={colors.textSecondary}>Primary border and Level 2 shadow.</Text>
            </Card>
          </View>
        </Section>

        <Section title="Avatars and ratings">
          <View style={styles.row}>
            <Avatar name="Alex Morgan" />
            <Avatar name="Sarah T" verified size={56} />
            <Avatar name="Sparkline" size={40} />
          </View>
          <View style={styles.stack}>
            <Rating value={4.8} count={127} />
            <Rating value={rating} size={28} showValue={false} onChange={setRating} />
          </View>
        </Section>

        <Section title="Stepper">
          <Stepper steps={['Details', 'Photos', 'Schedule']} current={step} />
          <View style={styles.row}>
            <Button label="Back" variant="outline" size="sm" disabled={step === 0} onPress={() => setStep((s) => s - 1)} />
            <Button label="Next" size="sm" disabled={step === 2} onPress={() => setStep((s) => s + 1)} />
          </View>
        </Section>

        <Section title="Bottom sheet">
          <Button label="Open sheet" variant="secondary" onPress={() => setSheetOpen(true)} />
        </Section>

        <Button label="Go to Provider tabs" onPress={() => navigation.navigate('ProviderTabs')} variant="outline" fullWidth />
      </ScrollView>

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Filter jobs">
        <View style={styles.row}>
          {FILTERS.map((item) => (
            <Chip key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />
          ))}
        </View>
        <Button label="Apply filters" onPress={() => setSheetOpen(false)} size="lg" fullWidth style={styles.sheetButton} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  section: { marginBottom: spacing.xl },
  sectionTitle: { marginBottom: spacing.sm },
  stack: { gap: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  sheetButton: { marginTop: spacing.base },
});
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';
import { http } from '@/services/api/client';

export default function QuotationSubmissionScreen({ navigation, route }: { navigation: { goBack: () => void }; route: { params: { requestId: string } } }) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [availability, setAvailability] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async () => { setSaving(true); setMessage(''); try { await http.post('/quotations', { request_id: route.params.requestId, price: Number(amount), availability, notes }); setMessage('Quotation sent to the customer.'); } catch { setMessage('Could not send quotation. Please try again.'); } finally { setSaving(false); } };
  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScreenHeader title="Submit quotation" onBack={navigation.goBack} /><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Text variant="headlineMd">Make a clear offer</Text><Text variant="bodyMd" color={colors.textSecondary}>Request #{route.params.requestId} · your quotation will be visible to the customer.</Text><Card style={styles.form}><Input label="Your price" placeholder="e.g. 125" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" /><Input label="Availability" placeholder="Today, 2:00 PM – 4:00 PM" value={availability} onChangeText={setAvailability} /><Input label="Notes for the customer" placeholder="Explain what is included…" value={notes} onChangeText={setNotes} multiline /><View style={styles.tip}><Text variant="labelMd" color={colors.secondary}>Helpful tip</Text><Text variant="bodySm" color={colors.textSecondary}>Mention materials, travel, and what your price includes.</Text></View><Button label="Send quotation" size="lg" fullWidth loading={saving} disabled={!amount || !availability} onPress={() => void submit()} />{message ? <Text variant="bodyMd" color={message.startsWith('Quotation') ? colors.success : colors.danger}>{message}</Text> : null}</Card></ScrollView></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg }, content: { padding: spacing.base, gap: spacing.md }, form: { gap: spacing.md, marginTop: spacing.sm }, tip: { backgroundColor: colors.secondaryContainer, borderRadius: 12, padding: spacing.md, gap: spacing.xs } });

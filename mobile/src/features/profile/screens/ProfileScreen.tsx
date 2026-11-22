import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import { http } from '@/services/api/client';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectUser } from '@/store/sessionSlice';
import type { Role } from '@/types/user';

const ROLE_LABELS: Record<Role, string> = {
  customer: 'Customer',
  provider: 'Service Provider',
  admin: 'Admin',
};

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const user = useAppSelector(selectUser);
  const [proposal, setProposal] = useState('');
  const [proposalStatus, setProposalStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submitProposal = async () => {
    setSubmitting(true);
    try {
      await http.post('/admin/ai/category-proposals', { name: proposal.trim() });
      setProposal('');
      setProposalStatus('Proposal submitted for admin review.');
    } catch {
      setProposalStatus('Could not submit. Check for an existing category or try again.');
    } finally { setSubmitting(false); }
  };

  const confirmSignOut = () =>
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Avatar name={user.name} size={72} />
        <Text variant="headlineSm" style={styles.name}>
          {user.name}
        </Text>
        <Text variant="bodyMd" color={colors.textSecondary}>
          {user.email}
        </Text>
        <View style={styles.roleBadge}>
          <Text variant="labelMd" color={colors.secondary} style={styles.role}>
          {ROLE_LABELS[user.role]}
          </Text>
        </View>
      </Card>

      {user.role === 'provider' ? <Card>
        <Input label="Propose a service category" value={proposal} onChangeText={setProposal} />
        <Button label={submitting ? 'Submitting…' : 'Submit proposal'} disabled={submitting || proposal.trim().length < 2} onPress={() => void submitProposal()} />
        {proposalStatus ? <Text>{proposalStatus}</Text> : null}
      </Card> : null}
      <Button label="Sign out" variant="outline" size="lg" fullWidth icon="logout" onPress={confirmSignOut} />
      {__DEV__ ? (
        <Button label="Open UI kit (dev)" variant="ghost" fullWidth onPress={() => navigation.navigate('UIKit')} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.base, paddingTop: spacing.xxxl, gap: spacing.md, backgroundColor: colors.bg },
  card: { alignItems: 'center', gap: spacing.xs },
  name: { marginTop: spacing.sm },
  role: { marginTop: spacing.xs },
  roleBadge: { marginTop: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 999, backgroundColor: colors.secondaryContainer },
});

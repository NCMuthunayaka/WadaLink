import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';

export default function CategoryProposalForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit() {
    setBusy(true);
    setMessage('');
    try {
      await http.post('/admin/ai/category-proposals', { name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      setMessage('Proposal submitted for admin review.');
    } catch (error) {
      setMessage(toApiError(error).message);
    } finally {
      setBusy(false);
    }
  }
  return <Card style={{ gap: 12 }}>
    <Text variant="headlineSm">Missing a service category?</Text>
    <Text color={colors.textSecondary}>Suggest a service you offer. New categories require admin approval before matching uses them.</Text>
    <Input label="Proposed category" maxLength={100} value={name} onChangeText={setName}/>
    <Input label="Describe the service" multiline maxLength={1000} value={description} onChangeText={setDescription}/>
    <Button label="Submit category proposal" size="lg" variant="secondary" loading={busy} disabled={name.trim().length < 2} onPress={() => void submit()}/>
    {!!message && <Text accessibilityLiveRegion="polite">{message}</Text>}
  </Card>;
}

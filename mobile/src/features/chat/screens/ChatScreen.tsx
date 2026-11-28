import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { colors, radius, spacing } from '@/constants/theme';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';
import type { RootStackParamList } from '@/navigation/types';
interface Message { id: number; senderId: number; text: string; sentAt: string; }

export default function ChatScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Chat'>) {
  const r = useRemote<Message[]>(`/chat/${route.params.requestId}`); const user = useAppSelector(selectUser); const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const reload = r.reload;
  useFocusEffect(useCallback(() => { const timer = setInterval(() => void reload(), 10000); return () => clearInterval(timer); }, [reload]));
  async function send() { setBusy(true); setError(''); try { await http.post(`/chat/${route.params.requestId}`, { text: text.trim() }); setText(''); await r.reload(); } catch (e) { setError(toApiError(e).message); } finally { setBusy(false); } }
  return <FeaturePage title="Job conversation" refresh={() => void r.reload()} refreshing={r.loading}><View style={styles.chatIntro}><View style={styles.chatIcon}><Icon name="chat-bubble-outline" size={22} color={colors.primary} /></View><View style={styles.chatCopy}><Text variant="headlineSm">Keep everything together</Text><Text variant="bodySm" color={colors.textSecondary}>Confirm work, arrival times and questions here for request #{route.params.requestId}.</Text></View></View>{!!r.error && <Notice text={r.error} retry={() => void r.reload()} />}{!r.loading && !r.error && !r.data?.length && <Notice text="Start the conversation by confirming the work and arrival arrangements." />}{r.data?.map(m => { const mine = String(m.senderId) === user?.id; return <View key={m.id} style={[styles.messageRow, mine && styles.messageRowMine]}><View style={[styles.bubble, mine ? styles.myBubble : styles.theirBubble]}><Text variant="labelMd" color={mine ? colors.primaryDark : colors.textSecondary}>{mine ? 'You' : 'Job participant'}</Text><Text color={mine ? colors.textPrimary : colors.textSecondary}>{m.text}</Text><Text color={colors.textMuted} variant="bodySm">{new Date(m.sentAt).toLocaleString()}</Text></View></View>; })}<Card style={s.card}><Input label="Message" placeholder="Write a clear update…" multiline maxLength={4000} value={text} onChangeText={setText} /><Button size="lg" label="Send message" icon="send" loading={busy} disabled={!text.trim() || !!r.error} onPress={() => void send()} />{!!error && <Text color={colors.danger}>{error}</Text>}</Card></FeaturePage>;
}

const styles = StyleSheet.create({
  chatIntro: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  chatIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  chatCopy: { flex: 1, gap: spacing.xs },
  messageRow: { width: '100%', alignItems: 'flex-start' },
  messageRowMine: { alignItems: 'flex-end' },
  bubble: { maxWidth: '86%', padding: spacing.md, borderRadius: radius.lg, gap: spacing.xs, borderWidth: 1 },
  myBubble: { backgroundColor: colors.primaryLight, borderColor: colors.borderStrong, borderBottomRightRadius: radius.sm },
  theirBubble: { backgroundColor: colors.surface, borderColor: colors.border, borderBottomLeftRadius: radius.sm },
});

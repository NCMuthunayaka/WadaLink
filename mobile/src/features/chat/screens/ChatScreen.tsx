import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';
import type { RootStackParamList } from '@/navigation/types';
interface Message {
    id: number;
    senderId: number;
    text: string;
    sentAt: string;
}
export default function ChatScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Chat'>) {
    const r = useRemote<Message[]>(`/chat/${route.params.requestId}`);
    const user = useAppSelector(selectUser);
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const reload = r.reload;
    useFocusEffect(useCallback(() => { const timer = setInterval(() => void reload(), 10000); return () => clearInterval(timer); }, [reload]));
    async function send() { setBusy(true); setError(''); try {
        await http.post(`/chat/${route.params.requestId}`, { text: text.trim() });
        setText('');
        await r.reload();
    }
    catch (e) {
        setError(toApiError(e).message);
    }
    finally {
        setBusy(false);
    } }
    return <FeaturePage title="Job conversation" refresh={() => void r.reload()} refreshing={r.loading}><Text color={colors.textSecondary}>Keep arrangements, progress, and questions together for request #{route.params.requestId}.</Text>{r.error && <Notice text={r.error} retry={() => void r.reload()}/>} {!r.loading && !r.error && !r.data?.length && <Notice text="Start the conversation. Confirm the work and arrival arrangements here."/>}{r.data?.map(m => <Card key={m.id} style={[s.card, { backgroundColor: String(m.senderId) === user?.id ? colors.primaryLight : colors.surface }]}><Text variant="labelMd">{String(m.senderId) === user?.id ? 'You' : 'Job participant'}</Text><Text>{m.text}</Text><Text color={colors.textMuted} variant="bodySm">{new Date(m.sentAt).toLocaleString()}</Text></Card>)}<Card style={s.card}><Input label="Message" multiline maxLength={4000} value={text} onChangeText={setText}/><Button size="lg" label="Send message" loading={busy} disabled={!text.trim() || !!r.error} onPress={() => void send()}/>{error && <Text color={colors.danger}>{error}</Text>}</Card></FeaturePage>;
}

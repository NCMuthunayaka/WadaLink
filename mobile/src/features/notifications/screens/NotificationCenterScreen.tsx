import React, { useState } from 'react';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import { colors } from '@/constants/theme';
interface Notification {
    id: number;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
}
export default function NotificationCenterScreen() { const r = useRemote<Notification[]>('/notifications'); const [error, setError] = useState(''); const [busy, setBusy] = useState<number>(); async function read(id: number) { setBusy(id); setError(''); try {
    await http.post(`/notifications/${id}/read`);
    await r.reload();
}
catch (e) {
    setError(toApiError(e).message);
}
finally {
    setBusy(undefined);
} } return <FeaturePage title="Notifications" refresh={() => void r.reload()} refreshing={r.loading}><Text variant="headlineMd">Stay in the loop</Text><Text>{r.data?.filter(n => !n.read).length ?? 0} unread updates</Text>{(r.error || error) && <Notice text={r.error || error} retry={() => void r.reload()}/>} {!r.loading && !r.error && !r.data?.length && <Notice text="You're all caught up. Job and quotation updates will appear here."/>}{r.data?.map(n => <Card key={n.id} style={[s.card, !n.read && { borderColor: colors.primary }]}><Text variant="headlineSm">{n.title}</Text><Text>{n.body}</Text><Text color={colors.textMuted}>{new Date(n.createdAt).toLocaleString()}</Text>{!n.read && <Button size="lg" variant="outline" loading={busy === n.id} label="Mark as read" onPress={() => void read(n.id)}/>}</Card>)}</FeaturePage>; }

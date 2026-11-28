import React, { useState } from 'react';
import { View } from 'react-native';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/theme';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';

interface Notification { id: number; title: string; body: string; read: boolean; createdAt: string; }

export default function NotificationCenterScreen() {
  const r = useRemote<Notification[]>('/notifications');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number>();
  const unread = r.data?.filter(n => !n.read).length ?? 0;
  async function read(id: number) { setBusy(id); setError(''); try { await http.post(`/notifications/${id}/read`); await r.reload(); } catch (e) { setError(toApiError(e).message); } finally { setBusy(undefined); } }
  return <FeaturePage title="Notifications" refresh={() => void r.reload()} refreshing={r.loading}>
    <View style={s.hero}><View style={s.heroIcon}><Icon name="notifications-none" size={22} color={colors.primary} /></View><Text variant="headlineMd" color={colors.textInverse}>Stay in the loop</Text><Text color={colors.borderStrong}>Important updates about requests, quotes, bookings and messages.</Text><View style={s.statusPill}><Text variant="labelSm" color={colors.primary}>{unread} unread {unread === 1 ? 'update' : 'updates'}</Text></View></View>
    {!!(r.error || error) && <Notice text={r.error || error} retry={() => void r.reload()} />}
    {!r.loading && !r.error && !r.data?.length && <Notice text="You're all caught up. New job and quotation updates will appear here." />}
    {r.data?.map(n => <Card key={n.id} style={[s.card, !n.read && { borderColor: colors.primary, borderWidth: 2 }]}><View style={s.jobHeader}><View style={[s.jobIcon, { backgroundColor: n.read ? colors.surfaceLow : colors.primaryLight }]}><Icon name={n.read ? 'notifications-none' : 'mark-email-unread'} size={19} color={n.read ? colors.textMuted : colors.primary} /></View><View style={s.jobHeading}><Text variant="headlineSm">{n.title}</Text><Text variant="bodySm" color={colors.textMuted}>{new Date(n.createdAt).toLocaleString()}</Text></View></View><Text color={colors.textSecondary}>{n.body}</Text>{!n.read && <Button size="lg" variant="outline" loading={busy === n.id} label="Mark as read" onPress={() => void read(n.id)} />}</Card>)}
  </FeaturePage>;
}

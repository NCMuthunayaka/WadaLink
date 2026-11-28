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
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';

interface Rental { id: number; equipment_name: string; start_date: string; end_date: string; total_price: number; hold_amount: number; delivery_fee: number; status: string; renter_name?: string; pickup_location?: string; notes?: string; }
const tone = (status: string) => ['returned', 'completed'].includes(status) ? { bg: colors.successLight, text: colors.success, icon: 'check-circle' as const } : ['cancelled'].includes(status) ? { bg: colors.dangerLight, text: colors.danger, icon: 'close' as const } : { bg: colors.primaryLight, text: colors.primary, icon: 'event' as const };

export default function ReservationsScreen() {
  const provider = useAppSelector(selectUser)?.role === 'provider';
  const r = useRemote<Rental[]>(provider ? '/reservations/fleet' : '/reservations/my');
  const [history, setHistory] = useState(false); const [busy, setBusy] = useState<number>(); const [message, setMessage] = useState(''); const [confirm, setConfirm] = useState<number>();
  const items = (r.data ?? []).filter(x => history ? ['returned', 'cancelled'].includes(x.status) : !['returned', 'cancelled'].includes(x.status));
  async function transition(id: number, status: string) { setBusy(id); setMessage(''); try { await http.patch(`/reservations/${id}/status`, { status }); setConfirm(undefined); await r.reload(); setMessage('Reservation updated.'); } catch (e) { setMessage(toApiError(e).message); } finally { setBusy(undefined); } }
  return <FeaturePage title="Reservations" refresh={() => void r.reload()} refreshing={r.loading}>
    <View style={s.hero}><View style={s.heroIcon}><Icon name="event" size={22} color={colors.primary} /></View><Text variant="headlineMd" color={colors.textInverse}>{history ? 'Your rental history' : 'Your active rentals'}</Text><Text color={colors.borderStrong}>{provider ? 'Keep every pickup and return clear for your renters.' : 'See dates, costs and next steps in one simple view.'}</Text></View>
    <View style={s.row}><Button size="lg" label="Active rentals" variant={history ? 'outline' : 'primary'} onPress={() => setHistory(false)} /><Button size="lg" label="History" variant={history ? 'primary' : 'outline'} onPress={() => setHistory(true)} /></View>
    {!!(message || r.error) && <Notice text={message || r.error} retry={r.error ? () => void r.reload() : undefined} />}
    {!r.loading && !r.error && !items.length && <Notice text={history ? 'No completed rentals yet.' : 'No active rentals right now.'} />}
    {items.map(x => { const t = tone(x.status); return <Card key={x.id} style={s.card}><View style={s.jobHeader}><View style={[s.jobIcon, { backgroundColor: t.bg }]}><Icon name={t.icon} size={19} color={t.text} /></View><View style={s.jobHeading}><Text variant="labelMd" color={t.text}>{x.status.replaceAll('_', ' ')}</Text><Text variant="headlineSm" numberOfLines={1}>{x.equipment_name}</Text></View><Text variant="labelLg" color={colors.primary}>{x.total_price}</Text></View><View style={s.jobMeta}><Text variant="bodySm" color={colors.textSecondary}>{new Date(x.start_date).toLocaleDateString()} – {new Date(x.end_date).toLocaleDateString()}</Text><Text variant="bodySm" color={colors.textMuted}>{x.delivery_fee ? `Delivery ${x.delivery_fee}` : 'Pickup'}</Text></View><Text color={colors.textSecondary}>Deposit hold: {x.hold_amount}{x.pickup_location ? ` · ${x.pickup_location}` : ''}</Text>{!!x.notes && <Text variant="bodySm" color={colors.textMuted}>{x.notes}</Text>}{provider && x.status === 'reserved' && <Button size="lg" loading={busy === x.id} label="Confirm pickup" icon="local-shipping" onPress={() => void transition(x.id, 'in_rent')} />}{provider && x.status === 'in_rent' && <Button size="lg" loading={busy === x.id} label="Record return in progress" icon="assignment-return" onPress={() => void transition(x.id, 'return_pending')} />}{provider && x.status === 'return_pending' && (confirm === x.id ? <><Text color={colors.textSecondary}>Confirm the equipment has been received and inspected.</Text><Button size="lg" loading={busy === x.id} label="Confirm equipment returned" onPress={() => void transition(x.id, 'returned')} /><Button size="lg" variant="outline" label="Keep pending" onPress={() => setConfirm(undefined)} /></> : <Button size="lg" label="Inspect and confirm return" icon="fact-check" onPress={() => setConfirm(x.id)} />)}{provider && x.status === 'reserved' && <Button size="lg" variant="danger" loading={busy === x.id} label="Cancel reservation" onPress={() => void transition(x.id, 'cancelled')} />}</Card>; })}
  </FeaturePage>;
}

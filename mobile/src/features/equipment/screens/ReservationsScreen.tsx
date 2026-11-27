import React, { useState } from 'react';
import { View } from 'react-native';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';
import { colors } from '@/constants/theme';
interface Rental {
    id: number;
    equipment_name: string;
    start_date: string;
    end_date: string;
    total_price: number;
    hold_amount: number;
    delivery_fee: number;
    status: string;
    renter_name?: string;
    pickup_location?: string;
    notes?: string;
}
export default function ReservationsScreen() { const provider = useAppSelector(selectUser)?.role === 'provider'; const r = useRemote<Rental[]>(provider ? '/reservations/fleet' : '/reservations/my'); const [history, setHistory] = useState(false); const [busy, setBusy] = useState<number>(); const [message, setMessage] = useState(''); const [confirm, setConfirm] = useState<number>(); const items = (r.data ?? []).filter(x => history ? ['returned', 'cancelled'].includes(x.status) : !['returned', 'cancelled'].includes(x.status)); async function transition(id: number, status: string) { setBusy(id); setMessage(''); try {
    await http.patch(`/reservations/${id}/status`, { status });
    setConfirm(undefined);
    await r.reload();
    setMessage('Reservation updated.');
}
catch (e) {
    setMessage(toApiError(e).message);
}
finally {
    setBusy(undefined);
} } return <FeaturePage title="Reservations & rental history" refresh={() => void r.reload()} refreshing={r.loading}><View style={s.row}><Button size="lg" label="Active rentals" variant={history ? 'outline' : 'primary'} onPress={() => setHistory(false)}/><Button size="lg" label="History" variant={history ? 'primary' : 'outline'} onPress={() => setHistory(true)}/></View>{!!(message || r.error) && <Notice text={message || r.error} retry={r.error ? () => void r.reload() : undefined}/>} {!r.loading && !r.error && !items.length && <Notice text="No reservations in this view yet."/>}{items.map(x => <Card key={x.id} style={s.card}><Text color={colors.secondary}>Reservation #{x.id} · {x.status.replaceAll('_', ' ')}</Text><Text variant="headlineSm">{x.equipment_name}</Text><Text>{new Date(x.start_date).toLocaleDateString()} — {new Date(x.end_date).toLocaleDateString()}</Text><Text>Rental total: {x.total_price} · Deposit: {x.hold_amount} · Delivery: {x.delivery_fee}</Text>{!!x.pickup_location && <Text>Pickup: {x.pickup_location}</Text>}{!!x.notes && <Text>{x.notes}</Text>}{provider && x.status === 'reserved' && <Button size="lg" loading={busy === x.id} label="Confirm pickup / dispatch" onPress={() => void transition(x.id, 'in_rent')}/>} {provider && x.status === 'in_rent' && <Button size="lg" loading={busy === x.id} label="Record return in progress" onPress={() => void transition(x.id, 'return_pending')}/>} {provider && x.status === 'return_pending' && (confirm === x.id ? <><Text>Confirm you have received and inspected this equipment. It will become available again.</Text><Button size="lg" loading={busy === x.id} label="Confirm equipment returned" onPress={() => void transition(x.id, 'returned')}/><Button size="lg" variant="outline" label="Keep pending" onPress={() => setConfirm(undefined)}/></> : <Button size="lg" label="Inspect and confirm return" onPress={() => setConfirm(x.id)}/>)}{provider && x.status === 'reserved' && <Button size="lg" variant="danger" loading={busy === x.id} label="Cancel reservation" onPress={() => void transition(x.id, 'cancelled')}/>}</Card>)}</FeaturePage>; }

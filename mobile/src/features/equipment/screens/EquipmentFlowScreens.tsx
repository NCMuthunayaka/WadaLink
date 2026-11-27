import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/theme';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';
import type { RootStackParamList } from '@/navigation/types';
export interface Equipment {
    id: number;
    owner_id: number;
    name: string;
    category: string;
    description?: string;
    image_url?: string;
    price_per_day: number;
    deposit: number;
    status: string;
    pickup_location?: string;
}
export function EquipmentPhoto({ url, name }: {
    url?: string;
    name: string;
}) { const [failed, setFailed] = useState(false); return url && !failed ? <Image source={{ uri: url }} accessibilityLabel={name} style={s.image} resizeMode="cover" onError={() => setFailed(true)}/> : <View style={[s.image, { justifyContent: 'center', alignItems: 'center', gap: 12 }]}><Icon name="handyman" size={48} color={colors.secondary}/><Text>{name}</Text><Text color={colors.textMuted}>No equipment photo available</Text></View>; }
export function EquipmentCatalogScreen({ fleet = false }: {
    fleet?: boolean;
}) { const r = useRemote<Equipment[]>(fleet ? '/equipment/fleet' : '/equipment/'); const [search, setSearch] = useState(''); const nav = useNavigation<NavigationProp<RootStackParamList>>(); const items = (r.data ?? []).filter(x => `${x.name} ${x.category}`.toLowerCase().includes(search.toLowerCase())); return <FeaturePage title={fleet ? 'Your equipment fleet' : 'Find equipment'} refresh={() => void r.reload()} refreshing={r.loading}><View style={s.hero}><Text variant="headlineMd" color={colors.textInverse}>{fleet ? 'Ready for the next job' : 'Tools for every task'}</Text><Text color={colors.textInverse}>{fleet ? 'Manage listings and rental returns.' : 'Explore equipment, compare daily rates, and reserve your dates.'}</Text></View><View style={s.row}>{fleet && <Button size="lg" label="Add equipment" onPress={() => nav.navigate('EquipmentForm')}/>}<Button size="lg" variant="outline" label="Reservations & history" onPress={() => nav.navigate('Reservations')}/></View><Input label="Search equipment or category" value={search} onChangeText={setSearch}/>{r.error && <Notice text={r.error} retry={() => void r.reload()}/>} {!r.loading && !r.error && !items.length && <Notice text="No equipment matches. Try another search or add your first listing."/>}{items.map(e => <Card key={e.id} style={s.card}><EquipmentPhoto url={e.image_url} name={e.name}/><Text color={colors.secondary}>{e.category} · {e.status.replaceAll('_', ' ')}</Text><Text variant="headlineSm">{e.name}</Text><Text>{e.price_per_day} / day · Deposit {e.deposit}</Text><Button size="lg" label="View equipment" onPress={() => nav.navigate('EquipmentDetail', { equipmentId: String(e.id) })}/>{fleet && <Button size="lg" variant="outline" label="Edit listing" onPress={() => nav.navigate('EquipmentForm', { equipmentId: String(e.id) })}/>}</Card>)}</FeaturePage>; }
export function FleetScreen() { return <EquipmentCatalogScreen fleet/>; }
export function EquipmentDetailScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'EquipmentDetail'>) { const id = route.params.equipmentId; const r = useRemote<Equipment>(`/equipment/${id}`); const customer = useAppSelector(selectUser)?.role === 'customer'; const [start, setStart] = useState(''); const [end, setEnd] = useState(''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const dates = /^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end) && Date.parse(end) > Date.parse(start) && Date.parse(start) >= new Date().setHours(0, 0, 0, 0); async function book() { setBusy(true); try {
    await http.post('/reservations/', { equipment_id: Number(id), start_date: `${start}T09:00:00`, end_date: `${end}T09:00:00` });
    navigation.navigate('Reservations');
}
catch (e) {
    setMessage(toApiError(e).message);
}
finally {
    setBusy(false);
} } const e = r.data; return <FeaturePage title="Equipment details" refresh={() => void r.reload()} refreshing={r.loading}>{r.error && <Notice text={r.error} retry={() => void r.reload()}/>} {e && <><EquipmentPhoto url={e.image_url} name={e.name}/><Card style={s.card}><Text color={colors.secondary}>{e.category} · {e.status.replaceAll('_', ' ')}</Text><Text variant="headlineMd">{e.name}</Text><Text>{e.description || 'No additional specifications supplied.'}</Text><Text variant="headlineSm">{e.price_per_day} / day</Text><Text>Deposit: {e.deposit}</Text><Text>Pickup: {e.pickup_location || 'Arrange with the owner'}</Text></Card>{customer && <Card style={s.card}><Text variant="headlineSm">Reserve your dates</Text><Input label="Pickup date (YYYY-MM-DD)" value={start} onChangeText={setStart}/><Input label="Return date (YYYY-MM-DD)" value={end} onChangeText={setEnd}/>{(start || end) && !dates && <Text color={colors.danger}>Choose a future pickup date and a later return date.</Text>}{dates && <Text>Estimated rental: {Math.ceil((Date.parse(end) - Date.parse(start)) / 86400000) * e.price_per_day}, excluding deposit and delivery.</Text>}<Button size="lg" label="Reserve equipment" disabled={!dates || e.status !== 'available'} loading={busy} onPress={() => void book()}/></Card>}</>}{message && <Notice text={message}/>}</FeaturePage>; }

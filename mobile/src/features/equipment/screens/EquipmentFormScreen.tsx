import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import type { RootStackParamList } from '@/navigation/types';
import { EquipmentPhoto, type Equipment } from './EquipmentFlowScreens';
export default function EquipmentFormScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'EquipmentForm'>) { const id = route.params?.equipmentId; const [form, setForm] = useState({ name: '', category: '', description: '', image_url: '', price_per_day: '', deposit: '0', pickup_location: '' }); const [loaded, setLoaded] = useState(!id); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); useEffect(() => { if (id)
    void http.get<Equipment>(`/equipment/${id}`).then(({ data: e }) => { setForm({ name: e.name, category: e.category, description: e.description ?? '', image_url: e.image_url ?? '', price_per_day: String(e.price_per_day), deposit: String(e.deposit), pickup_location: e.pickup_location ?? '' }); setLoaded(true); }).catch(e => setMessage(toApiError(e).message)); }, [id]); async function save() { setBusy(true); try {
    const payload = { ...form, price_per_day: Number(form.price_per_day), deposit: Number(form.deposit) };
    if (id)
        await http.patch(`/equipment/${id}`, payload);
    else
        await http.post('/equipment/', payload);
    navigation.goBack();
}
catch (e) {
    setMessage(toApiError(e).message);
}
finally {
    setBusy(false);
} } return <FeaturePage title={id ? 'Edit equipment' : 'List your equipment'}><Text>Add accurate specifications and an actual photo so renters can choose confidently.</Text>{!!form.image_url && <EquipmentPhoto key={form.image_url} url={form.image_url} name={form.name || 'Equipment photo preview'}/>}<Card style={s.card}>{(Object.keys(form) as (keyof typeof form)[]).map(key => <Input key={key} label={{ name: 'Equipment name', category: 'Category', description: 'Description and condition', image_url: 'Equipment photo URL (https://)', price_per_day: 'Daily rental price', deposit: 'Security deposit', pickup_location: 'Pickup location' }[key]} value={form[key]} multiline={key === 'description'} onChangeText={value => setForm({ ...form, [key]: value })}/>)}<Button size="lg" label="Save listing" loading={busy} disabled={!loaded || form.name.trim().length < 2 || form.category.trim().length < 2 || !Number.isFinite(Number(form.price_per_day)) || Number(form.price_per_day) <= 0 || !Number.isFinite(Number(form.deposit)) || Number(form.deposit) < 0 || !!form.image_url && !form.image_url.startsWith('https://')} onPress={() => void save()}/></Card>{!!message && <Notice text={message}/>}</FeaturePage>; }

import React, { useEffect, useState } from 'react';
import CategoryProposalForm from '../components/CategoryProposalForm';
import { View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectUser, restoreSession } from '@/store/sessionSlice';
import type { RootStackParamList } from '@/navigation/types';
import { colors } from '@/constants/theme';
interface Profile {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    businessName?: string;
    bio?: string;
    experienceYears?: number;
    hourlyRate?: number;
    serviceRadiusKm?: number;
    approvalStatus?: string;
}
interface Category {
    id: string;
    name: string;
}
export default function ProfileScreen() {
    const user = useAppSelector(selectUser);
    const provider = user?.role === 'provider';
    const r = useRemote<Profile>('/users/me');
    const categories = useRemote<Category[]>('/requests/categories');
    const [selected, setSelected] = useState<string[]>([]);
    const [draft, setForm] = useState<{
        name: string;
        phone: string;
        address: string;
        business: string;
        bio: string;
        experience: string;
        rate: string;
        radius: string;
    }>();
    const p = r.data;
    const form = draft ?? { name: p?.name ?? '', phone: p?.phone ?? '', address: p?.address ?? '', business: p?.businessName ?? '', bio: p?.bio ?? '', experience: String(p?.experienceYears ?? 0), rate: String(p?.hourlyRate ?? 0), radius: String(p?.serviceRadiusKm ?? 10) };
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const dispatch = useAppDispatch();
    const nav = useNavigation<NavigationProp<RootStackParamList>>();
    useEffect(() => { if (provider)
        void http.get<Category[]>('/users/me/provider/categories').then(x => setSelected(x.data.map(c => String(c.id)))).catch(e => setMessage(toApiError(e).message)); }, [provider]);
    async function save() { setBusy(true); setMessage(''); try {
        await http.patch(provider ? '/users/me/provider' : '/users/me', { full_name: form.name, phone: form.phone, ...(provider ? { business_name: form.business, bio: form.bio, experience_years: Number(form.experience), hourly_rate: Number(form.rate), service_radius_km: Number(form.radius) } : { address: form.address }) });
        if (provider)
            await http.put('/users/me/provider/categories', { categoryIds: selected.map(Number) });
        setMessage('Profile saved.');
        setForm(undefined);
        await r.reload();
        void dispatch(restoreSession());
    }
    catch (e) {
        setMessage(toApiError(e).message);
    }
    finally {
        setBusy(false);
    } }
    return (
        <FeaturePage title="Your profile" refresh={() => void r.reload()} refreshing={r.loading}>
            {!!r.error && <Notice text={r.error} retry={() => void r.reload()} />}
            <Card style={s.hero}>
                <Avatar name={r.data?.name ?? user?.name ?? ''} size={72} />
                <Text variant="headlineMd" color={colors.textInverse}>{r.data?.name ?? user?.name}</Text>
                <Text color={colors.textInverse}>{user?.email}</Text>
                <Text color={colors.textInverse}>
                    {provider ? `Provider approval: ${r.data?.approvalStatus ?? 'Loading'}` : 'Customer account'}
                </Text>
            </Card>
            <View style={s.row}>
                <Button size="lg" variant="secondary" label="Notifications" onPress={() => nav.navigate('Notifications')} />
                <Button size="lg" variant="outline" label="Equipment" onPress={() => nav.navigate('EquipmentCatalog')} />
                <Button size="lg" variant="outline" label="Rental history" onPress={() => nav.navigate('Reservations')} />
            </View>
            <Button
                size="lg"
                variant="outline"
                label="Sign out"
                icon="logout"
                onPress={() => void dispatch(logout())}
            />
            {r.data ? (
                <Card style={s.card}>
                    <Text variant="headlineSm">Account details</Text>
                    {(['name', 'phone', ...(provider ? ['business', 'bio', 'experience', 'rate', 'radius'] : ['address'])] as (keyof typeof form)[]).map((key) => (
                        <Input
                            key={key}
                            label={({ name: 'Full name', phone: 'Phone', business: 'Business name', bio: 'About your services', experience: 'Years of experience', rate: 'Hourly rate', radius: 'Service radius (km)', address: 'Address' })[key]}
                            value={form[key]}
                            multiline={key === 'bio'}
                            onChangeText={(value) => setForm({ ...form, [key]: value })}
                        />
                    ))}
                    {provider ? (
                        <>
                            <Text variant="headlineSm">Service categories</Text>
                            <Text>Choose the services you offer to see relevant jobs.</Text>
                            {!!categories.error && <Notice text={categories.error} retry={() => void categories.reload()} />}
                            <View style={s.row}>
                                {categories.data?.map((category) => (
                                    <Button
                                        key={category.id}
                                        size="lg"
                                        label={`${selected.includes(String(category.id)) ? 'Selected: ' : ''}${category.name}`}
                                        variant={selected.includes(String(category.id)) ? 'secondary' : 'outline'}
                                        onPress={() => setSelected(
                                            selected.includes(String(category.id))
                                                ? selected.filter((id) => id !== String(category.id))
                                                : [...selected, String(category.id)],
                                        )}
                                    />
                                ))}
                            </View>
                        </>
                    ) : null}
                    <Button
                        size="lg"
                        label="Save profile"
                        loading={busy}
                        disabled={form.name.trim().length < 2}
                        onPress={() => void save()}
                    />
                </Card>
            ) : null}
            {provider ? <CategoryProposalForm /> : null}
            {!!message && <Notice text={message} />}
        </FeaturePage>
    );
}


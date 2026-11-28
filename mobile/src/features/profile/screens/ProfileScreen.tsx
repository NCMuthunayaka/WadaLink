import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import CategoryProposalForm from '../components/CategoryProposalForm';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectUser, restoreSession } from '@/store/sessionSlice';
import type { RootStackParamList } from '@/navigation/types';
import { colors } from '@/constants/theme';

interface Profile { name: string; email: string; phone?: string; address?: string; businessName?: string; bio?: string; experienceYears?: number; hourlyRate?: number; serviceRadiusKm?: number; approvalStatus?: string; }
interface Category { id: string; name: string; }
type FormState = { name: string; phone: string; address: string; business: string; bio: string; experience: string; rate: string; radius: string; };

export default function ProfileScreen() {
  const user = useAppSelector(selectUser); const provider = user?.role === 'provider'; const r = useRemote<Profile>('/users/me'); const categories = useRemote<Category[]>('/requests/categories'); const [selected, setSelected] = useState<string[]>([]); const [draft, setDraft] = useState<FormState>(); const [section, setSection] = useState<'account' | 'services' | 'preferences'>('account'); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const dispatch = useAppDispatch(); const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const p = r.data; const form = draft ?? { name: p?.name ?? '', phone: p?.phone ?? '', address: p?.address ?? '', business: p?.businessName ?? '', bio: p?.bio ?? '', experience: String(p?.experienceYears ?? 0), rate: String(p?.hourlyRate ?? 0), radius: String(p?.serviceRadiusKm ?? 10) };
  useEffect(() => { if (provider) void http.get<Category[]>('/users/me/provider/categories').then(x => setSelected(x.data.map(c => String(c.id)))).catch(e => setMessage(toApiError(e).message)); }, [provider]);
  async function save() { setBusy(true); setMessage(''); try { await http.patch(provider ? '/users/me/provider' : '/users/me', { full_name: form.name, phone: form.phone, ...(provider ? { business_name: form.business, bio: form.bio, experience_years: Number(form.experience), hourly_rate: Number(form.rate), service_radius_km: Number(form.radius) } : { address: form.address }) }); if (provider) await http.put('/users/me/provider/categories', { categoryIds: selected.map(Number) }); setMessage('Profile saved successfully.'); setDraft(undefined); await r.reload(); void dispatch(restoreSession()); } catch (e) { setMessage(toApiError(e).message); } finally { setBusy(false); } }
  const update = (key: keyof FormState, value: string) => setDraft({ ...form, [key]: value });
  return <FeaturePage title="Your profile" refresh={() => void r.reload()} refreshing={r.loading}>
    {!!r.error && <Notice text={r.error} retry={() => void r.reload()} />}
    <Card style={s.hero}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><Avatar name={p?.name ?? user?.name ?? ''} size={64} /><View style={{ flex: 1, gap: 3 }}><Text variant="headlineSm" color={colors.textInverse}>{p?.name ?? user?.name}</Text><Text variant="bodySm" color={colors.borderStrong}>{provider ? 'Service provider' : 'Service seeker'}</Text><Text variant="bodySm" color={colors.borderStrong}>{provider ? `Approval: ${p?.approvalStatus ?? 'Pending'}` : 'Account ready'}</Text></View></View></Card>
    <View style={s.row}><Button size="lg" variant="secondary" label="Notifications" icon="notifications-none" onPress={() => nav.navigate('Notifications')} /><Button size="lg" variant="outline" label="Sign out" icon="logout" onPress={() => void dispatch(logout())} /></View>
    <View style={styles.tabs}><Pressable onPress={() => setSection('account')} style={[styles.tab, section === 'account' && styles.activeTab]}><Icon name="person-outline" size={18} color={section === 'account' ? colors.primary : colors.textMuted} /><Text variant="labelMd" color={section === 'account' ? colors.primary : colors.textMuted}>Account</Text></Pressable>{provider && <Pressable onPress={() => setSection('services')} style={[styles.tab, section === 'services' && styles.activeTab]}><Icon name="handyman" size={18} color={section === 'services' ? colors.primary : colors.textMuted} /><Text variant="labelMd" color={section === 'services' ? colors.primary : colors.textMuted}>Services</Text></Pressable>}<Pressable onPress={() => setSection('preferences')} style={[styles.tab, section === 'preferences' && styles.activeTab]}><Icon name="tune" size={18} color={section === 'preferences' ? colors.primary : colors.textMuted} /><Text variant="labelMd" color={section === 'preferences' ? colors.primary : colors.textMuted}>More</Text></Pressable></View>
    {section === 'account' && <Card style={s.card}><Text variant="headlineSm">Your details</Text><Text variant="bodySm" color={colors.textSecondary}>Keep these details current so people know who they are working with.</Text><Input label="Full name" value={form.name} onChangeText={v => update('name', v)} /><Input label="Phone" value={form.phone} onChangeText={v => update('phone', v)} keyboardType="phone-pad" />{!provider && <Input label="Address" value={form.address} onChangeText={v => update('address', v)} />}<Button size="lg" label="Save details" loading={busy} disabled={form.name.trim().length < 2} onPress={() => void save()} /></Card>}
    {section === 'services' && provider && <><Card style={s.card}><Text variant="headlineSm">Service profile</Text><Input label="Business name" value={form.business} onChangeText={v => update('business', v)} /><Input label="About your services" value={form.bio} onChangeText={v => update('bio', v)} multiline /><View style={s.row}><Input label="Years" value={form.experience} onChangeText={v => update('experience', v)} keyboardType="number-pad" /><Input label="Hourly rate" value={form.rate} onChangeText={v => update('rate', v)} keyboardType="decimal-pad" /></View><Input label="Service radius (km)" value={form.radius} onChangeText={v => update('radius', v)} keyboardType="decimal-pad" /><Button size="lg" label="Save service profile" loading={busy} onPress={() => void save()} /></Card><Card style={s.card}><Text variant="headlineSm">Services you offer</Text><Text variant="bodySm" color={colors.textSecondary}>Choose a few services so customers can find you.</Text>{!!categories.error && <Notice text={categories.error} retry={() => void categories.reload()} />}<View style={s.row}>{categories.data?.map(category => { const active = selected.includes(String(category.id)); return <Button key={category.id} size="lg" label={active ? `✓ ${category.name}` : category.name} variant={active ? 'secondary' : 'outline'} onPress={() => setSelected(active ? selected.filter(id => id !== String(category.id)) : [...selected, String(category.id)])} /> })}</View></Card><CategoryProposalForm /></>}
    {section === 'preferences' && <Card style={s.card}><Text variant="headlineSm">More options</Text><Button size="lg" variant="outline" label="Equipment and rentals" icon="handyman" onPress={() => nav.navigate('EquipmentCatalog')} /><Button size="lg" variant="outline" label="Rental history" icon="history" onPress={() => nav.navigate('Reservations')} /><Text variant="bodySm" color={colors.textMuted}>Your email: {user?.email}</Text></Card>}
    {!!message && <Notice text={message} />}
  </FeaturePage>;
}

const styles = { tabs: { flexDirection: 'row' as const, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 4, gap: 4 }, tab: { flex: 1, minHeight: 46, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 4 }, activeTab: { backgroundColor: colors.primaryLight } };

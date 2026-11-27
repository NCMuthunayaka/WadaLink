import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { useRemote } from '@/hooks/useRemote';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';
import type { RootStackParamList } from '@/navigation/types';
export interface Job {
    id: string;
    title: string;
    description: string;
    status: string;
    urgency: string;
    address: string;
    selectedProviderId?: string;
    canQuote?: boolean;
    budgetMax?: number;
    categoryName?: string;
}
export default function JobsScreen({ dashboard = false, conversations = false }: {
    dashboard?: boolean;
    conversations?: boolean;
}) {
    const user = useAppSelector(selectUser);
    const provider = user?.role === 'provider';
    const [mine, setMine] = useState(dashboard || conversations);
    const [search, setSearch] = useState('');
    const nav = useNavigation<NavigationProp<RootStackParamList>>();
    const r = useRemote<Job[]>(provider ? (mine ? '/providers/my-jobs' : '/providers/jobs') : '/requests');
    const jobs = (r.data ?? []).filter(j => (!conversations || provider || !!j.selectedProviderId) && j.title.toLowerCase().includes(search.toLowerCase()));
    return <FeaturePage title={conversations ? 'Messages' : dashboard ? 'Your working day' : 'Jobs'} refresh={() => void r.reload()} refreshing={r.loading}>
 {dashboard && <View style={s.hero}><Text variant="headlineMd" color={colors.textInverse}>Welcome back, {user?.name}</Text><Text color={colors.textInverse}>{jobs.filter(j => ['assigned', 'in_progress'].includes(j.status)).length} active jobs · {jobs.filter(j => j.status === 'completed').length} completed</Text><Button size="lg" label="Notifications" onPress={() => nav.navigate('Notifications')}/></View>}
 <Text color={colors.textSecondary}>{conversations ? 'Chat is available after a provider is selected.' : 'Discover opportunities and follow your work from quotation to completion.'}</Text>
 {provider && !conversations && <View style={s.row}><Button size="lg" label="Discover" variant={mine ? 'outline' : 'primary'} onPress={() => setMine(false)}/><Button size="lg" label="My jobs" variant={mine ? 'primary' : 'outline'} onPress={() => setMine(true)}/></View>}
 <Input label="Search jobs" value={search} onChangeText={setSearch}/>{r.error && <Notice text={r.error} retry={() => void r.reload()}/>}
 {!r.loading && !r.error && !jobs.length && <Notice text="No jobs here yet. Providers can add service categories in their profile to discover matching requests."/>}
 {jobs.map(j => <Card key={j.id} style={s.card}><Text variant="labelMd" color={colors.secondary}>{j.categoryName ?? 'Service request'} · {j.urgency}</Text><Text variant="headlineSm">{j.title}</Text><Text numberOfLines={2}>{j.description}</Text><Text color={colors.textMuted}>{j.address} · {(j.status ?? 'open').replaceAll('_', ' ')}</Text><Button size="lg" label={conversations ? 'Open conversation' : 'View details'} onPress={() => nav.navigate(conversations ? 'Chat' : 'JobDetail', { requestId: String(j.id) })}/></Card>)}
 </FeaturePage>;
}
export function ProviderHomeScreen() { return <JobsScreen dashboard/>; }
export function ConversationsScreen() { return <JobsScreen conversations/>; }

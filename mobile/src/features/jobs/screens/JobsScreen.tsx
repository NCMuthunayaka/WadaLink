import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { colors, radius, spacing } from '@/constants/theme';
import { useRemote } from '@/hooks/useRemote';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';
import type { RootStackParamList } from '@/navigation/types';

export interface Job { id: string; title: string; description: string; status: string; urgency: string; address: string; selectedProviderId?: string; canQuote?: boolean; budgetMax?: number; categoryName?: string; }

const statusTone = (status: string) => {
  if (['completed', 'closed'].includes(status)) return { bg: colors.successLight, text: colors.success, icon: 'check-circle' as const };
  if (['assigned', 'in_progress'].includes(status)) return { bg: colors.primaryLight, text: colors.primary, icon: 'work' as const };
  if (['cancelled', 'rejected'].includes(status)) return { bg: colors.dangerLight, text: colors.danger, icon: 'close' as const };
  return { bg: colors.warningLight, text: colors.warningText, icon: 'schedule' as const };
};

export default function JobsScreen({ dashboard = false, conversations = false }: { dashboard?: boolean; conversations?: boolean }) {
  const user = useAppSelector(selectUser);
  const provider = user?.role === 'provider';
  const [mine, setMine] = useState(dashboard || conversations);
  const [search, setSearch] = useState('');
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const r = useRemote<Job[]>(provider ? (mine ? '/providers/my-jobs' : '/providers/jobs') : '/requests');
  const jobs = (r.data ?? []).filter(j => (!conversations || provider || !!j.selectedProviderId) && `${j.title} ${j.categoryName ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const activeCount = jobs.filter(j => ['assigned', 'in_progress'].includes(j.status)).length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;

  return <FeaturePage title={conversations ? 'Messages' : dashboard ? 'Your working day' : 'Jobs'} refresh={() => void r.reload()} refreshing={r.loading}>
    {dashboard && <View style={s.hero}><View style={s.heroIcon}><Icon name="work" size={22} color={colors.primary} /></View><Text variant="headlineMd" color={colors.textInverse}>Welcome back, {user?.name}</Text><Text color={colors.borderStrong}>{activeCount} active {activeCount === 1 ? 'job' : 'jobs'} · {completedCount} completed</Text><Button size="lg" label="Open notifications" icon="notifications-none" variant="secondary" onPress={() => nav.navigate('Notifications')} /></View>}
    <View style={s.sectionIntro}><Text variant="headlineSm">{conversations ? 'Stay connected' : provider ? 'Keep work moving' : 'Your service requests'}</Text><Text color={colors.textSecondary}>{conversations ? 'Open a conversation after a provider is selected.' : provider ? 'Find local opportunities or follow jobs you already accepted.' : 'Follow every request from first message to completion.'}</Text></View>
    {provider && !conversations && <View style={s.row}><Button size="lg" label="Find jobs" variant={mine ? 'outline' : 'primary'} onPress={() => setMine(false)} /><Button size="lg" label="My jobs" variant={mine ? 'primary' : 'outline'} onPress={() => setMine(true)} /></View>}
    <Input label={conversations ? 'Search conversations' : 'Search jobs'} value={search} onChangeText={setSearch} leftIcon="search" />
    {!!r.error && <Notice text={r.error} retry={() => void r.reload()} />}
    {!r.loading && !r.error && !jobs.length && <Notice text={conversations ? 'No conversations yet. Once a provider is selected, messages will appear here.' : provider ? 'No matching jobs yet. Add service categories in your profile to improve matches.' : 'No requests yet. Start by describing what needs fixing.'} />}
    {jobs.map(j => { const tone = statusTone(j.status); return <Card key={j.id} style={s.card} onPress={() => nav.navigate(conversations ? 'Chat' : 'JobDetail', { requestId: String(j.id) })}><View style={s.jobHeader}><View style={[s.jobIcon, { backgroundColor: tone.bg }]}><Icon name={tone.icon} size={20} color={tone.text} /></View><View style={s.jobHeading}><Text variant="labelMd" color={colors.secondary}>{j.categoryName ?? 'Service request'}</Text><Text variant="headlineSm" numberOfLines={1}>{j.title}</Text></View><View style={[s.statusPill, { backgroundColor: tone.bg }]}><Text variant="labelSm" color={tone.text}>{(j.status || 'open').replaceAll('_', ' ')}</Text></View></View><Text color={colors.textSecondary} numberOfLines={2}>{j.description}</Text><View style={s.jobMeta}><Text variant="bodySm" color={colors.textMuted}>{j.address}</Text><Text variant="bodySm" color={colors.textMuted}>{j.urgency} priority</Text></View><Button size="lg" label={conversations ? 'Open conversation' : 'View details'} trailingIcon="arrow-forward" onPress={() => nav.navigate(conversations ? 'Chat' : 'JobDetail', { requestId: String(j.id) })} /></Card> })}
  </FeaturePage>;
}

export function ProviderHomeScreen() { return <JobsScreen dashboard />; }
export function ConversationsScreen() { return <JobsScreen conversations />; }

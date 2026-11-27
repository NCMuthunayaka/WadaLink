import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';
import type { RootStackParamList } from '@/navigation/types';
import type { Job } from './JobsScreen';
export default function JobDetailScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'JobDetail'>) {
    const id = route.params.requestId;
    const provider = useAppSelector(selectUser)?.role === 'provider';
    const r = useRemote<Job>(provider ? `/providers/jobs/${id}` : `/requests/${id}`);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    async function act(action: string) { setBusy(true); try {
        await http.post(provider ? `/providers/jobs/${id}/${action}` : `/requests/${id}/${action}`);
        await r.reload();
        setMessage('Job updated.');
    }
    catch (e) {
        setMessage(toApiError(e).message);
    }
    finally {
        setBusy(false);
    } }
    const j = r.data;
    return <FeaturePage title="Job details" refresh={() => void r.reload()} refreshing={r.loading}>{!!r.error && <Notice text={r.error} retry={() => void r.reload()}/>} {j && <><Card style={s.hero}><Text color={colors.textInverse}>{j.status.replaceAll('_', ' ')} · {j.urgency}</Text><Text color={colors.textInverse} variant="headlineMd">{j.title}</Text></Card><Card style={s.card}><Text variant="headlineSm">About this request</Text><Text>{j.description}</Text><Text>Location: {j.address}</Text>{j.budgetMax != null && <Text>Budget up to {j.budgetMax}</Text>}</Card>
 {!provider && j.status === 'open' && <><Button size="lg" label="Find matching providers" onPress={() => navigation.navigate('MatchingProviders', { requestId: id })}/><Button size="lg" variant="outline" label="Compare quotations" onPress={() => navigation.navigate('QuotationComparison', { requestId: id })}/></>}
 {provider && j.canQuote && <Button size="lg" label="Prepare quotation" onPress={() => navigation.navigate('QuotationSubmission', { requestId: id })}/>}
 {provider && j.status === 'assigned' && <Button size="lg" loading={busy} label="Start work" onPress={() => void act('start')}/>}
 {provider && j.status === 'in_progress' && <Button size="lg" loading={busy} label="Mark completed" onPress={() => void act('complete')}/>}
 {['assigned', 'in_progress', 'completed'].includes(j.status) && <Button size="lg" variant="secondary" label="Message about this job" onPress={() => navigation.navigate('Chat', { requestId: id })}/>}
 {j.status === 'completed' && <Button size="lg" variant="outline" label="Reviews and feedback" onPress={() => navigation.navigate('Reviews', { requestId: id })}/>}
 {!provider && j.status === 'open' && <Button size="lg" variant="danger" loading={busy} label="Cancel request" onPress={() => void act('cancel')}/>}
 </>}{!!message && <Notice text={message}/>}</FeaturePage>;
}

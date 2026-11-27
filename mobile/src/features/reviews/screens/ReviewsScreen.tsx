import React, { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import FeaturePage, { Notice, s } from '@/components/common/FeaturePage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRemote } from '@/hooks/useRemote';
import { http } from '@/services/api/client';
import { toApiError } from '@/services/api/helpers';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/sessionSlice';
import type { RootStackParamList } from '@/navigation/types';
interface Review {
    id: number;
    reviewerId: number;
    rating: number;
    comment?: string;
}
export default function ReviewsScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Reviews'>) {
    const url = `/reviews/request/${route.params.requestId}`;
    const r = useRemote<Review[]>(url);
    const user = useAppSelector(selectUser);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    async function submit() { setBusy(true); try {
        await http.post(url, { rating, comment });
        setMessage('Thank you. Your review has been saved.');
        await r.reload();
    }
    catch (e) {
        setMessage(toApiError(e).message);
    }
    finally {
        setBusy(false);
    } }
    return <FeaturePage title="Reviews & feedback" refresh={() => void r.reload()} refreshing={r.loading}><Text>Share an honest review of this completed job.</Text>{r.error && <Notice text={r.error} retry={() => void r.reload()}/>} {!r.loading && !r.error && !r.data?.some(x => String(x.reviewerId) === user?.id) && <Card style={s.card}><Text variant="headlineSm">How did it go?</Text><View style={s.row}>{[1, 2, 3, 4, 5].map(n => <Button key={n} size="lg" label={`${n} stars`} variant={rating === n ? 'primary' : 'outline'} onPress={() => setRating(n)}/>)}</View><Input label="Your experience" multiline maxLength={2000} value={comment} onChangeText={setComment}/><Button size="lg" label="Publish review" loading={busy} onPress={() => void submit()}/></Card>}{message && <Notice text={message}/>} {r.data?.map(x => <Card key={x.id} style={s.card}><Text variant="headlineSm">{x.rating} / 5 stars</Text><Text>{x.comment || 'Rating submitted without a comment.'}</Text></Card>)}</FeaturePage>;
}

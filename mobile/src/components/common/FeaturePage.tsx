import React from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { colors } from '@/constants/theme';
export default function FeaturePage({ title, children, refreshing = false, refresh }: React.PropsWithChildren<{
    title: string;
    refreshing?: boolean;
    refresh?: () => void;
}>) {
    const nav = useNavigation();
    return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScreenHeader title={title} onBack={nav.canGoBack() ? nav.goBack : undefined}/><ScrollView keyboardShouldPersistTaps="handled" refreshControl={refresh ? <RefreshControl refreshing={refreshing} onRefresh={refresh}/> : undefined} contentContainerStyle={s.page}>{children}</ScrollView></KeyboardAvoidingView>;
}
export function Notice({ text, retry }: {
    text: string;
    retry?: () => void;
}) { return <Card style={s.card}><Text>{text}</Text>{retry && <Button size="lg" label="Try again" onPress={retry}/>}</Card>; }
export const s = StyleSheet.create({ page: { padding: 16, gap: 16, paddingBottom: 48, width: '100%', maxWidth: 760, alignSelf: 'center' }, card: { gap: 12 }, hero: { backgroundColor: colors.dark, padding: 24, borderRadius: 16, gap: 12 }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, image: { height: 220, width: '100%', borderRadius: 16, backgroundColor: colors.surfaceLow } });

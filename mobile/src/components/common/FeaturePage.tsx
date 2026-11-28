import React from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
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
}) { return <Card style={s.card}><View style={s.noticeRow}><View style={s.noticeIcon}><Icon name="info-outline" size={18} color={colors.primary} /></View><Text style={s.noticeText}>{text}</Text></View>{retry && <Button size="lg" label="Try again" onPress={retry}/>}</Card>; }
export const s = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 48, width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { gap: 12 },
  noticeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  noticeIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  noticeText: { flex: 1, color: colors.textSecondary, lineHeight: 21 },
  hero: { backgroundColor: colors.dark, padding: 24, borderRadius: 16, gap: 12 },
  heroIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  sectionIntro: { gap: 4 },
  jobHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  jobIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  jobHeading: { flex: 1, gap: 2 },
  statusPill: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999 },
  jobMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 4 },
  stepItem: { alignItems: 'center', gap: 6, minWidth: 72 },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.borderLight },
  stepDotActive: { backgroundColor: colors.primary },
  image: { height: 220, width: '100%', borderRadius: 16, backgroundColor: colors.surfaceLow },
});

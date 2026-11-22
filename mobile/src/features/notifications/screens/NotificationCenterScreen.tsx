import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';
import { http } from '@/services/api/client';
import type { AppNotification } from '@/types/notification';

export default function NotificationCenterScreen() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => { void http.get<AppNotification[]>('/notifications').then((r) => setItems(r.data)).catch(() => setError(true)); }, []);
  return <View style={styles.root}><ScreenHeader title="Notifications" /><FlatList data={items} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListHeaderComponent={<View style={styles.intro}><Text variant="headlineMd">Stay in the loop</Text><Text variant="bodyMd" color={colors.textSecondary}>Quotation updates, provider responses, and job activity appear here.</Text></View>} ListEmptyComponent={<Card style={styles.empty}><Icon name={error ? 'error-outline' : 'notifications-none'} size={32} color={error ? colors.danger : colors.secondary} /><Text variant="headlineSm">{error ? 'Notifications unavailable' : 'You’re all caught up'}</Text><Text variant="bodyMd" color={colors.textMuted}>{error ? 'Pull to refresh and try again.' : 'New quotation and job updates will appear here.'}</Text></Card>} renderItem={({ item }) => <Card style={[styles.item, !item.read && styles.unread]}><View style={styles.icon}><Icon name="notifications" size={20} color={colors.secondary} /></View><View style={styles.copy}><Text variant="labelLg">{item.title}</Text><Text variant="bodyMd" color={colors.textSecondary}>{item.body}</Text><Text variant="bodySm" color={colors.textMuted}>{new Date(item.createdAt).toLocaleDateString()}</Text></View></Card>} />;</View>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg }, list: { padding: spacing.base, gap: spacing.md }, intro: { gap: spacing.sm, marginBottom: spacing.sm }, item: { flexDirection: 'row', gap: spacing.md }, unread: { borderColor: colors.secondary, borderWidth: 1.5 }, icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, gap: spacing.xs }, empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl } });

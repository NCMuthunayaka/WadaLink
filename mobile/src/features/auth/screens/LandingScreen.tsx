import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '@/components/ui/Button';
import Icon, { type IconName } from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import AuthActions from '../components/AuthActions';

const benefits: { icon: IconName; title: string; color: string }[] = [
  { icon: 'auto-awesome', title: 'Smart matching', color: '#00A9B7' },
  { icon: 'verified-user', title: 'Trusted providers', color: '#087E72' },
  { icon: 'handyman', title: 'Rent equipment', color: '#2459C5' },
];

export default function LandingScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Landing'>) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}><Icon name="handyman" size={19} color={colors.onPrimary} /></View>
          <Text variant="headlineSm" color={colors.primary}>WedaLink</Text>
        </View>
        <AuthActions onLogin={() => navigation.navigate('Login')} onRegister={() => navigation.navigate('RoleSelection')} />
      </View>

      <View style={styles.heroCopy}>
        <View style={styles.eyebrow}><View style={styles.eyebrowDot} /><Text variant="labelSm" color={colors.secondary}>SERVICES, CONNECTED</Text></View>
        <Text variant="displayLgMobile" style={styles.title}>Find help.{"\n"}<Text variant="displayLgMobile" color={colors.primary}>Fix what matters.</Text></Text>
        <Text variant="bodyLg" color={colors.textSecondary} style={styles.subtitle}>Book trusted professionals, get smart recommendations, and find the right equipment for your next project.</Text>
      </View>

      <View style={styles.imageWrap}>
        <Image source={require('../../../../assets/wedalink-hero.png')} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.imageBadge}><Icon name="verified" size={16} color={colors.secondary} /><Text variant="labelSm" color={colors.secondary}>TRUSTED CONNECTIONS</Text></View>
      </View>

      <View style={styles.benefitRow}>{benefits.map((benefit) => <View style={styles.benefit} key={benefit.title}><View style={[styles.benefitIcon, { backgroundColor: `${benefit.color}18` }]}><Icon name={benefit.icon} size={19} color={benefit.color} /></View><Text variant="labelSm" color={colors.textSecondary} style={styles.benefitText}>{benefit.title}</Text></View>)}</View>

      <View style={styles.actionCard}>
        <Text variant="headlineSm" style={styles.actionTitle}>Ready to get started?</Text>
        <Text variant="bodySm" color={colors.textMuted} style={styles.actionSubtitle}>Already have an account? Log in to continue. New to WedaLink? Register above.</Text>
        <Button label="Log in" size="lg" variant="secondary" fullWidth onPress={() => navigation.navigate('Login')} />
      </View>

      <Text variant="bodySm" color={colors.textMuted} style={styles.footerText}>Choose whether you need a service or provide one after entering the app.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xxl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { marginBottom: spacing.lg },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  eyebrowDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00A9B7' },
  title: { maxWidth: 330, fontSize: 40, lineHeight: 46, color: '#112B4A', letterSpacing: -0.7 },
  subtitle: { maxWidth: 350, marginTop: spacing.md, lineHeight: 23 },
  imageWrap: { height: 265, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#DDF4F5', ...shadow.md, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  imageBadge: { position: 'absolute', left: spacing.md, bottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 18, paddingHorizontal: spacing.sm, paddingVertical: 7 },
  benefitRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginVertical: spacing.lg },
  benefit: { flex: 1, alignItems: 'center', gap: 7 },
  benefitIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  benefitText: { textAlign: 'center', lineHeight: 15 },
  actionCard: { backgroundColor: '#102F4A', borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: '#1D4D6A', gap: spacing.md, ...shadow.lg },
  actionTitle: { color: '#FFFFFF', fontSize: 19 },
  actionSubtitle: { maxWidth: 280, marginTop: 4, marginBottom: spacing.sm, color: '#C6DCE8', lineHeight: 18 },
  footerText: { textAlign: 'center', lineHeight: 17, marginTop: spacing.lg, paddingHorizontal: spacing.md },
});

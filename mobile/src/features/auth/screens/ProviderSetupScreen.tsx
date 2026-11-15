import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormError from '@/components/common/FormError';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import FormInput from '@/components/ui/FormInput';
import Text from '@/components/ui/Text';
import { spacing } from '@/constants/theme';
import { useAppDispatch } from '@/store/hooks';
import { logout, saveProviderProfile } from '@/store/sessionSlice';
import AuthLayout from '../components/AuthLayout';
import { authErrorMessage } from '../authErrors';
import { providerSetupSchema, type ProviderSetupForm } from '../schemas';

const RADIUS_OPTIONS = [5, 15, 25, 50];

export default function ProviderSetupScreen() {
  const dispatch = useAppDispatch();
  const [radiusKm, setRadiusKm] = useState(15);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProviderSetupForm>({
    resolver: zodResolver(providerSetupSchema),
    defaultValues: { businessName: '', bio: '', experienceYears: '', hourlyRate: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await dispatch(
        saveProviderProfile({
          businessName: values.businessName,
          bio: values.bio || undefined,
          experienceYears: Number(values.experienceYears),
          hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : undefined,
          serviceRadiusKm: radiusKm,
        }),
      ).unwrap();
    } catch (e) {
      setSubmitError(authErrorMessage(e));
    }
  });

  return (
    <AuthLayout
      title="Set Up Your Profile"
      subtitle="Tell customers who you are. An admin reviews new providers before they can take jobs."
    >
      <FormInput
        control={control}
        name="businessName"
        label="Business / Display Name"
        placeholder="EcoVolt Solutions LLC"
        leftIcon="badge"
      />
      <FormInput
        control={control}
        name="bio"
        label="About your work"
        placeholder="Trades, specialities, certifications…"
        multiline
      />
      <FormInput
        control={control}
        name="experienceYears"
        label="Years in Trade"
        placeholder="8"
        keyboardType="number-pad"
        leftIcon="work-history"
      />
      <FormInput
        control={control}
        name="hourlyRate"
        label="Hourly Rate (optional)"
        placeholder="85"
        keyboardType="decimal-pad"
        leftIcon="attach-money"
      />

      <View>
        <Text variant="labelLg" style={styles.radiusLabel}>
          Service Radius
        </Text>
        <View style={styles.chips}>
          {RADIUS_OPTIONS.map((km) => (
            <Chip key={km} label={`${km} km`} selected={radiusKm === km} onPress={() => setRadiusKm(km)} />
          ))}
        </View>
      </View>

      <FormError message={submitError} />

      <Button
        label="Save & Continue"
        size="lg"
        fullWidth
        trailingIcon="arrow-forward"
        loading={isSubmitting}
        onPress={onSubmit}
      />
      <Button label="Sign out" variant="ghost" fullWidth onPress={() => dispatch(logout())} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  radiusLabel: { marginBottom: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
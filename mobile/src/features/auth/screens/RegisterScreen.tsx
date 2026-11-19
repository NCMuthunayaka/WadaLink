import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormError from '@/components/common/FormError';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { useAppDispatch } from '@/store/hooks';
import { register } from '@/store/sessionSlice';
import AuthLayout, { AuthFooter } from '../components/AuthLayout';
import { authErrorMessage } from '../authErrors';
import { registerSchema, type RegisterForm } from '../schemas';

export default function RegisterScreen({
  navigation,
  route,
}: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  const role = route.params?.role ?? 'customer';
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number', valid: /\d/.test(password) },
    { label: 'One special character', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await dispatch(
        register({
          name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone ? `+94${values.phone}` : undefined,
          role,
        }),
      ).unwrap();
    } catch (e) {
      setSubmitError(authErrorMessage(e, 'register'));
    }
  });

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle={
        role === 'provider'
            ? 'Join the network. New provider accounts may be reviewed before you can take jobs.'
            : 'Book trusted technicians in minutes.'
        }
    >
      <FormInput control={control} name="name" label="Full Name" placeholder="Alex Morgan" leftIcon="person-outline" autoComplete="name" />
      <FormInput
        control={control}
        name="email"
        label="Email Address"
        placeholder="name@example.com"
        leftIcon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
      />
      <FormInput
        control={control}
        name="phone"
        label="Phone (optional)"
        placeholder="771234567"
        leftIcon="phone"
        prefix="+94"
        keyboardType="number-pad"
        autoComplete="tel"
      />
      <Pressable
        style={styles.phoneHint}
        accessibilityRole="button"
        accessibilityLabel="Phone number format information"
        onPress={() => Alert.alert('Sri Lankan phone format', 'The +94 prefix is already included. Type exactly 9 digits after it and do not type the local 0. Example: 771234567.')}
      >
        <Icon name="info-outline" size={16} color={colors.secondary} />
        <Text variant="bodySm" color={colors.textMuted} style={styles.phoneHintText}>Enter 9 digits after +94. Example: 771234567</Text>
      </Pressable>
      <FormInput
        control={control}
        name="password"
        label="Password"
        placeholder="At least 8 characters"
        leftIcon="lock-outline"
        rightIcon={showPassword ? 'visibility-off' : 'visibility'}
        onRightIconPress={() => setShowPassword((value) => !value)}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <View style={styles.passwordChecklist} accessibilityLiveRegion="polite">
        <Text variant="labelSm" color={colors.textSecondary}>Password strength</Text>
        <View style={styles.checkGrid}>
          {passwordChecks.map((check) => (
            <View key={check.label} style={styles.checkItem}>
              <Icon name={check.valid ? 'check-circle' : 'radio-button-unchecked'} size={15} color={check.valid ? colors.success : colors.textDisabled} />
              <Text variant="bodySm" color={check.valid ? colors.success : colors.textMuted}>{check.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <FormInput
        control={control}
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Repeat your password"
        leftIcon="lock-outline"
        rightIcon={showConfirmPassword ? 'visibility-off' : 'visibility'}
        onRightIconPress={() => setShowConfirmPassword((value) => !value)}
        secureTextEntry={!showConfirmPassword}
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={() => onSubmit()}
      />
      {confirmPassword.length > 0 && password !== confirmPassword ? (
        <Text variant="bodySm" color={colors.danger} style={styles.mismatch}>Passwords do not match.</Text>
      ) : null}

      <FormError message={submitError} />

      <Button label="Create Account" size="lg" fullWidth loading={isSubmitting} onPress={onSubmit} />
      <AuthFooter
        text="Already have an account?"
        action="Sign In"
        onPress={() => navigation.navigate('Login', { role })}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  passwordChecklist: { marginTop: -spacing.sm, marginBottom: spacing.md, paddingHorizontal: spacing.xs },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: spacing.xs, marginTop: spacing.xs },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  mismatch: { marginTop: -spacing.sm, marginBottom: spacing.md, paddingHorizontal: spacing.xs },
  phoneHint: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: -spacing.sm, marginBottom: spacing.md, paddingHorizontal: spacing.xs },
  phoneHintText: { flex: 1 },
});

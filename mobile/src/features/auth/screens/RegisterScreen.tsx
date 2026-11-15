import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormError from '@/components/common/FormError';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
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
  const { role } = route.params;
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await dispatch(
        register({
          name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone || undefined,
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
        placeholder="+1 555 0123"
        leftIcon="phone"
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <FormInput
        control={control}
        name="password"
        label="Password"
        placeholder="At least 8 characters"
        leftIcon="lock-outline"
        secureTextEntry
        autoCapitalize="none"
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Repeat your password"
        leftIcon="lock-outline"
        secureTextEntry
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={() => onSubmit()}
      />

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
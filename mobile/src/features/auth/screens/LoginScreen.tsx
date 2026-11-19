import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormError from '@/components/common/FormError';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import type { AuthStackParamList } from '@/navigation/types';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/sessionSlice';
import AuthLayout, { AuthFooter } from '../components/AuthLayout';
import { authErrorMessage } from '../authErrors';
import { loginSchema, type LoginForm } from '../schemas';

const COPY = {
  customer: {
    title: 'Welcome Back!',
    subtitle: 'Sign in to book technicians, request quotes, and manage repairs.',
  },
  provider: {
    title: 'Welcome Back, Partner!',
    subtitle: 'Sign in to see customer requests, manage your quotes and track your jobs.',
  },
} as const;

export default function LoginScreen({
  navigation,
  route,
}: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const role = route.params?.role ?? 'customer';
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await dispatch(login(values)).unwrap();
      // The root navigator switches to the right area once the user is set.
    } catch (e) {
      setSubmitError(authErrorMessage(e, 'login'));
    }
  });

  return (
    <AuthLayout title={COPY[role].title} subtitle={COPY[role].subtitle}>
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
        name="password"
        label="Password"
        placeholder="Enter your password"
        leftIcon="lock-outline"
        rightIcon={showPassword ? 'visibility-off' : 'visibility'}
        onRightIconPress={() => setShowPassword((v) => !v)}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoComplete="password"
        returnKeyType="go"
        onSubmitEditing={() => onSubmit()}
      />

      <FormError message={submitError} />

      <Button
        label="Sign In"
        size="lg"
        fullWidth
        trailingIcon="arrow-forward"
        loading={isSubmitting}
        onPress={onSubmit}
      />
      <AuthFooter
        text="Don't have an account?"
        action="Sign Up"
        onPress={() => navigation.navigate('Register', { role })}
      />
    </AuthLayout>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken } from '@reduxjs/toolkit/query';
import { Controller, useForm } from 'react-hook-form';
import ErrorState from '@/components/common/ErrorState';
import FormError from '@/components/common/FormError';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import FormInput from '@/components/ui/FormInput';
import Icon from '@/components/ui/Icon';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Text from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';
import { authErrorMessage } from '@/features/auth/authErrors';
import type { CustomerStackScreenProps } from '@/navigation/types';
import {
  useCreateRequestMutation,
  useGetCategoriesQuery,
  useGetRequestQuery,
  useUpdateRequestMutation,
} from '@/services/api/requests';
import type { NewRequestInput } from '@/types/request';
import { categoryIcon } from '../categoryIcon';
import FlowProgress from '../components/FlowProgress';
import UrgencySelector from '../components/UrgencySelector';
import { createRequestSchema, type CreateRequestForm } from '../schemas';
import { deriveTitle } from '../utils';

export default function CreateRequestScreen({
  navigation,
  route,
}: CustomerStackScreenProps<'CreateRequest'>) {
  const requestId = route.params?.requestId;
  const presetCategoryId = route.params?.categoryId;
  const isEditing = requestId !== undefined;

  const categories = useGetCategoriesQuery();
  const existing = useGetRequestQuery(requestId ?? skipToken);
  const [createRequest] = useCreateRequestMutation();
  const [updateRequest] = useUpdateRequestMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<CreateRequestForm>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      categoryId: presetCategoryId ?? '',
      description: '',
      address: '',
      urgency: 'medium',
    },
  });

  // Editing: fill the form once, when the request first loads.
  const filled = useRef(false);
  useEffect(() => {
    if (existing.data && !filled.current) {
      filled.current = true;
      reset({
        categoryId: presetCategoryId ?? existing.data.categoryId ?? '',
        description: existing.data.description,
        address: existing.data.address,
        urgency: existing.data.urgency,
      });
    }
  }, [existing.data, presetCategoryId, reset]);

  const descriptionLength = watch('description').length;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const categoryName = categories.data?.find((c) => c.id === values.categoryId)?.name ?? 'Service';
    const input: NewRequestInput = {
      categoryId: values.categoryId,
      title: deriveTitle(categoryName, values.description),
      description: values.description,
      urgency: values.urgency,
      address: values.address,
    };

    try {
      if (requestId) {
        await updateRequest({ id: requestId, input }).unwrap();
        navigation.goBack(); // back to the AI result, which refreshes itself
      } else {
        const created = await createRequest(input).unwrap();
        navigation.replace('AIResult', { requestId: created.id });
      }
    } catch (e) {
      setSubmitError(authErrorMessage(e));
    }
  });

  const header = (
    <ScreenHeader
      title={isEditing ? 'Edit Request' : 'Create Service Request'}
      onBack={() => navigation.goBack()}
    />
  );

  if (isEditing && existing.isError) {
    return (
      <View style={styles.root}>
        {header}
        <ErrorState onRetry={() => void existing.refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {header}
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <FlowProgress step={1} label="Details & Diagnostics" />

          <View style={styles.field}>
            <Text variant="labelLg">Service Category</Text>
            <Controller
              control={control}
              name="categoryId"
              render={({ field, fieldState }) => (
                <View style={styles.field}>
                  <View style={styles.chips}>
                    {(categories.data ?? []).map((category) => (
                      <Chip
                        key={category.id}
                        label={category.name}
                        icon={categoryIcon(category.name)}
                        selected={field.value === category.id}
                        onPress={() => field.onChange(category.id)}
                      />
                    ))}
                  </View>
                  {fieldState.error ? (
                    <Text variant="labelMd" color={colors.danger}>
                      {fieldState.error.message}
                    </Text>
                  ) : null}
                </View>
              )}
            />
          </View>

          <FormInput
            control={control}
            name="description"
            label="Issue Description"
            placeholder="Describe symptoms, strange noises, when it happens..."
            helper={`${descriptionLength}/2000 · Be specific so our AI can match the right specialist.`}
            multiline
            maxLength={2000}
          />

          <FormInput
            control={control}
            name="address"
            label="Service Location"
            placeholder="742 Evergreen Terrace, Austin, TX 78704"
            leftIcon="location-on"
            autoComplete="street-address"
            maxLength={255}
          />

          <View style={styles.field}>
            <Text variant="labelLg">Urgency Level</Text>
            <Controller
              control={control}
              name="urgency"
              render={({ field }) => <UrgencySelector value={field.value} onChange={field.onChange} />}
            />
          </View>

          <Card variant="ai">
            <View style={styles.aiNote}>
              <Icon name="auto-awesome" size={18} color={colors.accentDark} />
              <View style={styles.aiNoteText}>
                <Text variant="labelLg">Automated Diagnostic Ready</Text>
                <Text variant="bodySm" color={colors.textSecondary}>
                  Our engine will analyse your description and pre-check qualified providers nearby.
                </Text>
              </View>
            </View>
          </Card>

          <FormError message={submitError} />

          <Button
            label={isEditing ? 'Save & Re-analyze' : 'Analyze with AI & Find Providers'}
            variant="ai"
            size="lg"
            fullWidth
            trailingIcon="arrow-forward"
            loading={isSubmitting}
            onPress={onSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl, gap: spacing.xl },
  field: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  aiNote: { flexDirection: 'row', gap: spacing.md },
  aiNoteText: { flex: 1, gap: 2 },
});

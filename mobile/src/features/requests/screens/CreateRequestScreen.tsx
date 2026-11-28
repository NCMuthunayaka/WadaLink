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
import Input from '@/components/ui/Input';
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
  const [manualReview, setManualReview] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

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
  const filteredCategories = (categories.data ?? []).filter((category) =>
    category.name.toLowerCase().includes(categorySearch.trim().toLowerCase()),
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const categoryName = categories.data?.find((c) => c.id === values.categoryId)?.name ?? 'Service';
    const input: NewRequestInput = {
      categoryId: values.categoryId || undefined,
      manualReview: requestId ? undefined : manualReview,
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
      title={isEditing ? 'Edit request' : 'New service request'}
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
          <FlowProgress step={1} label="Request details" />

          <View style={styles.intro}>
            <Text variant="headlineMd">What needs fixing?</Text>
            <Text variant="bodyMd" color={colors.textSecondary}>
              Tell us what happened in your own words. We’ll guide you to the right help.
            </Text>
          </View>

          <FormInput
            control={control}
            name="description"
            label="Describe the problem"
            placeholder="Describe symptoms, strange noises, when it happens..."
            helper={`${descriptionLength}/2000`}
            multiline
            maxLength={2000}
          />

          <Controller
            control={control}
            name="categoryId"
            render={({ field, fieldState }) => {
              const selectedCategory = categories.data?.find((category) => category.id === field.value);
              const categorySummary = manualReview
                ? 'Our team will review this service'
                : selectedCategory?.name ?? 'AI will choose from your description';

              return (
                <Card style={styles.categoryCard}>
                  <View style={styles.categoryHeading}>
                    <View style={styles.categoryIcon}>
                      <Icon name={selectedCategory ? categoryIcon(selectedCategory.name) : 'auto-awesome'} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.categoryHeadingText}>
                      <Text variant="labelLg">Service category</Text>
                      <Text variant="bodySm" color={colors.textMuted}>Optional</Text>
                    </View>
                    <Button
                      label={categoryPickerVisible ? 'Close' : 'Change'}
                      variant="ghost"
                      size="sm"
                      onPress={() => setCategoryPickerVisible(!categoryPickerVisible)}
                    />
                  </View>
                  <Text variant="bodyMd" color={colors.textSecondary}>{categorySummary}</Text>

                  {categoryPickerVisible ? (
                    <View style={styles.categoryPicker}>
                      <Input
                        label="Find a category"
                        placeholder="Search services"
                        leftIcon="search"
                        value={categorySearch}
                        onChangeText={setCategorySearch}
                      />
                      {categories.isLoading ? (
                        <Text variant="bodySm" color={colors.textMuted}>Loading categories…</Text>
                      ) : categories.isError ? (
                        <FormError message="Could not load categories. You can continue and let AI choose." />
                      ) : (
                        <View style={styles.chips}>
                          <Button
                            label="Let AI choose"
                            variant={!field.value && !manualReview ? 'secondary' : 'outline'}
                            size="sm"
                            onPress={() => {
                              field.onChange('');
                              setManualReview(false);
                              setCategoryPickerVisible(false);
                              setCategorySearch('');
                            }}
                          />
                          {filteredCategories.map((category) => (
                            <Chip
                              key={category.id}
                              label={category.name}
                              icon={categoryIcon(category.name)}
                              selected={field.value === category.id}
                              onPress={() => {
                                field.onChange(category.id);
                                setManualReview(false);
                                setCategoryPickerVisible(false);
                                setCategorySearch('');
                              }}
                            />
                          ))}
                          {!isEditing ? (
                            <Button
                              label="Service not listed"
                              variant={manualReview ? 'secondary' : 'outline'}
                              size="sm"
                              onPress={() => {
                                field.onChange('');
                                setManualReview(true);
                                setCategoryPickerVisible(false);
                                setCategorySearch('');
                              }}
                            />
                          ) : null}
                        </View>
                      )}
                      {!categories.isLoading && !categories.isError && filteredCategories.length === 0 ? (
                        <Text variant="bodySm" color={colors.textMuted}>
                          No matching categories. Try another search or let AI choose.
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                  {fieldState.error ? (
                    <Text variant="labelMd" color={colors.danger}>{fieldState.error.message}</Text>
                  ) : null}
                </Card>
              );
            }}
          />

          <FormInput
            control={control}
            name="address"
            label="Where should the professional go?"
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

          <FormError message={submitError} />

          <Button
            label={isEditing ? 'Save and update matches' : 'Find trusted help'}
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
  intro: { gap: spacing.xs },
  field: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryCard: { gap: spacing.md },
  categoryHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  categoryHeadingText: { flex: 1, gap: 2 },
  categoryPicker: { gap: spacing.md },
});

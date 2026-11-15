import React from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import Input, { type InputProps } from '@/components/ui/Input';

interface FormInputProps<T extends FieldValues>
  extends Omit<InputProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<T>;
  name: Path<T>;
}

/** Input wired to react-hook-form: value, change, blur and the error message. */
export default function FormInput<T extends FieldValues>({
  control,
  name,
  onBlur,
  ...rest
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...rest}
          value={typeof field.value === 'string' ? field.value : ''}
          onChangeText={field.onChange}
          onBlur={(e) => {
            field.onBlur();
            onBlur?.(e);
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
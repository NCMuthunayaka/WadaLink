import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Icon, { type IconName } from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const Input = React.forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    helper,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    multiline,
    editable = true,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="labelLg" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          { borderColor },
          multiline && styles.fieldMultiline,
          !editable && styles.fieldDisabled,
        ]}
      >
        {leftIcon ? <Icon name={leftIcon} size={20} color={colors.textMuted} style={styles.leftIcon} /> : null}

        <TextInput
          ref={ref}
          multiline={multiline}
          editable={editable}
          placeholderTextColor={colors.textDisabled}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline]}
          {...rest}
        />

        {rightIcon ? (
          <Pressable onPress={onRightIconPress} disabled={!onRightIconPress} hitSlop={8} accessibilityRole="button">
            <Icon name={rightIcon} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.messageRow}>
          <Icon name="error-outline" size={14} color={colors.danger} />
          <Text variant="labelMd" color={colors.danger} style={styles.messageText}>
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text variant="bodySm" color={colors.textMuted} style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  label: { marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.input,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: radius.sm,
  },
  fieldMultiline: { alignItems: 'flex-start', paddingVertical: spacing.sm },
  fieldDisabled: { backgroundColor: colors.surfaceLow, opacity: 0.7 },
  leftIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
  messageRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  messageText: { marginLeft: spacing.xs },
  helper: { marginTop: spacing.xs },
});
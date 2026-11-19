import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { colors, shadow } from '@/constants/theme';

interface AuthActionsProps {
  onLogin: () => void;
  onRegister: () => void;
}

/** Compact, consistently sized auth actions for landing-page headers. */
export default function AuthActions({ onLogin, onRegister }: AuthActionsProps) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.button} accessibilityRole="button" accessibilityLabel="Log in" onPress={onLogin}>
        <Text variant="labelSm" color={colors.primary}>Log in</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.register]} accessibilityRole="button" accessibilityLabel="Register" onPress={onRegister}>
        <Text variant="labelSm" color={colors.onPrimary}>Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  button: {
    width: 72,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#B9D5DC',
    backgroundColor: 'rgba(255,255,255,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  register: { borderWidth: 0, backgroundColor: colors.primary, ...shadow.sm },
});

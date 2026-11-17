import React from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export default function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text variant="headlineSm">{title}</Text>
      {actionLabel && onActionPress ? (
        <Button label={actionLabel} onPress={onActionPress} variant="ghost" size="sm" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
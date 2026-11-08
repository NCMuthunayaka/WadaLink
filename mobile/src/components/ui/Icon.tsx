import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

export type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export default function Icon({ name, size = 20, color = colors.textPrimary, style }: IconProps) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}
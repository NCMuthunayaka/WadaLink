import React from 'react';
import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from '@/store/store';
import RootNavigator from '@/navigation/RootNavigator';
import { colors } from '@/constants/theme';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.danger,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
}

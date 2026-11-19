import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'wedalink.accessToken';

// Native tokens live in the device keychain/keystore. The web build uses
// localStorage because Expo SecureStore is a native-only module.
export const tokenStorage = {
  get: async (): Promise<string | null> => {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(KEY) ?? null;
    return SecureStore.getItemAsync(KEY);
  },
  set: async (token: string): Promise<void> => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(KEY, token);
      return;
    }
    await SecureStore.setItemAsync(KEY, token);
  },
  clear: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(KEY);
      return;
    }
    await SecureStore.deleteItemAsync(KEY);
  },
};

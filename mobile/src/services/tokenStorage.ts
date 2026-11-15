import * as SecureStore from 'expo-secure-store';

const KEY = 'wedalink.accessToken';

// The JWT lives in the device keychain/keystore. Native only (not available on web).
export const tokenStorage = {
  get: (): Promise<string | null> => SecureStore.getItemAsync(KEY),
  set: (token: string): Promise<void> => SecureStore.setItemAsync(KEY, token),
  clear: (): Promise<void> => SecureStore.deleteItemAsync(KEY),
};
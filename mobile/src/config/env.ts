// Expo inlines EXPO_PUBLIC_* variables at build time, so each one must be read
// as a literal `process.env.EXPO_PUBLIC_X` (no dynamic lookups).
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  /** Mock backend is ON unless EXPO_PUBLIC_USE_MOCK is exactly "false". */
  useMock: process.env.EXPO_PUBLIC_USE_MOCK !== 'false',
};
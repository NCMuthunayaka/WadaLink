/** Simulated network latency so loading states are visible during development. */
export const delay = (ms = 350): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 250));

/** Deep copy so callers can never mutate the in-memory "database" by accident. */
export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Same shape the real API client produces, so error handling is identical. */
export const mockError = (status: number, message: string): Error =>
  Object.assign(new Error(message), { status });
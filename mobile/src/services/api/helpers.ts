import axios from 'axios';

export interface ApiError {
  status: number | 'NETWORK' | 'UNKNOWN';
  message: string;
}

/** Normalises axios errors and mock errors into one serialisable shape. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return {
      status: error.response?.status ?? 'NETWORK',
      message: error.response?.data?.message ?? error.message,
    };
  }
  if (error instanceof Error) {
    const status = (error as Error & { status?: number }).status;
    return { status: status ?? 'UNKNOWN', message: error.message };
  }
  return { status: 'UNKNOWN', message: 'Unexpected error' };
}

/** Wraps a gateway call into the { data } | { error } shape RTK Query expects. */
export async function toResult<T>(fn: () => Promise<T>): Promise<{ data: T } | { error: ApiError }> {
  try {
    return { data: await fn() };
  } catch (e) {
    return { error: toApiError(e) };
  }
}
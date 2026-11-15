import axios from 'axios';

export interface ApiError {
  status: number | 'NETWORK' | 'UNKNOWN';
  message: string;
}

/**
 * FastAPI errors look like { detail: "text" } or, for validation failures,
 * { detail: [{ loc: ["body", "email"], msg: "...", type: "..." }] }.
 */
function detailMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) return undefined;
  const detail = (data as { detail?: unknown }).detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { loc?: unknown; msg?: unknown };
    if (typeof first.msg !== 'string') return undefined;
    const msg = first.msg.replace(/^Value error, /, '');
    const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : undefined;
    return typeof field === 'string' ? `${field.replace(/_/g, ' ')}: ${msg}` : msg;
  }
  return undefined;
}

/** Normalises axios errors and mock errors into one serialisable shape. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      status: error.response?.status ?? 'NETWORK',
      message: detailMessage(error.response?.data) ?? error.message,
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
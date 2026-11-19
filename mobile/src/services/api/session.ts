// In-memory holder for the current JWT plus a hook for "the server rejected it".
// Kept outside Redux so the HTTP client never has to import the store.
let token: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const authToken = {
  get: (): string | null => token,
  set: (value: string | null): void => {
    token = value;
  },
};

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}
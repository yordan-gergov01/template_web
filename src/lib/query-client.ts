import { QueryClient } from '@tanstack/react-query';

import { ApiError, NetworkError } from '@/lib/api/errors';

export const MAX_QUERY_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 10_000;

/** Reads retry after a network failure or a server error, never after a 4xx answer. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) {
    return false;
  }
  if (error instanceof NetworkError) {
    return true;
  }
  return error instanceof ApiError && error.status >= 500;
}

/** Waits as long as Retry-After asks, otherwise backs off exponentially up to 10 s. */
export function retryDelay(attempt: number, error: unknown): number {
  if (error instanceof ApiError && error.retryAfter !== undefined) {
    return error.retryAfter * 1000;
  }
  return Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS);
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
        retryDelay,
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Never retried: a POST the server accepted before the connection failed
        // would run twice (a second prompt job, a confusing 409 on user creation).
        retry: 0,
      },
    },
  });
}

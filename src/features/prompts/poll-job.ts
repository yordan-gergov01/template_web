import { ApiError, NetworkError } from '@/lib/api/errors';
import type { Job } from '@/lib/api/types';

/** How long each poll waits on the backend; the backend caps it at 25 seconds. */
export const WAIT_SECONDS = 25;
const MAX_BACKOFF_MS = 10_000;

export interface PollDependencies {
  fetchJob: (id: string, waitSeconds: number, signal: AbortSignal) => Promise<Job>;
  sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
}

/** 1 s, 2 s, 4 s, 8 s, then 10 s for every further consecutive failure. */
export function backoffDelay(failures: number): number {
  return Math.min(1000 * 2 ** failures, MAX_BACKOFF_MS);
}

/** Waits `ms` milliseconds; rejects with the abort reason as soon as `signal` aborts. */
export function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason as Error);
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason as Error);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Long-polls a prompt job until it is completed or failed and returns it.
 *
 * One request at a time: the backend holds each poll until the job finishes
 * or WAIT_SECONDS pass, and limits how many polls of one user may wait at
 * once. A 429 waits for Retry-After; network errors and 5xx answers back off
 * exponentially (or follow Retry-After when given) and the backoff resets
 * after any answer. Other errors, such as 404, end the polling. Aborting
 * `signal` stops the current request and any wait.
 */
export async function pollJob(
  id: string,
  signal: AbortSignal,
  dependencies: PollDependencies,
): Promise<Job> {
  const wait = dependencies.sleep ?? sleep;
  let failures = 0;

  for (;;) {
    signal.throwIfAborted();
    try {
      const job = await dependencies.fetchJob(id, WAIT_SECONDS, signal);
      failures = 0;
      if (job.status !== 'pending') {
        return job;
      }
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      if (error instanceof ApiError && error.status === 429) {
        await wait((error.retryAfter ?? 1) * 1000, signal);
      } else if (
        error instanceof NetworkError ||
        (error instanceof ApiError && error.status >= 500)
      ) {
        const retryAfter = error instanceof ApiError ? error.retryAfter : undefined;
        await wait(retryAfter === undefined ? backoffDelay(failures) : retryAfter * 1000, signal);
        failures += 1;
      } else {
        throw error;
      }
    }
  }
}

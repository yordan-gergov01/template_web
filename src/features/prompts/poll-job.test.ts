import { afterEach, describe, expect, it, vi } from 'vitest';

import { WAIT_SECONDS, backoffDelay, pollJob, sleep, type PollDependencies } from './poll-job';
import { ApiError, NetworkError } from '@/lib/api/errors';
import type { Job } from '@/lib/api/types';

function job(status: Job['status'], extra: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    status,
    prompt: 'Hello',
    model: 'mock-small',
    output: status === 'completed' ? 'Hi' : null,
    error_code: status === 'failed' ? 'PROVIDER_ERROR' : null,
    created_at: '2026-10-06T10:00:00Z',
    completed_at: status === 'pending' ? null : '2026-10-06T10:00:02Z',
    ...extra,
  };
}

function apiError(status: number, code: string, retryAfter?: number) {
  return new ApiError({ status, code, title: 'Error', detail: 'Failed.', retryAfter });
}

const networkError = () => new NetworkError(new TypeError('Failed to fetch'));

/** A fake backend answering with the given results in order, and a sleep that records its delays. */
function setup(results: (Job | Error)[]) {
  const delays: number[] = [];
  let inFlight = 0;
  let maxInFlight = 0;
  const fetchJob = vi.fn<PollDependencies['fetchJob']>(async () => {
    inFlight += 1;
    maxInFlight = Math.max(maxInFlight, inFlight);
    await Promise.resolve();
    inFlight -= 1;
    const result = results.shift();
    if (result === undefined) {
      throw new Error('no more results');
    }
    if (result instanceof Error) {
      throw result;
    }
    return result;
  });
  const fakeSleep = vi.fn((ms: number) => {
    delays.push(ms);
    return Promise.resolve();
  });
  return { fetchJob, sleep: fakeSleep, delays, maxInFlight: () => maxInFlight };
}

describe('pollJob', () => {
  it('polls one request at a time until the job is completed', async () => {
    const deps = setup([job('pending'), job('pending'), job('completed')]);

    const result = await pollJob('job-1', new AbortController().signal, deps);

    expect(result.status).toBe('completed');
    expect(deps.fetchJob).toHaveBeenCalledTimes(3);
    expect(deps.fetchJob).toHaveBeenCalledWith('job-1', WAIT_SECONDS, expect.any(AbortSignal));
    expect(deps.maxInFlight()).toBe(1);
    expect(deps.delays).toEqual([]);
  });

  it('returns a failed job', async () => {
    const deps = setup([job('failed', { error_code: 'TIMED_OUT' })]);
    await expect(pollJob('job-1', new AbortController().signal, deps)).resolves.toMatchObject({
      status: 'failed',
      error_code: 'TIMED_OUT',
    });
  });

  it('waits for Retry-After after a 429, one second when it is missing', async () => {
    const deps = setup([
      apiError(429, 'TOO_MANY_CONCURRENT_POLLS', 1),
      apiError(429, 'RATE_LIMITED', 7),
      apiError(429, 'RATE_LIMITED'),
      job('completed'),
    ]);

    await pollJob('job-1', new AbortController().signal, deps);

    expect(deps.delays).toEqual([1000, 7000, 1000]);
  });

  it('backs off exponentially after network errors and 5xx, capped at 10 seconds', async () => {
    const deps = setup([
      networkError(),
      apiError(500, 'INTERNAL_ERROR'),
      networkError(),
      apiError(502, 'HTTP_ERROR'),
      networkError(),
      networkError(),
      job('completed'),
    ]);

    await pollJob('job-1', new AbortController().signal, deps);

    expect(deps.delays).toEqual([1000, 2000, 4000, 8000, 10_000, 10_000]);
  });

  it('follows Retry-After on a 503', async () => {
    const deps = setup([apiError(503, 'DATABASE_UNAVAILABLE', 5), job('completed')]);
    await pollJob('job-1', new AbortController().signal, deps);
    expect(deps.delays).toEqual([5000]);
  });

  it('resets the backoff after an answer', async () => {
    const deps = setup([
      networkError(),
      networkError(),
      job('pending'),
      networkError(),
      job('completed'),
    ]);
    await pollJob('job-1', new AbortController().signal, deps);
    expect(deps.delays).toEqual([1000, 2000, 1000]);
  });

  it('stops on other errors', async () => {
    const notFound = apiError(404, 'JOB_NOT_FOUND');
    const deps = setup([notFound, job('completed')]);

    await expect(pollJob('job-1', new AbortController().signal, deps)).rejects.toBe(notFound);
    expect(deps.fetchJob).toHaveBeenCalledOnce();
  });

  it('stops when aborted', async () => {
    const controller = new AbortController();
    const deps = setup([job('pending'), job('pending'), job('completed')]);
    deps.sleep.mockImplementation(() => Promise.resolve());
    deps.fetchJob.mockImplementationOnce(() => {
      controller.abort();
      return Promise.reject(new DOMException('The operation was aborted.', 'AbortError'));
    });

    await expect(pollJob('job-1', controller.signal, deps)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(deps.fetchJob).toHaveBeenCalledOnce();
  });

  it('does not start when already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const deps = setup([job('completed')]);

    await expect(pollJob('job-1', controller.signal, deps)).rejects.toBeDefined();
    expect(deps.fetchJob).not.toHaveBeenCalled();
  });
});

describe('backoffDelay', () => {
  it('doubles from one second up to ten', () => {
    expect([0, 1, 2, 3, 4, 10].map(backoffDelay)).toEqual([1000, 2000, 4000, 8000, 10_000, 10_000]);
  });
});

describe('sleep', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves after the delay', async () => {
    vi.useFakeTimers();
    const done = vi.fn();
    void sleep(1000, new AbortController().signal).then(done);

    await vi.advanceTimersByTimeAsync(999);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalledOnce();
  });

  it('rejects as soon as the signal aborts', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const pending = sleep(10_000, controller.signal);

    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(vi.getTimerCount()).toBe(0);
  });
});

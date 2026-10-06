import { api } from '@/lib/api/http';
import type { Job } from '@/lib/api/types';

/** Queues the prompt; the backend answers 202 with the pending job. */
export function submitPrompt(prompt: string) {
  return api.post<Job>('/api/v1/prompts', { json: { prompt } });
}

/** Reads the job, waiting up to `waitSeconds` on the backend for it to finish. */
export function fetchJob(id: string, waitSeconds: number, signal: AbortSignal) {
  return api.get<Job>(`/api/v1/prompts/${encodeURIComponent(id)}`, {
    query: { wait_seconds: waitSeconds },
    signal,
  });
}

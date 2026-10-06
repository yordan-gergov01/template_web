import { skipToken, useMutation, useQuery } from '@tanstack/react-query';

import { fetchJob, submitPrompt } from './api';
import { pollJob } from './poll-job';

/**
 * Submits a prompt and follows its job until it is answered. The long-poll
 * loop runs as the query function of a TanStack query keyed by the job, so
 * TanStack Query cancels it (through its abort signal) when the page is left
 * or a new prompt replaces the job: at most one poll runs at a time.
 */
export function usePromptJob() {
  const submission = useMutation({ mutationFn: submitPrompt });
  const submitted = submission.data;
  const pendingId = submitted?.status === 'pending' ? submitted.id : null;

  const result = useQuery({
    queryKey: ['prompt-job', pendingId],
    queryFn:
      pendingId === null ? skipToken : ({ signal }) => pollJob(pendingId, signal, { fetchJob }),
    // pollJob handles retries and rate limits itself; a finished job never changes.
    retry: false,
    staleTime: Infinity,
  });

  return {
    submission,
    job: result.data ?? submitted ?? null,
    pollError: result.error,
    /** Polls again after polling stopped with an error; the job may still finish. */
    retryPolling: () => {
      void result.refetch();
    },
  };
}

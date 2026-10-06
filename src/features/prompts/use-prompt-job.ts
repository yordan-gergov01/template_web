import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { fetchJob, submitPrompt } from './api';
import { pollJob } from './poll-job';
import type { Job } from '@/lib/api/types';

/**
 * Submits a prompt and follows its job until it is answered. Polling stops
 * when the job finishes, when the component unmounts, and before a new job
 * starts, so at most one poll runs at a time.
 */
export function usePromptJob() {
  const [job, setJob] = useState<Job | null>(null);
  const [pollError, setPollError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  const submission = useMutation({
    mutationFn: submitPrompt,
    onSuccess: (created) => {
      setPollError(null);
      setJob(created);
    },
  });

  const pendingId = job?.status === 'pending' ? job.id : null;

  useEffect(() => {
    if (pendingId === null) {
      return;
    }
    const controller = new AbortController();
    pollJob(pendingId, controller.signal, { fetchJob }).then(setJob, (error: unknown) => {
      if (!controller.signal.aborted) {
        setPollError(error);
      }
    });
    return () => {
      controller.abort();
    };
  }, [pendingId, attempt]);

  /** Polls again after polling stopped with an error; the job may still finish. */
  const retryPolling = useCallback(() => {
    setPollError(null);
    setAttempt((value) => value + 1);
  }, []);

  return { job, pollError, submission, retryPolling };
}

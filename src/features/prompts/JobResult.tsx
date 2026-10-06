import { Alert } from '@/components/ui/Alert';
import type { Job, JobErrorCode } from '@/lib/api/types';

const FAILURE_MESSAGES: Record<JobErrorCode, string> = {
  PROVIDER_ERROR: 'The model failed to answer.',
  PROVIDER_TIMEOUT: 'The model took too long to answer.',
  UNSUPPORTED_MODEL: 'The selected model is not available.',
  INVALID_MESSAGE: 'The request could not be processed.',
  INTERNAL_ERROR: 'An unexpected error occurred while answering.',
  TIMED_OUT: 'No answer arrived within the time limit.',
  UNDELIVERABLE: 'The request could not be delivered and will not be answered.',
  BROKER_UNAVAILABLE: 'The request could not be queued. Please try again later.',
};

export interface JobResultProps {
  job: Job;
}

/** The state of a prompt job. The answer is model output, so it is rendered as plain text only. */
export function JobResult({ job }: JobResultProps) {
  if (job.status === 'pending') {
    return (
      <p role="status" className="status">
        Waiting for the answer from {job.model}…
      </p>
    );
  }

  if (job.status === 'failed') {
    const message = job.error_code
      ? FAILURE_MESSAGES[job.error_code]
      : 'The prompt could not be answered.';
    return (
      <Alert>
        <p className="my-0">{message}</p>
        <p className="mt-1 mb-0 text-xs text-red-700">
          Model: {job.model}. Job ID: <code className="select-all">{job.id}</code>
        </p>
      </Alert>
    );
  }

  return (
    <section aria-label="Answer">
      <h2>Answer</h2>
      <p className="answer">{job.output}</p>
      <p className="text-xs text-gray-600">
        Answered by <strong className="font-semibold text-gray-800">{job.model}</strong>
      </p>
    </section>
  );
}

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
      <div role="alert" className="error-message">
        <p>{message}</p>
        <p className="request-id">
          Model: {job.model}. Job ID: <code>{job.id}</code>
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Answer">
      <h2>Answer</h2>
      <p className="answer">{job.output}</p>
      <p className="model">
        Answered by <strong>{job.model}</strong>
      </p>
    </section>
  );
}

import { Alert } from './Alert';
import { ApiError, NetworkError } from '@/lib/api/errors';

function describe(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'The server could not be reached. Check your connection and try again.';
  }
  if (!(error instanceof ApiError)) {
    return 'Something went wrong.';
  }
  if (error.code === 'PERMISSION_DENIED') {
    return 'You are not allowed to do this.';
  }
  if (error.status === 429) {
    return error.retryAfter === undefined
      ? 'Too many requests. Please wait a moment and try again.'
      : `Too many requests. Try again in ${String(error.retryAfter)} seconds.`;
  }
  if (error.status === 503) {
    return 'The service is temporarily unavailable. Please try again later.';
  }
  if (error.status >= 500) {
    return 'Something went wrong on the server. Please try again later.';
  }
  return error.detail;
}

export interface ErrorMessageProps {
  error: unknown;
}

/**
 * Shows an error from a backend call. The request ID identifies the request in
 * the backend logs and is shown so a failure can be reported.
 */
export function ErrorMessage({ error }: ErrorMessageProps) {
  const requestId = error instanceof ApiError ? error.requestId : undefined;

  return (
    <Alert>
      <p className="my-0">{describe(error)}</p>
      {requestId && (
        <p className="mt-1 mb-0 text-xs text-red-700">
          Request ID: <code className="select-all">{requestId}</code>
        </p>
      )}
    </Alert>
  );
}

import { ApiError, NetworkError } from '@/lib/api/errors';

function describe(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403 && error.code === 'PERMISSION_DENIED') {
      return 'You are not allowed to do this.';
    }
    if (error.status >= 500) {
      return 'Something went wrong on the server. Please try again later.';
    }
    return error.detail;
  }
  if (error instanceof NetworkError) {
    return 'The server could not be reached. Check your connection and try again.';
  }
  return 'Something went wrong.';
}

/**
 * Shows an error from a backend call. The request ID identifies the request in
 * the backend logs and is shown so a failure can be reported.
 */
export function ErrorMessage({ error }: { error: unknown }) {
  const requestId = error instanceof ApiError ? error.requestId : undefined;

  return (
    <div role="alert" className="error-message">
      <p>{describe(error)}</p>
      {requestId && (
        <p className="request-id">
          Request ID: <code>{requestId}</code>
        </p>
      )}
    </div>
  );
}

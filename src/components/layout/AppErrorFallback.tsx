import type { FallbackProps } from 'react-error-boundary';

/** Shown by the top-level error boundary instead of a blank page when rendering fails. */
export function AppErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <main>
      <h1>Something went wrong</h1>
      <p>The page could not be displayed.</p>
      {import.meta.env.DEV && error instanceof Error && <pre>{error.message}</pre>}
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>
    </main>
  );
}

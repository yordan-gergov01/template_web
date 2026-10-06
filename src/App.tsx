import type { ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { RouterProvider } from 'react-router/dom';

import { AppErrorFallback } from '@/components/layout/AppErrorFallback';
import { AppProviders } from '@/providers/AppProviders';
import { router } from '@/routes/router';

function reportRenderError(error: unknown, info: ErrorInfo) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- development-only diagnostics
    console.error(error, info.componentStack);
  }
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={AppErrorFallback} onError={reportRenderError}>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}

import { RouterProvider } from 'react-router/dom';

import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { AppProviders } from '@/providers/AppProviders';
import { router } from '@/routes/router';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}

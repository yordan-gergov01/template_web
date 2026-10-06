import { Navigate, Outlet, useLocation } from 'react-router';

import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/providers/auth/auth-context';
import type { LoginLocationState } from '@/types/navigation';

/** Lets signed-in users through; sends everyone else to the login page and back afterwards. */
export function RequireAuth() {
  const { status, error, retry } = useAuth();
  const location = useLocation();

  if (status === 'anonymous') {
    const state: LoginLocationState = {
      from: `${location.pathname}${location.search}${location.hash}`,
    };
    return <Navigate to="/login" replace state={state} />;
  }
  if (status === 'loading') {
    return <p className="status">Loading…</p>;
  }
  if (status === 'error') {
    return (
      <main>
        <ErrorMessage error={error} />
        <button type="button" onClick={retry}>
          Try again
        </button>
      </main>
    );
  }
  return <Outlet />;
}

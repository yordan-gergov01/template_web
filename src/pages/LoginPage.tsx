import { Navigate, useLocation } from 'react-router';

import { useAuth } from '@/providers/auth/auth-context';
import type { LoginLocationState } from '@/types/navigation';

export function LoginPage() {
  const { status } = useAuth();
  const state = useLocation().state as LoginLocationState | null;

  if (status === 'authenticated') {
    return <Navigate to={state?.from ?? '/'} replace />;
  }
  return (
    <main>
      <h1>Log in</h1>
    </main>
  );
}

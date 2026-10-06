import { Navigate, useLocation } from 'react-router';

import { LoginForm } from '@/features/auth/LoginForm';
import { SessionEndNotice } from '@/features/auth/SessionEndNotice';
import { useAuth } from '@/providers/auth/auth-context';
import type { LoginLocationState } from '@/types/navigation';

export function LoginPage() {
  const { status } = useAuth();
  const state = useLocation().state as LoginLocationState | null;

  // After signing in, return to the page the user wanted.
  if (status === 'authenticated') {
    return <Navigate to={state?.from ?? '/'} replace />;
  }
  return (
    <main>
      <h1>Log in</h1>
      <SessionEndNotice />
      <LoginForm />
    </main>
  );
}

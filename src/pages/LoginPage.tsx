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
    <main className="max-w-md pt-16">
      <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-xs sm:p-6">
        <h1 className="mb-0">Log in</h1>
        <SessionEndNotice />
        <LoginForm />
      </div>
    </main>
  );
}

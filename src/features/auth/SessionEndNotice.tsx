import { useAuth, type SessionEndReason } from '@/providers/auth/auth-context';

const MESSAGES: Record<SessionEndReason, string> = {
  expired: 'Your session has expired. Please log in again.',
  unauthorized: 'Your session has ended. Please log in again.',
  'password-changed': 'Your password was changed. Please log in with the new password.',
};

/** Explains why the user is back on the login page, unless they logged out themselves. */
export function SessionEndNotice() {
  const { endReason } = useAuth();
  if (!endReason) {
    return null;
  }
  return (
    <p role="status" className="notice">
      {MESSAGES[endReason]}
    </p>
  );
}

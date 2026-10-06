import { useMutation } from '@tanstack/react-query';

import { changePassword } from './api';
import { useAuth } from '@/providers/auth/auth-context';

/**
 * Changes the password. The backend then ends every session of the user, so
 * the local session ends too and the login page asks for the new password.
 */
export function useChangePassword() {
  const { endSession } = useAuth();
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      endSession('password-changed');
    },
  });
}

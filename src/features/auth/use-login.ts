import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/providers/auth/auth-context';

export interface Credentials {
  username: string;
  password: string;
}

/** Signs in and loads the user; the login page then moves on. */
export function useLogin() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: ({ username, password }: Credentials) => login(username.trim(), password),
  });
}

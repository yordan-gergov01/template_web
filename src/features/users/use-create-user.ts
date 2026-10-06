import { useMutation, useQueryClient } from '@tanstack/react-query';

import { USERS_KEY, createUser } from './api';

/** Creates a user and refreshes the user list. */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

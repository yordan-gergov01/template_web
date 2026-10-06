import { useMutation, useQueryClient } from '@tanstack/react-query';

import { USERS_KEY, updateUser, userQueryOptions } from './api';
import type { UserAdminUpdate } from '@/lib/api/types';
import { meQueryOptions } from '@/providers/auth/session-api';

/**
 * Saves changes to a user and refreshes what shows them: the user itself, the
 * list pages, and the session's user when someone edits their own record.
 */
export function useUpdateUser(userId: string, isSelf: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: UserAdminUpdate) => updateUser(userId, changes),
    onSuccess: async (updated) => {
      queryClient.setQueryData(userQueryOptions(userId).queryKey, updated);
      await queryClient.invalidateQueries({ queryKey: [...USERS_KEY, 'page'] });
      if (isSelf) {
        await queryClient.invalidateQueries({ queryKey: meQueryOptions.queryKey });
      }
    },
  });
}

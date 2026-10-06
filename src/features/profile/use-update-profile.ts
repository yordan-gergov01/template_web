import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProfile } from './api';
import { meQueryOptions } from '@/providers/auth/session-api';

/** Saves name and email and updates the session's user, so the header shows the change at once. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (me) => {
      queryClient.setQueryData(meQueryOptions.queryKey, me);
    },
  });
}

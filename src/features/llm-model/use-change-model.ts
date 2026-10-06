import { useMutation, useQueryClient } from '@tanstack/react-query';

import { changeModel, modelQueryOptions } from './api';

/**
 * Changes the model for all new prompts. The page owns this mutation so its
 * error stays visible even when a refusal removes the switch: a 403 reloads
 * the user's permissions, and the form is no longer shown.
 */
export function useChangeModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeModel,
    onSuccess: (settings) => {
      queryClient.setQueryData(modelQueryOptions.queryKey, settings);
    },
    onError: async () => {
      // The model may have changed meanwhile; show the backend's current state.
      await queryClient.invalidateQueries({ queryKey: modelQueryOptions.queryKey });
    },
  });
}

export type ChangeModelMutation = ReturnType<typeof useChangeModel>;

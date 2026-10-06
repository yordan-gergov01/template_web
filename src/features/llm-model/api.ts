import { queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api/http';
import type { ModelSettings } from '@/lib/api/types';

export const modelQueryOptions = queryOptions({
  queryKey: ['llm-model'],
  queryFn: ({ signal }) => api.get<ModelSettings>('/api/v1/llm/model', { signal }),
});

/** Admins only (llm:model:change); anyone else gets 403 and the model stays unchanged. */
export function changeModel(model: string) {
  return api.put<ModelSettings>('/api/v1/llm/model', { json: { model } });
}

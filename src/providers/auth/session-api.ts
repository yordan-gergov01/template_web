import { queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api/http';
import type { Me, Token } from '@/lib/api/types';

export function loginRequest(username: string, password: string) {
  return api.post<Token>('/api/v1/auth/login', { form: { username, password }, auth: false });
}

/** Ends every session of the user on the backend. */
export function logoutRequest() {
  return api.post<undefined>('/api/v1/auth/logout');
}

export const meQueryOptions = queryOptions({
  queryKey: ['me'],
  // Never reports a 403: this query is what a reported 403 reloads.
  queryFn: ({ signal }) => api.get<Me>('/api/v1/users/me', { signal, reportForbidden: false }),
  staleTime: 60_000,
});

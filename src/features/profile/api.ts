import { api } from '@/lib/api/http';
import type { Me, PasswordChange, UserSelfUpdate } from '@/lib/api/types';

export function updateProfile(changes: UserSelfUpdate) {
  return api.patch<Me>('/api/v1/users/me', { json: changes });
}

/** Ends every session of the user on success (204). */
export function changePassword(body: PasswordChange) {
  return api.post<undefined>('/api/v1/users/me/password', { json: body });
}

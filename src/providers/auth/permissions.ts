import type { Permission } from '@/lib/api/types';

/**
 * Whether the permissions from /users/me include the given one. The UI decides
 * by permission only, never by role name; the backend remains the authority.
 */
export function hasPermission(
  permissions: readonly Permission[] | undefined,
  permission: Permission,
): boolean {
  return permissions?.includes(permission) ?? false;
}

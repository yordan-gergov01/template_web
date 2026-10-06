import type { ReactNode } from 'react';

import type { Permission } from '@/lib/api/types';
import { NotAllowedPage } from '@/pages/NotAllowedPage';
import { useAuth } from '@/providers/auth/auth-context';

export interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
}

/** Shows the page only with the permission; the backend still checks every request. */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { can } = useAuth();
  return can(permission) ? children : <NotAllowedPage />;
}

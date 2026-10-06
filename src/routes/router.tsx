import type { ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';

import { RequireAuth, RequirePermission } from './guards';
import { AppShell, type NavItem } from '@/components/layout/AppShell';
import type { Permission } from '@/lib/api/types';
import { LoginPage } from '@/pages/LoginPage';
import { ModelPage } from '@/pages/ModelPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PromptPage } from '@/pages/PromptPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';
import { UsersPage } from '@/pages/UsersPage';

interface ProtectedPage {
  path: string;
  label: string;
  permission?: Permission;
  element: ReactNode;
}

/** Pages for signed-in users. The same list drives the routes, their guards and the navigation. */
const PROTECTED_PAGES: readonly ProtectedPage[] = [
  { path: 'profile', label: 'Profile', element: <ProfilePage /> },
  { path: 'users', label: 'Users', permission: 'users:read', element: <UsersPage /> },
  { path: 'prompt', label: 'Prompt', permission: 'prompts:create', element: <PromptPage /> },
  { path: 'model', label: 'Model', permission: 'llm:model:read', element: <ModelPage /> },
];

const navItems: NavItem[] = PROTECTED_PAGES.map(({ path, label, permission }) => ({
  to: `/${path}`,
  label,
  permission,
}));

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell navItems={navItems} />,
            children: [
              { index: true, element: <Navigate to="/profile" replace /> },
              ...PROTECTED_PAGES.map(({ path, permission, element }) => ({
                path,
                element: permission ? (
                  <RequirePermission permission={permission}>{element}</RequirePermission>
                ) : (
                  element
                ),
              })),
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

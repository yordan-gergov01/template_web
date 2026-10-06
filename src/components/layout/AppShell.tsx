import { NavLink, Outlet } from 'react-router';

import type { Permission } from '@/lib/api/types';
import { useAuth } from '@/providers/auth/auth-context';

export interface NavItem {
  to: string;
  label: string;
  /** Shown only to users with this permission. */
  permission?: Permission;
}

/** Page frame for signed-in users; the navigation shows only what the user may use. */
export function AppShell({ navItems }: { navItems: readonly NavItem[] }) {
  const { user, can, logout } = useAuth();
  const visible = navItems.filter((item) => !item.permission || can(item.permission));

  return (
    <>
      <header className="app-header">
        <nav aria-label="Main">
          {visible.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-header-user">
          <span>{user?.full_name}</span>
          <button
            type="button"
            onClick={() => {
              void logout();
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

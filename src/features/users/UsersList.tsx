import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';

import { PAGE_SIZE, usersPageQueryOptions } from './api';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/providers/auth/auth-context';

function pageFromParams(params: URLSearchParams): number {
  const page = Number(params.get('page') ?? '1');
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** One page of users; the page number is kept in the URL (?page=2). */
export function UsersList() {
  const { can } = useAuth();
  const [params, setParams] = useSearchParams();
  const page = pageFromParams(params);
  const { data, error, isPending, isPlaceholderData } = useQuery(
    usersPageQueryOptions((page - 1) * PAGE_SIZE),
  );

  const goTo = (target: number) => {
    setParams(target === 1 ? {} : { page: String(target) });
  };

  if (isPending) {
    return <p className="status">Loading…</p>;
  }
  if (error) {
    return <ErrorMessage error={error} />;
  }

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <>
      {can('users:create') && (
        <p>
          <Link to="/users/new">Create user</Link>
        </p>
      )}
      <table aria-busy={isPlaceholderData}>
        <thead>
          <tr>
            <th scope="col">Username</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((user) => (
            <tr key={user.id}>
              <td>
                <Link to={`/users/${user.id}`}>{user.username}</Link>
              </td>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.is_active ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav aria-label="Pages" className="pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => {
            goTo(page - 1);
          }}
        >
          Previous
        </button>
        <span>
          Page {page} of {pages} ({data.total} users)
        </span>
        <button
          type="button"
          disabled={page >= pages || isPlaceholderData}
          onClick={() => {
            goTo(page + 1);
          }}
        >
          Next
        </button>
      </nav>
    </>
  );
}

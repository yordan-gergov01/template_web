import { Link, useParams } from 'react-router';

import { UserDetail } from '@/features/users/UserDetail';

export function UserDetailPage() {
  const { userId = '' } = useParams();

  return (
    <>
      <p>
        <Link to="/users">Back to users</Link>
      </p>
      <h1>User</h1>
      <UserDetail key={userId} userId={userId} />
    </>
  );
}

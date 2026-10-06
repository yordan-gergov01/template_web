import { Link } from 'react-router';

import { CreateUserForm } from '@/features/users/CreateUserForm';

export function NewUserPage() {
  return (
    <>
      <p>
        <Link to="/users">Back to users</Link>
      </p>
      <h1>Create user</h1>
      <CreateUserForm />
    </>
  );
}

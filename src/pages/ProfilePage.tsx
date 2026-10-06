import { PasswordForm } from '@/features/profile/PasswordForm';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { useAuth } from '@/providers/auth/auth-context';

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  return (
    <>
      <h1>Profile</h1>
      <dl className="details">
        <dt>Username</dt>
        <dd>{user.username}</dd>
        <dt>Role</dt>
        <dd>{user.role}</dd>
      </dl>

      <h2>Name and email</h2>
      <ProfileForm key={user.id} user={user} />

      <h2>Password</h2>
      <PasswordForm />
    </>
  );
}

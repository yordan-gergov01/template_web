import { useMutation } from '@tanstack/react-query';
import { useState, type SubmitEvent } from 'react';

import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Field } from '@/components/ui/Field';
import { ApiError } from '@/lib/api/errors';
import { useAuth } from '@/providers/auth/auth-context';

/**
 * Wrong username, wrong password and an inactive account all get the same
 * answer from the backend, and the same message here.
 */
const INVALID_CREDENTIALS_MESSAGE = 'The username or password is incorrect.';

export function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Signing in also loads the user; the login page then moves on.
  const mutation = useMutation({
    mutationFn: () => login(username.trim(), password),
  });

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  const { error } = mutation;
  const invalidCredentials = error instanceof ApiError && error.code === 'INVALID_CREDENTIALS';

  return (
    <form onSubmit={submit} noValidate>
      {invalidCredentials && (
        <p role="alert" className="error-message">
          {INVALID_CREDENTIALS_MESSAGE}
        </p>
      )}
      {error && !invalidCredentials && <ErrorMessage error={error} />}

      <Field label="Username">
        {(props) => (
          <input
            {...props}
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
        )}
      </Field>
      <Field label="Password">
        {(props) => (
          <input
            {...props}
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        )}
      </Field>
      <button
        type="submit"
        disabled={mutation.isPending || username.trim() === '' || password === ''}
      >
        {mutation.isPending ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}

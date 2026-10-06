import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type SubmitEvent } from 'react';

import { updateProfile } from './api';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Field } from '@/components/ui/Field';
import { toFormErrors } from '@/lib/api/form-errors';
import type { Me } from '@/lib/api/types';
import { meQueryOptions } from '@/providers/auth/session-api';
import { changedFields } from '@/utils/changed-fields';
import { validateEmail, validateFullName } from '@/utils/validation';

const FIELDS = ['full_name', 'email'] as const;
type ProfileField = (typeof FIELDS)[number];

/** Name and email only: users never change their own role or active status. */
export function ProfileForm({ user }: { user: Me }) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [clientErrors, setClientErrors] = useState<Partial<Record<ProfileField, string>>>({});
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (me) => {
      queryClient.setQueryData(meQueryOptions.queryKey, me);
      // The backend normalises the email (lowercase); show what it stored.
      setFullName(me.full_name);
      setEmail(me.email);
      setSaved(true);
    },
  });

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    mutation.reset();

    const errors: Partial<Record<ProfileField, string>> = {
      full_name: validateFullName(fullName),
      email: validateEmail(email),
    };
    setClientErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      return;
    }

    const changes = changedFields(
      { full_name: user.full_name, email: user.email },
      { full_name: fullName.trim(), email: email.trim() },
    );
    if (Object.keys(changes).length === 0) {
      setSaved(true);
      return;
    }
    mutation.mutate(changes);
  };

  const server = mutation.error
    ? toFormErrors(mutation.error, FIELDS, { EMAIL_TAKEN: 'email' })
    : { fields: {}, general: null };
  const fieldError = (field: ProfileField) => clientErrors[field] ?? server.fields[field];

  return (
    <form onSubmit={submit} noValidate>
      {server.general !== null && <ErrorMessage error={server.general} />}
      {saved && (
        <p role="status" className="notice">
          Your profile is saved.
        </p>
      )}

      <Field label="Full name" error={fieldError('full_name')}>
        {(props) => (
          <input
            {...props}
            name="full_name"
            autoComplete="name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
            }}
          />
        )}
      </Field>
      <Field label="Email" error={fieldError('email')}>
        {(props) => (
          <input
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        )}
      </Field>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}

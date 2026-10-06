import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type SubmitEvent } from 'react';

import { USERS_KEY, rolesQueryOptions, updateUser, userQueryOptions } from './api';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Field } from '@/components/ui/Field';
import { toFormErrors } from '@/lib/api/form-errors';
import type { RoleName, User } from '@/lib/api/types';
import { useAuth } from '@/providers/auth/auth-context';
import { meQueryOptions } from '@/providers/auth/session-api';
import { changedFields } from '@/utils/changed-fields';
import { validateEmail, validateFullName } from '@/utils/validation';

const FIELDS = ['full_name', 'email', 'role', 'is_active'] as const;
type EditField = (typeof FIELDS)[number];

const formatDate = (value: string) => new Date(value).toLocaleString();

/** Loads one user and shows the edit form, read-only without users:update. */
export function UserDetail({ userId }: { userId: string }) {
  const { data, error, isPending } = useQuery(userQueryOptions(userId));

  if (isPending) {
    return <p className="status">Loading…</p>;
  }
  if (error) {
    return <ErrorMessage error={error} />;
  }
  return (
    <>
      <dl className="details">
        <dt>Username</dt>
        <dd>{data.username}</dd>
        <dt>Created</dt>
        <dd>{formatDate(data.created_at)}</dd>
        <dt>Updated</dt>
        <dd>{formatDate(data.updated_at)}</dd>
      </dl>
      <EditUserForm key={data.id} user={data} />
    </>
  );
}

function EditUserForm({ user }: { user: User }) {
  const { user: me, can } = useAuth();
  const queryClient = useQueryClient();
  const roles = useQuery(rolesQueryOptions);
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.is_active);
  const [clientErrors, setClientErrors] = useState<Partial<Record<EditField, string>>>({});
  const [saved, setSaved] = useState(false);

  const canEdit = can('users:update');
  // The backend refuses this too; the controls only make it visible.
  const isSelf = me?.id === user.id;

  const mutation = useMutation({
    mutationFn: (changes: Parameters<typeof updateUser>[1]) => updateUser(user.id, changes),
    onSuccess: async (updated) => {
      queryClient.setQueryData(userQueryOptions(user.id).queryKey, updated);
      setSaved(true);
      await queryClient.invalidateQueries({ queryKey: [...USERS_KEY, 'page'] });
      if (isSelf) {
        await queryClient.invalidateQueries({ queryKey: meQueryOptions.queryKey });
      }
    },
  });

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    mutation.reset();

    const errors: Partial<Record<EditField, string>> = {
      full_name: validateFullName(fullName),
      email: validateEmail(email),
    };
    setClientErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      return;
    }

    const changes = changedFields(
      {
        full_name: user.full_name,
        email: user.email,
        role: user.role as RoleName,
        is_active: user.is_active,
      },
      {
        full_name: fullName.trim(),
        email: email.trim(),
        role: role as RoleName,
        is_active: isActive,
      },
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
  const fieldError = (field: EditField) => clientErrors[field] ?? server.fields[field];
  const selfHint = isSelf ? 'You cannot change your own role or active status.' : undefined;

  return (
    <form onSubmit={submit} noValidate>
      {server.general !== null && <ErrorMessage error={server.general} />}
      {saved && (
        <p role="status" className="notice">
          The user is saved.
        </p>
      )}

      <fieldset disabled={!canEdit || mutation.isPending}>
        <Field label="Full name" error={fieldError('full_name')}>
          {(props) => (
            <input
              {...props}
              name="full_name"
              autoComplete="off"
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
              autoComplete="off"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
          )}
        </Field>
        <Field label="Role" error={fieldError('role')} hint={selfHint}>
          {(props) => (
            <select
              {...props}
              name="role"
              value={role}
              disabled={isSelf}
              onChange={(event) => {
                setRole(event.target.value);
              }}
            >
              {(roles.data ?? [{ name: role }]).map(({ name }) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Status" error={fieldError('is_active')} hint={selfHint}>
          {(props) => (
            <select
              {...props}
              name="is_active"
              value={isActive ? 'active' : 'inactive'}
              disabled={isSelf}
              onChange={(event) => {
                setIsActive(event.target.value === 'active');
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive (cannot log in)</option>
            </select>
          )}
        </Field>
        {canEdit && (
          <button type="submit">{mutation.isPending ? 'Saving…' : 'Save changes'}</button>
        )}
      </fieldset>
    </form>
  );
}

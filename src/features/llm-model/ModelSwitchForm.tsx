import { useQuery } from '@tanstack/react-query';
import { useState, type SubmitEvent } from 'react';

import { modelQueryOptions } from './api';
import type { ChangeModelMutation } from './use-change-model';
import { Field } from '@/components/ui/Field';

export interface ModelSwitchFormProps {
  mutation: ChangeModelMutation;
}

/**
 * Picks the model for all new prompts. Shown only with llm:model:change; the
 * backend decides. Errors are shown by the page that owns the mutation.
 */
export function ModelSwitchForm({ mutation }: ModelSwitchFormProps) {
  const { data } = useQuery(modelQueryOptions);
  const [selected, setSelected] = useState<string | null>(null);

  if (!data) {
    return null;
  }
  const model = selected ?? data.current_model;

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(model, {
      onSuccess: () => {
        setSelected(null);
      },
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      {mutation.isSuccess && (
        <p role="status" className="notice">
          New prompts are now answered by {mutation.data.current_model}.
        </p>
      )}
      <Field label="Model">
        {(props) => (
          <select
            {...props}
            name="model"
            value={model}
            onChange={(event) => {
              setSelected(event.target.value);
              mutation.reset();
            }}
          >
            {data.allowed_models.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
      </Field>
      <button type="submit" disabled={mutation.isPending || model === data.current_model}>
        {mutation.isPending ? 'Changing…' : 'Change model'}
      </button>
    </form>
  );
}

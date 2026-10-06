import { useState, type SubmitEvent } from 'react';

import { JobResult } from './JobResult';
import { usePromptJob } from './use-prompt-job';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Field } from '@/components/ui/Field';
import { toFormErrors } from '@/lib/api/form-errors';
import { PROMPT_MAX_LENGTH, characterCount, validatePrompt } from '@/utils/validation';

export function PromptForm() {
  const [prompt, setPrompt] = useState('');
  const [clientError, setClientError] = useState<string | undefined>();
  const { job, pollError, submission, retryPolling } = usePromptJob();

  const waiting = submission.isPending || (job?.status === 'pending' && pollError === null);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validatePrompt(prompt);
    setClientError(error);
    if (error === undefined) {
      submission.mutate(prompt);
    }
  };

  const server = submission.error
    ? toFormErrors(submission.error, ['prompt'], { PROMPT_TOO_LONG: 'prompt' })
    : { fields: {}, general: null };

  return (
    <>
      <form onSubmit={submit} noValidate>
        {server.general !== null && <ErrorMessage error={server.general} />}
        <Field
          label="Prompt"
          error={clientError ?? server.fields.prompt}
          hint={`${String(characterCount(prompt))} / ${String(PROMPT_MAX_LENGTH)} characters`}
        >
          {(props) => (
            <textarea
              {...props}
              name="prompt"
              rows={6}
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);
              }}
            />
          )}
        </Field>
        <button type="submit" disabled={waiting}>
          {waiting ? 'Waiting for the answer…' : 'Send'}
        </button>
      </form>

      {job && <JobResult job={job} />}
      {pollError !== null && (
        <>
          <ErrorMessage error={pollError} />
          <button type="button" onClick={retryPolling}>
            Check again
          </button>
        </>
      )}
    </>
  );
}

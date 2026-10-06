import { useQuery } from '@tanstack/react-query';

import { modelQueryOptions } from './api';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

/** The model new prompts are answered by. */
export function CurrentModel() {
  const { data, error } = useQuery(modelQueryOptions);

  if (error) {
    return <ErrorMessage error={error} />;
  }
  return (
    <p className="model">
      Current model: <strong>{data?.current_model ?? '…'}</strong>
    </p>
  );
}

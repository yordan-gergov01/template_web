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
    <p className="text-sm text-gray-600">
      Current model:{' '}
      <strong className="font-semibold text-gray-900">{data?.current_model ?? '…'}</strong>
    </p>
  );
}

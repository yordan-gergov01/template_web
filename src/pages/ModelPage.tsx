import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { CurrentModel } from '@/features/llm-model/CurrentModel';
import { ModelSwitchForm } from '@/features/llm-model/ModelSwitchForm';
import { useChangeModel } from '@/features/llm-model/use-change-model';
import { useAuth } from '@/providers/auth/auth-context';

export function ModelPage() {
  const { can } = useAuth();
  const changeModel = useChangeModel();

  return (
    <>
      <h1>Model</h1>
      <CurrentModel />
      {changeModel.error && <ErrorMessage error={changeModel.error} />}
      {can('llm:model:change') && <ModelSwitchForm mutation={changeModel} />}
    </>
  );
}

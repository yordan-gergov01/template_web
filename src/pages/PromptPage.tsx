import { CurrentModel } from '@/features/llm-model/CurrentModel';
import { PromptForm } from '@/features/prompts/PromptForm';
import { useAuth } from '@/providers/auth/auth-context';

export function PromptPage() {
  const { can } = useAuth();

  return (
    <>
      <h1>Prompt</h1>
      {can('llm:model:read') && <CurrentModel />}
      <PromptForm />
    </>
  );
}

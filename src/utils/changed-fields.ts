/**
 * The fields of `current` whose values differ from `initial`, for PATCH
 * requests that send only what changed. An empty result means nothing to save.
 */
export function changedFields<T extends object>(initial: T, current: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(current) as (keyof T)[]) {
    if (current[key] !== initial[key]) {
      result[key] = current[key];
    }
  }
  return result;
}

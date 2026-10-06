import { describe, expect, it } from 'vitest';

import { hasPermission } from './permissions';

describe('hasPermission', () => {
  it('is true for a listed permission', () => {
    expect(hasPermission(['prompts:create', 'users:read'], 'users:read')).toBe(true);
  });

  it('is false for a permission that is not listed', () => {
    expect(hasPermission(['prompts:create', 'prompts:read'], 'users:read')).toBe(false);
  });

  it('is false while the permissions are unknown', () => {
    expect(hasPermission(undefined, 'users:read')).toBe(false);
    expect(hasPermission([], 'users:read')).toBe(false);
  });
});

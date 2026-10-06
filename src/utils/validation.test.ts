import { describe, expect, it } from 'vitest';

import {
  PROMPT_MAX_LENGTH,
  characterCount,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePrompt,
  validateUsername,
} from './validation';

describe('validateUsername', () => {
  it.each(['abc', 'john.doe', 'a_b-c.9', 'Alice', ' bob ', 'a'.repeat(50)])('accepts %j', (v) => {
    expect(validateUsername(v)).toBeUndefined();
  });

  it.each(['ab', 'a'.repeat(51), '.abc', 'abc-', 'a b c', 'jöhn', 'a@b'])('rejects %j', (v) => {
    expect(validateUsername(v)).toBeTypeOf('string');
  });
});

describe('validateFullName', () => {
  it('accepts 1 to 200 characters after trimming', () => {
    expect(validateFullName(' A ')).toBeUndefined();
    expect(validateFullName('a'.repeat(200))).toBeUndefined();
  });

  it('rejects a blank or too long name', () => {
    expect(validateFullName('   ')).toBeTypeOf('string');
    expect(validateFullName('a'.repeat(201))).toBeTypeOf('string');
  });
});

describe('validateEmail', () => {
  it.each(['a@b.co', ' user@example.com '])('accepts %j', (v) => {
    expect(validateEmail(v)).toBeUndefined();
  });

  it.each(['', 'a', 'a@b', '@b.co', 'a b@c.de'])('rejects %j', (v) => {
    expect(validateEmail(v)).toBeTypeOf('string');
  });
});

describe('validatePassword', () => {
  it('accepts 12 to 128 characters', () => {
    expect(validatePassword('a'.repeat(12))).toBeUndefined();
    expect(validatePassword('a'.repeat(128))).toBeUndefined();
  });

  it('rejects shorter or longer passwords', () => {
    expect(validatePassword('a'.repeat(11))).toBeTypeOf('string');
    expect(validatePassword('a'.repeat(129))).toBeTypeOf('string');
  });
});

describe('validatePrompt', () => {
  it('rejects a blank prompt', () => {
    expect(validatePrompt(' \n ')).toBeTypeOf('string');
  });

  it('allows the maximum length and counts characters, not UTF-16 units', () => {
    expect(validatePrompt('😀'.repeat(PROMPT_MAX_LENGTH))).toBeUndefined();
    expect(validatePrompt('a'.repeat(PROMPT_MAX_LENGTH + 1))).toBeTypeOf('string');
    expect(characterCount('😀a')).toBe(2);
  });
});

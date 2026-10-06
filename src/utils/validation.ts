// Early feedback in forms, mirroring the backend's input rules. The backend
// decides; these only save a round trip for obvious mistakes. Lengths count
// characters (code points), as the backend does.

export const PROMPT_MAX_LENGTH = 4000;

const length = (value: string) => Array.from(value).length;

const USERNAME = /^[a-z0-9][a-z0-9._-]*[a-z0-9]$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Usernames are case-insensitive; the backend stores them lowercased. */
export function validateUsername(value: string): string | undefined {
  const username = value.trim().toLowerCase();
  if (length(username) < 3 || length(username) > 50 || !USERNAME.test(username)) {
    return 'Use 3 to 50 characters: letters, digits, dots, underscores or hyphens, starting and ending with a letter or digit.';
  }
  return undefined;
}

export function validateFullName(value: string): string | undefined {
  const name = value.trim();
  if (name === '') {
    return 'Enter a name.';
  }
  if (length(name) > 200) {
    return 'Use at most 200 characters.';
  }
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  return EMAIL.test(value.trim()) ? undefined : 'Enter a valid email address.';
}

export function validatePassword(value: string): string | undefined {
  if (length(value) < 12 || length(value) > 128) {
    return 'Use 12 to 128 characters.';
  }
  return undefined;
}

export function validatePrompt(value: string): string | undefined {
  if (value.trim() === '') {
    return 'Enter a prompt.';
  }
  if (length(value) > PROMPT_MAX_LENGTH) {
    return `Use at most ${String(PROMPT_MAX_LENGTH)} characters.`;
  }
  return undefined;
}

/** Number of characters as the backend counts them. */
export const characterCount = length;

import { createApiClient } from './client';
import { getRuntimeConfig } from '@/config/runtime-config';
import { tokenStorage } from '@/lib/token-storage';

let unauthorizedHandler: () => void = () => undefined;

/**
 * Registers what happens when the backend rejects the token (the session
 * provider ends the session). Returns a function that removes the handler.
 */
export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
  return () => {
    unauthorizedHandler = () => undefined;
  };
}

let forbiddenHandler: () => void = () => undefined;

/**
 * Registers what happens when a request is refused for a missing permission
 * (the session provider reloads the permissions). Returns a function that
 * removes the handler.
 */
export function setForbiddenHandler(handler: () => void) {
  forbiddenHandler = handler;
  return () => {
    forbiddenHandler = () => undefined;
  };
}

/** The client every backend call in the app uses. */
export const api = createApiClient({
  baseUrl: () => getRuntimeConfig().backendUrl,
  getToken: () => tokenStorage.getToken(),
  onUnauthorized: () => {
    unauthorizedHandler();
  },
  onForbidden: () => {
    forbiddenHandler();
  },
});

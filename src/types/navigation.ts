/** Router state passed to the login page when a signed-out user opens a protected page. */
export interface LoginLocationState {
  /** The page to return to after signing in (path, query and hash). */
  from?: string;
}

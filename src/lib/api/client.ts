import { ApiError, NetworkError, apiErrorFromResponse } from './errors';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  /** Sent as a JSON body. */
  json?: unknown;
  /** Sent as application/x-www-form-urlencoded (only the login uses this). */
  form?: Record<string, string>;
  signal?: AbortSignal;
  /** Send the bearer token (default). The login request sets this to false. */
  auth?: boolean;
}

export interface ApiClientOptions {
  /** The backend origin; read on every request. */
  baseUrl: () => string;
  getToken: () => string | null;
  /** Called when a request that carried a token is answered with 401. */
  onUnauthorized: () => void;
  fetch?: typeof fetch;
}

export type ApiClient = ReturnType<typeof createApiClient>;

function isAbort(error: unknown, signal: AbortSignal | undefined): boolean {
  return signal?.aborted === true || (error instanceof Error && error.name === 'AbortError');
}

export function createApiClient(options: ApiClientOptions) {
  const fetchImpl = options.fetch ?? ((input, init) => globalThis.fetch(input, init));

  // The response type is the caller's statement of the contract (see types.ts);
  // the body is not validated at run time.
  async function request<T>(method: HttpMethod, path: string, init: RequestOptions = {}) {
    const { query, json, form, signal, auth = true } = init;

    const url = new URL(path, options.baseUrl());
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const headers = new Headers({ Accept: 'application/json' });
    let body: string | undefined;
    if (json !== undefined) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(json);
    } else if (form) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded');
      body = new URLSearchParams(form).toString();
    }
    const token = auth ? options.getToken() : null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let response: Response;
    try {
      response = await fetchImpl(url, { method, headers, body, signal });
    } catch (error) {
      if (isAbort(error, signal)) {
        throw error;
      }
      throw new NetworkError(error);
    }

    if (!response.ok) {
      const error: ApiError = await apiErrorFromResponse(response);
      if (response.status === 401 && token) {
        options.onUnauthorized();
      }
      throw error;
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  return {
    request,
    get: <T>(path: string, init?: Omit<RequestOptions, 'json' | 'form'>) =>
      request<T>('GET', path, init),
    post: <T>(path: string, init?: RequestOptions) => request<T>('POST', path, init),
    put: <T>(path: string, init?: RequestOptions) => request<T>('PUT', path, init),
    patch: <T>(path: string, init?: RequestOptions) => request<T>('PATCH', path, init),
  };
}

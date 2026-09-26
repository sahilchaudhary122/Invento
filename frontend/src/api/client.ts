/**
 * Invento API Client
 * Base fetch wrapper for all backend calls.
 * Exposes typed errors so UI can show honest "backend not connected" states.
 * Automatically injects JWT Bearer token and clears on 401.
 */

import { getToken, removeToken } from '../utils/token';

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8000/api/v1';

// ─── Error Types ──────────────────────────────────────────────────────────────

export class ApiNotAvailableError extends Error {
  constructor() {
    super(
      'Backend API is not available. Ensure the server is running at ' + BASE_URL
    );
    this.name = 'ApiNotAvailableError';
  }
}

export class ApiResponseError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string
  ) {
    super(detail);
    this.name = 'ApiResponseError';
  }
}

// ─── Core Request ─────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  const reqHeaders: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };

  // Default to application/json if Content-Type is not explicitly provided
  // and body is not URLSearchParams
  if (!reqHeaders['Content-Type'] && !(options?.body instanceof URLSearchParams)) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  // Automatically attach Bearer token if available
  const token = getToken();
  if (token && !reqHeaders['Authorization']) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: reqHeaders,
    });
  } catch {
    throw new ApiNotAvailableError();
  }

  if (!response.ok) {
    // Clear stored token if unauthenticated or session expired
    if (response.status === 401) {
      removeToken();
    }

    let detail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      // ignore parse error
    }
    throw new ApiResponseError(response.status, detail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

// ─── Exported API Methods ─────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  /**
   * Specifically for OAuth2 and form URL-encoded endpoints (e.g., login)
   */
  postForm: <T>(path: string, params: URLSearchParams, options?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: params.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options?.headers,
      },
      ...options,
    }),

  put: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),

  patch: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: 'DELETE', ...options }),
};

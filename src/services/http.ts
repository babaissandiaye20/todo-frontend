// Generic HTTP client used by all services.
// Reads the API base URL from env so the frontend works both in dev (localhost:4000)
// and inside Docker (where it should call http://backend:4000 from server components).

// En prod, si NEXT_PUBLIC_API_URL n'est pas defini, le navigateur appelle l'API
// sur le MEME domaine via /api (Nginx sur le Front route /api vers le Back).
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:4000');
const INTERNAL_API_URL = process.env.API_URL_INTERNAL ?? PUBLIC_API_URL;

// Server components run inside the container -> use the internal Docker network hostname.
// Client components run in the browser -> use the public URL the user can reach.
const baseUrl = typeof window === 'undefined' ? INTERNAL_API_URL : PUBLIC_API_URL;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.replace(/^\//, ''), baseUrl + '/');
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body,
    signal: options.signal,
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new HttpError(response.status, errorBody, `HTTP ${response.status} on ${method} ${path}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, { body }),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

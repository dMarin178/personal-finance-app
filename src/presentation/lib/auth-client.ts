const UNAUTHORIZED_ERROR = 'UNAUTHORIZED';

function clearAuthStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      clearAuthStorage();
      return null;
    }

    const data = await response.json();
    if (!data.accessToken) {
      clearAuthStorage();
      return null;
    }

    localStorage.setItem('accessToken', data.accessToken);

    return data.accessToken as string;
  } catch {
    clearAuthStorage();
    return null;
  }
}

function withAuthorizationHeader(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers || undefined);
  headers.set('Authorization', `Bearer ${token}`);

  return {
    ...init,
    headers,
  };
}

export async function authorizedFetch(input: string, init?: RequestInit): Promise<Response> {
  let accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    accessToken = await refreshAccessToken();
  }

  if (!accessToken) {
    throw new Error(UNAUTHORIZED_ERROR);
  }

  let response = await fetch(input, withAuthorizationHeader(init, accessToken));

  if (response.status !== 401) {
    return response;
  }

  accessToken = await refreshAccessToken();

  if (!accessToken) {
    throw new Error(UNAUTHORIZED_ERROR);
  }

  response = await fetch(input, withAuthorizationHeader(init, accessToken));
  return response;
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof Error && error.message === UNAUTHORIZED_ERROR;
}

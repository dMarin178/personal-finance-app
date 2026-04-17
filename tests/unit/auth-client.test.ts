import { describe, expect, it, beforeEach, vi } from 'vitest';
import { authorizedFetch, isUnauthorizedError } from '@presentation/lib/auth-client';

describe('auth-client authorizedFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('retries with refreshed token after a 401 response', async () => {
    localStorage.setItem('accessToken', 'expired-token');

    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ accessToken: 'new-access' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const response = await authorizedFetch('/api/expenses', {
      method: 'POST',
      body: JSON.stringify({ amount: 10 }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.ok).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('new-access');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('throws unauthorized error when refresh fails', async () => {
    localStorage.setItem('accessToken', 'expired-token');

    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Invalid or expired refresh token' }), { status: 401 }));

    let thrown: unknown;

    try {
      await authorizedFetch('/api/expenses');
    } catch (error) {
      thrown = error;
    }

    expect(isUnauthorizedError(thrown)).toBe(true);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});

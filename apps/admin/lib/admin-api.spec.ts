import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { adminFetch } from './admin-api';

describe('adminFetch', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        pathname: '/products',
      },
      writable: true,
    });
  });

  it('calls /api on the current origin and includes credentials', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await adminFetch('/categories');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/categories'),
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('sets JSON content type for non-FormData requests', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await adminFetch('/products', { method: 'POST', body: JSON.stringify({ name: 'test' }) });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('does not set JSON content type for FormData', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const fd = new FormData();
    await adminFetch('/upload', { method: 'POST', body: fd });
    const call = mockFetch.mock.calls[0][1] as RequestInit;
    const headers = call.headers as Record<string, string> | undefined;
    expect(headers?.['Content-Type']).toBeUndefined();
  });
});

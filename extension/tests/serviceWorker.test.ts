import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });
it('does not advance sync state when a backend HTTP request fails', async () => {
  const set = vi.fn();
  vi.stubGlobal('chrome', { runtime: { onInstalled: { addListener: vi.fn() }, onMessage: { addListener: vi.fn() } }, storage: { local: { set } } });
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response('{"error":"Unavailable"}', { status: 503 })));
  const { syncBackendData } = await import('../src/background/serviceWorker.js');
  expect((await syncBackendData()).success).toBe(false);
  expect(set).not.toHaveBeenCalled();
});

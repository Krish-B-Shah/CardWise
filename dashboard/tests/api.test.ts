import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../src/api.js';

afterEach(() => vi.unstubAllGlobals());
describe('Dashboard response handling', () => {
  it('rejects HTTP errors instead of treating mutations as success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response(JSON.stringify({ error: 'Invalid card' }), { status: 400 })));
    await expect(api.createCard({})).rejects.toThrow('Invalid card');
    await expect(api.deleteCard('missing')).rejects.toThrow('Invalid card');
  });
  it('rejects non-JSON error pages', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Unavailable</html>', { status: 502 })));
    await expect(api.getCards()).rejects.toThrow('unreadable');
  });
  it('rejects malformed successful recommendations before rendering', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ bestCard: {}, alternatives: [], merchant: {} }))));
    await expect(api.getRecommendation('amazon.com', 100)).rejects.toThrow('invalid recommendation');
  });
  it('rejects malformed lists and analytics before rendering', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response(JSON.stringify({ summary: {} }))));
    await expect(api.getCards()).rejects.toThrow('invalid data');
    await expect(api.getAnalytics()).rejects.toThrow('invalid data');
  });
  it('reports network failures with an actionable error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api.getAnalytics()).rejects.toThrow('Start the backend');
  });
});

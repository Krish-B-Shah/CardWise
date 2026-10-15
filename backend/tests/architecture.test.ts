import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { DbClient, getDb } from '../src/db/index.js';
import { createCardSchema } from '../src/contracts.js';
import { createCardWithDefaultRule } from '../src/services/cardService.js';

describe('API boundaries and database guarantees', () => {
  let db: DbClient;
  beforeAll(async () => { db = await getDb(); });
  afterEach(() => vi.restoreAllMocks());
  const input = { name: 'Atomicity test fixture', bank: 'Test', network: 'Visa', last_four: '0000' };

  it('rolls back the card when its dependent reward insert fails', async () => {
    const id = 'atomic-failure-fixture';
    const ruleId = `rule-${id}-gen`;
    await db.query("INSERT INTO reward_rules (id,card_id,category,reward_rate) VALUES ($1,'card-prime-visa','general',0.01)", [ruleId]);
    try {
      await expect(createCardWithDefaultRule(db, createCardSchema.parse(input), id)).rejects.toMatchObject({ code: '23505' });
      expect((await db.query('SELECT id FROM cards WHERE id = $1', [id])).rows).toHaveLength(0);
    } finally { await db.query('DELETE FROM reward_rules WHERE id = $1', [ruleId]); }
  });

  it('creates exactly one card and its explicit demo rule in one operation', async () => {
    const card = await createCardWithDefaultRule(db, createCardSchema.parse(input), 'atomic-success-fixture');
    try {
      expect(card.id).toBe('atomic-success-fixture');
      const rules = (await db.query('SELECT * FROM reward_rules WHERE card_id = $1', [card.id])).rows;
      expect(rules).toHaveLength(1);
      expect(Number(rules[0].reward_rate)).toBe(0.015);
      expect(rules[0].description).toContain('not issuer terms');
    } finally { await db.query('DELETE FROM cards WHERE id = $1', [card.id]); }
  });

  it('returns a field-level contract error and a server-issued request ID', async () => {
    const response = await request(app).post('/api/cards').set('X-Request-ID', 'untrusted-client-value').send({ ...input, last_four: 'abcd' });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.fields).toContainEqual(expect.objectContaining({ path: 'last_four' }));
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
    expect(response.body.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('rejects unsupported categories, negative caps, and unexpected request fields', async () => {
    for (const payload of [{ domain: 'amazon.com', amount: 10, category: 'unsupported' }, { domain: 'amazon.com', amount: 10, cvv: 'test' }, { domain: 'not a domain', amount: 10 }]) {
      expect((await request(app).post('/api/recommend').send(payload)).status).toBe(400);
    }
    const response = await request(app).post('/api/rewards').send({ card_id: 'card-prime-visa', category: 'general', reward_rate: 0.01, cap_amount: -1 });
    expect(response.status).toBe(400);
  });

  it('uses the same JSON error envelope for malformed JSON and missing routes', async () => {
    const malformed = await request(app).post('/api/cards').set('Content-Type', 'application/json').send('{broken');
    expect(malformed.status).toBe(400);
    expect(malformed.body.code).toBe('INVALID_JSON');
    const missing = await request(app).get('/api/nonexistent');
    expect(missing.status).toBe(404);
    expect(missing.body.code).toBe('NOT_FOUND');
    expect(missing.body.requestId).toBe(missing.headers['x-request-id']);
  });

  it('does not claim that a nonexistent card or rule was deleted', async () => {
    for (const resource of ['cards', 'rewards']) {
      const response = await request(app).delete(`/api/${resource}/missing-fixture`);
      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    }
  });

  it('redacts internal errors while preserving a correlation ID', async () => {
    vi.spyOn(db, 'query').mockRejectedValueOnce(new Error('SQL secret: database-password SELECT private_data'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await request(app).get('/api/cards');
    expect(response.status).toBe(500);
    expect(response.body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(response.body)).not.toContain('database-password');
    expect(log).toHaveBeenCalledWith(JSON.stringify({ event: 'api_error', requestId: response.body.requestId, code: 'INTERNAL_ERROR' }));
  });

  it('checks database readiness and returns 503 when it cannot query', async () => {
    const healthy = await request(app).get('/api/health');
    expect(healthy.status).toBe(200);
    expect(healthy.body).toMatchObject({ status: 'ready', database: 'reachable' });
    vi.spyOn(db, 'query').mockRejectedValueOnce(new Error('Unavailable'));
    const unavailable = await request(app).get('/api/health');
    expect(unavailable.status).toBe(503);
    expect(unavailable.body.code).toBe('NOT_READY');
  });

  it('creates the indexes used by portfolio and chronological queries', async () => {
    const indexes = await db.query("SELECT indexname FROM pg_indexes WHERE indexname IN ('cards_user_active_idx','reward_rules_card_idx','transactions_user_date_idx','recommendation_logs_timestamp_idx')");
    expect(indexes.rows).toHaveLength(4);
  });
});

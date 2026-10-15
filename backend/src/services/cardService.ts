import { randomUUID } from 'node:crypto';
import { CreateCardInput } from '../contracts.js';
import { DbClient } from '../db/index.js';

export async function createCardWithDefaultRule(db: DbClient, input: CreateCardInput, id = `card-${randomUUID()}`) {
  // One PostgreSQL statement provides atomicity on both pg.Pool and PGlite.
  // A failure in either insert rolls back the whole statement, without relying
  // on BEGIN/COMMIT across potentially different pooled connections.
  const result = await db.query(`
    WITH inserted_card AS (
      INSERT INTO cards (id, user_id, name, bank, network, color_gradient, last_four, annual_fee, credit_limit, notes)
      VALUES ($1, 'demo-user-1', $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    ), inserted_rule AS (
      INSERT INTO reward_rules (id, card_id, category, reward_rate, description)
      SELECT $10, id, 'general', 0.015, '1.5% configured demo base rate (not issuer terms)' FROM inserted_card
      RETURNING id
    ) SELECT inserted_card.* FROM inserted_card CROSS JOIN inserted_rule`,
  [id, input.name, input.bank, input.network, input.color_gradient, input.last_four, input.annual_fee, input.credit_limit, input.notes || '', `rule-${id}-gen`]);
  return result.rows[0];
}

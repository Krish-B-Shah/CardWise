import { z } from 'zod';

export const categorySchema = z.enum(['online_shopping', 'electronics', 'dining', 'groceries', 'travel', 'gas', 'retail', 'drugstores', 'general']);
const money = z.number().finite().min(0).max(99999999.99);
export const domainSchema = z.string().trim().min(1).max(256).refine(value => {
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}, 'Provide a valid merchant domain or HTTP(S) URL');

export const createCardSchema = z.object({
  name: z.string().trim().min(1).max(128),
  bank: z.string().trim().min(1).max(64),
  network: z.enum(['Visa', 'Mastercard', 'Amex', 'Discover']),
  color_gradient: z.string().min(1).max(128).default('#14283F'),
  last_four: z.string().regex(/^\d{4}$/, 'Use exactly four digits'),
  annual_fee: money.default(0),
  credit_limit: money.positive().default(5000),
  notes: z.string().max(2000).optional()
}).strict();

export const rewardRuleSchema = z.object({
  card_id: z.string().min(1).max(64), category: categorySchema,
  reward_rate: z.number().finite().min(0.001).max(1),
  cap_amount: money.nullable().optional(), description: z.string().max(2000).optional()
}).strict();

export const recommendSchema = z.object({ domain: domainSchema, category: categorySchema.optional(), amount: money }).strict();
export const transactionSchema = z.object({
  merchant_name: z.string().trim().min(1).max(128),
  merchant_domain: domainSchema.optional().or(z.literal('')),
  category: categorySchema, amount: money.positive(), card_used_id: z.string().min(1).max(64)
}).strict();
export type CreateCardInput = z.infer<typeof createCardSchema>;

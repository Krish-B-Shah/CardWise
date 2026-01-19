import { describe, it, expect } from 'vitest';
import { validateExtensionMessage } from '../src/shared/messages.js';

describe('Extension Message Validation Unit Tests', () => {
  it('validates legitimate GET_RECOMMENDATION message', () => {
    const valid = {
      type: 'GET_RECOMMENDATION',
      payload: {
        domain: 'amazon.com',
        category: 'online_shopping',
        amount: 149.99
      }
    };
    expect(validateExtensionMessage(valid)).toBe(true);
  });

  it('rejects GET_RECOMMENDATION with negative amount', () => {
    const invalid = {
      type: 'GET_RECOMMENDATION',
      payload: {
        domain: 'amazon.com',
        amount: -50.00
      }
    };
    expect(validateExtensionMessage(invalid)).toBe(false);
  });

  it('rejects GET_RECOMMENDATION with empty domain', () => {
    const invalid = {
      type: 'GET_RECOMMENDATION',
      payload: {
        domain: '   ',
        amount: 100.00
      }
    };
    expect(validateExtensionMessage(invalid)).toBe(false);
  });

  it('validates GET_CARDS and SYNC_DATA messages', () => {
    expect(validateExtensionMessage({ type: 'GET_CARDS' })).toBe(true);
    expect(validateExtensionMessage({ type: 'SYNC_DATA' })).toBe(true);
  });

  it('rejects arbitrary or unknown messages', () => {
    expect(validateExtensionMessage(null)).toBe(false);
    expect(validateExtensionMessage('string_msg')).toBe(false);
    expect(validateExtensionMessage({ type: 'UNKNOWN_INJECTION', payload: {} })).toBe(false);
    expect(validateExtensionMessage({ type: 'GET_RECOMMENDATION', payload: null })).toBe(false);
  });
});

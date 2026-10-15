import { Card, RecommendationResult } from './types.js';

export type ExtensionMessageType =
  | 'GET_RECOMMENDATION'
  | 'RECOMMENDATION_RESPONSE'
  | 'GET_CARDS'
  | 'CARDS_RESPONSE'
  | 'SYNC_DATA'
  | 'SYNC_RESPONSE'
  | 'GET_STATUS'
  | 'STATUS_RESPONSE'
  | 'DISMISS_PANEL'
  | 'OPEN_POPUP';

export interface GetRecommendationMessage {
  type: 'GET_RECOMMENDATION';
  payload: {
    domain: string;
    category?: string;
    amount: number;
  };
}

export interface RecommendationResponseMessage {
  type: 'RECOMMENDATION_RESPONSE';
  success: boolean;
  payload?: RecommendationResult;
  error?: string;
}

export interface GetCardsMessage {
  type: 'GET_CARDS';
}

export interface CardsResponseMessage {
  type: 'CARDS_RESPONSE';
  success: boolean;
  payload?: Card[];
  cached?: boolean;
  error?: string;
}

export interface SyncDataMessage {
  type: 'SYNC_DATA';
}

export interface SyncResponseMessage {
  type: 'SYNC_RESPONSE';
  success: boolean;
  timestamp: number;
}

export interface DismissPanelMessage {
  type: 'DISMISS_PANEL';
  domain: string;
}

export interface OpenPopupMessage {
  type: 'OPEN_POPUP';
}

export type ExtensionMessage =
  | GetRecommendationMessage
  | RecommendationResponseMessage
  | GetCardsMessage
  | CardsResponseMessage
  | SyncDataMessage
  | SyncResponseMessage
  | DismissPanelMessage
  | OpenPopupMessage;

// Runtime validator to protect against arbitrary, unvalidated, or malicious extension messages
export function validateExtensionMessage(msg: unknown): msg is ExtensionMessage {
  if (!msg || typeof msg !== 'object') {
    return false;
  }

  const m = msg as Record<string, unknown>;
  if (typeof m.type !== 'string') {
    return false;
  }

  switch (m.type) {
    case 'GET_RECOMMENDATION': {
      if (!m.payload || typeof m.payload !== 'object') return false;
      const p = m.payload as Record<string, unknown>;
      return (
        typeof p.domain === 'string' &&
        p.domain.trim().length > 0 &&
        typeof p.amount === 'number' &&
        Number.isFinite(p.amount) &&
        p.amount >= 0 &&
        (p.category === undefined || typeof p.category === 'string')
      );
    }
    case 'RECOMMENDATION_RESPONSE':
      return typeof m.success === 'boolean';
    case 'GET_CARDS':
    case 'SYNC_DATA':
    case 'OPEN_POPUP':
      return true;
    case 'CARDS_RESPONSE':
    case 'SYNC_RESPONSE':
      return typeof m.success === 'boolean';
    case 'DISMISS_PANEL':
      return typeof m.domain === 'string';
    default:
      return false;
  }
}

import {
  ExtensionMessage,
  validateExtensionMessage,
  RecommendationResponseMessage,
  CardsResponseMessage,
  SyncResponseMessage
} from '../shared/messages.js';

import { backendRequest } from '../shared/backend.js';

// Cache configuration
const CACHE_KEYS = {
  CARDS: 'cardwise_cards_cache',
  MERCHANTS: 'cardwise_merchants_cache',
  LAST_SYNC: 'cardwise_last_sync'
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('[CardWise SW] Service worker installed.');
  syncBackendData();
});

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse: (response: any) => void) => {
  // 1. Strict validation of all messages
  if (!validateExtensionMessage(message)) {
    console.warn('[CardWise SW] Received invalid extension message:', message);
    sendResponse({ success: false, error: 'Invalid message structure' });
    return false;
  }

  const typedMsg = message as ExtensionMessage;

  switch (typedMsg.type) {
    case 'GET_RECOMMENDATION': {
      handleGetRecommendation(typedMsg.payload)
        .then(res => sendResponse(res))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // Keep channel open for async response
    }

    case 'GET_CARDS': {
      handleGetCards()
        .then(res => sendResponse(res))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'SYNC_DATA': {
      syncBackendData()
        .then(res => sendResponse(res))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;
    }

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
      return false;
  }
});

async function handleGetRecommendation(payload: {
  domain: string;
  category?: string;
  amount: number;
}): Promise<RecommendationResponseMessage> {
  try {
    const data = await backendRequest('recommend', { domain: payload.domain, category: payload.category, amount: payload.amount });
    return {
      type: 'RECOMMENDATION_RESPONSE',
      success: true,
      payload: data
    };
  } catch (err: any) {
    console.warn('[CardWise SW] Failed to fetch live recommendation:', err);
    return {
      type: 'RECOMMENDATION_RESPONSE',
      success: false,
      error: err.message
    };
  }
}

async function handleGetCards(): Promise<CardsResponseMessage> {
  try {
    const cards = await backendRequest('cards');
    await chrome.storage.local.set({ [CACHE_KEYS.CARDS]: cards });

    return {
      type: 'CARDS_RESPONSE',
      success: true,
      payload: cards
    };
  } catch (err: any) {
    // Try returning cached cards if network fails
    const cached = await chrome.storage.local.get(CACHE_KEYS.CARDS);
    if (cached && cached[CACHE_KEYS.CARDS]) {
      return {
        type: 'CARDS_RESPONSE',
        success: true,
        payload: cached[CACHE_KEYS.CARDS],
        cached: true
      };
    }

    return {
      type: 'CARDS_RESPONSE',
      success: false,
      error: err.message
    };
  }
}

export async function syncBackendData(): Promise<SyncResponseMessage> {
  try {
    console.log('[CardWise SW] Syncing cards and merchants from shared backend...');
    const [cards, merchants] = await Promise.all([backendRequest('cards'), backendRequest('merchants')]);
    await chrome.storage.local.set({ [CACHE_KEYS.CARDS]: cards, [CACHE_KEYS.MERCHANTS]: merchants });
    const now = Date.now();
    await chrome.storage.local.set({ [CACHE_KEYS.LAST_SYNC]: now });
    console.log('[CardWise SW] Sync successful.');

    return {
      type: 'SYNC_RESPONSE',
      success: true,
      timestamp: now
    };
  } catch (err) {
    console.error('[CardWise SW] Background sync error:', err);
    return {
      type: 'SYNC_RESPONSE',
      success: false,
      timestamp: Date.now()
    };
  }
}

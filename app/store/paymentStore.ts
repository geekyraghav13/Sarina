import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { checkPremiumStatus } from '../services/revenueCatService';

const SUBSCRIPTION_KEY = '@subscription_status';
const MESSAGE_LIMIT_KEY = '@message_limit_tracker';
const MAX_MESSAGES_PER_DAY = 50;

interface MessageLimitTracker {
  count: number;
  resetTime: number; // Unix timestamp when count resets (24 hours from first message)
}

interface PaymentStore {
  isPremium: boolean;
  freeMessagesCount: number;
  subscriptionType: 'weekly' | 'yearly' | null;
  expirationDate: string | null;
  messageLimitTracker: MessageLimitTracker;
  setIsPremium: (status: boolean) => Promise<void>;
  setSubscriptionType: (type: 'weekly' | 'yearly' | null) => void;
  setExpirationDate: (date: string | null) => void;
  incrementFreeMessages: () => void;
  hasUsedFreeMessage: () => boolean;
  canSendMessage: () => boolean;
  incrementMessageCount: () => Promise<void>;
  getRemainingMessages: () => number;
  loadSubscriptionStatus: () => Promise<void>;
  saveSubscriptionStatus: () => Promise<void>;
  syncWithRevenueCat: () => Promise<void>;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  isPremium: false,
  freeMessagesCount: 0,
  subscriptionType: null,
  expirationDate: null,
  messageLimitTracker: {
    count: 0,
    resetTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  },

  setIsPremium: async (status: boolean) => {
    set({ isPremium: status });
    await get().saveSubscriptionStatus();
  },

  setSubscriptionType: (type: 'weekly' | 'yearly' | null) => {
    set({ subscriptionType: type });
    get().saveSubscriptionStatus();
  },

  setExpirationDate: (date: string | null) => {
    set({ expirationDate: date });
    get().saveSubscriptionStatus();
  },

  incrementFreeMessages: () => {
    set((state) => ({ freeMessagesCount: state.freeMessagesCount + 1 }));
    get().saveSubscriptionStatus();
  },

  hasUsedFreeMessage: () => {
    return get().freeMessagesCount > 0;
  },

  canSendMessage: () => {
    const { isPremium, messageLimitTracker } = get();

    // Premium users have unlimited messages
    if (isPremium) return true;

    // Check if we need to reset the counter (24 hours passed)
    const now = Date.now();
    if (now >= messageLimitTracker.resetTime) {
      // Reset counter
      set({
        messageLimitTracker: {
          count: 0,
          resetTime: now + 24 * 60 * 60 * 1000,
        },
      });
      get().saveSubscriptionStatus();
      return true;
    }

    // Check if under limit
    return messageLimitTracker.count < MAX_MESSAGES_PER_DAY;
  },

  incrementMessageCount: async () => {
    const { isPremium, messageLimitTracker } = get();

    // Don't track for premium users
    if (isPremium) return;

    // Check if we need to reset first
    const now = Date.now();
    if (now >= messageLimitTracker.resetTime) {
      set({
        messageLimitTracker: {
          count: 1,
          resetTime: now + 24 * 60 * 60 * 1000,
        },
      });
    } else {
      set({
        messageLimitTracker: {
          ...messageLimitTracker,
          count: messageLimitTracker.count + 1,
        },
      });
    }

    await get().saveSubscriptionStatus();
  },

  getRemainingMessages: () => {
    const { isPremium, messageLimitTracker } = get();

    // Premium users have unlimited
    if (isPremium) return -1; // -1 indicates unlimited

    // Check if we need to reset
    const now = Date.now();
    if (now >= messageLimitTracker.resetTime) {
      return MAX_MESSAGES_PER_DAY;
    }

    return Math.max(0, MAX_MESSAGES_PER_DAY - messageLimitTracker.count);
  },

  loadSubscriptionStatus: async () => {
    try {
      const data = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({
          isPremium: parsed.isPremium || false,
          freeMessagesCount: parsed.freeMessagesCount || 0,
          subscriptionType: parsed.subscriptionType || null,
          expirationDate: parsed.expirationDate || null,
          messageLimitTracker: parsed.messageLimitTracker || {
            count: 0,
            resetTime: Date.now() + 24 * 60 * 60 * 1000,
          },
        });
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  },

  saveSubscriptionStatus: async () => {
    try {
      const { isPremium, freeMessagesCount, subscriptionType, expirationDate, messageLimitTracker } = get();
      await AsyncStorage.setItem(
        SUBSCRIPTION_KEY,
        JSON.stringify({ isPremium, freeMessagesCount, subscriptionType, expirationDate, messageLimitTracker })
      );
    } catch (error) {
      console.error('Failed to save subscription status:', error);
    }
  },

  syncWithRevenueCat: async () => {
    try {
      // const isPremium = await checkPremiumStatus();
      // set({ isPremium });
      get().saveSubscriptionStatus();
    } catch (error) {
      console.error('Failed to sync with RevenueCat:', error);
    }
  },
}));

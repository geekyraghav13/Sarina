import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { checkPremiumStatus } from '../services/revenueCatService';

const SUBSCRIPTION_KEY = '@subscription_status';
export const FREE_MESSAGE_LIMIT = 10;

interface PaymentStore {
  isPremium: boolean;
  freeMessagesCount: number;
  subscriptionType: 'weekly' | 'yearly' | null;
  expirationDate: string | null;
  setIsPremium: (status: boolean) => Promise<void>;
  setSubscriptionType: (type: 'weekly' | 'yearly' | null) => void;
  setExpirationDate: (date: string | null) => void;
  incrementFreeMessages: () => Promise<void>;
  hasUsedFreeMessage: () => boolean;
  canSendMessage: () => boolean;
  hasReachedFreeLimit: () => boolean;
  getRemainingMessages: () => number;
  loadSubscriptionStatus: () => Promise<void>;
  saveSubscriptionStatus: () => Promise<void>;
  syncWithRevenueCat: () => Promise<void>;
  resetStore: () => void;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  isPremium: false,
  freeMessagesCount: 0,
  subscriptionType: null,
  expirationDate: null,

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

  incrementFreeMessages: async () => {
    if (get().isPremium) return;
    set((state) => ({ freeMessagesCount: state.freeMessagesCount + 1 }));
    await get().saveSubscriptionStatus();
  },

  hasUsedFreeMessage: () => {
    return get().freeMessagesCount > 0;
  },

  canSendMessage: () => {
    const { isPremium, freeMessagesCount } = get();
    if (isPremium) return true;
    return freeMessagesCount < FREE_MESSAGE_LIMIT;
  },

  hasReachedFreeLimit: () => {
    const { isPremium, freeMessagesCount } = get();
    return !isPremium && freeMessagesCount >= FREE_MESSAGE_LIMIT;
  },

  getRemainingMessages: () => {
    const { isPremium, freeMessagesCount } = get();
    if (isPremium) return -1; // -1 indicates unlimited
    return Math.max(0, FREE_MESSAGE_LIMIT - freeMessagesCount);
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
        });
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  },

  saveSubscriptionStatus: async () => {
    try {
      const { isPremium, freeMessagesCount, subscriptionType, expirationDate } = get();
      await AsyncStorage.setItem(
        SUBSCRIPTION_KEY,
        JSON.stringify({ isPremium, freeMessagesCount, subscriptionType, expirationDate })
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

  resetStore: () => {
    set({ isPremium: false, freeMessagesCount: 0, subscriptionType: null, expirationDate: null });
    console.log('🔄 PaymentStore reset to initial state');
  },
}));

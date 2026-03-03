import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { checkPremiumStatus } from '../services/revenueCatService';

const SUBSCRIPTION_KEY = '@subscription_status';

interface PaymentStore {
  isPremium: boolean;
  freeMessagesCount: number;
  subscriptionType: 'weekly' | 'yearly' | null;
  expirationDate: string | null;
  setIsPremium: (status: boolean) => Promise<void>;
  setSubscriptionType: (type: 'weekly' | 'yearly' | null) => void;
  setExpirationDate: (date: string | null) => void;
  incrementFreeMessages: () => void;
  hasUsedFreeMessage: () => boolean;
  loadSubscriptionStatus: () => Promise<void>;
  saveSubscriptionStatus: () => Promise<void>;
  syncWithRevenueCat: () => Promise<void>;
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

  incrementFreeMessages: () => {
    set((state) => ({ freeMessagesCount: state.freeMessagesCount + 1 }));
    get().saveSubscriptionStatus();
  },

  hasUsedFreeMessage: () => {
    return get().freeMessagesCount > 0;
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
}));

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_KEY = '@subscription_status';

interface PaymentStore {
  isPremium: boolean;
  freeMessagesCount: number;
  setIsPremium: (status: boolean) => void;
  incrementFreeMessages: () => void;
  hasUsedFreeMessage: () => boolean;
  loadSubscriptionStatus: () => Promise<void>;
  saveSubscriptionStatus: () => Promise<void>;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  isPremium: false,
  freeMessagesCount: 0,

  setIsPremium: (status: boolean) => {
    set({ isPremium: status });
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
        });
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  },

  saveSubscriptionStatus: async () => {
    try {
      const { isPremium, freeMessagesCount } = get();
      await AsyncStorage.setItem(
        SUBSCRIPTION_KEY,
        JSON.stringify({ isPremium, freeMessagesCount })
      );
    } catch (error) {
      console.error('Failed to save subscription status:', error);
    }
  },
}));

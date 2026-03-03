import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CallState {
  hasSeenCall: boolean;
  lastDeclinedTime: number | null;
  isPremium: boolean;
  setHasSeenCall: (seen: boolean) => void;
  setLastDeclinedTime: (time: number) => void;
  setPremium: (premium: boolean) => void;
  shouldShowCall: () => boolean;
  reset: () => void;
}

const CALL_STATE_KEY = '@call_state';

export const useCallStore = create<CallState>((set, get) => ({
  hasSeenCall: false,
  lastDeclinedTime: null,
  isPremium: false,

  setHasSeenCall: (seen) => {
    set({ hasSeenCall: seen });
    AsyncStorage.setItem(
      CALL_STATE_KEY,
      JSON.stringify({ hasSeenCall: seen })
    ).catch((error) => console.warn('Failed to save call state:', error));
  },

  setLastDeclinedTime: (time) => {
    set({ lastDeclinedTime: time });
    AsyncStorage.setItem(
      CALL_STATE_KEY,
      JSON.stringify({ ...get(), lastDeclinedTime: time })
    ).catch((error) => console.warn('Failed to save call state:', error));
  },

  setPremium: (premium) => {
    set({ isPremium: premium });
    AsyncStorage.setItem(
      CALL_STATE_KEY,
      JSON.stringify({ ...get(), isPremium: premium })
    ).catch((error) => console.warn('Failed to save call state:', error));
  },

  shouldShowCall: () => {
    const state = get();

    // If user is premium, don't show call
    if (state.isPremium) {
      return false;
    }

    // If never seen call before, show it
    if (!state.hasSeenCall) {
      return true;
    }

    // If seen before, check if 2 minutes has passed since last decline
    if (state.lastDeclinedTime) {
      const now = Date.now();
      const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
      const timeSinceDecline = now - state.lastDeclinedTime;

      return timeSinceDecline >= twoMinutes;
    }

    return false;
  },

  reset: () => {
    set({ hasSeenCall: false, lastDeclinedTime: null, isPremium: false });
    AsyncStorage.removeItem(CALL_STATE_KEY).catch((error) => console.warn('Failed to remove call state:', error));
  },
}));

// Load call state from AsyncStorage on app start
export const loadCallState = async () => {
  try {
    const stored = await AsyncStorage.getItem(CALL_STATE_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      useCallStore.setState(state);
    }
  } catch (error) {
    console.error('Error loading call state:', error);
  }
};

import { create } from 'zustand';

export interface UserProfile {
  age: number;
  tone: string[];
  personality: string[];
  interests: string[];
  appearance: string;
  mode: string;
  name: string;
}

interface UserProfileStore {
  profile: Partial<UserProfile>;
  setProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
}

export const useUserProfile = create<UserProfileStore>((set) => ({
  profile: {},
  setProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),
  resetProfile: () => set({ profile: {} }),
}));

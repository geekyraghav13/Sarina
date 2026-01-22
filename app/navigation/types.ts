export type RootStackParamList = {
  Disclaimer: undefined;
  Create: undefined;
  Age: undefined;
  Tone: undefined;
  Personality: undefined;
  Interests: undefined;
  Appearance: undefined;
  Mode: undefined;
  Name: undefined;
  Summary: undefined;
  MainTabs: undefined; // Bottom Tab Navigator (contains Home & Conversations tabs)
  Chat: { fromOnboarding?: boolean } | undefined; // Track if coming from onboarding
  ChatSettings: undefined;
  Home: undefined; // Add Home type for navigation
  Conversations: undefined; // Add Conversations type for navigation
  IncomingCall: {
    characterName: string;
    characterImageUrl?: string;
  };
  Paywall: {
    characterName: string;
    characterImageUrl?: string;
  };
  Report: undefined;
};

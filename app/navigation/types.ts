export type RootStackParamList = {
  SignIn: undefined;
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
  Chat: {
    fromOnboarding?: boolean;
    isFirstLaunch?: boolean; // NEW: First-time user flag
  } | undefined; // Track if coming from onboarding
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
    callAction?: 'pick' | 'decline'; // NEW: Why user is seeing paywall
    returnScreen?: string; // NEW: Where to go on cancel
  };
  CustomCreditsPaywall: {
    characterName?: string;
    characterImageUrl?: string;
    callAction?: 'pick' | 'decline';
    returnScreen?: string;
  };
  VoiceCall: {
    characterName: string;
    characterImageUrl?: string;
    characterId: string;
    characterProfile: any;
  };
  Report: undefined;
};

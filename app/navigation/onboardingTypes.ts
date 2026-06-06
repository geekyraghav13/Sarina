/**
 * Navigation param list for the new onboarding flow (Figma redesign).
 * Screens are added here one at a time as the flow is built out.
 */
import { Character } from '../data/characters';

export type OnboardingStackParamList = {
  Welcome: undefined;
  Disclaimer: undefined;
  Language: undefined;
  CharacterSelect: undefined;
  Interests: undefined;
  Topics: undefined;
  Name: undefined;
  Auth: undefined;
  Home: undefined;
  Discover: undefined;
  Settings: undefined;
  Chat: { character?: Character } | undefined;
  IncomingCall: { character?: Character; auto?: boolean } | undefined;
  VoiceCall: { character?: Character } | undefined;
};

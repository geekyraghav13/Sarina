/**
 * Firebase Analytics Service for React Native
 *
 * This service provides comprehensive event tracking for the complete
 * user journey from onboarding through engagement and monetization.
 *
 * Key Events Tracked:
 * 1. Onboarding Flow - Language selection through character creation
 * 2. User Engagement - Chat messages, voice calls, photo requests
 * 3. Monetization - Subscription flows and purchases
 * 4. Retention - Daily active users, feature usage patterns
 */

import { Platform } from 'react-native';

// Lazy import Firebase to handle Expo Go environment
let analytics: any = null;
let firebaseApp: any = null;
let isFirebaseAvailable = false;

// Try to import Firebase App and Analytics
// IMPORTANT: Must import @react-native-firebase/app BEFORE analytics
try {
  firebaseApp = require('@react-native-firebase/app').default;
  analytics = require('@react-native-firebase/analytics').default;
  isFirebaseAvailable = true;
  console.log('✅ Firebase modules loaded successfully');
} catch (error) {
  console.log('ℹ️ Firebase not available (running in Expo Go or web)');
  isFirebaseAvailable = false;
}

/**
 * Check if Firebase Analytics is available
 * Returns false in Expo Go, true in development/production builds
 */
const isAnalyticsAvailable = (): boolean => {
  return isFirebaseAvailable && analytics !== null;
};

/**
 * Initialize Firebase Analytics
 * Call this once when the app starts
 */
export const initializeAnalytics = async (): Promise<void> => {
  if (!isAnalyticsAvailable()) {
    console.log('ℹ️ Firebase Analytics not available (running in Expo Go)');
    return;
  }

  try {
    // Verify Firebase app is initialized
    const apps = firebaseApp.apps;
    console.log(`📱 Firebase apps initialized: ${apps.length}`);

    if (apps.length === 0) {
      console.error('❌ No Firebase app found! Firebase may not be properly configured.');
      return;
    }

    // Enable analytics collection
    await analytics().setAnalyticsCollectionEnabled(true);

    // Log that analytics has been initialized
    console.log('✅ Firebase Analytics initialized');

    // The first_open event is automatically tracked by Firebase
    // when the app is opened for the first time
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Analytics:', error);
  }
};

/**
 * Set user ID for analytics
 * Use this to track individual users across sessions
 */
export const setUserId = async (userId: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().setUserId(userId);
    console.log(`📊 Analytics User ID set: ${userId}`);
  } catch (error) {
    console.error('❌ Failed to set analytics user ID:', error);
  }
};

/**
 * Set user properties for audience segmentation
 */
export const setUserProperties = async (properties: Record<string, string>): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    for (const [key, value] of Object.entries(properties)) {
      await analytics().setUserProperty(key, value);
    }
    console.log('📊 User properties set:', properties);
  } catch (error) {
    console.error('❌ Failed to set user properties:', error);
  }
};

/**
 * Generic event logger for ad-hoc events that don't have a dedicated helper
 * (e.g. review-prompt events). Guarded + Expo-Go-safe like the rest of this file.
 */
export const logEvent = async (
  name: string,
  params?: Record<string, any>
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;
  try {
    await analytics().logEvent(name, params);
    console.log(`📊 Event: ${name}`, params || '');
  } catch (error) {
    console.error(`❌ Failed to log event ${name}:`, error);
  }
};

// ============================================================================
// CORE EVENTS
// ============================================================================

/**
 * NOTE: first_open is automatically tracked by Firebase SDK
 * when a user opens the app for the first time.
 */

// ============================================================================
// PURCHASE EVENT
// ============================================================================

export interface PurchaseItem {
  /** Item ID (e.g., 'premium_monthly') */
  item_id: string;

  /** Item name (e.g., 'Sarina Premium Monthly') */
  item_name: string;

  /** Item category (e.g., 'subscription', 'one-time') */
  item_category?: string;

  /** Quantity purchased */
  quantity?: number;

  /** Price of individual item */
  price?: number;
}

export interface PurchaseParams {
  /** Unique transaction ID from payment provider */
  transaction_id: string;

  /** Total transaction value */
  value: number;

  /** Currency code (e.g., 'USD') */
  currency: string;

  /** Array of items purchased */
  items: PurchaseItem[];

  /** Optional: Tax amount */
  tax?: number;

  /** Optional: Shipping cost */
  shipping?: number;

  /** Optional: Coupon code used */
  coupon?: string;
}

/**
 * Log purchase event
 * Call this when user completes a purchase/subscription
 *
 * @example
 * ```typescript
 * logPurchase({
 *   transaction_id: 'txn_123456789',
 *   value: 9.99,
 *   currency: 'USD',
 *   items: [{
 *     item_id: 'premium_monthly',
 *     item_name: 'Sarina Premium Monthly',
 *     item_category: 'subscription',
 *     quantity: 1,
 *     price: 9.99
 *   }]
 * });
 * ```
 */
export const logPurchase = async (params: PurchaseParams): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('purchase', {
      transaction_id: params.transaction_id,
      value: params.value,
      currency: params.currency,
      items: params.items,
      ...(params.tax !== undefined && { tax: params.tax }),
      ...(params.shipping !== undefined && { shipping: params.shipping }),
      ...(params.coupon && { coupon: params.coupon }),
    });

    console.log('📊 Purchase logged:', params);
  } catch (error) {
    console.error('❌ Failed to log purchase:', error);
  }
};

// ============================================================================
// USER JOURNEY TRACKING - COMPREHENSIVE EVENTS
// ============================================================================

/**
 * Log custom screen view
 * Call this when user navigates to a new screen
 */
export const logScreenView = async (screenName: string, screenClass?: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    console.log(`📊 Screen view logged: ${screenName}`);
  } catch (error) {
    console.error('❌ Failed to log screen view:', error);
  }
};

// ============================================================================
// ONBOARDING JOURNEY EVENTS
// ============================================================================

/**
 * Log app open event
 * Call this when user opens the app (not just first time)
 */
export const logAppOpen = async (): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('app_open', {
      timestamp: Date.now(),
    });
    console.log('📊 App open event logged');
  } catch (error) {
    console.error('❌ Failed to log app open:', error);
  }
};

/**
 * Log when user starts onboarding
 */
export const logOnboardingStart = async (): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('onboarding_start', {
      timestamp: Date.now(),
    });
    console.log('📊 Onboarding start logged');
  } catch (error) {
    console.error('❌ Failed to log onboarding start:', error);
  }
};

/**
 * Log when user selects a language
 */
export const logLanguageSelected = async (language: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('language_selected', {
      language,
      timestamp: Date.now(),
    });
    console.log(`📊 Language selected: ${language}`);
  } catch (error) {
    console.error('❌ Failed to log language selection:', error);
  }
};

/**
 * Log when user completes onboarding
 */
export const logOnboardingComplete = async (): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('onboarding_complete', {
      timestamp: Date.now(),
    });
    console.log('📊 Onboarding complete logged');
  } catch (error) {
    console.error('❌ Failed to log onboarding complete:', error);
  }
};

/**
 * Log when user starts chat session
 */
export const logChatStart = async (
  characterName: string,
  characterId?: string,
  category?: string,
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('chat_start', {
      character_name: characterName,
      ...(characterId && { character_id: characterId }),
      ...(category && { category }),
      timestamp: Date.now(),
    });
    console.log(`📊 Chat start logged: ${characterName}`);
  } catch (error) {
    console.error('❌ Failed to log chat start:', error);
  }
};

/**
 * Log when user sends a message
 */
export const logMessageSent = async (
  characterName: string,
  messageLength: number,
  characterId?: string,
  category?: string,
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('message_sent', {
      character_name: characterName,
      message_length: messageLength,
      ...(characterId && { character_id: characterId }),
      ...(category && { category }),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('❌ Failed to log message sent:', error);
  }
};

/**
 * Log a chat engagement-depth milestone (user hit 1/5/10/25/50 messages in a
 * conversation). Drives the engagement funnel + volume that screen views can't.
 */
export const logMessageMilestone = async (
  count: number,
  characterId?: string,
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;
  try {
    await analytics().logEvent('message_milestone', {
      count,
      ...(characterId && { character_id: characterId }),
      timestamp: Date.now(),
    });
    console.log('📊 Message milestone:', count);
  } catch (error) {
    console.error('❌ Failed to log message_milestone:', error);
  }
};

/**
 * Log when the user hits the free-message limit (the core monetization trigger).
 */
export const logFreeLimitReached = async (characterId?: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;
  try {
    await analytics().logEvent('free_limit_reached', {
      ...(characterId && { character_id: characterId }),
      timestamp: Date.now(),
    });
    console.log('📊 Free limit reached');
  } catch (error) {
    console.error('❌ Failed to log free_limit_reached:', error);
  }
};

/**
 * Log when a character's opening story is shown (measures the story hook).
 */
export const logStoryViewed = async (characterId?: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;
  try {
    await analytics().logEvent('story_viewed', {
      ...(characterId && { character_id: characterId }),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('❌ Failed to log story_viewed:', error);
  }
};

/**
 * Log an AI reply successfully rendered, with round-trip latency (health).
 */
export const logAiReplyReceived = async (
  characterId: string | undefined,
  latencyMs: number,
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;
  try {
    await analytics().logEvent('ai_reply_received', {
      ...(characterId && { character_id: characterId }),
      latency_ms: latencyMs,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('❌ Failed to log ai_reply_received:', error);
  }
};

/**
 * Log when the AI reply failed and a fallback line was shown (health/quality).
 */
export const logAiReplyFailed = async (
  reason: string,
  characterId?: string,
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;
  try {
    await analytics().logEvent('ai_reply_failed', {
      reason,
      ...(characterId && { character_id: characterId }),
      timestamp: Date.now(),
    });
    console.log('📊 AI reply failed:', reason);
  } catch (error) {
    console.error('❌ Failed to log ai_reply_failed:', error);
  }
};

/**
 * Log a category-filter pill selection on a character grid (content discovery).
 */
export const logCategorySelected = async (
  category: string,
  surface: 'onboarding' | 'discover',
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;
  try {
    await analytics().logEvent('category_selected', {
      category,
      surface,
      timestamp: Date.now(),
    });
    console.log('📊 Category selected:', category, surface);
  } catch (error) {
    console.error('❌ Failed to log category_selected:', error);
  }
};

/**
 * Log a tap on a character card in the Discover grid (browse → chat).
 */
export const logCharacterCardTapped = async (
  characterId: string,
  characterName: string,
  category?: string,
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;
  try {
    await analytics().logEvent('character_card_tapped', {
      character_id: characterId,
      character_name: characterName,
      ...(category && { category }),
      timestamp: Date.now(),
    });
    console.log('📊 Character card tapped:', characterName);
  } catch (error) {
    console.error('❌ Failed to log character_card_tapped:', error);
  }
};

/**
 * Log subscription cancellation
 */
export const logSubscriptionCancel = async (subscriptionType: string, reason?: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('subscription_cancel', {
      subscription_type: subscriptionType,
      ...(reason && { cancellation_reason: reason }),
      timestamp: Date.now(),
    });
    console.log('📊 Subscription cancellation logged');
  } catch (error) {
    console.error('❌ Failed to log subscription cancel:', error);
  }
};

/**
 * Log when user starts checkout (taps Continue button)
 */
export const logBeginCheckout = async (planType: string, value: number, currency: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('begin_checkout', {
      plan_type: planType,
      value: value,
      currency: currency,
      timestamp: Date.now(),
    });
    console.log('📊 Begin checkout logged:', planType);
  } catch (error) {
    console.error('❌ Failed to log begin checkout:', error);
  }
};

/**
 * Log when purchase fails
 */
export const logPurchaseFailed = async (planType: string, error: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('purchase_failed', {
      plan_type: planType,
      error_message: error,
      timestamp: Date.now(),
    });
    console.log('📊 Purchase failed logged:', planType);
  } catch (error) {
    console.error('❌ Failed to log purchase failed:', error);
  }
};

/**
 * Log when user restores purchases
 */
export const logSubscriptionRestored = async (isPremium: boolean): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('subscription_restored', {
      is_premium: isPremium,
      timestamp: Date.now(),
    });
    console.log('📊 Subscription restored logged');
  } catch (error) {
    console.error('❌ Failed to log subscription restored:', error);
  }
};

/**
 * Log when user selects a plan
 */
export const logPlanSelected = async (planType: string, value: number): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('plan_selected', {
      plan_type: planType,
      value: value,
      timestamp: Date.now(),
    });
    console.log('📊 Plan selected logged:', planType);
  } catch (error) {
    console.error('❌ Failed to log plan selected:', error);
  }
};

// ============================================================================
// COMPREHENSIVE USER JOURNEY EVENTS
// ============================================================================

/**
 * Log onboarding step completion
 */
export const logOnboardingStep = async (stepNumber: number, stepName: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('onboarding_step', {
      step_number: stepNumber,
      step_name: stepName,
      timestamp: Date.now(),
    });
    console.log(`📊 Onboarding step logged: ${stepNumber} - ${stepName}`);
  } catch (error) {
    console.error('❌ Failed to log onboarding step:', error);
  }
};

/**
 * Log personality traits selection
 */
export const logPersonalitySelected = async (traits: string[]): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('personality_selected', {
      selected_traits: traits.join(','),
      trait_count: traits.length,
      timestamp: Date.now(),
    });
    console.log('📊 Personality traits selected:', traits);
  } catch (error) {
    console.error('❌ Failed to log personality selection:', error);
  }
};

/**
 * Log interests selection
 */
export const logInterestsSelected = async (interests: string[]): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('interests_selected', {
      selected_interests: interests.join(','),
      interest_count: interests.length,
      timestamp: Date.now(),
    });
    console.log('📊 Interests selected:', interests);
  } catch (error) {
    console.error('❌ Failed to log interests selection:', error);
  }
};

// ============================================================================
// NEW ONBOARDING FLOW EVENTS (Figma flow: Welcome → … → Auth → Chat)
// These map 1:1 to the screens in app/screens/onboarding/*.
// ============================================================================

/**
 * Log character selection (new flow — CharacterSelectScreen).
 */
export const logCharacterSelected = async (
  characterId: string,
  characterName: string,
  category?: string,
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('character_selected', {
      character_id: characterId,
      character_name: characterName,
      ...(category && { category }),
      timestamp: Date.now(),
    });
    console.log('📊 Character selected:', characterName);
  } catch (error) {
    console.error('❌ Failed to log character_selected:', error);
  }
};

/**
 * Log when the user signs out (account lifecycle).
 */
export const logAccountSignedOut = async (): Promise<void> => {
  if (!isAnalyticsAvailable()) return;
  try {
    await analytics().logEvent('account_signed_out', { timestamp: Date.now() });
    console.log('📊 Account signed out');
  } catch (error) {
    console.error('❌ Failed to log account_signed_out:', error);
  }
};

/**
 * Log topic selection (new flow — TopicsScreen).
 */
export const logTopicsSelected = async (topics: string[]): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('topics_selected', {
      selected_topics: topics.join(','),
      topic_count: topics.length,
      timestamp: Date.now(),
    });
    console.log('📊 Topics selected:', topics);
  } catch (error) {
    console.error('❌ Failed to log topics_selected:', error);
  }
};

/**
 * Log name entry (new flow — NameScreen).
 */
export const logNameEntered = async (hasCustomName: boolean): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('name_entered', {
      has_custom_name: hasCustomName,
      timestamp: Date.now(),
    });
    console.log('📊 Name entered:', hasCustomName ? 'custom' : 'skipped');
  } catch (error) {
    console.error('❌ Failed to log name_entered:', error);
  }
};

/**
 * Log auth completion (new flow — AuthScreen).
 */
export const logAuthCompleted = async (
  method: 'google' | 'guest',
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('auth_completed', {
      method,
      timestamp: Date.now(),
    });
    console.log('📊 Auth completed:', method);
  } catch (error) {
    console.error('❌ Failed to log auth_completed:', error);
  }
};

/**
 * Log incoming-call screen shown (new flow — IncomingCallScreen).
 */
export const logIncomingCallShown = async (
  characterName: string,
  source: 'manual' | 'auto_after_messages' = 'manual',
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('incoming_call_shown', {
      character_name: characterName,
      source,
      timestamp: Date.now(),
    });
    console.log('📊 Incoming call shown:', characterName, source);
  } catch (error) {
    console.error('❌ Failed to log incoming_call_shown:', error);
  }
};

/**
 * Log incoming-call answered.
 */
export const logIncomingCallAnswered = async (
  characterName: string,
  isPremium: boolean,
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('incoming_call_answered', {
      character_name: characterName,
      is_premium: isPremium,
      timestamp: Date.now(),
    });
    console.log('📊 Incoming call answered:', characterName);
  } catch (error) {
    console.error('❌ Failed to log incoming_call_answered:', error);
  }
};

/**
 * Log incoming-call declined.
 */
export const logIncomingCallDeclined = async (
  characterName: string,
): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('incoming_call_declined', {
      character_name: characterName,
      timestamp: Date.now(),
    });
    console.log('📊 Incoming call declined:', characterName);
  } catch (error) {
    console.error('❌ Failed to log incoming_call_declined:', error);
  }
};

/**
 * Log appearance style selection
 */
export const logAppearanceSelected = async (style: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('appearance_selected', {
      style,
      timestamp: Date.now(),
    });
    console.log('📊 Appearance style selected:', style);
  } catch (error) {
    console.error('❌ Failed to log appearance selection:', error);
  }
};

/**
 * Log mode selection
 */
export const logModeSelected = async (mode: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('mode_selected', {
      mode,
      timestamp: Date.now(),
    });
    console.log('📊 Mode selected:', mode);
  } catch (error) {
    console.error('❌ Failed to log mode selection:', error);
  }
};

/**
 * Log tone selection
 */
export const logToneSelected = async (tones: string[]): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('tone_selected', {
      selected_tones: tones.join(','),
      tone_count: tones.length,
      timestamp: Date.now(),
    });
    console.log('📊 Tones selected:', tones);
  } catch (error) {
    console.error('❌ Failed to log tone selection:', error);
  }
};

/**
 * Log character name entered
 */
export const logCharacterNamed = async (hasCustomName: boolean): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('character_named', {
      has_custom_name: hasCustomName,
      timestamp: Date.now(),
    });
    console.log('📊 Character named:', hasCustomName ? 'custom' : 'default');
  } catch (error) {
    console.error('❌ Failed to log character naming:', error);
  }
};

/**
 * Log character creation completed
 */
export const logCharacterCreated = async (characterData: {
  personality: string[];
  interests: string[];
  appearance: string;
  mode: string;
  tones: string[];
}): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('character_created', {
      personality_count: characterData.personality.length,
      interest_count: characterData.interests.length,
      appearance: characterData.appearance,
      mode: characterData.mode,
      tone_count: characterData.tones.length,
      timestamp: Date.now(),
    });
    console.log('📊 Character created');
  } catch (error) {
    console.error('❌ Failed to log character creation:', error);
  }
};

// ============================================================================
// ENGAGEMENT EVENTS
// ============================================================================

/**
 * Log voice call started
 */
export const logVoiceCallStart = async (characterName: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('voice_call_start', {
      character_name: characterName,
      timestamp: Date.now(),
    });
    console.log('📊 Voice call started:', characterName);
  } catch (error) {
    console.error('❌ Failed to log voice call start:', error);
  }
};

/**
 * Log voice call ended
 */
export const logVoiceCallEnd = async (characterName: string, duration: number): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('voice_call_end', {
      character_name: characterName,
      duration_seconds: duration,
      timestamp: Date.now(),
    });
    console.log('📊 Voice call ended:', characterName, duration);
  } catch (error) {
    console.error('❌ Failed to log voice call end:', error);
  }
};

/**
 * Log photo request
 */
export const logPhotoRequest = async (characterName: string, prompt?: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('photo_request', {
      character_name: characterName,
      has_custom_prompt: !!prompt,
      timestamp: Date.now(),
    });
    console.log('📊 Photo requested:', characterName);
  } catch (error) {
    console.error('❌ Failed to log photo request:', error);
  }
};

/**
 * Log photo viewed
 */
export const logPhotoViewed = async (characterName: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('photo_viewed', {
      character_name: characterName,
      timestamp: Date.now(),
    });
    console.log('📊 Photo viewed:', characterName);
  } catch (error) {
    console.error('❌ Failed to log photo viewed:', error);
  }
};

/**
 * Log chat session duration
 */
export const logChatSessionEnd = async (characterName: string, duration: number, messageCount: number, characterId?: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('chat_session_end', {
      character_name: characterName,
      duration_seconds: duration,
      message_count: messageCount,
      ...(characterId && { character_id: characterId }),
      timestamp: Date.now(),
    });
    console.log('📊 Chat session ended:', characterName, duration, messageCount);
  } catch (error) {
    console.error('❌ Failed to log chat session end:', error);
  }
};

/**
 * Log paywall viewed
 */
export const logPaywallViewed = async (source: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('paywall_viewed', {
      source,
      timestamp: Date.now(),
    });
    console.log('📊 Paywall viewed from:', source);
  } catch (error) {
    console.error('❌ Failed to log paywall viewed:', error);
  }
};

/**
 * Log the voice-credit top-up paywall being shown (placement-based soft paywall).
 */
export const logTopupPaywallViewed = async (): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('topup_paywall_viewed', {
      source: 'voice_call',
      timestamp: Date.now(),
    });
    console.log('📊 Top-up paywall viewed');
  } catch (error) {
    console.error('❌ Failed to log top-up paywall viewed:', error);
  }
};

/**
 * Log a successful voice-credit top-up purchase.
 */
export const logTopupPurchased = async (seconds: number): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('topup_purchased', {
      seconds,
      timestamp: Date.now(),
    });
    console.log('📊 Top-up purchased:', seconds, 'seconds');
  } catch (error) {
    console.error('❌ Failed to log top-up purchased:', error);
  }
};

/**
 * Log paywall dismissed
 */
export const logPaywallDismissed = async (source: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('paywall_dismissed', {
      source,
      timestamp: Date.now(),
    });
    console.log('📊 Paywall dismissed from:', source);
  } catch (error) {
    console.error('❌ Failed to log paywall dismissed:', error);
  }
};

/**
 * Log credits depleted
 */
export const logCreditsDepleted = async (lastAction: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('credits_depleted', {
      last_action: lastAction,
      timestamp: Date.now(),
    });
    console.log('📊 Credits depleted after:', lastAction);
  } catch (error) {
    console.error('❌ Failed to log credits depleted:', error);
  }
};

/**
 * Log character regenerated
 */
export const logCharacterRegenerated = async (): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('character_regenerated', {
      timestamp: Date.now(),
    });
    console.log('📊 Character regenerated');
  } catch (error) {
    console.error('❌ Failed to log character regeneration:', error);
  }
};

/**
 * Enable/disable debug mode for analytics
 * Use this during development to see events in Firebase DebugView
 */
export const setAnalyticsDebugMode = async (enabled: boolean): Promise<void> => {
  try {
    // Note: For Android, you need to use adb command:
    // adb shell setprop debug.firebase.analytics.app com.sarina.app
    console.log(`📊 Analytics debug mode: ${enabled ? 'enabled' : 'disabled'}`);
    console.log('💡 For Android, also run: adb shell setprop debug.firebase.analytics.app com.sarina.app');
  } catch (error) {
    console.error('❌ Failed to set debug mode:', error);
  }
};

export default {
  // Core
  initializeAnalytics,
  setUserId,
  setUserProperties,

  // Monetization
  logPurchase,
  logBeginCheckout,
  logPurchaseFailed,
  logSubscriptionRestored,
  logSubscriptionCancel,
  logPlanSelected,

  // Onboarding Journey
  logAppOpen,
  logOnboardingStart,
  logOnboardingStep,
  logLanguageSelected,
  logCharacterSelected,
  logTopicsSelected,
  logNameEntered,
  logAuthCompleted,
  logIncomingCallShown,
  logIncomingCallAnswered,
  logIncomingCallDeclined,
  logPersonalitySelected,
  logInterestsSelected,
  logAppearanceSelected,
  logModeSelected,
  logToneSelected,
  logCharacterNamed,
  logCharacterCreated,
  logOnboardingComplete,

  // Engagement
  logScreenView,
  logChatStart,
  logMessageSent,
  logMessageMilestone,
  logFreeLimitReached,
  logStoryViewed,
  logAiReplyReceived,
  logAiReplyFailed,
  logChatSessionEnd,
  logVoiceCallStart,
  logVoiceCallEnd,
  logPhotoRequest,
  logPhotoViewed,

  // Discovery
  logCategorySelected,
  logCharacterCardTapped,

  // Paywall & Credits
  logPaywallViewed,
  logPaywallDismissed,
  logCreditsDepleted,

  // Account
  logAccountSignedOut,

  // Character Management
  logCharacterRegenerated,

  // Debug
  setAnalyticsDebugMode,
};

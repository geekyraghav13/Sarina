import analytics from '@react-native-firebase/analytics';

/**
 * Analytics Service for Firebase Analytics (React Native)
 * Provides helper functions to track user events and behavior
 * Using @react-native-firebase/analytics for native support
 */

// Custom event names
export const AnalyticsEvents = {
  // Onboarding Events
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_STEP_VIEWED: 'onboarding_step_viewed',

  // Character Selection Events
  CHARACTER_VIEWED: 'character_viewed',
  CHARACTER_SELECTED: 'character_selected',
  HOME_SCREEN_VIEWED: 'home_screen_viewed',

  // Chat Events
  CHAT_STARTED: 'chat_started',
  MESSAGE_SENT: 'message_sent',
  CHAT_SESSION_DURATION: 'chat_session_duration',

  // Navigation Events
  SCREEN_VIEW: 'screen_view',
  TAB_CHANGED: 'tab_changed',

  // Engagement Events
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',

  // Error Events
  ERROR_OCCURRED: 'error_occurred',

  // Monetization & Credit Events (NEW)
  CALL_START_RECORD_FAILED: 'call_start_record_failed',
  CREDIT_DEDUCTION_BATCH: 'credit_deduction_batch',
  CREDITS_EXHAUSTED: 'credits_exhausted',
  CRASH_RECOVERY_TRIGGERED: 'crash_recovery_triggered',
  ZERO_BALANCE_FLAGGED: 'zero_balance_flagged',
  PAYWALL_SHOWN: 'paywall_shown',
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
  CREDITS_PURCHASED: 'credits_purchased',
  VOICE_CALL_STARTED: 'voice_call_started',
  VOICE_CALL_ENDED: 'voice_call_ended',
} as const;

/**
 * Log a custom event to Firebase Analytics
 */
export const logAnalyticsEvent = async (
  eventName: string,
  params?: Record<string, any>
): Promise<void> => {
  try {
    await analytics().logEvent(eventName, params);
    console.log(`📊 Analytics: ${eventName}`, params);
  } catch (error) {
    console.warn('Failed to log analytics event:', error);
  }
};

/**
 * Track screen views
 */
export const logScreenView = (screenName: string, params?: Record<string, any>): void => {
  logAnalyticsEvent(AnalyticsEvents.SCREEN_VIEW, {
    screen_name: screenName,
    ...params,
  });
};

/**
 * Track onboarding progress
 */
export const logOnboardingStep = (stepName: string, stepNumber: number): void => {
  logAnalyticsEvent(AnalyticsEvents.ONBOARDING_STEP_VIEWED, {
    step_name: stepName,
    step_number: stepNumber,
  });
};

/**
 * Track onboarding completion
 */
export const logOnboardingCompleted = (profile: Record<string, any>): void => {
  logAnalyticsEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
    age: profile.age,
    appearance: profile.appearance,
    mode: profile.mode,
    has_name: !!profile.name,
  });
};

/**
 * Track character selection
 */
export const logCharacterSelected = (
  characterId: string,
  characterName: string,
  appearance: string
): void => {
  logAnalyticsEvent(AnalyticsEvents.CHARACTER_SELECTED, {
    character_id: characterId,
    character_name: characterName,
    appearance_type: appearance,
  });
};

/**
 * Track character view
 */
export const logCharacterViewed = (
  characterId: string,
  characterName: string
): void => {
  logAnalyticsEvent(AnalyticsEvents.CHARACTER_VIEWED, {
    character_id: characterId,
    character_name: characterName,
  });
};

/**
 * Track chat session start
 */
export const logChatStarted = (
  characterId: string,
  characterName: string,
  isFirstChat: boolean
): void => {
  logAnalyticsEvent(AnalyticsEvents.CHAT_STARTED, {
    character_id: characterId,
    character_name: characterName,
    is_first_chat: isFirstChat,
  });
};

/**
 * Track message sent
 */
export const logMessageSent = (
  characterId: string,
  messageLength: number,
  messageNumber: number
): void => {
  logAnalyticsEvent(AnalyticsEvents.MESSAGE_SENT, {
    character_id: characterId,
    message_length: messageLength,
    message_number: messageNumber,
  });
};

/**
 * Track chat session duration
 */
export const logChatSessionDuration = (
  characterId: string,
  durationSeconds: number,
  messageCount: number
): void => {
  logAnalyticsEvent(AnalyticsEvents.CHAT_SESSION_DURATION, {
    character_id: characterId,
    duration_seconds: durationSeconds,
    message_count: messageCount,
  });
};

/**
 * Track tab navigation
 */
export const logTabChanged = (tabName: string): void => {
  logAnalyticsEvent(AnalyticsEvents.TAB_CHANGED, {
    tab_name: tabName,
  });
};

/**
 * Track errors
 */
export const logError = (
  errorType: string,
  errorMessage: string,
  errorContext?: string
): void => {
  logAnalyticsEvent(AnalyticsEvents.ERROR_OCCURRED, {
    error_type: errorType,
    error_message: errorMessage,
    error_context: errorContext,
  });
};

/**
 * Set user ID for analytics
 */
export const setAnalyticsUserId = async (userId: string): Promise<void> => {
  try {
    await analytics().setUserId(userId);
    console.log('📊 Analytics: User ID set');
  } catch (error) {
    console.warn('Failed to set user ID:', error);
  }
};

/**
 * Set user properties for analytics
 */
export const setAnalyticsUserProperties = async (properties: Record<string, any>): Promise<void> => {
  try {
    await analytics().setUserProperties(properties);
    console.log('📊 Analytics: User properties set', properties);
  } catch (error) {
    console.warn('Failed to set user properties:', error);
  }
};

/**
 * Track app open
 */
export const logAppOpened = (): void => {
  logAnalyticsEvent(AnalyticsEvents.APP_OPENED, {
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track home screen view
 */
export const logHomeScreenViewed = (characterCount: number): void => {
  logAnalyticsEvent(AnalyticsEvents.HOME_SCREEN_VIEWED, {
    character_count: characterCount,
  });
};

/**
 * Track failed call start recording (for monitoring)
 */
export const logCallStartRecordFailed = (
  userId: string,
  callId: string,
  errorMessage: string,
  attemptsExhausted: number
): void => {
  logAnalyticsEvent(AnalyticsEvents.CALL_START_RECORD_FAILED, {
    user_id: userId,
    call_id: callId,
    error_message: errorMessage,
    attempts_exhausted: attemptsExhausted,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track batched credit deduction
 */
export const logCreditDeductionBatch = (
  userId: string,
  secondsDeducted: number,
  newBalance: number,
  totalCallSeconds: number
): void => {
  logAnalyticsEvent(AnalyticsEvents.CREDIT_DEDUCTION_BATCH, {
    user_id: userId,
    seconds_deducted: secondsDeducted,
    new_balance: newBalance,
    total_call_seconds: totalCallSeconds,
  });
};

/**
 * Track when credits are exhausted during a call
 */
export const logCreditsExhausted = (
  userId: string,
  characterName: string,
  callDuration: number
): void => {
  logAnalyticsEvent(AnalyticsEvents.CREDITS_EXHAUSTED, {
    user_id: userId,
    character_name: characterName,
    call_duration_seconds: callDuration,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track crash recovery reconciliation
 */
export const logCrashRecoveryTriggered = (
  userId: string,
  callId: string,
  secondsReconciled: number,
  staleMinutes: number
): void => {
  logAnalyticsEvent(AnalyticsEvents.CRASH_RECOVERY_TRIGGERED, {
    user_id: userId,
    call_id: callId,
    seconds_reconciled: secondsReconciled,
    stale_minutes: staleMinutes,
  });
};

/**
 * Track zero-balance flagging
 */
export const logZeroBalanceFlagged = (
  userId: string,
  unpaidSeconds: number,
  reason: string
): void => {
  logAnalyticsEvent(AnalyticsEvents.ZERO_BALANCE_FLAGGED, {
    user_id: userId,
    unpaid_seconds: unpaidSeconds,
    reason: reason,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track paywall display
 */
export const logPaywallShown = (
  reason: string,
  characterName?: string,
  currentBalance?: number
): void => {
  logAnalyticsEvent(AnalyticsEvents.PAYWALL_SHOWN, {
    reason: reason,
    character_name: characterName,
    current_balance: currentBalance,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track subscription purchase
 */
export const logSubscriptionPurchased = (
  userId: string,
  tier: string,
  price: number,
  currency: string
): void => {
  logAnalyticsEvent(AnalyticsEvents.SUBSCRIPTION_PURCHASED, {
    user_id: userId,
    tier: tier,
    price: price,
    currency: currency,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track credit purchase
 */
export const logCreditsPurchased = (
  userId: string,
  secondsPurchased: number,
  price: number,
  currency: string
): void => {
  logAnalyticsEvent(AnalyticsEvents.CREDITS_PURCHASED, {
    user_id: userId,
    seconds_purchased: secondsPurchased,
    price: price,
    currency: currency,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track voice call start
 */
export const logVoiceCallStarted = (
  userId: string,
  characterName: string,
  initialBalance: number,
  isPremium: boolean
): void => {
  logAnalyticsEvent(AnalyticsEvents.VOICE_CALL_STARTED, {
    user_id: userId,
    character_name: characterName,
    initial_balance: initialBalance,
    is_premium: isPremium,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track voice call end
 */
export const logVoiceCallEnded = (
  userId: string,
  characterName: string,
  duration: number,
  creditsUsed: number,
  finalBalance: number,
  endReason: string
): void => {
  logAnalyticsEvent(AnalyticsEvents.VOICE_CALL_ENDED, {
    user_id: userId,
    character_name: characterName,
    duration_seconds: duration,
    credits_used: creditsUsed,
    final_balance: finalBalance,
    end_reason: endReason,
    timestamp: new Date().toISOString(),
  });
};

import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { getAnalyticsInstance } from '../config/firebase';

/**
 * Analytics Service for Firebase Analytics
 * Provides helper functions to track user events and behavior
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
} as const;

/**
 * Log a custom event to Firebase Analytics
 */
export const logAnalyticsEvent = (
  eventName: string,
  params?: Record<string, any>
): void => {
  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      logEvent(analytics, eventName, params);
      console.log(`📊 Analytics: ${eventName}`, params);
    }
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
export const setAnalyticsUserId = (userId: string): void => {
  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      setUserId(analytics, userId);
      console.log('📊 Analytics: User ID set');
    }
  } catch (error) {
    console.warn('Failed to set user ID:', error);
  }
};

/**
 * Set user properties for analytics
 */
export const setAnalyticsUserProperties = (properties: Record<string, any>): void => {
  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      setUserProperties(analytics, properties);
      console.log('📊 Analytics: User properties set', properties);
    }
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

/**
 * Firebase Analytics Service for React Native
 *
 * This service provides type-safe Firebase Analytics event logging
 * for tracking user behavior, monetization, and app performance.
 *
 * Mandatory Events for Google Play:
 * 1. first_open - Automatically tracked by Firebase
 * 2. ad_impression - Tracked when user sees ads/paywall
 * 3. purchase - Tracked when user completes purchase
 */

import { Platform } from 'react-native';
import { captureError } from '../config/sentry';

// Lazy import Firebase to handle Expo Go environment
let analytics: any = null;
let isFirebaseAvailable = false;

// Try to import Firebase Analytics
try {
  analytics = require('@react-native-firebase/analytics').default;
  isFirebaseAvailable = true;
} catch (error) {
  console.log('Analytics skipped: Not in browser environment (React Native)');
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
    // Enable analytics collection
    await analytics().setAnalyticsCollectionEnabled(true);

    // Log that analytics has been initialized
    console.log('✅ Firebase Analytics initialized');

    // The first_open event is automatically tracked by Firebase
    // when the app is opened for the first time
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Analytics:', error);
    captureError(error as Error, { service: 'firebase_analytics', action: 'initialize' });
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
    captureError(error as Error, { service: 'firebase_analytics', action: 'setUserId' });
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
    captureError(error as Error, { service: 'firebase_analytics', action: 'setUserProperties' });
  }
};

// ============================================================================
// MANDATORY EVENT 1: first_open
// ============================================================================
/**
 * NOTE: first_open is automatically tracked by Firebase SDK
 * when a user opens the app for the first time.
 *
 * No manual implementation needed!
 *
 * Firebase will automatically log this event when:
 * - User installs the app and opens it for the first time
 * - Or clears app data and opens it again
 */

// ============================================================================
// MANDATORY EVENT 2: ad_impression
// ============================================================================

export interface AdImpressionParams {
  /** Platform showing the ad (e.g., 'paywall', 'banner', 'interstitial') */
  ad_platform: string;

  /** Format of the ad (e.g., 'subscription_offer', 'rewarded_video') */
  ad_format: string;

  /** Source of the ad (e.g., 'sarina_premium', 'admob') */
  ad_source: string;

  /** Value/potential revenue of the ad impression */
  value: number;

  /** Currency code (e.g., 'USD', 'EUR') */
  currency: string;

  /** Optional: specific ad unit ID */
  ad_unit_name?: string;
}

/**
 * Log ad impression event
 * Call this when user views an ad or paywall
 *
 * @example
 * ```typescript
 * logAdImpression({
 *   ad_platform: 'paywall',
 *   ad_format: 'subscription_offer',
 *   ad_source: 'sarina_premium',
 *   value: 9.99,
 *   currency: 'USD',
 *   ad_unit_name: 'premium_monthly_offer'
 * });
 * ```
 */
export const logAdImpression = async (params: AdImpressionParams): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('ad_impression', {
      ad_platform: params.ad_platform,
      ad_format: params.ad_format,
      ad_source: params.ad_source,
      value: params.value,
      currency: params.currency,
      ...(params.ad_unit_name && { ad_unit_name: params.ad_unit_name }),
    });

    console.log('📊 Ad impression logged:', params);
  } catch (error) {
    console.error('❌ Failed to log ad impression:', error);
    captureError(error as Error, { service: 'firebase_analytics', action: 'logAdImpression', params });
  }
};

// ============================================================================
// MANDATORY EVENT 3: purchase
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
    captureError(error as Error, { service: 'firebase_analytics', action: 'logPurchase', params });
  }
};

// ============================================================================
// ADDITIONAL HELPFUL EVENTS
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
export const logChatStart = async (characterName: string): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('chat_start', {
      character_name: characterName,
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
export const logMessageSent = async (characterName: string, messageLength: number): Promise<void> => {
  if (!isAnalyticsAvailable()) return;

  try {
    await analytics().logEvent('message_sent', {
      character_name: characterName,
      message_length: messageLength,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('❌ Failed to log message sent:', error);
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
  initializeAnalytics,
  setUserId,
  setUserProperties,
  logAdImpression,
  logPurchase,
  logScreenView,
  logAppOpen,
  logOnboardingStart,
  logOnboardingComplete,
  logChatStart,
  logMessageSent,
  logSubscriptionCancel,
  setAnalyticsDebugMode,
};

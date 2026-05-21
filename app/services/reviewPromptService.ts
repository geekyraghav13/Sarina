import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import { logAnalyticsEvent } from './analyticsService';

const SOFT_PROMPT_LAST_SHOWN_KEY = '@review_prompt_last_shown';
const SOFT_PROMPT_COUNT_KEY = '@review_prompt_count';

// Google Play caps native review prompts at ~4-5 per user per year.
// Soft-prompt cooldown is tighter so we don't nag — 60 days between asks.
const COOLDOWN_MS = 60 * 24 * 60 * 60 * 1000;

const FEEDBACK_EMAIL = 'geekyraghav13@gmail.com';

export type ReviewPromptReason =
  | 'shown'
  | 'cooldown'
  | 'unavailable'
  | 'no_action'
  | 'error';

export interface ReviewPromptResult {
  shown: boolean;
  reason: ReviewPromptReason;
}

export type ReviewSentiment = 'love' | 'neutral' | 'negative';

/**
 * Returns true if the soft prompt cooldown has elapsed (or the prompt has
 * never been shown). Safe to call frequently — pure AsyncStorage read.
 */
export const shouldShowSoftPrompt = async (): Promise<boolean> => {
  try {
    const lastShown = await AsyncStorage.getItem(SOFT_PROMPT_LAST_SHOWN_KEY);
    if (!lastShown) return true;
    const elapsed = Date.now() - parseInt(lastShown, 10);
    return Number.isFinite(elapsed) && elapsed >= COOLDOWN_MS;
  } catch (error) {
    console.warn('shouldShowSoftPrompt failed:', error);
    return false;
  }
};

/**
 * Record that the soft prompt was shown (resets cooldown). Always call on
 * mount of the soft-prompt modal — regardless of which path the user picks —
 * to avoid showing it again across other triggers within the cooldown.
 */
export const recordSoftPromptShown = async (trigger: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(SOFT_PROMPT_LAST_SHOWN_KEY, Date.now().toString());
    const prevCount = parseInt(
      (await AsyncStorage.getItem(SOFT_PROMPT_COUNT_KEY)) || '0',
      10,
    );
    await AsyncStorage.setItem(
      SOFT_PROMPT_COUNT_KEY,
      (Number.isFinite(prevCount) ? prevCount + 1 : 1).toString(),
    );
    try {
      logAnalyticsEvent('review_soft_prompt_shown', { trigger });
    } catch {
      // analytics failures must not affect the user flow
    }
  } catch (error) {
    console.warn('recordSoftPromptShown failed:', error);
  }
};

/**
 * Open the native in-app review widget directly. Used by the 😍 path of the
 * soft prompt and by the manual "Rate the app" entry in Settings.
 */
export const openNativeReviewWidget = async (
  trigger: string,
): Promise<ReviewPromptResult> => {
  try {
    const available = await StoreReview.isAvailableAsync();
    if (!available) return { shown: false, reason: 'unavailable' };

    const hasAction = await StoreReview.hasAction();
    if (!hasAction) return { shown: false, reason: 'no_action' };

    await StoreReview.requestReview();

    try {
      logAnalyticsEvent('review_native_widget_requested', { trigger });
    } catch {
      // analytics failures must not affect the user flow
    }
    return { shown: true, reason: 'shown' };
  } catch (error) {
    console.warn('openNativeReviewWidget failed:', error);
    return { shown: false, reason: 'error' };
  }
};

/**
 * Open the mail composer pre-filled with a feedback template. Routes 😐/😞
 * users to the founder inbox instead of a 1-2★ public review.
 */
export const openFeedbackEmail = async (
  sentiment: Exclude<ReviewSentiment, 'love'>,
  trigger: string,
): Promise<void> => {
  const sentimentLabel = sentiment === 'negative' ? 'frustrating' : 'just okay';
  const subject = encodeURIComponent('Sarina AI — Feedback');
  const body = encodeURIComponent(
    `Hi team,\n\nMy experience with Sarina has been ${sentimentLabel}. Here's what I'd love to see improved:\n\n[Your feedback here]\n\nThanks!\n\n— Sent from Sarina (${Platform.OS}, trigger: ${trigger})\n`,
  );
  const url = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.warn('Cannot open mailto URL:', url);
    }
    try {
      logAnalyticsEvent('review_feedback_email_opened', { trigger, sentiment });
    } catch {
      // analytics failures must not affect the user flow
    }
  } catch (error) {
    console.warn('openFeedbackEmail failed:', error);
  }
};

/**
 * Direct path: cooldown + native widget. Used by Settings → Rate the app.
 * Components that want the full soft-prompt UX should use the
 * useSoftReviewPrompt hook instead.
 */
export const maybeAskForReview = async (
  trigger: string,
): Promise<ReviewPromptResult> => {
  const eligible = await shouldShowSoftPrompt();
  if (!eligible) return { shown: false, reason: 'cooldown' };
  const result = await openNativeReviewWidget(trigger);
  if (result.shown) {
    await recordSoftPromptShown(trigger);
  }
  return result;
};

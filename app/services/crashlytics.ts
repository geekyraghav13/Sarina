/**
 * Firebase Crashlytics wrapper.
 *
 * Native module (@react-native-firebase/crashlytics) — loaded via guarded
 * require so the app still runs in Expo Go / web (where it simply no-ops).
 * Crashlytics auto-captures fatal JS + native crashes once the google-services
 * plugin + crashlytics gradle plugin are applied; these helpers add user/context
 * and let us record handled (non-fatal) errors for the dashboard.
 */

let crashlytics: any = null;
let available = false;

try {
  crashlytics = require('@react-native-firebase/crashlytics').default;
  available = true;
} catch {
  available = false;
}

const isAvailable = (): boolean => available && crashlytics !== null;

/** Enable collection (default on in release). Safe to call on app start. */
export const initializeCrashlytics = async (): Promise<void> => {
  if (!isAvailable()) {
    console.log('ℹ️ Crashlytics not available (Expo Go / web)');
    return;
  }
  try {
    await crashlytics().setCrashlyticsCollectionEnabled(true);
    console.log('✅ Crashlytics initialized');
  } catch (e) {
    console.warn('Crashlytics init failed:', e);
  }
};

/** Tie crashes to a user (the Firebase uid). */
export const setCrashlyticsUserId = (userId: string): void => {
  if (!isAvailable()) return;
  try {
    crashlytics().setUserId(userId);
  } catch {}
};

/** Add a breadcrumb shown alongside any subsequent crash. */
export const crashLog = (message: string): void => {
  if (!isAvailable()) return;
  try {
    crashlytics().log(message);
  } catch {}
};

/** Record a handled (non-fatal) error so it shows up in the dashboard. */
export const recordError = (error: unknown, context?: string): void => {
  if (!isAvailable()) return;
  try {
    if (context) crashlytics().log(context);
    const err = error instanceof Error ? error : new Error(String(error));
    crashlytics().recordError(err);
  } catch {}
};

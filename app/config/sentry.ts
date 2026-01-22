// Conditional import to avoid Expo Go issues
let Sentry: any = null;
let Constants: any = null;

try {
  if (!__DEV__) {
    Sentry = require('sentry-expo');
    Constants = require('expo-constants');
  }
} catch (error) {
  console.log('Sentry not loaded in development');
}

/**
 * Sentry Configuration for Crash Reporting
 *
 * To get your Sentry DSN:
 * 1. Go to https://sentry.io/signup/
 * 2. Create a new project (React Native)
 * 3. Copy your DSN from Settings → Client Keys
 * 4. Update SENTRY_DSN below
 */

// Sentry DSN - Free tier (5k errors/month)
const SENTRY_DSN = process.env.SENTRY_DSN || 'https://0f03cc818d415d840ca9f58c2ab5b2d2@o4510701895417856.ingest.us.sentry.io/4510701897777152';

export const initSentry = () => {
  // Skip Sentry in development (Expo Go doesn't support native modules)
  if (__DEV__) {
    console.log('⚠️ Sentry disabled in development mode (Expo Go)');
    console.log('   Sentry will be active in production builds');
    return;
  }

  // Check if Sentry is available
  if (!Sentry || !Constants) {
    console.log('⚠️ Sentry modules not loaded');
    return;
  }

  // Only initialize if DSN is configured
  if (!SENTRY_DSN || SENTRY_DSN.includes('YOUR_DSN')) {
    console.log('⚠️ Sentry not configured. Add your DSN to app/config/sentry.ts');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      enableInExpoDevelopment: false, // Disable in dev to reduce noise
      debug: false, // Disable debug to prevent errors in Expo Go

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    tracesSampleRate: 1.0,

    // Environment
    environment: __DEV__ ? 'development' : 'production',

    // Release tracking
    release: Constants.expoConfig?.version || '1.0.0',
    dist: Constants.expoConfig?.android?.versionCode?.toString() || '1',

    // Integrations - Skip for Expo Go to avoid errors
    integrations: [],

    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive user data
      if (event.request) {
        delete event.request.cookies;

        // Sanitize OpenRouter API key from breadcrumbs
        if (event.request.headers) {
          if (event.request.headers.Authorization) {
            event.request.headers.Authorization = '[Filtered]';
          }
        }
      }

      return event;
    },
  });

    console.log('✅ Sentry initialized for crash reporting');
  } catch (error) {
    console.log('⚠️ Sentry initialization skipped (Expo Go compatibility)');
    console.log('   Sentry will work in production builds');
  }
};

/**
 * Manually capture an error
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (!Sentry || __DEV__) {
    console.error('Error (not sent to Sentry):', error.message);
    if (context) console.error('Context:', context);
    return;
  }

  try {
    if (context) {
      Sentry.Native.captureException(error, { extra: context });
    } else {
      Sentry.Native.captureException(error);
    }
  } catch (e) {
    console.error('Error capturing to Sentry:', e);
  }
};

/**
 * Set user context for better error tracking
 */
export const setSentryUser = (userId: string, userData?: Record<string, any>) => {
  if (!Sentry || __DEV__) return;

  try {
    Sentry.Native.setUser({
      id: userId,
      ...userData,
    });
  } catch (e) {
    // Ignore
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  if (!Sentry || __DEV__) return;

  try {
    Sentry.Native.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  } catch (e) {
    // Ignore
  }
};

/**
 * Clear user context (on logout)
 */
export const clearSentryUser = () => {
  if (!Sentry || __DEV__) return;

  try {
    Sentry.Native.setUser(null);
  } catch (e) {
    // Ignore
  }
};

export default Sentry;

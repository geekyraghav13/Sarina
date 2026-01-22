import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  RemoteConfig
} from 'firebase/remote-config';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoso8vP9ZY6fCGq3g-bgOyEdLDja9Dyo0",
  authDomain: "sarina-ai-2b2c1.firebaseapp.com",
  projectId: "sarina-ai-2b2c1",
  storageBucket: "sarina-ai-2b2c1.firebasestorage.app",
  messagingSenderId: "1051121433445",
  appId: "1:1051121433445:web:b3d60bb5ea0190e09c7f8c",
  measurementId: "G-SX1919QG46"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Analytics (conditionally for web)
// Note: Firebase Analytics works on web. For native apps, you would use
// @react-native-firebase/analytics instead. This implementation is for Expo web.
let analytics: Analytics | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

if (isBrowser) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized');
    }
  }).catch((error) => {
    console.warn('Analytics not supported:', error);
  });
} else {
  console.log('Analytics skipped: Not in browser environment (React Native)');
}

export const getAnalyticsInstance = (): Analytics | null => analytics;

// Initialize Remote Config with custom settings for React Native
let remoteConfigInstance: RemoteConfig | null = null;

export const getRemoteConfigInstance = (): RemoteConfig => {
  if (!remoteConfigInstance) {
    remoteConfigInstance = getRemoteConfig(app);

    // Configure settings
    remoteConfigInstance.settings = {
      minimumFetchIntervalMillis: 3600000, // 1 hour (change to 0 for testing)
      fetchTimeoutMillis: 60000,
    };

    // Set default values
    remoteConfigInstance.defaultConfig = {
      characters: '[]',
    };
  }

  return remoteConfigInstance;
};

export { fetchAndActivate, getValue };

export default app;

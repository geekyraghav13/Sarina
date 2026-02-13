import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  RemoteConfig
} from 'firebase/remote-config';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, Firestore, enableNetwork, initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Track Firestore readiness
let firestoreReady = false;

// Initialize Firestore with network enabled and NO offline persistence
// Using ONLY memory cache to avoid React Native offline persistence bugs
export const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Required for React Native
  useFetchStreams: false, // Disable for React Native compatibility
  localCache: {
    kind: 'memory', // Memory-only cache - no disk persistence
  },
  // Disable offline persistence completely
  ignoreUndefinedProperties: true,
});

// Enable network immediately and ensure Firestore is online
// This must complete before any Firestore operations
enableNetwork(firestore)
  .then(() => {
    firestoreReady = true;
    console.log('✅ Firestore network enabled successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to enable Firestore network:', error);
  });

// Helper to wait for Firestore to be ready
export const waitForFirestore = async (timeout: number = 5000): Promise<void> => {
  const startTime = Date.now();
  while (!firestoreReady && (Date.now() - startTime) < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!firestoreReady) {
    throw new Error('Firestore failed to go online within timeout');
  }
};

// Initialize Firebase Analytics (conditionally for web)
// Note: Firebase Analytics works on web. For native apps, you would use
// @react-native-firebase/analytics instead. This implementation is for Expo web.
let analytics: Analytics | null = null;

// Check if we're in a browser environment
const isBrowser = typeof global !== 'undefined' && (global as any).window !== undefined;

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

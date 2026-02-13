/**
 * Authentication Service
 * Handles Google Sign-In with Firebase Auth
 */

import {
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getDocumentREST, createUserDocumentREST } from './firestoreRestService';

// Configure Google Sign-In
// Web Client ID from Firebase Console (google-services.json)
const WEB_CLIENT_ID = '1051121433445-8sehc92iuvth1aq4ej5fb8452pcf61mt.apps.googleusercontent.com';

/**
 * Initialize Google Sign-In
 */
export const initializeGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
  });
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    console.log('🔐 Starting Google Sign-In...');

    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get the users ID token
    const response = await GoogleSignin.signIn();
    console.log('📝 Google Sign-In response:', response);

    // In v10+, the response structure is { type: 'success', data: { idToken, user } }
    const idToken = response.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token received from Google Sign-In');
    }

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    const user = userCredential.user;

    console.log('✅ Google Sign-In successful:', user.uid);

    // Initialize user document in Firestore (non-blocking)
    // Don't let Firestore errors block authentication
    initializeUserDocument(user).catch((error) => {
      console.warn('⚠️ Could not initialize user document immediately:', error.message);
      console.log('ℹ️ User document will be created on next successful connection');
    });

    return user;
  } catch (error: any) {
    console.error('❌ Google Sign-In failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error(error.message || 'Google Sign-In failed');
  }
};

/**
 * Initialize user document in Firestore with required fields
 * Includes retry logic for network issues
 */
const initializeUserDocument = async (user: User, retryCount = 0): Promise<void> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  try {
    // Use REST API (works on restricted networks)
    console.log('🔐 Checking if user document exists via REST API...');
    const existingDoc = await getDocumentREST('users', user.uid);

    if (!existingDoc) {
      // Create new user document using REST API
      console.log('📝 Creating user document via REST API...');
      await createUserDocumentREST({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      console.log('✅ User document created:', user.uid);
    } else {
      console.log('ℹ️ User document already exists:', user.uid);
    }
  } catch (error: any) {
    console.error('❌ Failed to initialize user document:', error);

    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying user document creation (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return initializeUserDocument(user, retryCount + 1);
    }

    throw error;
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    await firebaseSignOut(auth);
    console.log('✅ Signed out successfully');
  } catch (error) {
    console.error('❌ Sign out failed:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get Firebase ID Token for backend authentication
 */
export const getIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    return await user.getIdToken();
  } catch (error) {
    console.error('❌ Failed to get ID token:', error);
    return null;
  }
};

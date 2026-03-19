/**
 * Authentication Service
 * Handles Google Sign-In with Firebase Auth
 */

import {
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { getDocumentREST, createUserDocumentREST } from './firestoreRestService';

// Configure Google Sign-In
// Web Client ID from Firebase Console (google-services.json)
const WEB_CLIENT_ID = '1051121433445-8sehc92iuvth1aq4ej5fb8452pcf61mt.apps.googleusercontent.com';

// iOS Client ID from Firebase Console (GoogleService-Info.plist)
const IOS_CLIENT_ID = '1051121433445-rqjvp9kqjdkqvoctr14ac57eilstg0v3.apps.googleusercontent.com';

/**
 * Initialize Google Sign-In
 */
export const initializeGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
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
const initializeUserDocument = async (
  user: User,
  retryCount = 0,
  overrideData?: { displayName?: string | null; email?: string | null }
): Promise<void> => {
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
        email: overrideData?.email || user.email,
        displayName: overrideData?.displayName || user.displayName,
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
      return initializeUserDocument(user, retryCount + 1, overrideData);
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

/**
 * Check if Apple Sign In is available
 */
export const isAppleSignInAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch (error) {
    console.error('❌ Error checking Apple Sign In availability:', error);
    return false;
  }
};

/**
 * Sign in with Apple
 */
export const signInWithApple = async (): Promise<User> => {
  try {
    console.log('🍎 Starting Apple Sign-In...');

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log('📝 Apple Sign-In response received');

    // Create an OAuthProvider credential
    const provider = new OAuthProvider('apple.com');
    const oauthCredential = provider.credential({
      idToken: credential.identityToken!,
      rawNonce: credential.realUserStatus?.toString(),
    });

    // Sign in with Firebase
    const userCredential = await signInWithCredential(auth, oauthCredential);
    const user = userCredential.user;

    console.log('✅ Apple Sign-In successful:', user.uid);

    // Update user profile with Apple user info if available
    if (credential.fullName) {
      const displayName = [
        credential.fullName.givenName,
        credential.fullName.familyName
      ].filter(Boolean).join(' ');

      // Initialize user document with Apple user info
      initializeUserDocument(user, 0, {
        displayName: displayName || null,
        email: credential.email || user.email,
      }).catch((error) => {
        console.warn('⚠️ Could not initialize user document immediately:', error.message);
        console.log('ℹ️ User document will be created on next successful connection');
      });
    } else {
      // Initialize user document with default info
      initializeUserDocument(user).catch((error) => {
        console.warn('⚠️ Could not initialize user document immediately:', error.message);
        console.log('ℹ️ User document will be created on next successful connection');
      });
    }

    return user;
  } catch (error: any) {
    console.error('❌ Apple Sign-In failed:', error);

    // Check if user cancelled
    if (error.code === 'ERR_CANCELED') {
      throw new Error('Apple Sign-In was cancelled');
    }

    throw new Error(error.message || 'Apple Sign-In failed');
  }
};

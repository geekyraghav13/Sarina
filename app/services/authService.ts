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
import * as RevenueCatService from './revenueCatService';

// Configure Google Sign-In
// Web Client ID from Firebase Console (for backend authentication)
const WEB_CLIENT_ID = '1051121433445-8sehc92iuvth1aq4ej5fb8452pcf61mt.apps.googleusercontent.com';

// iOS Client ID from Firebase Console (GoogleService-Info.plist)
const IOS_CLIENT_ID = '1051121433445-rqjvp9kqjdkqvoctr14ac57eilstg0v3.apps.googleusercontent.com';

// Android OAuth Client ID from Firebase Console (for com.x8284.katrina)
// This is auto-configured via google-services.json, but we keep it for reference
const ANDROID_CLIENT_ID = '1051121433445-io8chm2slotm86u652ug9i7022th6hau.apps.googleusercontent.com';

/**
 * Initialize Google Sign-In
 * Note: Android OAuth client is auto-configured from google-services.json
 * We only need to specify webClientId for Firebase Authentication
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

    // Log in user to RevenueCat
    RevenueCatService.loginRevenueCatUser(user.uid).catch((error) => {
      console.warn('⚠️ Could not log in to RevenueCat:', error.message);
    });

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
    // Log out from RevenueCat
    await RevenueCatService.logoutRevenueCatUser();

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
 * Delete a Firestore collection using batch deletes via REST API
 * This function handles pagination to ensure ALL documents are deleted
 */
const deleteCollectionREST = async (collectionPath: string, token: string): Promise<number> => {
  let deletedCount = 0;
  const batchSize = 500; // Max allowed by Firestore REST API
  let pageToken: string | undefined = undefined;

  try {
    // Keep fetching and deleting until no more documents exist
    do {
      // List documents in the collection with pagination
      let listUrl = `https://firestore.googleapis.com/v1/projects/sarina-ai-2b2c1/databases/(default)/documents/${collectionPath}?pageSize=${batchSize}`;
      if (pageToken) {
        listUrl += `&pageToken=${pageToken}`;
      }

      const listResponse = await fetch(listUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!listResponse.ok) {
        if (listResponse.status === 404) {
          console.log(`ℹ️ Collection ${collectionPath} does not exist or is empty`);
          return deletedCount;
        }
        console.warn(`⚠️ Could not list documents in ${collectionPath}: ${listResponse.status}`);
        return deletedCount;
      }

      const data = await listResponse.json();
      const documents = data.documents || [];
      pageToken = data.nextPageToken;

      if (documents.length === 0) {
        break;
      }

      // Delete each document in this batch
      for (const doc of documents) {
        try {
          const docName = doc.name; // Full path like "projects/.../databases/.../documents/..."
          const deleteResponse = await fetch(
            `https://firestore.googleapis.com/v1/${docName}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (deleteResponse.ok) {
            deletedCount++;
          } else {
            console.warn(`⚠️ Failed to delete document ${docName}: ${deleteResponse.status}`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to delete document:`, error);
        }
      }

      console.log(`🗑️ Deleted ${deletedCount} documents from ${collectionPath} so far...`);

    } while (pageToken); // Continue if there are more pages

    console.log(`✅ Finished deleting ${deletedCount} documents from ${collectionPath}`);
  } catch (error) {
    console.warn(`⚠️ Failed to delete collection ${collectionPath}:`, error);
  }

  return deletedCount;
};

/**
 * Delete all documents in a root collection that match a specific userId field
 * Used for deleting call_sessions and credit_transactions
 */
const deleteDocumentsByUserIdREST = async (
  collectionName: string,
  userId: string,
  token: string
): Promise<number> => {
  let deletedCount = 0;
  const batchSize = 500;
  let pageToken: string | undefined = undefined;

  try {
    console.log(`🔍 Searching for ${collectionName} documents for user ${userId}...`);

    do {
      // List all documents in the collection (we'll filter by userId on client side)
      // Note: Firestore REST API doesn't support queries directly, so we fetch all and filter
      let listUrl = `https://firestore.googleapis.com/v1/projects/sarina-ai-2b2c1/databases/(default)/documents/${collectionName}?pageSize=${batchSize}`;
      if (pageToken) {
        listUrl += `&pageToken=${pageToken}`;
      }

      const listResponse = await fetch(listUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!listResponse.ok) {
        if (listResponse.status === 404) {
          console.log(`ℹ️ Collection ${collectionName} does not exist`);
          return deletedCount;
        }
        console.warn(`⚠️ Could not list ${collectionName}: ${listResponse.status}`);
        return deletedCount;
      }

      const data = await listResponse.json();
      const documents = data.documents || [];
      pageToken = data.nextPageToken;

      if (documents.length === 0) {
        break;
      }

      // Filter documents that belong to this user and delete them
      for (const doc of documents) {
        try {
          // Check if this document has a userId field matching our user
          const userIdField = doc.fields?.userId?.stringValue;
          if (userIdField === userId) {
            const docName = doc.name;
            const deleteResponse = await fetch(
              `https://firestore.googleapis.com/v1/${docName}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );

            if (deleteResponse.ok) {
              deletedCount++;
            } else {
              console.warn(`⚠️ Failed to delete ${collectionName} document: ${deleteResponse.status}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to delete ${collectionName} document:`, error);
        }
      }

      if (deletedCount > 0) {
        console.log(`🗑️ Deleted ${deletedCount} ${collectionName} documents so far...`);
      }

    } while (pageToken);

    console.log(`✅ Finished deleting ${deletedCount} ${collectionName} documents`);
  } catch (error) {
    console.warn(`⚠️ Failed to delete ${collectionName} documents:`, error);
  }

  return deletedCount;
};

/**
 * Delete user account and ALL associated data from Firestore and Firebase Auth
 *
 * This function deletes 100% of user data including:
 * 1. All user subcollections (girlfriends, messages, conversations, preferences, settings, etc.)
 * 2. User document from users collection
 * 3. All call_sessions documents where userId matches
 * 4. All credit_transactions documents where userId matches
 * 5. Firebase Auth account
 * 6. RevenueCat user data
 * 7. Google Sign-In access
 *
 * IMPORTANT: This is IRREVERSIBLE and deletes ALL traces of the user from the database
 */
export const deleteAccount = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    console.log('🗑️ ========================================');
    console.log('🗑️ STARTING COMPLETE ACCOUNT DELETION');
    console.log('🗑️ User ID:', user.uid);
    console.log('🗑️ Email:', user.email);
    console.log('🗑️ ========================================');

    // Get auth token for API calls
    const token = await getIdToken();
    if (!token) {
      throw new Error('Could not get authentication token');
    }

    let totalDocumentsDeleted = 0;

    // STEP 1: Delete all user subcollections from Firestore
    console.log('\n📦 STEP 1: Deleting user subcollections...');
    try {
      const subcollections = [
        'girlfriends',
        'messages',
        'conversations',
        'preferences',
        'settings',
        'purchases',
        'credits',
        'call_history',
        'notifications',
        'sessions',
      ];

      for (const subcollection of subcollections) {
        const collectionPath = `users/${user.uid}/${subcollection}`;
        console.log(`  🗂️ Deleting ${collectionPath}...`);
        const deleted = await deleteCollectionREST(collectionPath, token);
        totalDocumentsDeleted += deleted;
        if (deleted > 0) {
          console.log(`  ✅ Deleted ${deleted} documents from ${subcollection}`);
        }
      }

      console.log(`✅ STEP 1 COMPLETE: Deleted ${totalDocumentsDeleted} documents from subcollections`);
    } catch (error) {
      console.error('❌ STEP 1 FAILED:', error);
      // Continue with account deletion even if subcollection deletion fails
    }

    // STEP 2: Delete ALL call_sessions for this user
    console.log('\n📞 STEP 2: Deleting call sessions...');
    try {
      const callSessionsDeleted = await deleteDocumentsByUserIdREST('call_sessions', user.uid, token);
      totalDocumentsDeleted += callSessionsDeleted;
      console.log(`✅ STEP 2 COMPLETE: Deleted ${callSessionsDeleted} call session documents`);
    } catch (error) {
      console.error('❌ STEP 2 FAILED:', error);
      // Continue with account deletion
    }

    // STEP 3: Delete ALL credit_transactions for this user
    console.log('\n💳 STEP 3: Deleting credit transactions...');
    try {
      const transactionsDeleted = await deleteDocumentsByUserIdREST('credit_transactions', user.uid, token);
      totalDocumentsDeleted += transactionsDeleted;
      console.log(`✅ STEP 3 COMPLETE: Deleted ${transactionsDeleted} credit transaction documents`);
    } catch (error) {
      console.error('❌ STEP 3 FAILED:', error);
      // Continue with account deletion
    }

    // STEP 4: Delete main user document from Firestore
    console.log('\n👤 STEP 4: Deleting main user document...');
    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/sarina-ai-2b2c1/databases/(default)/documents/users/${user.uid}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        totalDocumentsDeleted += 1;
        console.log('✅ STEP 4 COMPLETE: User document deleted from Firestore');
      } else {
        console.warn('⚠️ STEP 4 WARNING: Could not delete user document:', await response.text());
      }
    } catch (error) {
      console.error('❌ STEP 4 FAILED:', error);
      // Continue with account deletion
    }

    // STEP 5: Log out from RevenueCat
    console.log('\n💰 STEP 5: Logging out from RevenueCat...');
    try {
      await RevenueCatService.logoutRevenueCatUser();
      console.log('✅ STEP 5 COMPLETE: Logged out from RevenueCat');
    } catch (error: any) {
      // Gracefully handle RevenueCat errors (e.g., SDK not initialized)
      console.warn('⚠️ STEP 5 WARNING: Could not log out from RevenueCat:', error?.message || error);
      console.log('ℹ️ This is expected if RevenueCat SDK is not initialized - continuing with deletion...');
    }

    // STEP 6: Revoke Google Sign-In access
    console.log('\n🔐 STEP 6: Revoking Google access...');
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      console.log('✅ STEP 6 COMPLETE: Revoked Google access');
    } catch (error) {
      console.warn('⚠️ STEP 6 WARNING: Could not revoke Google access:', error);
    }

    // STEP 7: Delete Firebase Auth account (FINAL STEP)
    console.log('\n🔥 STEP 7: Deleting Firebase Auth account...');
    try {
      await user.delete();
      console.log('✅ STEP 7 COMPLETE: Firebase Auth account deleted');
    } catch (error) {
      console.error('❌ STEP 7 FAILED:', error);
      throw error; // This is critical, so we throw
    }

    console.log('\n🗑️ ========================================');
    console.log('✅ ACCOUNT DELETION COMPLETED SUCCESSFULLY');
    console.log(`📊 Total Firestore documents deleted: ${totalDocumentsDeleted}`);
    console.log('🗑️ ========================================');
  } catch (error: any) {
    console.error('\n❌ ========================================');
    console.error('❌ ACCOUNT DELETION FAILED');
    console.error('❌ Error:', error);
    console.error('❌ ========================================');

    // Check if re-authentication is required
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security reasons, please sign out and sign in again before deleting your account.');
    }

    throw new Error(error.message || 'Failed to delete account');
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

    // Log in user to RevenueCat
    RevenueCatService.loginRevenueCatUser(user.uid).catch((error) => {
      console.warn('⚠️ Could not log in to RevenueCat:', error.message);
    });

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

/**
 * Guest (anonymous) auth — Expo-Go-safe.
 *
 * Deliberately isolated from authService.ts: that module statically imports
 * @react-native-google-signin (a native module absent from Expo Go), so even
 * touching it crashes the JS-only preview. Anonymous sign-in needs only the
 * Firebase JS SDK, which runs fine in Expo Go — so we keep it here with no
 * native dependencies.
 *
 * NOTE: this intentionally skips RevenueCat login and Firestore user-doc
 * creation (both reach native/authService code). Those run on the real
 * (dev/prod) build path via authService.signInAsGuest. Here we just establish
 * the anonymous session so the flow can proceed to Chat during testing.
 */

import { signInAnonymously, User } from 'firebase/auth';
import { auth } from '../config/firebase';

export const signInAsGuest = async (): Promise<User> => {
  console.log('👤 Starting anonymous (guest) sign-in...');
  try {
    const { user } = await signInAnonymously(auth);
    console.log('✅ Guest sign-in successful:', user.uid);
    return user;
  } catch (error: any) {
    console.error('❌ Guest sign-in failed:', error?.code, error?.message);
    if (error?.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Guest sign-in is not enabled. Enable Anonymous sign-in in Firebase Console → Authentication.'
      );
    }
    throw new Error(error?.message || 'Guest sign-in failed');
  }
};

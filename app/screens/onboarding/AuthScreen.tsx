/**
 * Onboarding · Screen 08 — Auth wall ("Don't lose her.")
 * New flow design (Figma node 14:663)
 *
 * Full-screen portrait of the chosen companion + a frosted bottom sheet with
 * two sign-in options: Continue with Google (Firebase + native Google Sign-In)
 * and Continue as guest (Firebase anonymous auth).
 *
 * IMPORTANT — Expo Go safety: the OnboardingNavigator eagerly imports every
 * screen module, so this file must NOT statically import authService (which
 * pulls in @react-native-google-signin + firebase/auth, both native). Instead
 * we lazy-require authService inside the button handlers. The preview path
 * therefore loads nothing native; the buttons only touch native code when
 * tapped (and only work in a dev/prod build, not Expo Go).
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import {
  logScreenView,
  logAuthCompleted,
  logOnboardingComplete,
} from '../../services/firebaseAnalytics';
import { useAuthStrings } from '../../data/onboardingStrings';
import { Character, characterImageSource } from '../../data/characters';

const fallbackBg = require('../../../assets/onboarding/auth-bg.png');

const TERMS_URL = 'https://sarina-ai-companion.lovable.app/terms';
const PRIVACY_URL = 'https://sarina-ai-companion.lovable.app/privacy';

// Pink Google "G" mark, exactly as exported from Figma (14:681).
const iconGoogle = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.4542 8.5325V11.7167H14.9917C14.3983 13.6458 12.7858 15.0267 10.4542 15.0267C7.6775 15.0267 5.42667 12.7758 5.42667 10C5.42667 7.22417 7.6775 4.97333 10.4542 4.97333C11.7025 4.97333 12.8425 5.43083 13.7217 6.18417L16.0667 3.83917C14.5858 2.49 12.6158 1.66667 10.4542 1.66667C5.85083 1.66667 2.11917 5.3975 2.11917 10C2.11917 14.6025 5.85083 18.3333 10.4542 18.3333C17.4508 18.3333 18.995 11.7917 18.3092 8.54333L10.4542 8.5325V8.5325" fill="#FFB2B9"/>
</svg>`;

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Auth'>;
};

type Pending = 'google' | 'guest' | null;

export const AuthScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const strings = useAuthStrings();
  const [character, setCharacter] = React.useState<Character | null>(null);
  const [pending, setPending] = React.useState<Pending>(null);

  React.useEffect(() => {
    logScreenView('Onboarding_Auth');
    AsyncStorage.getItem('selected_character')
      .then((raw) => {
        if (raw) setCharacter(JSON.parse(raw));
      })
      .catch(() => {});
  }, []);

  // Resolve the backdrop: chosen companion's image, else the Figma fallback.
  const bgSource = character ? characterImageSource(character) : fallbackBg;

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Link unavailable', 'Please try again later.');
    });
  };

  // After a successful sign-in, land in Chat with Discover beneath it, so
  // pressing back from the chat returns to the Discover screen.
  const proceed = () => {
    navigation.reset({ index: 1, routes: [{ name: 'Discover' }, { name: 'Chat' }] });
  };

  const handleGoogle = async () => {
    if (pending) return;
    setPending('google');
    try {
      // authService statically imports the native Google Sign-In module, so this
      // require throws in Expo Go — caught below and surfaced as a friendly note.
      const auth = require('../../services/authService');
      auth.initializeGoogleSignIn();
      const user = await auth.signInWithGoogle();
      console.log('✅ Signed in with Google:', user.uid);
      logAuthCompleted('google');
      logOnboardingComplete();
      proceed();
    } catch (error: any) {
      const msg: string = error?.message || 'Sign-in failed. Please try again.';
      if (/RNGoogleSignin|native|TurboModule/i.test(msg)) {
        Alert.alert(
          'Not available in Expo Go',
          'Google Sign-In needs a dev/production build. Use “Continue as guest” to test the flow in Expo Go.'
        );
      } else if (!/cancel/i.test(msg)) {
        Alert.alert('Sign in failed', msg);
      }
    } finally {
      setPending(null);
    }
  };

  const handleGuest = async () => {
    if (pending) return;
    setPending('guest');
    try {
      // Isolated, Expo-Go-safe module (Firebase JS SDK only — no native imports).
      const { signInAsGuest } = require('../../services/guestAuth');
      const user = await signInAsGuest();
      console.log('✅ Signed in as guest:', user.uid);
      logAuthCompleted('guest');
      logOnboardingComplete();
      proceed();
    } catch (error: any) {
      Alert.alert('Could not continue', error?.message || 'Please try again.');
    } finally {
      setPending(null);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={bgSource} style={styles.bg} resizeMode="cover">
        {/* Gradient to blend the portrait into the bottom sheet */}
        <LinearGradient
          colors={['rgba(19,19,21,0)', 'rgba(19,19,21,0.4)', '#131315']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      {/* Bottom sheet auth wall */}
      <BlurView
        intensity={20}
        tint="dark"
        style={[styles.sheet, { paddingBottom: insets.bottom + 32 }]}
      >
        <View style={styles.dragHandle} />

        <View style={styles.header}>
          <Text style={styles.title}>{strings.authTitle}</Text>
          <Text style={styles.subtitle}>{strings.authSubtitle}</Text>
        </View>

        <View style={styles.actions}>
          {/* Continue with Google */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.authButton}
            onPress={handleGoogle}
            disabled={!!pending}
          >
            {pending === 'google' ? (
              <ActivityIndicator color="#ffb2b9" />
            ) : (
              <>
                <SvgXml xml={iconGoogle} width={20} height={20} />
                <Text style={styles.authButtonText}>{strings.continueGoogle}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Continue as guest */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.authButton}
            onPress={handleGuest}
            disabled={!!pending}
          >
            {pending === 'guest' ? (
              <ActivityIndicator color="#ffb2b9" />
            ) : (
              <>
                <Ionicons name="person-outline" size={18} color="#ffb2b9" />
                <Text style={styles.authButtonText}>{strings.continueGuest}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Terms / Privacy */}
        <Text style={styles.legal}>
          {strings.agreePrefix}{' '}
          <Text style={styles.legalLink} onPress={() => openLink(TERMS_URL)}>
            {strings.termsLabel}
          </Text>{' '}
          {strings.andLabel}{' '}
          <Text style={styles.legalLink} onPress={() => openLink(PRIVACY_URL)}>
            {strings.privacyLabel}
          </Text>
          .
        </Text>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  // Bottom sheet
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxWidth: 512,
    alignSelf: 'center',
    width: '100%',
    paddingTop: 16,
    paddingHorizontal: 40,
    gap: 24,
    alignItems: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(21,21,26,0.85)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 24,
  },
  dragHandle: {
    width: 48,
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#353437',
    opacity: 0.6,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    lineHeight: 35,
    color: '#e5e1e4',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#a0a0a5',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 16,
    paddingTop: 8,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    minHeight: 54,
    paddingVertical: 17,
    paddingHorizontal: 25,
    borderRadius: 12,
    backgroundColor: '#1a1a22',
    borderWidth: 1,
    borderColor: 'rgba(92,63,65,0.3)',
  },
  authButtonText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    letterSpacing: 0.2,
    color: '#ffb2b9',
    textAlign: 'center',
  },
  legal: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16.8,
    color: '#5a5a65',
    textAlign: 'center',
  },
  legalLink: {
    color: '#a0a0a5',
    textDecorationLine: 'underline',
  },
});

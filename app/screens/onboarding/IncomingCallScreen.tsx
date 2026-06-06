/**
 * Voice Call · Incoming call screen
 * New flow design (Figma node 68:125)
 *
 * Shown when the user taps the call button in Chat. Full-screen portrait of the
 * companion + "Incoming Call…" with Decline / Answer actions.
 *
 * Gating (per spec):
 *  - NOT premium → tapping Answer OR Decline opens the paywall. On purchase we
 *    allocate the plan's call credits, congratulate, and return to Chat (the user
 *    taps call again to actually start). On cancel we just return to Chat.
 *  - Premium + credits → Answer goes to the live Vapi call; Decline returns.
 *  - Premium + 0 credits → "credits ended, wait for renewal".
 *
 * Expo-Go safety: RevenueCat (native) is lazy-required inside handlers; the
 * paywall is presented via services/paywall (also lazy). voiceCreditsService is
 * pure REST. So the eager import graph stays Expo-Go-safe.
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
  Vibration,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import {
  logScreenView,
  logIncomingCallShown,
  logIncomingCallAnswered,
  logIncomingCallDeclined,
  logPaywallViewed,
  logTopupPaywallViewed,
} from '../../services/firebaseAnalytics';
import { useCallStrings, interpolate } from '../../data/onboardingStrings';
import { useSoftReviewPrompt } from '../../hooks/useSoftReviewPrompt';
import { Character, characterImageSource } from '../../data/characters';
import { getVoiceState } from '../../services/voiceCreditsService';
import { presentPaywall, purchaseVoiceTopup } from '../../services/paywall';
import { auth } from '../../config/firebase';

const fallbackBg = require('../../../assets/onboarding/auth-bg.png');

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'IncomingCall'>;
  route: RouteProp<OnboardingStackParamList, 'IncomingCall'>;
};

export const IncomingCallScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const s = useCallStrings();
  // Peak moment: just upgraded to premium → ask for a review (cooldown-gated).
  const { showIfEligible, promptElement } = useSoftReviewPrompt('premium_purchased');
  const [character, setCharacter] = React.useState<Character | null>(
    route.params?.character ?? null
  );
  const [busy, setBusy] = React.useState(false);
  const busyRef = React.useRef(false);

  // Gentle pulse on the answer button.
  const pulse = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    logScreenView('Onboarding_IncomingCall');
    logIncomingCallShown(
      character?.name || 'Sarina',
      route.params?.auto ? 'auto_after_messages' : 'manual',
    );

    // Ringtone-style vibration while the call is incoming.
    Vibration.vibrate([0, 800, 600, 800, 600], true);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Load character from storage if not passed in.
    if (!route.params?.character) {
      AsyncStorage.getItem('selected_character')
        .then((raw) => raw && setCharacter(JSON.parse(raw)))
        .catch(() => {});
    }

    // Prime RevenueCat so the premium check + paywall are ready (native, guarded).
    (async () => {
      try {
        const rc = require('../../services/revenueCatService');
        await rc.initializeRevenueCat();
        const uid = auth.currentUser?.uid;
        if (uid) await rc.loginRevenueCatUser(uid);
      } catch {}
    })();

    return () => Vibration.cancel();
  }, []);

  const name = character?.name || 'Sarina';
  const bgSource = character ? characterImageSource(character) : fallbackBg;

  // Decide what happens after Answer / Decline.
  const proceed = async (action: 'answer' | 'decline') => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    Vibration.cancel();

    try {
      // Is the user premium? (RevenueCat — native, lazy.)
      let premium = false;
      try {
        premium = await require('../../services/revenueCatService').checkPremiumStatus();
      } catch {
        premium = false;
      }

      if (action === 'decline') {
        logIncomingCallDeclined(name);
      } else {
        logIncomingCallAnswered(name, premium);
      }

      if (premium) {
        if (action === 'decline') {
          navigation.goBack();
          return;
        }
        // Answer + premium → check call credits (subscription allowance + top-up).
        const { balance, topup } = await getVoiceState();
        if (balance + topup > 0) {
          navigation.replace('VoiceCall', { character: character ?? undefined });
        } else {
          // Out of credits → offer a one-time top-up, or wait for renewal.
          Alert.alert(s.creditsEndedTitle, s.creditsEndedTopupBody, [
            { text: s.maybeLater, style: 'cancel', onPress: () => navigation.goBack() },
            {
              text: s.buyMore,
              onPress: async () => {
                logTopupPaywallViewed();
                const r = await purchaseVoiceTopup();
                if (r === true) {
                  navigation.replace('VoiceCall', { character: character ?? undefined });
                } else if (r === null) {
                  Alert.alert(s.topupUnavailableTitle, s.topupUnavailableBody, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                  ]);
                } else {
                  navigation.goBack();
                }
              },
            },
          ]);
        }
        return;
      }

      // Not premium → show the paywall for BOTH answer and decline.
      logPaywallViewed('voice_call');
      const result = await presentPaywall();
      if (result === true) {
        // Purchased → allocate the plan's call credits, then congratulate.
        try {
          await require('../../services/revenueCatService').syncVoiceAllowance();
        } catch {}
        Alert.alert(s.congratsTitle, interpolate(s.congratsBody, { name }), [
          // After the "now you can call" popup, ask for a review (then return).
          { text: 'OK', onPress: () => showIfEligible(() => navigation.goBack()) },
        ]);
      } else if (result === null) {
        Alert.alert(s.unavailableTitle, s.unavailableBody, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Paywall shown, no purchase → back to chat.
        navigation.goBack();
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={bgSource} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(10,10,12,0.6)', 'rgba(10,10,12,0.2)', 'rgba(10,10,12,0.4)', 'rgba(10,10,12,0.92)']}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={[styles.ui, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 48 }]}>
        {/* Top — caller info */}
        <View style={styles.header}>
          <Text style={styles.incoming}>{s.incomingCall}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>

        {/* Bottom — actions */}
        <View style={styles.actions}>
          <View style={styles.actionCol}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={busy}
              onPress={() => proceed('decline')}
            >
              <BlurView intensity={20} tint="dark" style={styles.declineBtn}>
                {busy ? (
                  <ActivityIndicator color="#e6bcbf" />
                ) : (
                  <Ionicons name="call" size={26} color="#e6bcbf" style={styles.hangIcon} />
                )}
              </BlurView>
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: '#e6bcbf' }]}>{s.decline}</Text>
          </View>

          <View style={styles.actionCol}>
            <Animated.View style={{ transform: [{ scale: busy ? 1 : pulse }] }}>
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={busy}
                onPress={() => proceed('answer')}
                style={styles.answerBtn}
              >
                {busy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Ionicons name="call" size={26} color="#ffffff" />
                )}
              </TouchableOpacity>
            </Animated.View>
            <Text style={[styles.actionLabel, { color: '#ffb2b9' }]}>{s.answer}</Text>
          </View>
        </View>
      </View>

      {promptElement}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131315' },
  ui: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', gap: 8 },
  incoming: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 18,
    letterSpacing: 0.45,
    color: 'rgba(255,178,185,0.85)',
    textAlign: 'center',
  },
  name: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    lineHeight: 38,
    color: '#e5e1e4',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 448,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionCol: { alignItems: 'center', gap: 16 },
  declineBtn: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(57,57,59,0.4)',
  },
  // Rotate the phone glyph so it reads as "hang up".
  hangIcon: { transform: [{ rotate: '135deg' }] },
  answerBtn: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15ae27',
    shadowColor: '#4eff2a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  actionLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    letterSpacing: 0.6,
  },
});

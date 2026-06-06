/**
 * Voice Call · Active call screen
 * New flow design (Figma node 57:3)
 *
 * Live Vapi voice call with the companion. Premium-only and gated upstream by
 * IncomingCallScreen, so by the time we get here the user is premium with > 0
 * call credits. Credits (seconds) are deducted as the call runs and persisted to
 * Firestore (batched every 10s + a final flush). When the balance hits 0 we hang
 * up Vapi (which also ends the call on Vapi's servers) and tell the user to wait
 * for renewal. The End-call button hangs up + flushes the final seconds.
 *
 * Expo-Go safety: vapiService (native @vapi-ai/react-native) is lazy-required;
 * if it isn't available (Expo Go) we surface a friendly note and go back.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Animated,
  Easing,
  Platform,
  PermissionsAndroid,
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
  logVoiceCallStart,
  logVoiceCallEnd,
  logTopupPaywallViewed,
} from '../../services/firebaseAnalytics';
import { useCallStrings, interpolate } from '../../data/onboardingStrings';
import { Character, characterImageSource } from '../../data/characters';
import {
  getVoiceState,
  decrementVoiceCredits,
  formatSeconds,
} from '../../services/voiceCreditsService';
import { purchaseVoiceTopup } from '../../services/paywall';

const fallbackBg = require('../../../assets/onboarding/auth-bg.png');
const PERSIST_EVERY = 10; // flush deducted seconds to Firestore every N seconds

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'VoiceCall'>;
  route: RouteProp<OnboardingStackParamList, 'VoiceCall'>;
};

export const VoiceCallScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const s = useCallStrings();

  const [character, setCharacter] = React.useState<Character | null>(
    route.params?.character ?? null
  );
  const [connected, setConnected] = React.useState(false);
  const [remaining, setRemaining] = React.useState<number | null>(null);
  const [muted, setMuted] = React.useState(false);
  const [speaker, setSpeaker] = React.useState(true);

  // Deduction bookkeeping (refs so the interval reads live values).
  // Calls spend the subscription allowance first, then the purchased top-up.
  const initialAllowanceRef = React.useRef(0); // voice_balance_seconds at call start
  const initialTopupRef = React.useRef(0); // voice_topup_seconds at call start
  const elapsedRef = React.useRef(0); // total seconds counted while connected
  const persistedRef = React.useRef(0); // seconds already decremented in Firestore
  const tickRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const endedRef = React.useRef(false);
  const vapiRef = React.useRef<any>(null);
  const tierRef = React.useRef<string | null>(null); // 'weekly' | 'yearly' — for the renew message

  const pulse = React.useRef(new Animated.Value(0.6)).current;

  const name = character?.name || 'Sarina';
  const bgSource = character ? characterImageSource(character) : fallbackBg;

  // Persist the seconds counted since the last flush (best-effort). The window
  // [from, to] is split across the two buckets — allowance first (the first
  // `initialAllowance` seconds of the call), then top-up — so each Firestore
  // field stays an atomic decrement.
  const flush = async () => {
    const from = persistedRef.current;
    const to = elapsedRef.current;
    const unpersisted = to - from;
    if (unpersisted <= 0) return;
    persistedRef.current = to;
    const A = initialAllowanceRef.current;
    const allowanceSecs = Math.max(0, Math.min(to, A) - Math.min(from, A));
    const topupSecs = unpersisted - allowanceSecs;
    await decrementVoiceCredits({ allowanceSecs, topupSecs });
  };

  const stopTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  // Hang up Vapi (ends the call on Vapi's servers too) — guarded. Falls back to
  // a fresh require so End-call works even if the ref wasn't set yet.
  const hangUpVapi = () => {
    try {
      const v = vapiRef.current || require('../../services/vapiService');
      v?.stopCall();
    } catch (e) {
      console.warn('[VoiceCall] hangUp failed:', e);
    }
  };

  // Out of credits → offer a one-time top-up, or wait for renewal. On a successful
  // purchase we relaunch a fresh call screen so it re-reads the new balance.
  const promptOutOfCredits = () => {
    Alert.alert(s.creditsEndedTitle, s.creditsEndedTopupBody, [
      { text: s.maybeLater, style: 'cancel', onPress: () => navigation.goBack() },
      {
        text: s.buyMore,
        onPress: async () => {
          logTopupPaywallViewed();
          const r = await purchaseVoiceTopup();
          if (r === true) {
            navigation.replace('VoiceCall', { character: route.params?.character });
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
  };

  // End because credits ran out → hang up, flush, then offer a top-up.
  const endDueToCredits = async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    stopTick();
    hangUpVapi();
    await flush();
    logVoiceCallEnd(name, elapsedRef.current);
    promptOutOfCredits();
  };

  // User tapped End call.
  const handleEndCall = async () => {
    if (endedRef.current) {
      navigation.goBack();
      return;
    }
    endedRef.current = true;
    stopTick();
    hangUpVapi();
    await flush();
    logVoiceCallEnd(name, elapsedRef.current);
    navigation.goBack();
  };

  React.useEffect(() => {
    logScreenView('Onboarding_VoiceCall');

    // Status pulse dot.
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    let cancelled = false;

    (async () => {
      // Resolve character.
      let char = route.params?.character ?? null;
      if (!char) {
        try {
          const raw = await AsyncStorage.getItem('selected_character');
          if (raw) char = JSON.parse(raw);
        } catch {}
      }
      if (char && !cancelled) setCharacter(char);

      // Microphone permission (Android).
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(s.micTitle, s.micBody, [{ text: 'OK', onPress: () => navigation.goBack() }]);
            return;
          }
        } catch {
          Alert.alert(s.micTitle, s.micBody, [{ text: 'OK', onPress: () => navigation.goBack() }]);
          return;
        }
      }

      // Initial balances (seconds): subscription allowance + purchased top-up.
      const { balance, topup, tier } = await getVoiceState();
      if (cancelled) return;
      tierRef.current = tier;
      initialAllowanceRef.current = balance;
      initialTopupRef.current = topup;
      setRemaining(balance + topup);
      if (balance + topup <= 0) {
        promptOutOfCredits();
        return;
      }

      // Load Vapi (native — lazy). Unavailable in Expo Go.
      let vapi: any;
      try {
        vapi = require('../../services/vapiService');
        vapiRef.current = vapi;
      } catch {
        Alert.alert(s.unavailableTitle, s.unavailableBody, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      // Clear any listeners left over from a previous call so stale closures
      // can't fire into this one (e.g. double credit deduction).
      try {
        vapi.clearCallListeners();
      } catch {}

      // Wire Vapi events.
      vapi.onCallStart(() => {
        if (cancelled || endedRef.current) return;
        setConnected(true);
        logVoiceCallStart(name);
        // Start the per-second credit clock.
        stopTick();
        tickRef.current = setInterval(() => {
          if (endedRef.current) return;
          elapsedRef.current += 1;
          const left =
            initialAllowanceRef.current + initialTopupRef.current - elapsedRef.current;
          setRemaining(Math.max(0, left));
          if (elapsedRef.current - persistedRef.current >= PERSIST_EVERY) {
            flush();
          }
          if (left <= 0) {
            endDueToCredits();
          }
        }, 1000);
      });

      vapi.onCallEnd(async () => {
        // Remote/system hang-up — stop counting and flush the final seconds.
        if (endedRef.current) return;
        endedRef.current = true;
        stopTick();
        await flush();
        logVoiceCallEnd(name, elapsedRef.current);
        if (!cancelled) navigation.goBack();
      });

      vapi.onError(async (err: any) => {
        console.warn('[VoiceCall] Vapi error:', err);
        if (endedRef.current) return;
        endedRef.current = true;
        stopTick();
        await flush();
        Alert.alert(s.callFailed, undefined, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      });

      // Start the call.
      try {
        await vapi.startCall();
      } catch (e) {
        console.warn('[VoiceCall] startCall failed:', e);
        if (endedRef.current) return;
        endedRef.current = true;
        stopTick();
        Alert.alert(s.callFailed, undefined, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    })();

    // Cleanup: stop everything + flush remaining seconds + drop listeners.
    return () => {
      cancelled = true;
      endedRef.current = true;
      stopTick();
      hangUpVapi();
      flush();
      try {
        vapiRef.current?.clearCallListeners();
      } catch {}
    };
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    try {
      vapiRef.current?.setMuted(next);
    } catch {}
  };

  const statusText = connected
    ? `${s.inProgress} ${interpolate(s.timeLeft, { time: formatSeconds(remaining ?? 0) })}`
    : s.connecting;

  return (
    <View style={styles.container}>
      <ImageBackground source={bgSource} style={StyleSheet.absoluteFill} resizeMode="cover">
        {/* Vignette + top/bottom gradients */}
        <LinearGradient
          colors={['rgba(19,19,21,0.9)', 'rgba(19,19,21,0)']}
          style={[styles.edgeGradient, { top: 0, height: 220 }]}
        />
        <LinearGradient
          colors={['rgba(19,19,21,0)', 'rgba(19,19,21,0.6)', 'rgba(19,19,21,0.92)']}
          style={[styles.edgeGradient, { bottom: 0, height: 280 }]}
        />
      </ImageBackground>

      {/* Top app bar — Sarina wordmark */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.wordmark}>Sarina</Text>
      </View>

      {/* Call context */}
      <View style={[styles.context, { top: insets.top + 72 }]}>
        <Text style={styles.talkingTo}>{interpolate(s.talkingTo, { name })}</Text>
        <View style={styles.statusRow}>
          <Animated.View style={[styles.dot, { opacity: pulse }]} />
          <Text style={styles.status}>{statusText}</Text>
        </View>
      </View>

      {/* Bottom control panel */}
      <BlurView
        intensity={24}
        tint="dark"
        style={[styles.controls, { bottom: insets.bottom + 24 }]}
      >
        <TouchableOpacity style={styles.ctrlBtn} activeOpacity={0.8} onPress={toggleMute}>
          <Ionicons name={muted ? 'mic-off' : 'mic'} size={22} color={muted ? '#ff5070' : '#e5e1e4'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.endBtn} activeOpacity={0.85} onPress={handleEndCall}>
          <Ionicons name="call" size={24} color="#ffffff" style={styles.hangIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctrlBtn}
          activeOpacity={0.8}
          onPress={() => setSpeaker((v) => !v)}
        >
          <Ionicons name={speaker ? 'volume-high' : 'volume-mute'} size={22} color="#e5e1e4" />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131315' },
  edgeGradient: { position: 'absolute', left: 0, right: 0 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    letterSpacing: -0.8,
    color: '#ffb2b9',
    textShadowColor: 'rgba(255,42,95,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  context: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  talkingTo: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 28,
    lineHeight: 35,
    color: '#e5e1e4',
    textAlign: 'center',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00e475',
  },
  status: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#a0a0a5',
  },
  controls: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(21,21,26,0.8)',
    shadowColor: '#ff2a5f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 16,
  },
  ctrlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff5070',
    shadowColor: '#ff2a5f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 12,
  },
  hangIcon: { transform: [{ rotate: '135deg' }] },
});

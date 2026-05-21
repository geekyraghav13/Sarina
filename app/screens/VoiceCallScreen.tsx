import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { canStartCall, subscribeToBalance } from '../services/creditService';
import { usePaymentStore } from '../store/paymentStore';
import * as RevenueCatService from '../services/revenueCatService';
import { startCall, stopCall, onCallStart, onCallEnd, onError } from '../services/vapiService';
import { setDocumentREST, decrementVoiceBalanceAtomic, recordCallStart, clearActiveCall } from '../services/firestoreRestService';
import { getCurrentUser } from '../services/authService';
import {
  logVoiceCallStarted,
  logVoiceCallEnded,
  logCreditDeductionBatch,
  logCreditsExhausted,
} from '../services/analyticsService';
import { useSoftReviewPrompt } from '../hooks/useSoftReviewPrompt';

// Minimum call duration that counts as a "satisfying" experience worth
// asking for a review. Anything shorter is likely a misfire.
const REVIEW_PROMPT_MIN_CALL_SECONDS = 60;

type VoiceCallScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VoiceCall'
>;

type VoiceCallScreenRouteProp = RouteProp<RootStackParamList, 'VoiceCall'>;

interface VoiceCallScreenProps {
  navigation: VoiceCallScreenNavigationProp;
  route: VoiceCallScreenRouteProp;
}


export const VoiceCallScreen: React.FC<VoiceCallScreenProps> = ({
  navigation,
  route,
}) => {
  const { characterName, characterImageUrl, characterId, characterProfile } = route.params;

  // Get premium status from store
  const { isPremium } = usePaymentStore();

  const { showIfEligible: showReviewPromptIfEligible, promptElement: reviewPromptElement } =
    useSoftReviewPrompt('voice_call_ended');

  // State management
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for credit deduction
  const creditDeductionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const premiumCheckIntervalRef = useRef<NodeJS.Timeout | null>(null); // SCENARIO 8 FIX: Track premium check interval
  const balanceUnsubscribeRef = useRef<(() => void) | null>(null);
  const balanceRef = useRef<number | null>(null);
  const creditsExhaustedShownRef = useRef<boolean>(false);
  const secondsAccumulatedRef = useRef<number>(0); // BATCHING: Track seconds since last deduction
  const callStartTimeRef = useRef<number | null>(null); // CRASH RECOVERY: Track call start time
  const initialBalanceRef = useRef<number | null>(null); // ANALYTICS: Track initial balance for call
  const totalCallSecondsRef = useRef<number>(0); // ANALYTICS: Track total call duration
  const manuallyEndedRef = useRef<boolean>(false); // DOUBLE-DEDUCTION FIX: Track if call was manually ended

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  // Initialize call and Vapi listeners
  useEffect(() => {
    const initializeCall = async () => {
      console.log('🎙️ Initializing Vapi voice call...');

      // Request microphone permission on Android
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'This app needs access to your microphone for voice calls.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              'Permission Required',
              'Microphone permission is required for voice calls.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
            return;
          }
          console.log('🎤 Microphone permission granted');
        } catch (err) {
          console.error('❌ Error requesting microphone permission:', err);
          Alert.alert('Error', 'Failed to request microphone permission', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return;
        }
      }

      // Check premium status first - premium users have unlimited voice credits
      const premiumStatus = await RevenueCatService.checkPremiumStatus();
      console.log('🔍 Initial premium status check:', premiumStatus);

      let balanceCheck;
      if (!premiumStatus) {
        // Only check credit balance for non-premium users
        balanceCheck = await canStartCall();
        if (!balanceCheck.allowed) {
          Alert.alert(
            'Not enough credits',
            balanceCheck.message || 'You need at least 10 seconds to start a call.',
            [
              {
                text: 'Get More Credits',
                onPress: () => {
                  navigation.replace('Paywall', {
                    characterName,
                    characterImageUrl,
                    callAction: 'pick',
                    returnScreen: 'Chat',
                  });
                },
              },
              {
                text: 'Cancel',
                onPress: () => navigation.goBack(),
                style: 'cancel',
              },
            ]
          );
          return;
        }
      } else {
        console.log('✅ Premium user - skipping balance check, allowing call');
        // Set a dummy balance for premium users
        balanceCheck = { allowed: true, balance: 999999 };
      }

      // Subscribe to real-time balance updates
      balanceUnsubscribeRef.current = subscribeToBalance(async (newBalance) => {
        console.log('💰 Balance updated:', newBalance);
        setBalance(newBalance);
        balanceRef.current = newBalance; // Update ref for interval access

        // CRITICAL: Only check balance for non-premium users
        // Premium users have unlimited voice credits
        // Check directly from RevenueCat to avoid store sync timing issues
        const premiumStatus = await RevenueCatService.checkPremiumStatus();
        if (premiumStatus) {
          console.log('✅ Premium user - ignoring balance check');
          return;
        }

        // If credits reach 0 during call, stop immediately
        if (newBalance <= 0 && isCallActive && !creditsExhaustedShownRef.current) {
          console.log('❌ Credits depleted, stopping call');
          creditsExhaustedShownRef.current = true;
          handleCreditsExhausted();
        }
      });

      // Setup Vapi event listeners
      onCallStart(() => {
        console.log('📞 Vapi call started');
        setIsCallActive(true);
        setIsConnecting(false);
        setErrorMessage(null);

        // Log voice call started to analytics
        const user = getCurrentUser();
        if (user) {
          initialBalanceRef.current = balanceRef.current;
          totalCallSecondsRef.current = 0;
          logVoiceCallStarted(
            user.uid,
            characterName,
            balanceRef.current ?? 0,
            isPremium
          );
        }

        startCreditDeduction();
      });

      onCallEnd(() => {
        console.log('📴 Vapi call ended');
        setIsCallActive(false);

        // DOUBLE-DEDUCTION FIX: Only stop credit deduction if NOT manually ended
        // If manually ended, stopCreditDeduction was already called in handleEndCall
        if (!manuallyEndedRef.current) {
          console.log('✅ Call ended by remote/system - stopping credit deduction');
          stopCreditDeduction();
        } else {
          console.log('⚠️ Call was manually ended - credit deduction already stopped, skipping');
        }

        // Log voice call ended to analytics
        const user = getCurrentUser();
        if (user && !manuallyEndedRef.current) {
          const creditsUsed = (initialBalanceRef.current ?? 0) - (balanceRef.current ?? 0);
          logVoiceCallEnded(
            user.uid,
            characterName,
            totalCallSecondsRef.current,
            creditsUsed,
            balanceRef.current ?? 0,
            'normal'
          );
        }
      });

      onError((error: any) => {
        console.error('❌ Vapi error:', error);
        setErrorMessage('Call failed, try again');
        Alert.alert('Call Failed', 'Call failed, try again');
        setIsCallActive(false);
        setIsConnecting(false);
        stopCreditDeduction();
      });

      // Start the call
      try {
        console.log('📞 Starting Vapi call...');
        setBalance(balanceCheck.balance);
        balanceRef.current = balanceCheck.balance; // Initialize ref with balance
        await startCall();
        console.log('✅ Vapi call initiated successfully');
      } catch (error) {
        console.error('❌ Failed to start Vapi call:', error);
        setErrorMessage('Call failed, try again');
        setIsConnecting(false);
        Alert.alert(
          'Call Failed',
          'Unable to start the call. Please check your internet connection and try again.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      // Set manually ended flag to prevent double deduction on cleanup
      manuallyEndedRef.current = true;
      stopCall();
      stopCreditDeduction();
      creditsExhaustedShownRef.current = false; // Reset flag on unmount
      if (balanceUnsubscribeRef.current) {
        balanceUnsubscribeRef.current();
      }
      // SCENARIO 8 FIX: Clear premium check interval to prevent memory leaks
      if (premiumCheckIntervalRef.current) {
        clearInterval(premiumCheckIntervalRef.current);
        premiumCheckIntervalRef.current = null;
      }
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive]);

  // Credit deduction functions
  const startCreditDeduction = async () => {
    console.log('💳 Starting credit deduction timer...');

    // CRITICAL: Premium users have UNLIMITED voice credits - skip deduction entirely
    // Check premium status directly from RevenueCat to avoid store sync timing issues
    const premiumStatus = await RevenueCatService.checkPremiumStatus();
    console.log('🔍 Checking premium status for credit deduction:', premiumStatus);

    if (premiumStatus) {
      console.log('✅ Premium user detected - unlimited voice credits, skipping deduction');

      // SCENARIO 8: Mid-call subscription expiry monitoring
      // Check premium status every minute during the call
      // SCENARIO 8 FIX: Store interval in ref so it can be cleared on cleanup
      premiumCheckIntervalRef.current = setInterval(async () => {
        const currentPremiumStatus = await RevenueCatService.checkPremiumStatus();
        console.log('🔍 Mid-call premium status check:', currentPremiumStatus);

        if (!currentPremiumStatus) {
          console.warn('⚠️ Premium status expired during call - gracefully completing call');

          // Clear the interval
          if (premiumCheckIntervalRef.current) {
            clearInterval(premiumCheckIntervalRef.current);
            premiumCheckIntervalRef.current = null;
          }

          // Show alert AFTER call ends naturally
          // Don't cut the call mid-conversation for better UX
          Alert.alert(
            'Subscription Expired',
            'Your premium subscription has expired. This call will complete, but you\'ll need to renew to make future calls.',
            [{ text: 'OK' }]
          );
        }
      }, 60000); // Check every 60 seconds

      return;
    }

    const user = getCurrentUser();
    if (!user) {
      console.error('No user found for credit deduction');
      return;
    }

    // CRASH RECOVERY: Record call start timestamp with retry logic
    const callId = `${user.uid}_${Date.now()}`;
    callStartTimeRef.current = Date.now();
    const recordSuccess = await recordCallStart(user.uid, callId, characterName, balanceRef.current || 0);

    if (!recordSuccess) {
      console.warn('⚠️ Failed to record call start after retries - crash recovery may be incomplete');
      // TODO: Log to analytics for monitoring production failures
      // logEvent('call_start_record_failed', { uid: user.uid, callId });
    }

    // BATCHED DEDUCTION: Accumulate seconds locally, batch Firestore writes
    // This reduces Firestore write costs and avoids hitting 1 write/second/document limit
    const BATCH_INTERVAL_SECONDS = 10; // Deduct every 10 seconds instead of every 1 second

    creditDeductionIntervalRef.current = setInterval(async () => {
      try {
        // Check if we've already shown the exhausted alert
        if (creditsExhaustedShownRef.current) {
          return;
        }

        // Accumulate 1 second
        secondsAccumulatedRef.current += 1;
        totalCallSecondsRef.current += 1; // Track total call duration for analytics

        // Check local balance estimate
        const estimatedBalance = (balanceRef.current || 0) - secondsAccumulatedRef.current;

        // Warn user when getting low (but don't end call yet - wait for server confirmation)
        if (estimatedBalance <= 10 && estimatedBalance > 0) {
          console.warn(`⚠️ Low balance: ~${estimatedBalance}s remaining`);
        }

        // BATCHED WRITE: Only write to Firestore every N seconds
        if (secondsAccumulatedRef.current >= BATCH_INTERVAL_SECONDS) {
          const secondsToDeduct = secondsAccumulatedRef.current;
          secondsAccumulatedRef.current = 0; // Reset accumulator

          console.log(`💰 Batch deducting ${secondsToDeduct} seconds...`);

          // CONCURRENT SESSION FIX: Use atomic decrement to prevent double-spend
          const newBalance = await decrementVoiceBalanceAtomic(user.uid, secondsToDeduct);

          if (newBalance === null) {
            console.error('❌ Failed to atomically decrement balance');
            // Re-add seconds back to accumulator to retry next batch
            secondsAccumulatedRef.current += secondsToDeduct;
            return;
          }

          // Update local ref with server-confirmed balance
          balanceRef.current = newBalance;
          console.log(`✅ Batch deducted ${secondsToDeduct}s atomically. New balance: ${newBalance}s`);

          // Log batch deduction to analytics
          logCreditDeductionBatch(
            user.uid,
            secondsToDeduct,
            newBalance,
            totalCallSecondsRef.current
          );

          // CRITICAL: If balance hit 0 or negative, end call immediately
          if (newBalance <= 0) {
            console.log('❌ Credits depleted after batch deduction, ending call NOW');
            creditsExhaustedShownRef.current = true;
            stopCreditDeduction();
            stopCall();
            await clearActiveCall(user.uid); // Clear crash recovery record
            handleCreditsExhausted();
            return;
          }
        }
      } catch (error) {
        console.error('❌ Error deducting credits:', error);
      }
    }, 1000); // Check every 1 second, but only write every BATCH_INTERVAL_SECONDS
  };

  const stopCreditDeduction = async () => {
    // CRITICAL FIX: Prevent double-deduction by checking if already stopped
    if (!creditDeductionIntervalRef.current && secondsAccumulatedRef.current === 0) {
      console.log('⚠️ Credit deduction already stopped, skipping duplicate call');
      return;
    }

    if (creditDeductionIntervalRef.current) {
      clearInterval(creditDeductionIntervalRef.current);
      creditDeductionIntervalRef.current = null;
      console.log('🛑 Credit deduction stopped');
    }

    // BATCHED DEDUCTION: Deduct any remaining accumulated seconds
    const user = getCurrentUser();
    if (user && secondsAccumulatedRef.current > 0) {
      const finalSeconds = secondsAccumulatedRef.current;
      secondsAccumulatedRef.current = 0; // Reset accumulator IMMEDIATELY to prevent race condition

      console.log(`💰 Final batch deduction: ${finalSeconds} seconds`);

      try {
        const newBalance = await decrementVoiceBalanceAtomic(user.uid, finalSeconds);
        if (newBalance !== null) {
          balanceRef.current = newBalance;
          console.log(`✅ Final deduction complete. Final balance: ${newBalance}s`);
        }
      } catch (error) {
        console.error('❌ Error in final credit deduction:', error);
      }

      // CRASH RECOVERY: Clear active call record on normal end
      await clearActiveCall(user.uid);
    }
  };

  const handleCreditsExhausted = async () => {
    console.log('📵 Credits exhausted, ending call');

    // DOUBLE-DEDUCTION FIX: Mark call as manually ended to prevent onCallEnd from deducting again
    manuallyEndedRef.current = true;

    // Log credits exhausted to analytics
    const user = getCurrentUser();
    if (user) {
      logCreditsExhausted(user.uid, characterName, totalCallSecondsRef.current);
      const creditsUsed = (initialBalanceRef.current ?? 0) - (balanceRef.current ?? 0);
      logVoiceCallEnded(
        user.uid,
        characterName,
        totalCallSecondsRef.current,
        creditsUsed,
        0,
        'credits_exhausted'
      );
    }

    // CRITICAL: Stop credit deduction FIRST, before stopping call
    stopCreditDeduction();
    stopCall();

    const premium = await RevenueCatService.checkPremiumStatus();
    Alert.alert(
      'Out of Credits!',
      `Your voice call credits have ended.\n\nPurchase more credits to continue talking with ${characterName}!`,
      [
        {
          text: 'Buy More Credits',
          onPress: () => {
            if (premium) {
              navigation.replace('CustomCreditsPaywall', {
                characterName,
                characterImageUrl,
                callAction: 'pick',
                returnScreen: 'Chat',
              });
            } else {
              navigation.replace('Paywall', {
                characterName,
                characterImageUrl,
                callAction: 'pick',
                returnScreen: 'Chat',
              });
            }
          },
        },
        {
          text: 'Later',
          onPress: () => {
            navigation.navigate('Chat', { fromOnboarding: false });
          },
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  };

  // Pulsing avatar animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Waveform animations
  useEffect(() => {
    if (isCallActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(waveAnim1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }),
        ])
      ).start();

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim2, {
              toValue: 1,
              duration: 500,
              useNativeDriver: false,
            }),
            Animated.timing(waveAnim2, {
              toValue: 0,
              duration: 500,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }, 100);

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim3, {
              toValue: 1,
              duration: 600,
              useNativeDriver: false,
            }),
            Animated.timing(waveAnim3, {
              toValue: 0,
              duration: 600,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }, 200);
    }
  }, [isCallActive]);

  // Format time as MM:SS
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get balance color based on remaining time
  const getBalanceColor = (seconds: number | null) => {
    if (seconds === null) return '#FFFFFF';
    if (seconds > 30) return '#10B981'; // Green: >30 seconds
    if (seconds > 10) return '#F59E0B'; // Yellow: 11-30 seconds
    return '#EF4444'; // Red: ≤10 seconds
  };

  // Check if low balance warning should show
  const shouldShowLowBalanceWarning = (seconds: number | null) => {
    return seconds !== null && seconds <= 10 && seconds > 0;
  };

  // Get call status text
  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isCallActive) return 'Connected';
    return 'Call ended';
  };

  const handleEndCall = () => {
    Alert.alert('End Call', 'Are you sure you want to end this call?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'End Call',
        style: 'destructive',
        onPress: async () => {
          // DOUBLE-DEDUCTION FIX: Mark call as manually ended to prevent onCallEnd from deducting again
          manuallyEndedRef.current = true;

          // CRITICAL: Stop credit deduction FIRST, before stopping call
          stopCreditDeduction();
          // SCENARIO 8 FIX: Also clear premium check interval
          if (premiumCheckIntervalRef.current) {
            clearInterval(premiumCheckIntervalRef.current);
            premiumCheckIntervalRef.current = null;
          }
          stopCall();

          // Capture duration BEFORE navigation unmounts this screen.
          const durationForReview = totalCallSecondsRef.current || callDuration;
          const navigateBack = () =>
            navigation.navigate('Chat', { fromOnboarding: false });

          if (durationForReview >= REVIEW_PROMPT_MIN_CALL_SECONDS) {
            await showReviewPromptIfEligible(navigateBack);
          } else {
            navigateBack();
          }
        },
      },
    ]);
  };

  // Wave height animation
  const wave1Height = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const wave2Height = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const wave3Height = waveAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Gradient Background */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFill}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Large Avatar with Glow Effect */}
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {characterImageUrl ? (
            <Image
              source={{ uri: characterImageUrl }}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
              placeholder={require('../../assets/icon.png')}
              placeholderContentFit="contain"
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Text style={styles.placeholderText}>
                {characterName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Animated Glow Rings */}
          {isCallActive && (
            <>
              <View style={[styles.glowRing, styles.glowRing1]} />
              <View style={[styles.glowRing, styles.glowRing2]} />
            </>
          )}
        </Animated.View>

        {/* Character Name */}
        <Text style={styles.characterName}>{characterName}</Text>

        {/* Call Status */}
        <View style={styles.statusContainer}>
          {isCallActive && (
            <View style={styles.statusDotActive} />
          )}
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {/* Call Duration */}
        <Text style={styles.durationText}>
          {formatTime(callDuration)}
        </Text>

        {/* Waveform Visualization */}
        {isCallActive && (
          <View style={styles.waveformContainer}>
            <Animated.View style={[styles.wavebar, styles.wavebarTall, { opacity: wave1Height }]} />
            <Animated.View style={[styles.wavebar, styles.wavebarMedium, { opacity: wave2Height }]} />
            <Animated.View style={[styles.wavebar, styles.wavebarShort, { opacity: wave3Height }]} />
            <Animated.View style={[styles.wavebar, styles.wavebarTall, { opacity: wave1Height }]} />
            <Animated.View style={[styles.wavebar, styles.wavebarMedium, { opacity: wave2Height }]} />
            <Animated.View style={[styles.wavebar, styles.wavebarShort, { opacity: wave3Height }]} />
            <Animated.View style={[styles.wavebar, styles.wavebarTall, { opacity: wave1Height }]} />
            <Animated.View style={[styles.wavebar, styles.wavebarMedium, { opacity: wave2Height }]} />
          </View>
        )}

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>CREDITS REMAINING</Text>
          <Text style={[styles.balanceTime, { color: getBalanceColor(balance) }]}>
            {formatTime(balance)}
          </Text>
          {shouldShowLowBalanceWarning(balance) && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>LOW BALANCE</Text>
            </View>
          )}
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* End Call Button */}
        {isCallActive && (
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.endCallGradient}
            >
              <Text style={styles.endCallIcon}>📞</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
      {reviewPromptElement}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#8B5CF6',
    backgroundColor: '#1a1a1a',
  },
  placeholderAvatar: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 110,
    borderWidth: 3,
    borderColor: 'rgba(139, 92, 246, 0.6)',
  },
  glowRing1: {
    width: 180,
    height: 180,
    top: -10,
    left: -10,
  },
  glowRing2: {
    width: 200,
    height: 200,
    top: -20,
    left: -20,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  characterName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 10,
  },
  statusText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  durationText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 2,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 6,
    marginBottom: 24,
  },
  wavebar: {
    width: 6,
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  wavebarTall: {
    height: 45,
  },
  wavebarMedium: {
    height: 30,
  },
  wavebarShort: {
    height: 18,
  },
  balanceContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 52, 96, 0.6)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    minWidth: 220,
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
  },
  balanceTime: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  warningBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  warningText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 30,
    gap: 40,
  },
  micButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    shadowColor: '#10B981',
  },
  micButtonGradient: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  micIcon: {
    fontSize: 42,
  },
  micLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  speakerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  speakerButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
  },
  speakerIcon: {
    fontSize: 28,
  },
  speakerLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  endCallButton: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  endCallGradient: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallIcon: {
    fontSize: 32,
    transform: [{ rotate: '135deg' }],
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useVoiceCall, CallState } from '../services/voiceCallService';
import { getCurrentUser } from '../services/authService';
import { canStartCall } from '../services/creditService';
import { usePaymentStore } from '../store/paymentStore';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

type VoiceCallScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VoiceCall'
>;

type VoiceCallScreenRouteProp = RouteProp<RootStackParamList, 'VoiceCall'>;

interface VoiceCallScreenProps {
  navigation: VoiceCallScreenNavigationProp;
  route: VoiceCallScreenRouteProp;
}

const { width, height } = Dimensions.get('window');

export const VoiceCallScreen: React.FC<VoiceCallScreenProps> = ({
  navigation,
  route,
}) => {
  const { characterName, characterImageUrl, characterId, characterProfile } = route.params;

  // Get premium status from store
  const { isPremium } = usePaymentStore();

  const {
    state,
    balance,
    error,
    connect,
    disconnect,
    startCall,
    endCall,
    sendText,
    setOnCutOff,
    setOnTextResponse,
  } = useVoiceCall();

  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastAIMessage, setLastAIMessage] = useState<string>('');

  const recordingRef = useRef<Audio.Recording | null>(null);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeCall = async () => {
      console.log('🎙️ Initializing voice call...');
      console.log('💎 Premium status:', isPremium);

      // Check if user has premium subscription OR sufficient balance
      // After purchase, isPremium is set immediately but balance might sync later
      if (!isPremium) {
        // Only check balance if not premium
        console.log('💰 Checking credit balance...');
        const balanceCheck = await canStartCall();

        if (!balanceCheck.allowed) {
          console.warn('❌ Insufficient balance:', balanceCheck.message);
          Alert.alert(
            'Insufficient Balance',
            balanceCheck.message || 'You need at least 10 seconds to start a call.',
            [
              {
                text: 'Purchase More',
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
      }

      console.log('✅ User can start call - Premium or sufficient balance');

      // Request audio permissions
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Microphone Permission', 'Please allow microphone access to use voice calling.');
          return;
        }

        // Set audio mode for recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('❌ Error requesting audio permissions:', error);
      }

      // Connect to WebSocket
      await connect();

      // Set cutoff callback
      setOnCutOff((reason) => {
        console.log('📵 Call cut off:', reason);
        Alert.alert(
          'Time Limit Reached! ⏱️',
          `Your voice call time has ended. All your voice minutes have been used up.\n\nPurchase more minutes to continue talking with ${characterName}!`,
          [
            {
              text: 'Buy More Minutes',
              onPress: () => {
                disconnect();
                navigation.replace('Paywall', { characterName, characterImageUrl });
              },
              style: 'default',
            },
            {
              text: 'Later',
              onPress: () => {
                disconnect();
                navigation.navigate('Chat', { fromOnboarding: false });
              },
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      });

      // Set text response callback for TTS
      setOnTextResponse((text) => {
        console.log('🗣️ AI response:', text);
        setLastAIMessage(text);
        speakText(text);
      });
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      disconnect();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      Speech.stop();
    };
  }, []);

  // Start call when ready
  useEffect(() => {
    if (state === CallState.READY && !isCallActive) {
      console.log('✅ WebSocket ready, starting call...');
      startCall(characterId, characterName, characterProfile);
      setIsCallActive(true);
    }
  }, [state, isCallActive]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state === CallState.CALLING) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state]);

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
    if (state === CallState.CALLING) {
      // Wave 1
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

      // Wave 2 (delayed)
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

      // Wave 3 (more delayed)
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
  }, [state]);

  // Format time as MM:SS
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // NEW: Task 2.3 - Get balance color based on remaining time
  const getBalanceColor = (seconds: number | null) => {
    if (seconds === null) return '#FFFFFF';
    if (seconds > 30) return '#10B981'; // Green: >30 seconds
    if (seconds > 10) return '#F59E0B'; // Yellow: 11-30 seconds
    return '#EF4444'; // Red: ≤10 seconds
  };

  // NEW: Task 2.3 - Check if low balance warning should show
  const shouldShowLowBalanceWarning = (seconds: number | null) => {
    return seconds !== null && seconds <= 10 && seconds > 0;
  };

  // Text-to-Speech function
  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      console.log('🔊 Speaking:', text);

      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.1,
        rate: 0.95,
        voice: 'com.apple.ttsbundle.Samantha-compact', // Female voice on iOS
        onDone: () => {
          setIsSpeaking(false);
          console.log('✅ Finished speaking');
        },
        onError: (error) => {
          console.error('❌ TTS error:', error);
          setIsSpeaking(false);
        },
      });
    } catch (error) {
      console.error('❌ Error speaking text:', error);
      setIsSpeaking(false);
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      console.log('🎙️ Starting recording...');
      setIsRecording(true);

      // Stop TTS if speaking
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      console.log('✅ Recording started');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  // Stop recording and send audio
  const stopRecording = async () => {
    try {
      if (!recordingRef.current) {
        console.warn('⚠️ No active recording');
        return;
      }

      console.log('🛑 Stopping recording...');

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      setIsRecording(false);
      recordingRef.current = null;

      if (uri) {
        console.log('✅ Recording stopped. URI:', uri);
        // For now, send a text message instead of audio
        // TODO: Implement audio-to-base64 conversion and send via sendAudio
        sendText('Hello! (Audio recording feature coming soon)');
      }
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      setIsRecording(false);
    }
  };

  // Get call status text
  const getStatusText = () => {
    switch (state) {
      case CallState.CONNECTING:
        return 'Connecting...';
      case CallState.AUTHENTICATING:
        return 'Authenticating...';
      case CallState.READY:
        return 'Starting call...';
      case CallState.CALLING:
        return 'Connected';
      case CallState.ERROR:
        return 'Connection error';
      default:
        return 'Connecting...';
    }
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
        onPress: () => {
          endCall();
          disconnect();
          navigation.navigate('Chat', { fromOnboarding: false });
        },
      },
    ]);
  };

  // Wave height animation - using opacity instead of height for native driver support
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

      {/* Main Content - Centered Layout */}
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
          {state === CallState.CALLING && (
            <>
              <View style={[styles.glowRing, styles.glowRing1]} />
              <View style={[styles.glowRing, styles.glowRing2]} />
            </>
          )}
        </Animated.View>

        {/* Character Name */}
        <Text style={styles.characterName}>{characterName}</Text>

        {/* Call Status with Icon */}
        <View style={styles.statusContainer}>
          {state === CallState.CALLING && (
            <View style={styles.statusDotActive} />
          )}
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {/* Call Duration - Large Display */}
        <Text style={styles.durationText}>
          {formatTime(callDuration)}
        </Text>

        {/* Waveform Visualization - Bigger & Better */}
        {state === CallState.CALLING && (
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

        {/* Balance Display - Modern Card */}
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
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Microphone Button */}
        {state === CallState.CALLING && (
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isRecording ? ['#10B981', '#059669'] : ['#8B5CF6', '#7C3AED']}
              style={styles.micButtonGradient}
            >
              <Text style={styles.micIcon}>{isRecording ? '🎙️' : '🎤'}</Text>
            </LinearGradient>
            <Text style={styles.micLabel}>
              {isRecording ? 'Listening...' : 'Tap to Speak'}
            </Text>
          </TouchableOpacity>
        )}

        {/* End Call Button - Always enabled to allow user to exit even if connection lost */}
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
      </View>
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

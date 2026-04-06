import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useVoiceCall, CallState } from '../services/voiceCallService';
import { canStartCall } from '../services/creditService';
import { usePaymentStore } from '../store/paymentStore';
import * as RevenueCatService from '../services/revenueCatService';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { ExpoPlayAudioStream, type Subscription, type RecordingConfig, type AudioDataEvent } from '@saltmango/expo-audio-stream';

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

  const {
    state,
    balance,
    error,
    connect,
    disconnect,
    startCall,
    endCall,
    sendAudio,
    setOnCutOff,
    setOnTextResponse,
    setOnAudioResponse,
  } = useVoiceCall();

  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // Audio streaming refs
  const audioStreamRef = useRef<Subscription | null>(null);
  const audioChunksRef = useRef<string[]>([]);
  const isStreamingRef = useRef<boolean>(false);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeCall = async () => {
      console.log('🎙️ Initializing voice call...');
      console.log('💎 Premium status from store:', isPremium);

      // Small delay to ensure all native modules are initialized
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check credit balance
      console.log('💰 Checking credit balance...');
      const balanceCheck = await canStartCall();
      console.log('💰 Balance check result:', {
        allowed: balanceCheck.allowed,
        balance: balanceCheck.balance,
        message: balanceCheck.message
      });

      // If user doesn't have enough credits, redirect to paywall
      if (!balanceCheck.allowed) {
        console.warn('❌ Insufficient credits:', balanceCheck.message);
        Alert.alert(
          'Insufficient Credits',
          balanceCheck.message || 'You need at least 10 seconds to start a call. Purchase a subscription to get more credits!',
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

      console.log('✅ User has sufficient credits to start call:', balanceCheck.balance, 'seconds');

      // Check audio permissions
      try {
        console.log('🎤 Checking audio permissions...');
        const { status: currentStatus } = await Audio.getPermissionsAsync();
        console.log('🎤 Current permission status:', currentStatus);

        if (currentStatus !== 'granted') {
          console.log('⚠️ Audio permissions not pre-granted, requesting now...');
          const { status } = await Audio.requestPermissionsAsync();
          console.log('🎤 Permission status:', status);

          if (status !== 'granted') {
            Alert.alert('Microphone Permission', 'Please allow microphone access to use voice calling.');
            navigation.goBack();
            return;
          }
        }

        console.log('🎵 Setting audio mode...');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: !isSpeakerOn,
        });
        console.log('✅ Audio mode set successfully');

        console.log('✅ Audio recording ready for streaming');

      } catch (error: any) {
        console.error('❌ Error initializing audio:', error);
        console.error('❌ Error stack:', error?.stack);
        console.error('❌ Error message:', error?.message);

        Alert.alert(
          'Audio Initialization Error',
          'Unable to initialize audio. Please restart the app and try again.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
            },
          ]
        );
        return;
      }

      // Connect to WebSocket
      await connect();

      // Set cutoff callback
      setOnCutOff(async (reason) => {
        console.log('📵 Call cut off:', reason);
        console.log('💎 Checking premium status for paywall navigation...');

        const premium = await RevenueCatService.checkPremiumStatus();
        console.log('💎 Premium status result:', premium);

        Alert.alert(
          'Out of Credits! ⏱️',
          `Your voice call credits have ended.\n\nPurchase more credits to continue talking with ${characterName}!`,
          [
            {
              text: 'Buy More Credits',
              onPress: () => {
                disconnect();

                if (premium) {
                  console.log('💎 Premium user - Navigating to CustomCreditsPaywall');
                  navigation.replace('CustomCreditsPaywall', {
                    characterName,
                    characterImageUrl,
                    callAction: 'pick',
                    returnScreen: 'Chat',
                  });
                } else {
                  console.log('💎 Non-premium user - Navigating to Paywall');
                  navigation.replace('Paywall', {
                    characterName,
                    characterImageUrl,
                    callAction: 'pick',
                    returnScreen: 'Chat',
                  });
                }
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
        speakText(text);
      });

      // Set audio response callback (if backend sends PCM audio)
      setOnAudioResponse((audioData) => {
        console.log('🔊 Received audio response from backend');
        playAudioResponse(audioData);
      });
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      disconnect();
      stopAudioStream();
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
  }, [state]);

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

  // Text-to-Speech function
  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      console.log('🔊 Speaking:', text);

      Speech.speak(text, {
        language: 'en-US',
        pitch: 0.95,
        rate: 1.0,
        voice: Platform.OS === 'ios'
          ? 'com.apple.ttsbundle.Samantha-compact'
          : 'en-us-x-sfg#female_1-local',
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

  // Play audio response from backend (PCM data)
  const playAudioResponse = async (_audioData: any) => {
    try {
      console.log('🎵 Playing audio response...');
      // TODO: Implement PCM audio playback if backend sends audio
      // For now, we're using TTS on the client side
    } catch (error) {
      console.error('❌ Error playing audio:', error);
    }
  };

  // Start PCM audio streaming
  const startAudioStream = async () => {
    try {
      console.log('🎙️ Starting PCM audio stream...');
      setIsRecording(true);
      isStreamingRef.current = true;

      // Stop TTS if speaking
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
      }

      // Clear previous chunks
      audioChunksRef.current = [];

      // Configure recording for 16kHz PCM with audio callback
      const recordingConfig: RecordingConfig = {
        interval: 250,  // Send chunks every 250ms
        sampleRate: 16000,
        channels: 1,
        encoding: 'pcm_16bit',
        pointsPerSecond: 16000,
        onAudioStream: async (event: AudioDataEvent) => {
          if (isStreamingRef.current && event.data) {
            // Collect base64 PCM chunks at 16kHz
            console.log(`🎤 Audio chunk received: ${event.eventDataSize} bytes, soundLevel: ${event.soundLevel}`);
            audioChunksRef.current.push(event.data);
          }
        },
      };

      // Start streaming with callback
      const { subscription } = await ExpoPlayAudioStream.startMicrophone(recordingConfig);

      // Store subscription for cleanup
      if (subscription) {
        audioStreamRef.current = subscription;
      }

      console.log('✅ Audio stream started');
    } catch (error) {
      console.error('❌ Failed to start audio stream:', error);
      setIsRecording(false);
      isStreamingRef.current = false;
    }
  };

  // Stop PCM audio streaming and send to backend
  const stopAudioStream = async () => {
    try {
      console.log('🛑 Stopping audio stream...');

      // Mark as not streaming
      isStreamingRef.current = false;

      // Stop microphone
      await ExpoPlayAudioStream.stopMicrophone();

      setIsRecording(false);

      // Combine all PCM chunks into one base64 string
      if (audioChunksRef.current.length > 0) {
        const combinedAudio = audioChunksRef.current.join('');
        console.log(`📤 Sending ${combinedAudio.length} characters of PCM audio data to server`);

        // Send PCM audio to backend
        sendAudio(combinedAudio);

        // Clear chunks
        audioChunksRef.current = [];
      } else {
        console.warn('⚠️ No audio data collected');
      }

      // Remove listener
      if (audioStreamRef.current) {
        audioStreamRef.current.remove();
        audioStreamRef.current = null;
      }

      console.log('✅ Audio stream stopped');
    } catch (error) {
      console.error('❌ Failed to stop audio stream:', error);
      setIsRecording(false);
      isStreamingRef.current = false;
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

  // Toggle speaker mode
  const toggleSpeaker = async () => {
    try {
      const newSpeakerState = !isSpeakerOn;
      setIsSpeakerOn(newSpeakerState);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !newSpeakerState,
      });

      console.log(`🔊 Audio mode: ${newSpeakerState ? 'Speaker' : 'Earpiece'}`);
    } catch (error) {
      console.error('❌ Failed to toggle speaker:', error);
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
          {state === CallState.CALLING && (
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
          {state === CallState.CALLING && (
            <View style={styles.statusDotActive} />
          )}
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {/* Call Duration */}
        <Text style={styles.durationText}>
          {formatTime(callDuration)}
        </Text>

        {/* Waveform Visualization */}
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
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Speaker Toggle Button */}
        {state === CallState.CALLING && (
          <TouchableOpacity
            style={styles.speakerButton}
            onPress={toggleSpeaker}
            activeOpacity={0.8}
          >
            <View style={[styles.speakerButtonCircle, isSpeakerOn && styles.speakerButtonActive]}>
              <Text style={styles.speakerIcon}>{isSpeakerOn ? '🔊' : '🎧'}</Text>
            </View>
            <Text style={styles.speakerLabel}>
              {isSpeakerOn ? 'Speaker' : 'Earpiece'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Microphone Button */}
        {state === CallState.CALLING && (
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPressIn={startAudioStream}
            onPressOut={stopAudioStream}
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

        {/* End Call Button */}
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

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Animated,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { VideoBackground } from '../components/VideoBackground';
import { LiveChatOverlay } from '../components/LiveChatOverlay';
import { TypingIndicator } from '../components/TypingIndicator';
import { SuggestionChips } from '../components/SuggestionChips';
import { useUserProfile } from '../store/userProfile';
import { useGirlfriendStore } from '../store/girlfriendStore';
import { useCallStore } from '../store/callStore';
import { usePaymentStore } from '../store/paymentStore';
import { useVideoForProfile } from '../hooks/useVideoForProfile';
import { RootStackParamList } from '../navigation/types';
import {
  logScreenView,
  logChatStarted,
  logMessageSent,
  logChatSessionDuration,
} from '../services/analyticsService';
import {
  generateAIResponse,
  generateWelcomeMessage,
  isOpenRouterConfigured,
} from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: string; // Changed from 'user' | 'ai' to string for sender names
  timestamp: Date;
}

type ChatScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Chat'
>;

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface ChatScreenProps {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { profile } = useUserProfile();
  const {
    selectedGirlfriend,
    addMessage,
    getChatHistory,
    setSelectedGirlfriend,
  } = useGirlfriendStore();

  // Use selected girlfriend's video or fall back to profile-based video
  const girlfriendVideo = selectedGirlfriend?.videoPath;
  const profileVideo = useVideoForProfile();
  const videoSource = girlfriendVideo || profileVideo;

  // Use selected girlfriend's name or fall back to profile name
  const girlfriendName = selectedGirlfriend?.name || profile.name || 'Sarina';
  const girlfriendId = selectedGirlfriend?.id || 'default';

  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [messageCount, setMessageCount] = useState(0);
  const [isAITyping, setIsAITyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Load messages from chat history
  const messages = getChatHistory(girlfriendId);

  // Check if coming from onboarding and if first launch
  const fromOnboarding = route.params?.fromOnboarding;
  const isFirstLaunch = route.params?.isFirstLaunch;
  const { shouldShowCall } = useCallStore();

  // Payment store for freemium model
  const { isPremium, freeMessagesCount, loadSubscriptionStatus } = usePaymentStore();

  // Load subscription status on mount
  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  // Track screen view and chat start
  useEffect(() => {
    logScreenView('Chat', {
      character_id: girlfriendId,
      character_name: girlfriendName,
    });

    // Track chat started
    const isFirstChat = messages.length === 0;
    logChatStarted(girlfriendId, girlfriendName, isFirstChat);
  }, [girlfriendId]);

  // Trigger incoming call based on timing logic
  useEffect(() => {
    // NEW: Show incoming call after 7 seconds for first-time users
    if (isFirstLaunch) {
      const timer = setTimeout(() => {
        navigation.navigate('IncomingCall', {
          characterName: girlfriendName,
          characterImageUrl: selectedGirlfriend?.imageUrl,
        });
      }, 7000); // 7 seconds for first-time users

      return () => clearTimeout(timer);
    }
    // Existing logic for subsequent visits
    else if (fromOnboarding && shouldShowCall()) {
      const timer = setTimeout(() => {
        navigation.navigate('IncomingCall', {
          characterName: girlfriendName,
          characterImageUrl: selectedGirlfriend?.imageUrl,
        });
      }, 5000); // 5 seconds after chat screen loads

      return () => clearTimeout(timer);
    }
    // If not from onboarding but should show call (repeat timer), check periodically
    else if (!fromOnboarding && !isFirstLaunch) {
      const checkInterval = setInterval(() => {
        if (shouldShowCall()) {
          navigation.navigate('IncomingCall', {
            characterName: girlfriendName,
            characterImageUrl: selectedGirlfriend?.imageUrl,
          });
          clearInterval(checkInterval);
        }
      }, 120000); // Check every 2 minutes (120 seconds)

      return () => clearInterval(checkInterval);
    }
  }, [fromOnboarding, isFirstLaunch, girlfriendName, selectedGirlfriend, navigation, shouldShowCall]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
        setShowSuggestions(false); // Hide suggestions when keyboard shows
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle hardware back button and navigation back button
  useEffect(() => {
    const backAction = () => {
      // Log chat session duration before leaving
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      logChatSessionDuration(girlfriendId, sessionDuration, messageCount);

      // Always navigate to MainTabs (Home screen) when back is pressed
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      // Log session duration on unmount
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      logChatSessionDuration(girlfriendId, sessionDuration, messageCount);
      backHandler.remove();
    };
  }, [navigation, messageCount, sessionStartTime, girlfriendId]);

  // Initialize welcome message when girlfriend changes
  useEffect(() => {
    if (selectedGirlfriend && messages.length === 0) {
      const welcomeText = generateWelcomeMessage(selectedGirlfriend);
      const welcomeMessage = {
        id: '1',
        text: welcomeText,
        sender: girlfriendName,
        timestamp: new Date(),
      };
      addMessage(girlfriendId, welcomeMessage);
    }
  }, [girlfriendId]);

  const handleSend = async () => {
    if (inputText.trim() && !isAITyping) {
      const userMessageText = inputText.trim();
      const newMessage: Message = {
        id: Date.now().toString(),
        text: userMessageText,
        sender: 'You',
        timestamp: new Date(),
      };

      addMessage(girlfriendId, newMessage);

      // Track message sent
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      logMessageSent(girlfriendId, userMessageText.length, newCount);

      setInputText('');
      setIsAITyping(true);

      try {
        // Realistic typing delay: Show typing indicator first
        // Simulate reading the message (300-800ms)
        const readingDelay = Math.random() * 500 + 300;
        await new Promise((resolve) => setTimeout(resolve, readingDelay));

        // Check if AI is configured
        if (!isOpenRouterConfigured()) {
          throw new Error('AI service not configured');
        }

        // Get current chat history for context
        const currentHistory = getChatHistory(girlfriendId);

        // Generate AI response using OpenRouter (this will take some time)
        const aiResponseText = await generateAIResponse(
          userMessageText,
          selectedGirlfriend || {
            id: girlfriendId,
            name: girlfriendName,
            tagline: '',
            appearance: 'realistic',
            personality: ['Kind', 'Friendly'],
            interests: ['Conversation'],
            tone: ['Friendly'],
          },
          currentHistory,
          'You'
        );

        // Simulate typing delay based on response length
        // Average typing speed: ~200 chars per minute = ~3.3 chars per second
        // Add some randomness for realism
        const typingSpeed = 3.3 + Math.random() * 1.7; // 3.3-5 chars/sec
        const typingDelay = (aiResponseText.length / typingSpeed) * 1000;
        const clampedTypingDelay = Math.min(Math.max(typingDelay, 500), 3000); // 0.5s - 3s

        await new Promise((resolve) => setTimeout(resolve, clampedTypingDelay));

        // Add AI response to chat
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponseText,
          sender: girlfriendName,
          timestamp: new Date(),
        };
        addMessage(girlfriendId, aiResponse);
      } catch (error) {
        console.error('Error getting AI response:', error);

        // Small delay even for error response
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Fallback response on error
        const fallbackResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having a little trouble thinking right now... Can you say that again? 💭",
          sender: girlfriendName,
          timestamp: new Date(),
        };
        addMessage(girlfriendId, fallbackResponse);
      } finally {
        setIsAITyping(false);
      }
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  const handleUnlockPress = () => {
    navigation.navigate('Paywall', {
      characterName: girlfriendName,
      characterImageUrl: selectedGirlfriend?.imageUrl,
    });
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
  };

  const toggleSuggestions = () => {
    if (keyboardVisible) {
      // If keyboard is visible, dismiss it and show suggestions
      Keyboard.dismiss();
      // Wait for keyboard to dismiss before showing suggestions
      setTimeout(() => {
        setShowSuggestions(true);
      }, 100);
    } else if (showSuggestions) {
      // If suggestions are showing, hide them and show keyboard
      setShowSuggestions(false);
    } else {
      // If nothing is showing, show suggestions
      setShowSuggestions(true);
    }
  };

  const openChatSettings = () => {
    navigation.navigate('ChatSettings');
  };

  const handlePhoneCall = () => {
    // Trigger incoming call when phone icon is tapped
    navigation.navigate('IncomingCall', {
      characterName: girlfriendName,
      characterImageUrl: selectedGirlfriend?.imageUrl,
    });
  };

  return (
    <View style={styles.container}>
      {/* Full-screen video background */}
      <VideoBackground source={videoSource} />

      {/* Header with AI name and status */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              // Always navigate to MainTabs (Home screen)
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Home</Text>
          </View>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerName}>{girlfriendName}</Text>
          <Text style={styles.headerStatus}>• Online</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.phoneButton}
            onPress={handlePhoneCall}
            activeOpacity={0.7}
          >
            <Text style={styles.phoneIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openChatSettings}
            activeOpacity={0.7}
          >
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Instagram Live-style chat overlay */}
      <LiveChatOverlay
        messages={messages}
        characterAvatarUrl={selectedGirlfriend?.imageUrl}
        characterName={girlfriendName}
        isPremium={isPremium}
        freeMessagesCount={freeMessagesCount}
        onUnlockPress={handleUnlockPress}
      />

      {/* AI Typing Indicator */}
      {isAITyping && (
        <View style={[styles.typingIndicator, { bottom: 110 + keyboardHeight }]}>
          <View style={styles.typingBubble}>
            <Text style={styles.typingText}>{girlfriendName} is typing</Text>
            <TypingIndicator dotColor="#FF3263" />
          </View>
        </View>
      )}

      {/* Suggestion Chips - Always visible when toggled, positioned above input */}
      {showSuggestions && (
        <View style={[styles.suggestionsContainer, { bottom: 120 + keyboardHeight }]}>
          <SuggestionChips
            onSuggestionPress={handleSuggestionPress}
            girlfriendName={girlfriendName}
          />
        </View>
      )}

      {/* Input bar at bottom - ALWAYS VISIBLE */}
      <View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleSuggestions}
              activeOpacity={0.7}
            >
              <Text style={styles.iconButtonText}>😊</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Hi"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => {
                setShowSuggestions(false); // Don't show suggestions when typing
              }}
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              isAITyping && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={!inputText.trim() || isAITyping}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Instagram Live-style header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 50, 99, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  headerStatus: {
    fontSize: 12,
    color: '#4ADE80',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  phoneIcon: {
    fontSize: 18,
    color: '#10B981',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 3,
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  // Suggestions container
  suggestionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 150, // Above everything
    elevation: 150,
  },
  // Input bar (Reference design)
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Slight background for better visibility
    zIndex: 100,
    elevation: 100,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 22,
  },
  input: {
    flex: 1,
    color: '#000000',
    fontSize: 16,
    maxHeight: 80,
    paddingVertical: 0,
    fontWeight: '400',
  },
  sendButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Typing indicator styles
  typingIndicator: {
    position: 'absolute',
    bottom: 110, // Above input bar (input is at bottom: 0 + 90px height = need 110px)
    left: 16,
    zIndex: 50,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  typingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LiveChatMessage } from './LiveChatMessage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

interface LiveChatOverlayProps {
  messages: Message[];
  maxVisibleMessages?: number;
  characterAvatarUrl?: string;
  characterName?: string;
}

export const LiveChatOverlay: React.FC<LiveChatOverlayProps> = ({
  messages,
  maxVisibleMessages = 8,
  characterAvatarUrl,
  characterName,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Keep only recent messages for performance
  useEffect(() => {
    const recentMessages = messages.slice(-15); // Keep last 15 messages
    setDisplayMessages(recentMessages);

    // Auto-scroll to bottom when new message arrives
    if (recentMessages.length > displayMessages.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Determine which message is new
  const getMessageWithNewFlag = (msg: Message, idx: number) => {
    const isNew = idx === displayMessages.length - 1 && displayMessages.length > 1;
    return { ...msg, isNew };
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Gradient fade effect at top */}
      <View style={styles.topGradient} pointerEvents="none" />

      {/* Messages container */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true} // Enable scrolling to see all messages
        pointerEvents="auto"
      >
        {displayMessages.map((message, index) => {
          const isUser = message.sender === 'You' || message.sender === 'User';
          return (
            <LiveChatMessage
              key={message.id}
              text={message.text}
              sender={message.sender}
              index={index}
              totalMessages={displayMessages.length}
              isNew={index === displayMessages.length - 1 && displayMessages.length > 1}
              avatarUrl={!isUser ? characterAvatarUrl : undefined}
              isUser={isUser}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120, // Below header
    bottom: 180, // Above input bar and typing indicator (90 input + 90 space)
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    zIndex: 10, // Below input bar
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.1))',
    // For React Native, we'll use opacity change instead
    opacity: 0.5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
});

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LiveChatMessageProps {
  text: string;
  sender: string;
  index: number;
  totalMessages: number;
  isNew?: boolean;
  avatarUrl?: string;
  isUser?: boolean;
}

export const LiveChatMessage: React.FC<LiveChatMessageProps> = ({
  text,
  sender,
  index,
  totalMessages,
  isNew = false,
  avatarUrl,
  isUser = false,
}) => {
  const slideAnim = useRef(new Animated.Value(isNew ? 50 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;

  // Calculate opacity based on position (older messages fade)
  const positionFromBottom = totalMessages - index - 1;
  const maxVisibleMessages = 8;

  // Fade older messages exponentially
  let calculatedOpacity = 1;
  if (positionFromBottom < maxVisibleMessages) {
    calculatedOpacity = Math.max(0.2, 1 - (positionFromBottom / maxVisibleMessages) * 0.8);
  } else {
    calculatedOpacity = 0.2;
  }

  useEffect(() => {
    if (isNew) {
      // Slide up animation for new messages
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: calculatedOpacity,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade older messages when new one arrives
      Animated.timing(opacityAnim, {
        toValue: calculatedOpacity,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isNew, calculatedOpacity]);

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.messageContent, isUser && styles.userMessage]}>
        {/* Avatar for AI messages */}
        {!isUser && avatarUrl && (
          <Image
            source={{ uri: avatarUrl, cache: 'force-cache' }}
            style={styles.avatar}
            defaultSource={require('../../assets/icon.png')}
          />
        )}

        {/* User message with gradient */}
        {isUser ? (
          <LinearGradient
            colors={['#FF6B9D', '#C084FC', '#60A5FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.messageBackground, styles.userMessageBackground]}
          >
            <Text style={styles.messageText} numberOfLines={3}>
              {text}
            </Text>
          </LinearGradient>
        ) : (
          /* AI message with white background */
          <View style={[styles.messageBackground, styles.aiMessageBackground]}>
            <View style={styles.senderContainer}>
              <Text style={styles.aiSenderText} numberOfLines={1}>
                {sender}
              </Text>
            </View>
            <Text style={styles.aiMessageText} numberOfLines={3}>
              {text}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#FF3263',
    backgroundColor: '#000',
  },
  messageBackground: {
    borderRadius: 18,
    padding: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aiMessageBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  userMessageBackground: {
    // Gradient applied via LinearGradient component
  },
  senderContainer: {
    marginBottom: 4,
  },
  aiSenderText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.6,
  },
  aiMessageText: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
});

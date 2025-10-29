import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { VideoBackground } from '../components/VideoBackground';
import { GlassContainer } from '../components/GlassContainer';
import { useUserProfile } from '../store/userProfile';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const ChatScreen: React.FC = () => {
  const { profile } = useUserProfile();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm ${profile.name || 'Sarina'}. I'm so excited to chat with you! 💕`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "That's interesting! Tell me more about it.",
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <GlassContainer
        style={[
          styles.messageBubble,
          item.sender === 'user'
            ? styles.userBubble
            : styles.aiBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </GlassContainer>
    </View>
  );

  return (
    <View style={styles.container}>
      <VideoBackground source={require('../../assets/videos/default.mp4')} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <GlassContainer style={styles.headerContent}>
            <Text style={styles.headerName}>{profile.name || 'Sarina'}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </GlassContainer>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <GlassContainer style={styles.inputWrapper}>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={toggleVoiceMode}
                activeOpacity={0.7}
              >
                <Text style={styles.voiceIcon}>
                  {isVoiceMode ? '🎤' : '⌨️'}
                </Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                activeOpacity={0.7}
                disabled={!inputText.trim()}
              >
                <Text style={styles.sendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
          </GlassContainer>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerContent: {
    padding: 16,
    alignItems: 'center',
  },
  headerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerStatus: {
    fontSize: 12,
    color: '#4ADE80',
    fontWeight: '500',
  },
  messagesList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
  },
  userBubble: {
    backgroundColor: 'rgba(255, 50, 99, 0.2)',
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  inputWrapper: {
    padding: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  voiceIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FF3263',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 50, 99, 0.5)',
  },
  sendIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});

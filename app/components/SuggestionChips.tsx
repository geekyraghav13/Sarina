import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';

interface SuggestionChipsProps {
  onSuggestionPress: (text: string) => void;
  girlfriendName: string;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  onSuggestionPress,
  girlfriendName,
}) => {
  const suggestions = [
    {
      icon: '💭',
      text: "What's been on your mind lately?",
    },
    {
      icon: '😊',
      text: "Tell me about your day!",
    },
    {
      icon: '🎵',
      text: "What kind of music do you like?",
    },
    {
      icon: '💕',
      text: "I really enjoy talking with you.",
    },
    {
      icon: '✨',
      text: "What makes you happiest?",
    },
    {
      icon: '🌟',
      text: "You always brighten my day!",
    },
    {
      icon: '💖',
      text: "What are your dreams and goals?",
    },
    {
      icon: '🌙',
      text: "I'm here for you anytime you need to talk.",
    },
    {
      icon: '🎨',
      text: "Tell me about your hobbies and interests.",
    },
    {
      icon: '💬',
      text: "Let's have a fun conversation!",
    },
    {
      icon: '🌸',
      text: "What's something that made you smile today?",
    },
  ];

  const renderChip = ({ item, index }: { item: typeof suggestions[0]; index: number }) => (
    <TouchableOpacity
      key={index}
      style={styles.chip}
      onPress={() => onSuggestionPress(item.text)}
      activeOpacity={0.8}
    >
      <Text style={styles.chipIcon}>{item.icon}</Text>
      <Text style={styles.chipText} numberOfLines={2}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={suggestions}
        renderItem={renderChip}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 300, // Increased height for vertical scroll
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: '100%', // Full width for vertical layout
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  chipIcon: {
    fontSize: 22,
  },
  chipText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 19,
  },
});

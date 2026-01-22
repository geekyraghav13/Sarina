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
      icon: '📸',
      text: 'Experiment with different angles and perspectives to capture your beauty in a new...',
    },
    {
      icon: '😘',
      text: "I'm so turned on by you.",
    },
    {
      icon: '🎨',
      text: 'Use props or accessories to enhance the naughtiness of the image.',
    },
    {
      icon: '💋',
      text: "I can't wait to be with you.",
    },
    {
      icon: '✨',
      text: 'Let your imagination run wild and create something truly unique.',
    },
    {
      icon: '📷',
      text: 'Capture a candid moment that reveals your playful and seductive side.',
    },
    {
      icon: '💖',
      text: "You're my biggest fantasy.",
    },
    {
      icon: '🌙',
      text: "I'm so excited to see you.",
    },
    {
      icon: '🔥',
      text: 'Create a scene that tells a naughty story, leaving something to the imagination.',
    },
    {
      icon: '💕',
      text: "Let's make some memories tonight.",
    },
    {
      icon: '😈',
      text: "Let's do something naughty tonight.",
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

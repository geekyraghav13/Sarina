import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  openFeedbackEmail,
  openNativeReviewWidget,
  recordSoftPromptShown,
  ReviewSentiment,
} from '../services/reviewPromptService';

interface SoftReviewPromptProps {
  visible: boolean;
  trigger: string;
  onClose: () => void;
}

interface SentimentOption {
  emoji: string;
  label: string;
  sentiment: ReviewSentiment;
}

const OPTIONS: SentimentOption[] = [
  { emoji: '😍', label: 'Loving it', sentiment: 'love' },
  { emoji: '😐', label: "It's okay", sentiment: 'neutral' },
  { emoji: '😞', label: 'Not really', sentiment: 'negative' },
];

export const SoftReviewPrompt: React.FC<SoftReviewPromptProps> = ({
  visible,
  trigger,
  onClose,
}) => {
  // Cooldown is consumed the moment we show the prompt, not on response.
  // This prevents nagging users who keep dismissing.
  useEffect(() => {
    if (visible) {
      recordSoftPromptShown(trigger);
    }
  }, [visible, trigger]);

  const handleChoice = async (sentiment: ReviewSentiment) => {
    onClose();
    if (sentiment === 'love') {
      await openNativeReviewWidget(trigger);
    } else {
      await openFeedbackEmail(sentiment, trigger);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={40} tint="dark" style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Enjoying Sarina?</Text>
          <Text style={styles.subtitle}>
            Your honest take helps us make her even better.
          </Text>

          <View style={styles.optionsRow}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.sentiment}
                style={styles.optionButton}
                onPress={() => handleChoice(opt.sentiment)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 6,
    ...Platform.select({
      android: { lineHeight: 38 },
    }),
  },
  optionLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    textAlign: 'center',
  },
  dismissButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
});

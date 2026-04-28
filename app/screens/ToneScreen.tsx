import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { ChipSelector } from '../components/ChipSelector';
import { useUserProfile } from '../store/userProfile';
import { RootStackParamList } from '../navigation/types';
import { getVideoForTone, VIDEO_SOURCES } from '../utils/videoSelector';

type ToneScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tone'>;

interface ToneScreenProps {
  navigation: ToneScreenNavigationProp;
}

const TONE_OPTIONS = [
  'Cute',
  'Friendly',
  'Cheerful',
  'Caring',
  'Supportive',
  'Mysterious',
  'Confident',
  'Energetic',
];

export const ToneScreen: React.FC<ToneScreenProps> = ({ navigation }) => {
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const { setProfile } = useUserProfile();
  const [videoSource, setVideoSource] = useState(VIDEO_SOURCES.FANTASY);

  const handleToneSelect = (tone: string) => {
    const newSelectedTones = selectedTones.includes(tone)
      ? selectedTones.filter((t) => t !== tone)
      : [...selectedTones, tone];

    setSelectedTones(newSelectedTones);

    // Change video immediately based on the first selected tone
    if (newSelectedTones.length > 0) {
      const newVideo = getVideoForTone(newSelectedTones[0]);
      setVideoSource(newVideo);
    } else {
      // No selection, use default
      setVideoSource(VIDEO_SOURCES.FANTASY);
    }
  };

  const handleNext = () => {
    if (selectedTones.length > 0) {
      setProfile({ tone: selectedTones });
      navigation.navigate('Personality');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <VideoBackground
        source={videoSource}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.step}>Step 2 of 8</Text>
          <Text style={styles.title}>Choose Her Tone</Text>
          <Text style={styles.subtitle}>
            Select one or more personality tones
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <ChipSelector
            options={TONE_OPTIONS}
            selected={selectedTones}
            onSelect={handleToneSelect}
            multiSelect
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nextButton,
                selectedTones.length === 0 && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              activeOpacity={0.8}
              disabled={selectedTones.length === 0}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 60,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  step: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 40,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#FF3263',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 50, 99, 0.5)',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

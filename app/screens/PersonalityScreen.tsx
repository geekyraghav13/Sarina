import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { CharacterImageOverlay } from '../components/CharacterImageOverlay';
import { ChipSelector } from '../components/ChipSelector';
import { useUserProfile } from '../store/userProfile';
import { RootStackParamList } from '../navigation/types';
import { getVideoForPersonality, VIDEO_SOURCES } from '../utils/videoSelector';

type PersonalityScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Personality'
>;

interface PersonalityScreenProps {
  navigation: PersonalityScreenNavigationProp;
}

const PERSONALITY_OPTIONS = [
  'Kind',
  'Adventurous',
  'Intelligent',
  'Funny',
  'Empathetic',
  'Bold',
  'Creative',
  'Supportive',
  'Spontaneous',
  'Thoughtful',
];

export const PersonalityScreen: React.FC<PersonalityScreenProps> = ({
  navigation,
}) => {
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>(
    []
  );
  const { setProfile } = useUserProfile();
  const [videoSource, setVideoSource] = useState(VIDEO_SOURCES.FANTASY);

  const handlePersonalitySelect = (personality: string) => {
    const newSelectedPersonalities = selectedPersonalities.includes(personality)
      ? selectedPersonalities.filter((p) => p !== personality)
      : [...selectedPersonalities, personality];

    setSelectedPersonalities(newSelectedPersonalities);

    // Change video immediately based on the first selected personality
    if (newSelectedPersonalities.length > 0) {
      const newVideo = getVideoForPersonality(newSelectedPersonalities[0]);
      setVideoSource(newVideo);
    } else {
      setVideoSource(VIDEO_SOURCES.FANTASY);
    }
  };

  const handleNext = () => {
    if (selectedPersonalities.length > 0) {
      setProfile({ personality: selectedPersonalities });
      navigation.navigate('Interests');
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
          <Text style={styles.step}>Step 3 of 8</Text>
          <Text style={styles.title}>Choose Her Personality</Text>
          <Text style={styles.subtitle}>
            Select personality traits that appeal to you
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <ChipSelector
            options={PERSONALITY_OPTIONS}
            selected={selectedPersonalities}
            onSelect={handlePersonalitySelect}
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
                selectedPersonalities.length === 0 &&
                  styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              activeOpacity={0.8}
              disabled={selectedPersonalities.length === 0}
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
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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

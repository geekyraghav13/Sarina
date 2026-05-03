import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { ChipSelector } from '../components/ChipSelector';
import { useUserProfile } from '../store/userProfile';
import { RootStackParamList } from '../navigation/types';
import { getVideoForPersonality, VIDEO_SOURCES } from '../utils/videoSelector';
import { logScreenView } from '../services/firebaseAnalytics';
import { useTranslation } from 'react-i18next';

type PersonalityScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Personality'
>;

interface PersonalityScreenProps {
  navigation: PersonalityScreenNavigationProp;
}

const PERSONALITY_KEYS = [
  'kind',
  'adventurous',
  'intelligent',
  'funny',
  'empathetic',
  'bold',
  'creative',
  'supportive',
  'spontaneous',
  'thoughtful',
];

export const PersonalityScreen: React.FC<PersonalityScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>(
    []
  );
  const { setProfile } = useUserProfile();
  const [videoSource, setVideoSource] = useState(VIDEO_SOURCES.FANTASY);

  // Translate personality options
  const personalityOptions = PERSONALITY_KEYS.map(key => t(`personality.${key}`));

  // Track screen view
  React.useEffect(() => {
    logScreenView('Personality');
  }, []);

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
          <Text style={styles.step}>{t('personality.step', { current: 2, total: 8 })}</Text>
          <Text style={styles.title}>{t('personality.title')}</Text>
          <Text style={styles.subtitle}>
            {t('personality.subtitle')}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <ChipSelector
            options={personalityOptions}
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
              <Text style={styles.backButtonText}>{t('common.back')}</Text>
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
              <Text style={styles.nextButtonText}>{t('common.next')}</Text>
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

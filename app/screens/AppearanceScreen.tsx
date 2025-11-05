import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { ModeCard } from '../components/ModeCard';
import { useUserProfile } from '../store/userProfile';
import { RootStackParamList } from '../navigation/types';
import { getVideoForAppearance, VIDEO_SOURCES } from '../utils/videoSelector';

type AppearanceScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Appearance'
>;

interface AppearanceScreenProps {
  navigation: AppearanceScreenNavigationProp;
}

const APPEARANCE_STYLES = [
  {
    id: 'realistic',
    title: 'Realistic',
    description: 'Photorealistic and lifelike appearance',
    icon: '📸',
  },
  {
    id: 'anime',
    title: 'Anime',
    description: 'Beautiful anime-style character',
    icon: '✨',
  },
  {
    id: 'fantasy',
    title: 'Fantasy',
    description: 'Magical and ethereal look',
    icon: '🌙',
  },
  {
    id: 'minimal',
    title: 'Minimal',
    description: 'Simple and elegant design',
    icon: '💫',
  },
];

export const AppearanceScreen: React.FC<AppearanceScreenProps> = ({
  navigation,
}) => {
  const [selectedAppearance, setSelectedAppearance] = useState<string>('');
  const { setProfile } = useUserProfile();
  const [videoSource, setVideoSource] = useState(VIDEO_SOURCES.FANTASY);

  const handleAppearanceSelect = (id: string) => {
    setSelectedAppearance(id);

    // Change video immediately based on appearance selection
    const newVideo = getVideoForAppearance(id);
    setVideoSource(newVideo);
  };

  const handleNext = () => {
    if (selectedAppearance) {
      setProfile({ appearance: selectedAppearance });
      navigation.navigate('Mode');
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
          <Text style={styles.step}>Step 5 of 8</Text>
          <Text style={styles.title}>Choose Appearance Style</Text>
          <Text style={styles.subtitle}>How should she look?</Text>
        </View>

        <View style={styles.cardsContainer}>
          {APPEARANCE_STYLES.map((style) => (
            <ModeCard
              key={style.id}
              title={style.title}
              description={style.description}
              icon={style.icon}
              selected={selectedAppearance === style.id}
              onPress={() => handleAppearanceSelect(style.id)}
            />
          ))}
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
                !selectedAppearance && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              activeOpacity={0.8}
              disabled={!selectedAppearance}
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
    marginBottom: 40,
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
  cardsContainer: {
    flex: 1,
    gap: 16,
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

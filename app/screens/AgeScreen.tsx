import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { CharacterImageOverlay } from '../components/CharacterImageOverlay';
import { AgeWheel } from '../components/AgeWheel';
import { useUserProfile } from '../store/userProfile';
import { RootStackParamList } from '../navigation/types';
import { ALL_VIDEOS } from '../utils/videoSelector';

type AgeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Age'>;

interface AgeScreenProps {
  navigation: AgeScreenNavigationProp;
}

export const AgeScreen: React.FC<AgeScreenProps> = ({ navigation }) => {
  const [age, setAge] = useState(25);
  const { setProfile } = useUserProfile();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(
    Math.floor(Math.random() * ALL_VIDEOS.length)
  );

  // Change video every time it loops
  const handleVideoEnd = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * ALL_VIDEOS.length);
    } while (newIndex === currentVideoIndex && ALL_VIDEOS.length > 1);
    setCurrentVideoIndex(newIndex);
  };

  const handleNext = () => {
    setProfile({ age });
    navigation.navigate('Tone');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <VideoBackground
        source={ALL_VIDEOS[currentVideoIndex]}
        onVideoEnd={handleVideoEnd}
      />
      <CharacterImageOverlay />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>Step 1 of 8</Text>
          <Text style={styles.title}>How old are you?</Text>
          <Text style={styles.subtitle}>You must be 18 or older to continue</Text>
        </View>

        <View style={styles.wheelContainer}>
          <AgeWheel onAgeChange={setAge} initialAge={age} />
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
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
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
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 40,
  },
  footer: {
    gap: 16,
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
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

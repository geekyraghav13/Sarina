import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { GlassContainer } from '../components/GlassContainer';
import { ChipSelector } from '../components/ChipSelector';
import { useUserProfile } from '../store/userProfile';
import { RootStackParamList } from '../navigation/types';

type InterestsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Interests'
>;

interface InterestsScreenProps {
  navigation: InterestsScreenNavigationProp;
}

const INTEREST_OPTIONS = [
  'Music',
  'Movies',
  'Gaming',
  'Travel',
  'Cooking',
  'Art',
  'Sports',
  'Reading',
  'Photography',
  'Fitness',
  'Technology',
  'Fashion',
];

export const InterestsScreen: React.FC<InterestsScreenProps> = ({
  navigation,
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { setProfile } = useUserProfile();

  const handleInterestSelect = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (selectedInterests.length > 0) {
      setProfile({ interests: selectedInterests });
      navigation.navigate('Appearance');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <VideoBackground source={require('../../assets/videos/default.mp4')} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.step}>Step 4 of 8</Text>
          <Text style={styles.title}>Select Her Interests</Text>
          <Text style={styles.subtitle}>
            What should she be passionate about?
          </Text>
        </View>

        <GlassContainer style={styles.optionsContainer}>
          <ChipSelector
            options={INTEREST_OPTIONS}
            selected={selectedInterests}
            onSelect={handleInterestSelect}
            multiSelect
          />
        </GlassContainer>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <GlassContainer style={styles.nextButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  selectedInterests.length === 0 && styles.nextButtonDisabled,
                ]}
                onPress={handleNext}
                activeOpacity={0.8}
                disabled={selectedInterests.length === 0}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </GlassContainer>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    marginBottom: 32,
  },
  footer: {
    marginTop: 'auto',
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
  nextButtonContainer: {
    flex: 2,
    padding: 0,
  },
  nextButton: {
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

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { ModeCard } from '../components/ModeCard';
import { useUserProfile } from '../store/userProfile';
import { useVideoForProfile } from '../hooks/useVideoForProfile';
import { RootStackParamList } from '../navigation/types';
import { logScreenView } from '../services/firebaseAnalytics';

type ModeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Mode'>;

interface ModeScreenProps {
  navigation: ModeScreenNavigationProp;
}

const MODES = [
  {
    id: 'safe',
    title: 'Friendly',
    description: 'Warm and appropriate conversations',
    icon: '😊',
  },
  {
    id: 'caring',
    title: 'Caring',
    description: 'Sweet, affectionate, and supportive',
    icon: '💕',
  },
];

export const ModeScreen: React.FC<ModeScreenProps> = ({ navigation }) => {
  const [selectedMode, setSelectedMode] = useState<string>('');
  const { setProfile } = useUserProfile();
  const videoSource = useVideoForProfile();

  // Track screen view
  React.useEffect(() => {
    logScreenView('Mode');
  }, []);

  const handleModeSelect = (id: string) => {
    setSelectedMode(id);
  };

  const handleNext = () => {
    if (selectedMode) {
      setProfile({ mode: selectedMode });
      navigation.navigate('Name');
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
          <Text style={styles.step}>Step 6 of 8</Text>
          <Text style={styles.title}>Select Mode</Text>
          <Text style={styles.subtitle}>Choose the conversation style</Text>
        </View>

        <View style={styles.cardsContainer}>
          {MODES.map((mode) => (
            <ModeCard
              key={mode.id}
              title={mode.title}
              description={mode.description}
              icon={mode.icon}
              selected={selectedMode === mode.id}
              onPress={() => handleModeSelect(mode.id)}
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
                !selectedMode && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              activeOpacity={0.8}
              disabled={!selectedMode}
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

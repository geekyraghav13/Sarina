import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VideoBackground } from '../components/VideoBackground';
import { useUserProfile } from '../store/userProfile';
import { useVideoForProfile } from '../hooks/useVideoForProfile';
import { useGirlfriendStore } from '../store/girlfriendStore';
import { RootStackParamList } from '../navigation/types';
import { logScreenView, logOnboardingCompleted } from '../services/analyticsService';
import { logOnboardingComplete } from '../services/firebaseAnalytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

type SummaryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Summary'
>;

interface SummaryScreenProps {
  navigation: SummaryScreenNavigationProp;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ navigation }) => {
  const { profile } = useUserProfile();
  const videoSource = useVideoForProfile();
  const { initializeDefaultGirlfriend } = useGirlfriendStore();

  // Track screen view
  React.useEffect(() => {
    logScreenView('Summary');
  }, []);

  const handleStart = async () => {
    // Track onboarding completion
    logOnboardingCompleted({
      age: profile.age,
      appearance: profile.appearance,
      mode: profile.mode,
      name: profile.name,
      tone: profile.tone,
      personality: profile.personality,
      interests: profile.interests,
    });

    // Firebase: Track onboarding complete
    logOnboardingComplete();

    // Save onboarding completion flag
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
    }

    // Initialize default girlfriend from onboarding with custom name
    initializeDefaultGirlfriend(profile.name);

    // Reset navigation and go to Chat directly with default girlfriend
    // User can access Home later via back button or bottom nav
    navigation.reset({
      index: 1,
      routes: [
        { name: 'MainTabs' },
        { name: 'Chat', params: { fromOnboarding: true } }
      ],
    });
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
          <Text style={styles.step}>Step 8 of 8</Text>
          <Text style={styles.title}>Meet {profile.name || 'Your AI'}</Text>
          <Text style={styles.subtitle}>
            Review your creation before starting
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Name</Text>
            <Text style={styles.sectionValue}>{profile.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Age</Text>
            <Text style={styles.sectionValue}>{profile.age} years old</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Tone</Text>
            <Text style={styles.sectionValue}>
              {profile.tone?.join(', ') || 'Not set'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Personality</Text>
            <Text style={styles.sectionValue}>
              {profile.personality?.join(', ') || 'Not set'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Interests</Text>
            <Text style={styles.sectionValue}>
              {profile.interests?.join(', ') || 'Not set'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Appearance</Text>
            <Text style={styles.sectionValue}>
              {profile.appearance
                ? profile.appearance.charAt(0).toUpperCase() +
                  profile.appearance.slice(1)
                : 'Not set'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>Mode</Text>
            <Text style={styles.sectionValue}>
              {profile.mode
                ? profile.mode.charAt(0).toUpperCase() + profile.mode.slice(1)
                : 'Not set'}
            </Text>
          </View>
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
              style={styles.startButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>Start Chatting</Text>
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
  summaryContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
  },
  summarySection: {
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  startButton: {
    flex: 2,
    backgroundColor: '#FF3263',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

// Export function to check if onboarding has been completed
export const checkOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Failed to check onboarding completion:', error);
    return false;
  }
};

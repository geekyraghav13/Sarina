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
import { getCurrentUser } from '../services/authService';
import { useTranslation } from 'react-i18next';
import * as RevenueCatService from '../services/revenueCatService';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

type SummaryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Summary'
>;

interface SummaryScreenProps {
  navigation: SummaryScreenNavigationProp;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
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

    // Save onboarding completion flag with user-specific key
    try {
      const user = getCurrentUser();
      const key = user ? `${ONBOARDING_COMPLETED_KEY}_${user.uid}` : ONBOARDING_COMPLETED_KEY;
      await AsyncStorage.setItem(key, 'true');
      console.log('✅ Onboarding completed for user:', user?.uid);
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
    }

    // Sync user profile to RevenueCat attributes
    try {
      const user = getCurrentUser();
      await RevenueCatService.syncUserProfileToAttributes({
        email: user?.email,
        displayName: user?.displayName,
        age: profile.age,
        personality: profile.personality,
        interests: profile.interests,
        appearance: profile.appearance,
        mode: profile.mode,
        tone: profile.tone,
      });
      console.log('✅ User profile synced to RevenueCat');
    } catch (error) {
      console.warn('⚠️ Could not sync profile to RevenueCat:', error);
      // Don't block user flow if this fails
    }

    // Initialize default girlfriend from onboarding with custom name
    initializeDefaultGirlfriend(profile.name);

    // NEW: Navigate directly to Chat with first-time flags
    navigation.replace('Chat', {
      fromOnboarding: true,
      isFirstLaunch: true,
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
          <Text style={styles.step}>{t('summary.step', { current: 8, total: 8 })}</Text>
          <Text style={styles.title}>
            {profile.name ? t('summary.title', { name: profile.name }) : t('summary.title_default')}
          </Text>
          <Text style={styles.subtitle}>
            {t('summary.subtitle')}
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>{t('summary.label_name')}</Text>
            <Text style={styles.sectionValue}>{profile.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>{t('summary.label_age')}</Text>
            <Text style={styles.sectionValue}>{t('summary.years_old', { age: profile.age })}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>{t('summary.label_tone')}</Text>
            <Text style={styles.sectionValue}>
              {profile.tone?.join(', ') || t('summary.not_set')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>{t('summary.label_personality')}</Text>
            <Text style={styles.sectionValue}>
              {profile.personality?.join(', ') || t('summary.not_set')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>{t('summary.label_interests')}</Text>
            <Text style={styles.sectionValue}>
              {profile.interests?.join(', ') || t('summary.not_set')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>{t('summary.label_appearance')}</Text>
            <Text style={styles.sectionValue}>
              {profile.appearance
                ? profile.appearance.charAt(0).toUpperCase() +
                  profile.appearance.slice(1)
                : t('summary.not_set')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionLabel}>{t('summary.label_mode')}</Text>
            <Text style={styles.sectionValue}>
              {profile.mode
                ? profile.mode.charAt(0).toUpperCase() + profile.mode.slice(1)
                : t('summary.not_set')}
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
              <Text style={styles.backButtonText}>{t('common.back')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>{t('summary.button_start')}</Text>
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
export const checkOnboardingCompleted = async (userId?: string): Promise<boolean> => {
  try {
    // Use user-specific key if userId is provided, otherwise use global key for backward compatibility
    const key = userId ? `${ONBOARDING_COMPLETED_KEY}_${userId}` : ONBOARDING_COMPLETED_KEY;
    const completed = await AsyncStorage.getItem(key);
    return completed === 'true';
  } catch (error) {
    console.error('Failed to check onboarding completion:', error);
    return false;
  }
};

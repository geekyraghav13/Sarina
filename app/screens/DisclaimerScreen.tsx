import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logScreenView } from '../services/analyticsService';
import { logOnboardingStart } from '../services/firebaseAnalytics';

// Sample character images from Firebase
const SAMPLE_CHARACTERS = [
  { id: '1', name: 'Serena', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fserena.jpg?alt=media&token=5f6ca662-d41b-4d72-92a8-053c1d466cd2' },
  { id: '2', name: 'Maya', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fmaya.jpg?alt=media&token=eb0872f5-d151-4d94-8379-eb81247fb09e' },
  { id: '3', name: 'Luna', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fluna.jpg?alt=media&token=03a97c04-0d46-44e5-bf47-927d159fd6b0' },
  { id: '4', name: 'Sophie', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fsophie.jpg?alt=media&token=9bf29ed5-ef5b-4314-9f8d-23901f2dbade' },
];

type DisclaimerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Disclaimer'
>;

interface DisclaimerScreenProps {
  navigation: DisclaimerScreenNavigationProp;
}

const DISCLAIMER_ACCEPTED_KEY = '@disclaimer_accepted';

export const DisclaimerScreen: React.FC<DisclaimerScreenProps> = ({
  navigation,
}) => {
  const [isAgreed, setIsAgreed] = useState(false);

  React.useEffect(() => {
    logScreenView('Disclaimer');
    logOnboardingStart(); // Firebase: Track onboarding start
  }, []);

  const handleAgree = async () => {
    try {
      setIsAgreed(true);
      await AsyncStorage.setItem(DISCLAIMER_ACCEPTED_KEY, 'true');
      console.log('✅ Disclaimer accepted');
      // Don't navigate - let AppNavigator handle it via state change
    } catch (error) {
      console.error('Failed to save disclaimer acceptance:', error);
    }
  };

  const openTerms = () => {
    Linking.openURL('https://sarina-ai-companion.lovable.app/terms');
  };

  const openPrivacy = () => {
    Linking.openURL('https://sarina-ai-companion.lovable.app/privacy');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Before We Begin...</Text>

        {/* Character Preview Grid */}
        <View style={styles.charactersGrid}>
          {SAMPLE_CHARACTERS.map((char) => (
            <View key={char.id} style={styles.characterCard}>
              <Image
                source={{ uri: char.imageUrl }}
                style={styles.characterImage}
                resizeMode="cover"
              />
              <View style={styles.characterOverlay}>
                <Text style={styles.characterName}>{char.name}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* AI Generated Content */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🤖</Text>
          </View>
          <Text style={styles.sectionTitle}>AI Generated Content</Text>
          <Text style={styles.sectionText}>
            All character responses are AI-generated fiction, not real advice or
            truth.
          </Text>
        </View>

        {/* Safe & Responsible Use */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🛡️</Text>
          </View>
          <Text style={styles.sectionTitle}>Safe & Responsible Use</Text>
          <Text style={styles.sectionText}>
            By continuing, you agree to use this app responsibly and avoid
            illegal content or harmful activities.
          </Text>
        </View>

        {/* Age & Responsibility */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚠️</Text>
          </View>
          <Text style={styles.sectionTitle}>Age & Responsibility</Text>
          <Text style={styles.sectionText}>
            You confirm you're 18+ and take full responsibility for your account
            activity. Companion chatbots may not be suitable for minors.
          </Text>
        </View>

        {/* Terms & Privacy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>By using this app, you agree to our </Text>
          <TouchableOpacity onPress={openTerms}>
            <Text style={styles.termsLink}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.termsText}> and </Text>
          <TouchableOpacity onPress={openPrivacy}>
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* I Agree Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.agreeButton, isAgreed && styles.agreeButtonActive]}
          onPress={handleAgree}
          activeOpacity={0.8}
        >
          <Text style={styles.agreeButtonText}>I Agree</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  termsLink: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#1A1A1A',
  },
  agreeButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  agreeButtonActive: {
    backgroundColor: '#6D28D9',
  },
  agreeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  charactersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  characterCard: {
    width: '48%',
    aspectRatio: 0.75,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  characterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  characterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

// Helper function to check if disclaimer was accepted
export const checkDisclaimerAccepted = async (): Promise<boolean> => {
  try {
    const accepted = await AsyncStorage.getItem(DISCLAIMER_ACCEPTED_KEY);
    return accepted === 'true';
  } catch (error) {
    console.error('Failed to check disclaimer acceptance:', error);
    return false;
  }
};

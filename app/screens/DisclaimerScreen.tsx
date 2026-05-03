import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logScreenView } from '../services/analyticsService';
import { logOnboardingStart } from '../services/firebaseAnalytics';
import { getCurrentUser } from '../services/authService';

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
  const [isChecked, setIsChecked] = useState(false);

  React.useEffect(() => {
    logScreenView('Disclaimer');
    logOnboardingStart(); // Firebase: Track onboarding start
  }, []);

  const handleAgree = async () => {
    if (!isChecked) return; // Don't proceed if checkbox isn't checked

    try {
      setIsAgreed(true);
      const user = getCurrentUser();
      const key = user ? `${DISCLAIMER_ACCEPTED_KEY}_${user.uid}` : DISCLAIMER_ACCEPTED_KEY;
      await AsyncStorage.setItem(key, 'true');
      console.log('✅ Disclaimer accepted for user:', user?.uid);
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
          <Text style={styles.sectionTitle}>User Responsibility</Text>
          <Text style={styles.sectionText}>
            You take full responsibility for your account activity and agree to
            use this app in accordance with our terms and applicable laws.
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

        {/* Checkbox Agreement */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsChecked(!isChecked)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            I have read and agree to the terms above
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* I Agree Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.agreeButton,
            isAgreed && styles.agreeButtonActive,
            !isChecked && styles.agreeButtonDisabled
          ]}
          onPress={handleAgree}
          activeOpacity={0.8}
          disabled={!isChecked}
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
    paddingTop: 40,
    paddingBottom: 140,
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
  agreeButtonDisabled: {
    backgroundColor: 'rgba(124, 58, 237, 0.4)',
  },
  agreeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkboxText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
});

// Helper function to check if disclaimer was accepted
export const checkDisclaimerAccepted = async (userId?: string): Promise<boolean> => {
  try {
    // Check user-specific key first if userId is provided
    if (userId) {
      const userKey = `${DISCLAIMER_ACCEPTED_KEY}_${userId}`;
      const userAccepted = await AsyncStorage.getItem(userKey);
      if (userAccepted === 'true') {
        return true;
      }
      // Fallback to global key (for users who accepted before sign-in)
      const globalAccepted = await AsyncStorage.getItem(DISCLAIMER_ACCEPTED_KEY);
      return globalAccepted === 'true';
    }
    // No userId, check global key only
    const accepted = await AsyncStorage.getItem(DISCLAIMER_ACCEPTED_KEY);
    return accepted === 'true';
  } catch (error) {
    console.error('Failed to check disclaimer acceptance:', error);
    return false;
  }
};

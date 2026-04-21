/**
 * Welcome Screen - First Onboarding Screen
 * Shows app branding with "Sarina" and features
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../services/authService';

const { width, height } = Dimensions.get('window');
const WELCOME_SEEN_KEY = '@welcome_seen';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleGetStarted = async () => {
    try {
      // Mark welcome screen as seen with user-specific key
      const user = getCurrentUser();
      const key = user ? `${WELCOME_SEEN_KEY}_${user.uid}` : WELCOME_SEEN_KEY;
      await AsyncStorage.setItem(key, 'true');
    } catch (error) {
      console.error('Error saving welcome seen status:', error);
    }

    // Navigate to disclaimer screen
    navigation.navigate('Disclaimer');
  };

  return (
    <View style={styles.container}>
      {/* Dark gradient background */}
      <LinearGradient
        colors={['#0a0014', '#1a0933', '#0a0014']}
        style={styles.gradient}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>Sarina</Text>
          <Text style={styles.tagline}>Your AI Companion</Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Chat</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📸</Text>
            <Text style={styles.featureText}>Request photo</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📞</Text>
            <Text style={styles.featureText}>Video call</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✨</Text>
            <Text style={styles.featureText}>Much more</Text>
          </View>
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ffffff', '#f0f0f0']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Let's Start</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0014',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: height * 0.15,
    paddingBottom: 60,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 40,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 0, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 8,
    letterSpacing: 1,
  },
  featuresSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  featureText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
  },
});

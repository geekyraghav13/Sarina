import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  signInWithGoogle,
  signInWithApple,
  initializeGoogleSignIn,
  isAppleSignInAvailable
} from '../services/authService';

export const SignInScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [appleSignInAvailable, setAppleSignInAvailable] = useState(false);

  const handleOpenLink = async (url: string, linkName: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Link Not Available',
          `We're working on setting up our ${linkName}. Please try again later.`
        );
      }
    } catch (error) {
      console.error(`Error opening ${linkName}:`, error);
      Alert.alert(
        'Link Not Available',
        `We're working on setting up our ${linkName}. Please try again later.`
      );
    }
  };

  useEffect(() => {
    // Initialize Google Sign-In on mount
    initializeGoogleSignIn();

    // Check if Apple Sign In is available
    checkAppleSignIn();
  }, []);

  const checkAppleSignIn = async () => {
    const available = await isAppleSignInAvailable();
    setAppleSignInAvailable(available);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('🔐 Starting Google Sign-In...');

      const user = await signInWithGoogle();

      console.log('✅ Google Sign-In successful:', user.uid);
      setLoading(false);

      // Navigation will happen automatically via auth state listener
      console.log('ℹ️ Waiting for navigation...');
    } catch (error: any) {
      console.error('❌ Sign-in error:', error);
      setLoading(false);

      let errorMessage = 'Failed to sign in. Please try again.';

      if (error.message?.includes('DEVELOPER_ERROR')) {
        errorMessage = 'Google Sign-In configuration error. Please check SHA-1 fingerprint in Firebase Console.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Sign In Failed', errorMessage);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      console.log('🍎 Starting Apple Sign-In...');

      const user = await signInWithApple();

      console.log('✅ Apple Sign-In successful:', user.uid);
      setLoading(false);

      // Navigation will happen automatically via auth state listener
      console.log('ℹ️ Waiting for navigation...');
    } catch (error: any) {
      console.error('❌ Apple Sign-in error:', error);
      setLoading(false);

      // Don't show alert if user cancelled
      if (error.message?.includes('cancelled')) {
        return;
      }

      let errorMessage = 'Failed to sign in with Apple. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Sign In Failed', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Sarina</Text>
            <Text style={styles.subtitle}>Your AI Girlfriend Experience</Text>
          </View>

          {/* Sign In Buttons */}
          <View style={styles.buttonContainer}>
            {/* Apple Sign In Button - Show first on iOS */}
            {appleSignInAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={30}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            )}

            {/* Google Sign In Button - Following Google Brand Guidelines */}
            <TouchableOpacity
              style={[styles.googleButton, appleSignInAvailable && styles.googleButtonSpacing]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#1F1F1F" />
              ) : (
                <>
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Terms and Privacy Policy - Separate clickable links */}
            <View style={styles.legalContainer}>
              <Text style={styles.legalText}>By continuing, you agree to our{'\n'}</Text>
              <View style={styles.legalLinksRow}>
                <TouchableOpacity onPress={() => handleOpenLink('https://sarina-ai-companion.lovable.app/terms', 'Terms of Service')}>
                  <Text style={styles.legalLink}>Terms of Service</Text>
                </TouchableOpacity>
                <Text style={styles.legalText}> and </Text>
                <TouchableOpacity onPress={() => handleOpenLink('https://sarina-ai-companion.lovable.app/privacy', 'Privacy Policy')}>
                  <Text style={styles.legalLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  appleButton: {
    width: '100%',
    height: 54,
    marginBottom: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  googleButtonSpacing: {
    marginTop: 0,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#1F1F1F',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.25,
  },
  legalContainer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legalText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  legalLink: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

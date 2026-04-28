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
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  signInWithGoogle,
  initializeGoogleSignIn,
} from '../services/authService';

const { width } = Dimensions.get('window');

export const SignInScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

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

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('🔐 Starting Google Sign-In...');

      const user = await signInWithGoogle();

      console.log('✅ Google Sign-In successful:', user.uid);
      setLoading(false);

      // Use replace instead of navigate to reset the stack and go to Summary
      navigation.replace('Summary');
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


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Circles Background */}
        <View style={styles.circlesContainer}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Logo/Icon Area */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#FF6B9D', '#C06C84', '#6C5B7B']}
              style={styles.logoContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="heart" size={56} color="#FFFFFF" />
            </LinearGradient>

            <Text style={styles.title}>Sarina</Text>
            <Text style={styles.subtitle}>Your AI Companion Experience</Text>

            {/* Feature Pills */}
            <View style={styles.featuresContainer}>
              <View style={styles.featurePill}>
                <Ionicons name="chatbubbles" size={14} color="#FF6B9D" />
                <Text style={styles.featureText}>Chat</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="call" size={14} color="#FF6B9D" />
                <Text style={styles.featureText}>Voice Calls</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="sparkles" size={14} color="#FF6B9D" />
                <Text style={styles.featureText}>AI Powered</Text>
              </View>
            </View>
          </View>

          {/* Sign In Buttons */}
          <View style={styles.buttonContainer}>
            {/* Google Sign In Button - Modern Design */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F5F5F5']}
                style={styles.googleButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#1F1F1F" />
                ) : (
                  <>
                    <View style={styles.googleIconContainer}>
                      <Ionicons name="logo-google" size={22} color="#4285F4" />
                    </View>
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.securityText}>Secure & Private</Text>
            </View>

            {/* Terms and Privacy Policy */}
            <View style={styles.legalContainer}>
              <Text style={styles.legalText}>By continuing, you agree to our</Text>
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
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  gradient: {
    flex: 1,
  },
  circlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.1,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: '#FF6B9D',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: '#C06C84',
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    backgroundColor: '#6C5B7B',
    top: 200,
    left: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 50,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.3)',
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  googleButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  googleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  googleIconContainer: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#1F1F1F',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  securityText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
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
    marginTop: 4,
  },
  legalText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
  legalLink: {
    color: '#FF6B9D',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

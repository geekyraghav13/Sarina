import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

type CreateScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Create'
>;

interface CreateScreenProps {
  navigation: CreateScreenNavigationProp;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({ navigation }) => {
  const video = React.useRef<Video>(null);

  useEffect(() => {
    // Play video on mount
    if (video.current) {
      video.current.playAsync();
    }
  }, []);

  const handleStart = () => {
    navigation.navigate('LanguageSelection');
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        ref={video}
        source={require('../../assets/onboarding-bg.mp4')}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
      />

      {/* Dark Overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Top Section - Title */}
        <View style={styles.topSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.createText}>Create Your</Text>
            <LinearGradient
              colors={['#FF6B9D', '#FF8FAB', '#FFB3C1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titleGradientWrapper}
            >
              <Text style={styles.companionText}>AI Companion</Text>
            </LinearGradient>
          </View>

          <Text style={styles.subtitle}>
            Design a personalized AI companion that understands and connects with you
          </Text>
        </View>

        {/* Middle Section - Features */}
        <View style={styles.middleSection}>
          <BlurView intensity={20} style={styles.featureCard}>
            <View style={styles.featureRow}>
              <View style={styles.featureIconWrapper}>
                <LinearGradient
                  colors={['#FF6B9D', '#FF3D71']}
                  style={styles.featureIconGradient}
                >
                  <Ionicons name="color-palette" size={24} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Customize Appearance</Text>
                <Text style={styles.featureDesc}>Choose style, personality & traits</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIconWrapper}>
                <LinearGradient
                  colors={['#A855F7', '#7C3AED']}
                  style={styles.featureIconGradient}
                >
                  <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Natural Conversations</Text>
                <Text style={styles.featureDesc}>Chat via text or voice calls</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIconWrapper}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.featureIconGradient}
                >
                  <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Always Available</Text>
                <Text style={styles.featureDesc}>Connect anytime, anywhere</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Bottom Section - Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FF6B9D', '#FF3D71']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Start Creating</Text>
              <Ionicons name="arrow-forward-circle" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Takes less than 2 minutes to set up
          </Text>
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
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: 'center',
    gap: 20,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  createText: {
    fontSize: 36,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  titleGradientWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  companionText: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255, 107, 157, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 24,
    gap: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIconWrapper: {
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  featureIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  featureDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  bottomSection: {
    gap: 16,
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF3D71',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  disclaimer: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 4,
  },
});

/**
 * Splash / launch screen (Figma node 68:205).
 *
 * Shown in-app while the OnboardingNavigator resolves the persisted auth session
 * on launch. Dark atmospheric backdrop + the Sarina logo, wordmark, and tagline.
 * Purely presentational.
 */

import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const logo = require('../../../assets/onboarding/sarina-logo.png');
const bg = require('../../../assets/onboarding/splash-bg.png');

export const SplashScreen: React.FC = () => (
  <View style={styles.container}>
    <ImageBackground source={bg} style={StyleSheet.absoluteFill} resizeMode="cover">
      <LinearGradient
        colors={['rgba(19,19,21,0.55)', 'rgba(19,19,21,0.85)', '#131315']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
    </ImageBackground>

    <View style={styles.content}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.wordmark}>Sarina</Text>
      <Text style={styles.tagline}>Your AI Companion</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 168,
    height: 166,
    marginBottom: 24,
  },
  wordmark: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 64,
    lineHeight: 76,
    letterSpacing: -1.6,
    color: '#ffffff',
    textShadowColor: 'rgba(227,32,81,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  tagline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
    color: '#ffffff',
    marginTop: 4,
  },
});

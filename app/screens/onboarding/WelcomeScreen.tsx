/**
 * Onboarding · Screen 01 — Welcome
 * New flow design (Figma node 39:637)
 *
 * Masonry photo collage background + dark gradient overlay,
 * "SARINA" serif wordmark, tagline, and a "Let's Start" CTA.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView } from '../../services/firebaseAnalytics';

// ── Collage images (bundled from Figma design) ───────────────────────────────
const imgIsabella = require('../../../assets/onboarding/isabella.jpg');
const imgMaya = require('../../../assets/onboarding/maya.png');
const imgVictoria = require('../../../assets/onboarding/victoria.png');
const imgLuna = require('../../../assets/onboarding/luna.jpg');
const imgElena = require('../../../assets/onboarding/elena.png');
const imgJax = require('../../../assets/onboarding/jax.png');
const imgSophia = require('../../../assets/onboarding/sophia.png');

// Grid cell heights (rows are 150px; a 2-row span is 150*2 + 8px gap = 308px)
const SINGLE = 150;
const DOUBLE = 308;

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Welcome'>;
};

// Per-cell dark gradient (top → bottom) used to blend photos into the collage
const CellGradient = () => (
  <LinearGradient
    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
    style={StyleSheet.absoluteFill}
  />
);

type CellProps = { source: any; height: number };
const Cell = ({ source, height }: CellProps) => (
  <View style={[styles.cell, { height }]}>
    <ImageBackground source={source} style={styles.cellImage} resizeMode="cover">
      <CellGradient />
    </ImageBackground>
  </View>
);

export const WelcomeScreen: React.FC<Props> = () => {
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    logScreenView('Onboarding_Welcome');
  }, []);

  const handleStart = () => {
    // TODO(flow): wire to screen 02 once it's built. No-op for now so the
    // button is reviewable without a registered next route.
    console.log('[Onboarding] Welcome → Start pressed');
  };

  return (
    <View style={styles.container}>
      {/* ── Background masonry collage ── */}
      <View style={styles.grid} pointerEvents="none">
        <View style={styles.column}>
          <Cell source={imgIsabella} height={DOUBLE} />
          <Cell source={imgElena} height={DOUBLE} />
          <Cell source={imgIsabella} height={SINGLE} />
        </View>
        <View style={styles.column}>
          <Cell source={imgMaya} height={SINGLE} />
          <Cell source={imgLuna} height={SINGLE} />
          <Cell source={imgJax} height={DOUBLE} />
        </View>
        <View style={styles.column}>
          <Cell source={imgVictoria} height={DOUBLE} />
          <Cell source={imgSophia} height={SINGLE} />
          <Cell source={imgMaya} height={DOUBLE} />
        </View>
      </View>

      {/* ── Foreground content with vertical fade-to-dark overlay ── */}
      <LinearGradient
        colors={['rgba(21,21,26,0)', 'rgba(21,21,26,0.7)', '#15151a']}
        locations={[0, 0.5, 1]}
        style={[
          styles.overlay,
          { paddingBottom: 48 + insets.bottom, paddingTop: insets.top },
        ]}
      >
        <View style={styles.centerBlock}>
          <Text style={styles.title}>SARINA</Text>
          <Text style={styles.subtitle}>Find Your Perfect Connection.</Text>
        </View>

        <TouchableOpacity
          style={styles.buttonWrapper}
          activeOpacity={0.85}
          onPress={handleStart}
        >
          <LinearGradient
            colors={['#ff5070', '#e01e50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Let's Start</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  // Collage
  grid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    opacity: 0.6,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  cell: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1d1d22',
  },
  cellImage: {
    flex: 1,
    width: '100%',
  },
  // Foreground
  overlay: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: 8,
    color: '#ffffff',
    textShadowColor: 'rgba(255,42,95,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 18,
    lineHeight: 27,
    color: '#e5e1e4',
    opacity: 0.9,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 448,
    borderRadius: 12,
    // Pink glow
    shadowColor: '#ff2a5f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    letterSpacing: 0.2,
    color: '#ffffff',
  },
});

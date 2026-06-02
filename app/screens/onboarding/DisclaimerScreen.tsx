/**
 * Onboarding · Screen 02 — "Before we begin..." (community guidelines / age gate)
 * New flow design (Figma node 39:675)
 *
 * Faded character backdrop, glassmorphism card with three guideline rows,
 * a primary "I Agree & Am 18+" CTA, and a Terms of Service footer link.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView } from '../../services/firebaseAnalytics';
import { iconAge, iconRoleplay, iconLock, iconArrow } from './disclaimerIcons';

const bgImage = require('../../../assets/onboarding/disclaimer-bg.png');

const TERMS_URL = 'https://sarina-ai-companion.lovable.app/terms';

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Disclaimer'>;
};

type Guideline = {
  icon: string;
  iconW: number;
  iconH: number;
  title: string;
  body: string;
};

const GUIDELINES: Guideline[] = [
  {
    icon: iconAge,
    iconW: 18,
    iconH: 18,
    title: '18+ Requirement',
    body: 'You must be at least 18 years of age to interact with our companions. By proceeding, you confirm your age.',
  },
  {
    icon: iconRoleplay,
    iconW: 22,
    iconH: 20,
    title: 'Roleplay Permitted',
    body: 'Our AI companions are designed for deep, unfiltered narratives and adult-oriented roleplay. Explore your desires freely.',
  },
  {
    icon: iconLock,
    iconW: 16,
    iconH: 21,
    title: 'Private Conversations',
    body: 'Your interactions are encrypted and entirely confidential. What happens in the chat, stays in the chat.',
  },
];

const GuidelineRow = ({ item }: { item: Guideline }) => (
  <View style={styles.row}>
    <View style={styles.iconCircle}>
      <SvgXml xml={item.icon} width={item.iconW} height={item.iconH} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowTitle}>{item.title}</Text>
      <Text style={styles.rowBody}>{item.body}</Text>
    </View>
  </View>
);

export const DisclaimerScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    logScreenView('Onboarding_Disclaimer');
  }, []);

  const handleAgree = () => {
    // TODO(flow): wire to screen 03 once it's built
    console.log('[Onboarding] Disclaimer → I Agree & Am 18+ pressed');
  };

  const handleTerms = () => {
    Linking.openURL(TERMS_URL).catch((e) =>
      console.warn('Failed to open Terms URL:', e)
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Faded character backdrop ── */}
      <ImageBackground
        source={bgImage}
        style={StyleSheet.absoluteFill}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(19,19,21,0.4)', 'rgba(19,19,21,0.8)', '#131315']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      {/* ── Content ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 48 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand wordmark */}
        <Text style={styles.brand}>Sarina</Text>

        {/* Glass card */}
        <View style={styles.cardShadow}>
          <BlurView intensity={40} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Headline */}
              <View style={styles.headline}>
                <Text style={styles.title}>Before we begin...</Text>
                <Text style={styles.subtitle}>
                  Please review our community guidelines to ensure a safe,
                  intimate experience.
                </Text>
              </View>

              {/* Guidelines */}
              <View style={styles.list}>
                {GUIDELINES.map((item) => (
                  <GuidelineRow key={item.title} item={item} />
                ))}
              </View>

              {/* CTA */}
              <View style={styles.cta}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleAgree}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={['#ff2a5f', '#e01e50']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>I Agree &amp; Am 18+</Text>
                    <SvgXml xml={iconArrow} width={13.33} height={13.33} />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleTerms} activeOpacity={0.7}>
                  <Text style={styles.termsLink}>Read full Terms of Service</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  bgImage: {
    opacity: 0.4,
    transform: [{ scale: 1.4 }],
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  brand: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    lineHeight: 38.4,
    letterSpacing: -0.8,
    color: '#ffffff',
    textShadowColor: 'rgba(255,178,185,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7.5,
    marginBottom: 32,
  },
  // Card
  cardShadow: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 16,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(53,52,55,0.4)',
  },
  cardInner: {
    backgroundColor: 'rgba(21,21,26,0.7)',
    padding: 25,
    gap: 32,
  },
  // Headline
  headline: {
    gap: 4,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    lineHeight: 38.4,
    color: '#e5e1e4',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#a0a0a5',
    textAlign: 'center',
  },
  // List
  list: {
    gap: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(53,52,55,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(53,52,55,0.5)',
  },
  rowText: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  rowTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 20,
    lineHeight: 27,
    color: '#e5e1e4',
  },
  rowBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#a0a0a5',
  },
  // CTA
  cta: {
    gap: 16,
    paddingTop: 8,
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 12,
    shadowColor: '#ff2a5f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    letterSpacing: 0.2,
    color: '#ffffff',
  },
  termsLink: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16.8,
    color: '#5a5a65',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

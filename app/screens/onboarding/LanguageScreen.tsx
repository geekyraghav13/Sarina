/**
 * Onboarding · Screen 03 — "Choose her language"
 * New flow design (Figma node 23:76)
 *
 * Faded portrait backdrop, serif heading with pink accent, a scrollable
 * radio list of languages, and a "Continue" CTA. The selected language is
 * persisted (AsyncStorage 'user_language') and applied via i18n so the AI
 * companion communicates in that language.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView } from '../../services/firebaseAnalytics';
import { iconArrow } from './disclaimerIcons';

const bgImage = require('../../../assets/onboarding/language-bg.jpg');

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Language'>;
};

type Language = { code: string; name: string };

// Design's six + existing app locales + requested additions, sorted A–Z.
const LANGUAGES: Language[] = [
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'es', name: 'Spanish' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
];

const Radio = ({ selected }: { selected: boolean }) => (
  <View style={[styles.radio, selected ? styles.radioOn : styles.radioOff]}>
    {selected && <View style={styles.radioDot} />}
  </View>
);

export const LanguageScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const [selected, setSelected] = React.useState<string>('en');

  React.useEffect(() => {
    logScreenView('Onboarding_Language');
  }, []);

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('user_language', selected);
      // Apply for UI where translations exist; otherwise drives the AI language.
      await i18n.changeLanguage(selected);
    } catch (e) {
      console.warn('Failed to persist language:', e);
    }
    // TODO(flow): wire to screen 04 once it's built
    console.log('[Onboarding] Language selected:', selected);
  };

  return (
    <View style={styles.container}>
      {/* ── Faded portrait backdrop ── */}
      <ImageBackground
        source={bgImage}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.darkOverlay} />
        <LinearGradient
          colors={['rgba(21,21,26,0.4)', 'rgba(21,21,26,0)', '#15151a']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      {/* ── Content ── */}
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.pill} />
          <Text style={styles.title}>Choose her language</Text>
          <Text style={styles.subtitle}>
            Sarina will communicate with you in this language.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.form}>
          <View style={styles.listWrapper}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >
              {LANGUAGES.map((lang) => {
                const isSel = selected === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    activeOpacity={0.8}
                    onPress={() => setSelected(lang.code)}
                    style={[styles.option, isSel ? styles.optionOn : styles.optionOff]}
                  >
                    <Text style={[styles.optionText, isSel && styles.optionTextOn]}>
                      {lang.name}
                    </Text>
                    <Radio selected={isSel} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {/* Bottom fade so the list scrolls under a soft edge */}
            <LinearGradient
              colors={['rgba(21,21,26,0)', '#15151a']}
              style={styles.listFade}
              pointerEvents="none"
            />
          </View>

          {/* Continue */}
          <View style={styles.actionArea}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinue}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={['#ff5070', '#e01e50']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Continue</Text>
                <SvgXml xml={iconArrow} width={17} height={17} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15151a',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,21,26,0.8)',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  // Header
  header: {
    alignItems: 'center',
    paddingBottom: 32,
    gap: 8,
  },
  pill: {
    width: 64,
    height: 4,
    borderRadius: 9999,
    backgroundColor: '#ff5070',
    opacity: 0.8,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    lineHeight: 35,
    letterSpacing: 0.7,
    color: '#ffb2b9',
    textAlign: 'center',
    paddingTop: 8,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#a0a0a5',
    textAlign: 'center',
    maxWidth: 280,
  },
  // Options
  form: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  list: {
    gap: 16,
    paddingBottom: 16,
  },
  listFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 17,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionOn: {
    backgroundColor: 'rgba(42,42,44,0.8)',
    borderColor: 'rgba(255,80,112,0.7)',
  },
  optionOff: {
    backgroundColor: 'rgba(32,31,33,0.4)',
    borderColor: 'rgba(92,63,65,0.3)',
  },
  optionText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    lineHeight: 27,
    color: '#e5e1e4',
  },
  optionTextOn: {
    color: '#ffb2b9',
  },
  // Radio
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21,21,26,0.5)',
  },
  radioOn: {
    borderColor: '#ff5070',
  },
  radioOff: {
    borderColor: '#a0a0a5',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff5070',
  },
  // Action
  actionArea: {
    paddingTop: 24,
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 12,
    shadowColor: '#ff5070',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    letterSpacing: 0.2,
    color: '#ffffff',
  },
});

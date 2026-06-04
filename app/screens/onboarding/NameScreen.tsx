/**
 * Onboarding · Screen 07 — "What should {name} call you?" (name entry)
 * New flow design (Figma node 14:692)
 *
 * Atmospheric backdrop + a single text input for the user's name. Localized;
 * the title is interpolated with the selected character's name. Stores the
 * entered name in AsyncStorage ('user_name').
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView } from '../../services/firebaseAnalytics';
import { useNameStrings, interpolate } from '../../data/onboardingStrings';
import { SvgXml } from 'react-native-svg';
import { iconArrow } from './disclaimerIcons';

const bgImage = require('../../../assets/onboarding/name-bg.png');

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Name'>;
};

export const NameScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const strings = useNameStrings();
  const [charName, setCharName] = React.useState<string>('Your Companion');
  const [name, setName] = React.useState<string>('');
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    logScreenView('Onboarding_Name');
    AsyncStorage.getItem('selected_character')
      .then((raw) => {
        if (raw) {
          const c = JSON.parse(raw);
          if (c?.name) setCharName(c.name);
        }
      })
      .catch(() => {});
  }, []);

  const trimmed = name.trim();
  const canContinue = trimmed.length > 0;

  const handleContinue = async () => {
    if (!canContinue) return;
    try {
      await AsyncStorage.setItem('user_name', trimmed);
    } catch (e) {
      console.warn('Failed to persist name:', e);
    }
    console.log('[Onboarding] Name entered:', trimmed);
    navigation.navigate('Auth');
  };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <ImageBackground source={bgImage} style={StyleSheet.absoluteFill} resizeMode="cover">
          <LinearGradient
            colors={['rgba(21,21,26,0.8)', 'rgba(21,21,26,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header + progress */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={18} color="#e5e1e4" />
            </TouchableOpacity>
            <Text style={styles.step}>STEP 1 OF 4</Text>
            <View style={styles.backBtnSpacer} />
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Centered content */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headline}>
            <Text style={styles.title}>
              {interpolate(strings.nameTitle, { name: charName })}
            </Text>
            <Text style={styles.subtitle}>{strings.nameSubtitle}</Text>
          </View>

          <Pressable
            style={[styles.inputWrap, focused && styles.inputWrapFocused]}
            onPress={() => inputRef.current?.focus()}
          >
            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={setName}
              placeholder={strings.namePlaceholder}
              placeholderTextColor="#5a5a65"
              style={styles.input}
              selectionColor="#ff5070"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSubmitEditing={handleContinue}
              maxLength={40}
            />
          </Pressable>
        </ScrollView>

        {/* Footer CTA */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!canContinue}
            onPress={handleContinue}
            style={styles.buttonWrapper}
          >
            {canContinue ? (
              <LinearGradient
                colors={['#ff2a5f', '#e01e50']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{strings.continueLabel}</Text>
                <SvgXml xml={iconArrow} width={13} height={13} />
              </LinearGradient>
            ) : (
              <View style={[styles.button, styles.buttonDisabled]}>
                <Text style={styles.buttonText}>{strings.continueLabel}</Text>
                <SvgXml xml={iconArrow} width={13} height={13} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  flex: {
    flex: 1,
  },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(53,52,55,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(92,63,65,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnSpacer: {
    width: 40,
  },
  step: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#a0a0a5',
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: '100%',
    maxWidth: 384,
    height: 4,
    borderRadius: 9999,
    backgroundColor: '#353437',
    overflow: 'hidden',
  },
  progressFill: {
    width: '25%',
    height: '100%',
    borderRadius: 9999,
    backgroundColor: '#ffb2b9',
    shadowColor: '#ffb2b9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  // Content
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  headline: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    lineHeight: 38,
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
  // Input
  inputWrap: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5c3f41',
    backgroundColor: 'rgba(19,19,21,0.9)',
    padding: 3,
  },
  inputWrapFocused: {
    // Only change borderColor on focus. Toggling elevation/shadow here recreates
    // the native view on Android and drops the first tap's focus (multi-tap bug).
    borderColor: '#ff5070',
  },
  input: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6b7280',
    paddingHorizontal: 24,
    paddingVertical: Platform.OS === 'ios' ? 22 : 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 18,
    color: '#e5e1e4',
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    borderRadius: 12,
    shadowColor: '#e01e50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonDisabled: {
    backgroundColor: '#353437',
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    letterSpacing: 0.2,
    color: '#ffffff',
  },
});

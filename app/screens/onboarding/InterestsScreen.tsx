/**
 * Onboarding · Screen 05 — "What does she love?" (interests, multi-select)
 * New flow design (Figma node 23:131)
 *
 * Localized to the user's chosen language. Stores the English canonical
 * interest values (so the AI prompt stays consistent) while displaying
 * localized labels.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView } from '../../services/firebaseAnalytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useOnboardingStrings,
  formatStep,
  InterestLabels,
} from '../../data/onboardingStrings';
import { iconArrow } from './disclaimerIcons';

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Interests'>;
};

type Interest = {
  key: keyof InterestLabels;
  value: string; // English canonical value, stored/sent to AI
  icon: keyof typeof Ionicons.glyphMap;
};

const INTERESTS: Interest[] = [
  { key: 'lateNightWalks', value: 'Late-night walks', icon: 'walk' },
  { key: 'readingPoetry', value: 'Reading poetry', icon: 'book' },
  { key: 'gaming', value: 'Gaming', icon: 'game-controller' },
  { key: 'cooking', value: 'Cooking', icon: 'restaurant' },
  { key: 'travel', value: 'Travel', icon: 'airplane' },
  { key: 'music', value: 'Music', icon: 'musical-note' },
];

export const InterestsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const strings = useOnboardingStrings();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    logScreenView('Onboarding_Interests');
  }, []);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleFinalize = async () => {
    const chosen = INTERESTS.filter((i) => selected.has(i.key)).map((i) => i.value);
    try {
      await AsyncStorage.setItem('selected_interests', JSON.stringify(chosen));
    } catch (e) {
      console.warn('Failed to persist interests:', e);
    }
    // TODO(flow): wire to screen 06 once it's built
    console.log('[Onboarding] Interests selected:', chosen);
  };

  return (
    <View style={styles.container}>
      {/* Atmospheric glow */}
      <View style={styles.glow} pointerEvents="none" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color="#e5e1e4" />
        </TouchableOpacity>
        <Text style={styles.step}>{formatStep(strings.step, 3, 4)}</Text>
        <View style={styles.backBtnSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 140 + insets.bottom }]}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{strings.interestsTitle}</Text>
          <Text style={styles.subtitle}>{strings.interestsSubtitle}</Text>
        </View>

        <View style={styles.grid}>
          {INTERESTS.map((item) => {
            const isSel = selected.has(item.key);
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.85}
                onPress={() => toggle(item.key)}
                style={[styles.card, isSel ? styles.cardOn : styles.cardOff]}
              >
                <Ionicons
                  name={item.icon}
                  size={30}
                  color={isSel ? '#ffb2b9' : '#e5e1e4'}
                />
                <Text style={[styles.cardLabel, isSel && styles.cardLabelOn]}>
                  {strings.interests[item.key]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <BlurView
        intensity={24}
        tint="dark"
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleFinalize}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={['#ff2a5f', '#e01e50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{strings.finalizeConnection}</Text>
            <SvgXml xml={iconArrow} width={15} height={15} />
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const CARD_GAP = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15151a',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: '-25%',
    right: '-25%',
    height: 256,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,80,112,0.08)',
  },
  // Header
  header: {
    height: undefined,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1c1b1d',
    borderWidth: 1,
    borderColor: '#5c3f41',
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
  // Content
  scroll: {
    paddingHorizontal: 20,
  },
  titleBlock: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 32,
    paddingBottom: 48,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1,
    color: '#e5e1e4',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 18,
    lineHeight: 27,
    color: '#a0a0a5',
    textAlign: 'center',
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 142,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  cardOff: {
    backgroundColor: '#0e0e10',
    borderColor: '#5c3f41',
  },
  cardOn: {
    backgroundColor: 'rgba(255,80,112,0.1)',
    borderColor: '#ff5070',
    shadowColor: '#ff5070',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  cardLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#a0a0a5',
    textAlign: 'center',
  },
  cardLabelOn: {
    color: '#ffb2b9',
  },
  // Bottom CTA
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 21,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(21,21,26,0.8)',
    borderTopWidth: 1,
    borderTopColor: '#353437',
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 12,
    shadowColor: '#ff2a5f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    letterSpacing: 0.2,
    color: '#ffffff',
  },
});

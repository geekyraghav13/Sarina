/**
 * Onboarding · Screen 06 — "Customize {name}'s Interests" (topic chips)
 * New flow design (Figma node 39:204)
 *
 * Uses the selected character's name. Localized chrome + category headers;
 * topic chip labels are kept as canonical English (genre/borrowed terms,
 * also the values stored for the AI). Multi-select up to MAX_TOPICS.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView, logTopicsSelected } from '../../services/firebaseAnalytics';
import {
  useTopicsStrings,
  useTopicLabel,
  interpolate,
  TopicsStrings,
} from '../../data/onboardingStrings';
import { iconArrow } from './disclaimerIcons';

const heartIcon = require('../../../assets/onboarding/heart-3d.jpg');

const MAX_TOPICS = 5;

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Topics'>;
};

type CategoryKey = 'catMusic' | 'catLiterature' | 'catLifestyle';
type Category = {
  key: CategoryKey;
  icon: keyof typeof Ionicons.glyphMap;
  topics: string[]; // canonical English topic values
};

const CATEGORIES: Category[] = [
  { key: 'catMusic', icon: 'headset', topics: ['Indie Rock', 'Classical Piano', 'Techno', 'Jazz', 'Lo-Fi Beats'] },
  { key: 'catLiterature', icon: 'book', topics: ['Dark Romance', 'Sci-Fi', 'Poetry', 'Thrillers'] },
  { key: 'catLifestyle', icon: 'cafe', topics: ['Gourmet Cooking', 'Fitness', 'Yoga', 'Gaming', 'Travel', 'Photography'] },
];

export const TopicsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const strings: TopicsStrings = useTopicsStrings();
  const topicLabel = useTopicLabel();
  const [name, setName] = React.useState<string>('Your Companion');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    logScreenView('Onboarding_Topics');
    AsyncStorage.getItem('selected_character')
      .then((raw) => {
        if (raw) {
          const c = JSON.parse(raw);
          if (c?.name) setName(c.name);
        }
      })
      .catch(() => {});
  }, []);

  const toggle = (topic: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else if (next.size < MAX_TOPICS) {
        next.add(topic);
      }
      return next;
    });
  };

  const count = selected.size;
  const canContinue = count > 0;

  const handleContinue = async () => {
    if (!canContinue) return;
    try {
      await AsyncStorage.setItem('selected_topics', JSON.stringify([...selected]));
    } catch (e) {
      console.warn('Failed to persist topics:', e);
    }
    console.log('[Onboarding] Topics selected:', [...selected]);
    logTopicsSelected([...selected]);
    navigation.navigate('Name');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: 150 + insets.bottom },
        ]}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heartBox}>
            <Image source={heartIcon} style={styles.heartImg} resizeMode="cover" />
          </View>
          <Text style={styles.title}>
            {interpolate(strings.customizeTitle, { name })}
          </Text>
          <Text style={styles.subtitle}>{strings.topicsSubtitle}</Text>
        </View>

        {/* Categories */}
        {CATEGORIES.map((cat) => (
          <View key={cat.key} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={cat.icon} size={18} color="#ff5070" />
              <Text style={styles.sectionTitle}>{strings[cat.key]}</Text>
            </View>
            <View style={styles.chips}>
              {cat.topics.map((topic) => {
                const isSel = selected.has(topic);
                return (
                  <TouchableOpacity
                    key={topic}
                    activeOpacity={0.85}
                    onPress={() => toggle(topic)}
                    style={[styles.chip, isSel ? styles.chipOn : styles.chipOff]}
                  >
                    <Text style={[styles.chipText, isSel && styles.chipTextOn]}>
                      {topicLabel(topic)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Fixed bottom action area */}
      <BlurView
        intensity={30}
        tint="dark"
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
      >
        <View style={styles.counter}>
          <View style={styles.counterCircle}>
            <Text style={styles.counterNum}>{count}</Text>
          </View>
          <Text style={styles.counterText}>
            {interpolate(strings.ofSelected, { n: MAX_TOPICS })}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canContinue}
          onPress={handleContinue}
          style={styles.buttonWrapper}
        >
          {canContinue ? (
            <LinearGradient
              colors={['#ff5070', '#e01e50']}
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
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  // Hero
  hero: {
    gap: 8,
    marginBottom: 48,
  },
  heartBox: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a22',
    borderWidth: 1,
    borderColor: 'rgba(92,63,65,0.3)',
    marginBottom: 16,
    shadowColor: '#ff2a5f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  heartImg: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 40,
    lineHeight: 50,
    color: '#e5e1e4',
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 18,
    lineHeight: 27,
    color: '#a0a0a5',
  },
  // Sections
  section: {
    gap: 16,
    marginBottom: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 20,
    lineHeight: 27,
    color: '#e5e1e4',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 25,
    paddingVertical: 9,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipOff: {
    backgroundColor: '#131315',
    borderColor: '#5c3f41',
  },
  chipOn: {
    backgroundColor: 'rgba(255,80,112,0.1)',
    borderColor: '#ff5070',
  },
  chipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#e5e1e4',
  },
  chipTextOn: {
    color: '#ffb2b9',
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 17,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(21,21,26,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(53,52,55,0.5)',
    alignItems: 'center',
    gap: 16,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a22',
    borderWidth: 1,
    borderColor: '#5c3f41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterNum: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 20,
    lineHeight: 27,
    color: '#ffb2b9',
  },
  counterText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#a0a0a5',
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 9999,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 9999,
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

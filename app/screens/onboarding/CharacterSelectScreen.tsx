/**
 * Onboarding · Screen 04 — "Who catches your eye?" (character selection)
 * New flow design (Figma node 15:1119)
 *
 * A 2-column grid of character cards loaded from Firestore (with offline
 * fallback). Tapping a card selects it; "Start Chatting" continues the flow.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView, logCharacterSelected, logCategorySelected } from '../../services/firebaseAnalytics';
import { fetchCharacters } from '../../services/characterService';
import { Character, characterImageSource, ALL_CATEGORY } from '../../data/characters';
import { CategoryBar, filterByCategory } from '../../components/CategoryBar';
import { useOnboardingStrings } from '../../data/onboardingStrings';
import { useSoftReviewPrompt } from '../../hooks/useSoftReviewPrompt';

const { width } = Dimensions.get('window');
const H_PADDING = 20;
const GAP = 16;
const CARD_W = (width - H_PADDING * 2 - GAP) / 2;
const CARD_H = CARD_W * 1.34; // ~167×223 per Figma

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'CharacterSelect'>;
};

const CharacterCard = ({
  character,
  selected,
  onPress,
}: {
  character: Character;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={onPress}
    style={[styles.card, selected && styles.cardSelected]}
  >
    <Image
      source={characterImageSource(character)}
      style={styles.cardImage}
      resizeMode="cover"
    />
    <LinearGradient
      colors={['rgba(19,19,21,0)', 'rgba(19,19,21,0.9)']}
      locations={[0.5, 1]}
      style={styles.cardOverlay}
    >
      <Text style={styles.cardName} numberOfLines={1}>
        {character.name}
      </Text>
      <Text style={styles.cardTagline} numberOfLines={1}>
        {character.tagline}
      </Text>
    </LinearGradient>
    {selected && (
      <View style={styles.checkBadge}>
        <Ionicons name="checkmark" size={14} color="#ffffff" />
      </View>
    )}
  </TouchableOpacity>
);

export const CharacterSelectScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const strings = useOnboardingStrings();
  const [characters, setCharacters] = React.useState<Character[] | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState<string>(ALL_CATEGORY);
  const listRef = React.useRef<FlatList<Character>>(null);
  // Peak moment: the user just picked "their" girlfriend — a high-delight beat.
  // Gated by the 60-day cooldown in reviewPromptService so it never nags.
  const { showIfEligible, promptElement } = useSoftReviewPrompt('character_selected');

  React.useEffect(() => {
    logScreenView('Onboarding_CharacterSelect');
    let active = true;
    fetchCharacters().then((list) => {
      if (active) setCharacters(list);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleStart = async () => {
    const chosen = characters?.find((c) => c.id === selectedId);
    if (!chosen) return;
    try {
      await AsyncStorage.setItem('selected_character', JSON.stringify(chosen));
    } catch (e) {
      console.warn('Failed to persist selected character:', e);
    }
    console.log('[Onboarding] Character selected:', chosen.name);
    logCharacterSelected(chosen.id, chosen.name, chosen.categories?.[0]);
    // Show the soft review prompt if eligible, then continue. If the cooldown
    // hasn't elapsed, this navigates immediately (onComplete fires right away).
    showIfEligible(() => navigation.navigate('Interests'));
  };

  // Categories present in the loaded roster (so empty pills never show).
  const available = React.useMemo(() => {
    const set = new Set<string>();
    characters?.forEach((c) => c.categories?.forEach((cat) => set.add(cat)));
    return Array.from(set);
  }, [characters]);

  const filtered = React.useMemo(
    () => (characters ? filterByCategory(characters, category) : []),
    [characters, category],
  );

  // Reset scroll to the top whenever the category changes, so switching from a
  // scrolled-down list doesn't leave the new list mid-way down.
  const onSelectCategory = (cat: string) => {
    setCategory(cat);
    logCategorySelected(cat, 'onboarding');
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  return (
    <View style={styles.container}>
      {/* Pinned header + category filter bar */}
      <View style={{ paddingTop: insets.top + 32 }}>
        <View style={styles.header}>
          <Text style={styles.title}>{strings.characterTitle}</Text>
          <Text style={styles.subtitle}>{strings.characterSubtitle}</Text>
        </View>
        {characters !== null && (
          <CategoryBar
            selected={category}
            onSelect={onSelectCategory}
            available={available}
          />
        )}
      </View>

      {characters === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#ff5070" size="large" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={(c) => c.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 140 + insets.bottom },
          ]}
          initialNumToRender={8}
          windowSize={5}
          removeClippedSubviews
          renderItem={({ item }) => (
            <CharacterCard
              character={item}
              selected={selectedId === item.id}
              onPress={() => setSelectedId(item.id)}
            />
          )}
        />
      )}

      {/* Fixed bottom CTA */}
      <BlurView
        intensity={30}
        tint="dark"
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!selectedId}
          onPress={handleStart}
          style={[styles.buttonWrapper, !selectedId && styles.buttonDisabled]}
        >
          <LinearGradient
            colors={['#ff5070', '#e01e50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{strings.startChatting}</Text>
            <Ionicons name="heart" size={18} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>

      {promptElement}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 16,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    lineHeight: 35,
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
  loading: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
  },
  // Grid
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1d1d22',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#ff5070',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 16,
  },
  cardName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    lineHeight: 27,
    color: '#e5e1e4',
  },
  cardTagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16.8,
    color: '#ffb2b9',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff5070',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Bottom CTA
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(19,19,21,0.9)',
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 12,
    shadowColor: '#ff2a5f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
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

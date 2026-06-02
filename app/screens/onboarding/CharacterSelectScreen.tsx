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
  ScrollView,
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
import { logScreenView } from '../../services/firebaseAnalytics';
import { fetchCharacters } from '../../services/characterService';
import { Character, characterImageSource } from '../../data/characters';

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
  const [characters, setCharacters] = React.useState<Character[] | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

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
    // TODO(flow): wire to screen 05 once it's built
    console.log('[Onboarding] Character selected:', chosen.name);
  };

  return (
    <View style={styles.container}>
      {/* Header + grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 32, paddingBottom: 140 + insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Who catches your eye?</Text>
          <Text style={styles.subtitle}>
            Select a companion to begin your journey.
          </Text>
        </View>

        {characters === null ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#ff5070" size="large" />
          </View>
        ) : (
          <View style={styles.grid}>
            {characters.map((c) => (
              <CharacterCard
                key={c.id}
                character={c}
                selected={selectedId === c.id}
                onPress={() => setSelectedId(c.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

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
            <Text style={styles.buttonText}>Start Chatting</Text>
            <Ionicons name="heart" size={18} color="#ffffff" />
          </LinearGradient>
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
    paddingHorizontal: H_PADDING,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 32,
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
    paddingTop: 80,
    alignItems: 'center',
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
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

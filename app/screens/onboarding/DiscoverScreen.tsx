/**
 * Discover — "Choose your Companion" grid (Figma node 39:1046).
 *
 * 2-column grid of all characters; tapping a card opens the shared ChatScreen
 * for that companion. Shares the bottom nav with Home. Expo-Go-safe.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView, logCategorySelected, logCharacterCardTapped } from '../../services/firebaseAnalytics';
import { useHomeStrings } from '../../data/onboardingStrings';
import { fetchCharacters } from '../../services/characterService';
import { Character, characterImageSource, ALL_CATEGORY } from '../../data/characters';
import { CategoryBar, filterByCategory } from '../../components/CategoryBar';
import { BottomNav } from './BottomNav';

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Discover'>;
};

export const DiscoverScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const strings = useHomeStrings();
  const [characters, setCharacters] = React.useState<Character[] | null>(null);
  const [category, setCategory] = React.useState<string>(ALL_CATEGORY);
  const listRef = React.useRef<FlatList<Character>>(null);

  React.useEffect(() => {
    logScreenView('Discover');
    fetchCharacters()
      .then((list) => setCharacters(list))
      .catch(() => setCharacters([]));
  }, []);

  const available = React.useMemo(() => {
    const set = new Set<string>();
    characters?.forEach((c) => c.categories?.forEach((cat) => set.add(cat)));
    return Array.from(set);
  }, [characters]);

  const filtered = React.useMemo(
    () => (characters ? filterByCategory(characters, category) : []),
    [characters, category],
  );

  const onSelectCategory = (cat: string) => {
    setCategory(cat);
    logCategorySelected(cat, 'discover');
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  return (
    <View style={styles.container}>
      {/* Pinned heading + category filter bar */}
      <View style={{ paddingTop: insets.top + 64 + 8 }}>
        <View style={styles.heading}>
          <Text style={styles.title}>{strings.discoverTitle}</Text>
          <Text style={styles.subtitle}>{strings.discoverSubtitle}</Text>
        </View>
        {characters !== null && (
          <CategoryBar
            selected={category}
            onSelect={onSelectCategory}
            available={available}
            style={{ paddingTop: 16 }}
          />
        )}
      </View>

      {characters === null ? (
        <ActivityIndicator color="#ff5070" style={{ marginTop: 40 }} />
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
            { paddingBottom: insets.bottom + 110 },
          ]}
          initialNumToRender={8}
          windowSize={5}
          removeClippedSubviews
          renderItem={({ item: c }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => {
                logCharacterCardTapped(c.id, c.name, c.categories?.[0]);
                navigation.navigate('Chat', { character: c });
              }}
            >
              <Image source={characterImageSource(c)} style={styles.cardImg} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(19,19,21,0)', 'rgba(19,19,21,0.9)']}
                style={styles.cardOverlay}
              >
                <Text style={styles.cardName} numberOfLines={1}>{c.name}</Text>
                <Text style={styles.cardTag} numberOfLines={1}>{c.tagline}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Top app bar (brand) */}
      <LinearGradient
        colors={['#15151a', 'rgba(21,21,26,0)']}
        style={[styles.header, { height: insets.top + 64, paddingTop: insets.top }]}
      >
        <Text style={styles.brand}>Sarina</Text>
      </LinearGradient>

      <BottomNav
        active="discover"
        onMessages={() => navigation.navigate('Home')}
        onSettings={() => navigation.navigate('Settings')}
      />
    </View>
  );
};

const CARD_GAP = 16;
const CARD_W = (Dimensions.get('window').width - 40 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131315' },
  listContent: { paddingHorizontal: 20, paddingTop: 24 },
  row: { gap: CARD_GAP, marginBottom: CARD_GAP },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  brand: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    letterSpacing: -0.8,
    color: '#ffb2b9',
  },
  heading: { gap: 8, alignItems: 'center' },
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_W,
    height: 222,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a22',
  },
  cardImg: {
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
  cardTag: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16.8,
    color: '#ffb2b9',
    marginTop: 2,
  },
});

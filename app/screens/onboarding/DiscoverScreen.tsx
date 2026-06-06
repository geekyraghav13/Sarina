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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView } from '../../services/firebaseAnalytics';
import { useHomeStrings } from '../../data/onboardingStrings';
import { fetchCharacters } from '../../services/characterService';
import { Character, characterImageSource } from '../../data/characters';
import { BottomNav } from './BottomNav';

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Discover'>;
};

export const DiscoverScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const strings = useHomeStrings();
  const [characters, setCharacters] = React.useState<Character[] | null>(null);

  React.useEffect(() => {
    logScreenView('Discover');
    fetchCharacters()
      .then((list) => setCharacters(list))
      .catch(() => setCharacters([]));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 64 + 8, paddingBottom: insets.bottom + 110 },
        ]}
      >
        <View style={styles.heading}>
          <Text style={styles.title}>{strings.discoverTitle}</Text>
          <Text style={styles.subtitle}>{strings.discoverSubtitle}</Text>
        </View>

        {characters === null ? (
          <ActivityIndicator color="#ff5070" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {characters.map((c) => (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.85}
                style={styles.card}
                onPress={() => navigation.navigate('Chat', { character: c })}
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
            ))}
          </View>
        )}
      </ScrollView>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131315' },
  scroll: { paddingHorizontal: 20, gap: 32 },
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
    flexGrow: 1,
    flexBasis: '47%',
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

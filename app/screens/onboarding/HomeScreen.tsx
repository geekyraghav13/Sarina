/**
 * Home — "Recent Connections" (Figma node 23:13).
 *
 * The Messages tab: lists ONLY characters the user has actually chatted with
 * (from local chat history), most-recent first, with a last-message preview.
 * Tapping one reopens the shared ChatScreen. Browse all characters in Discover.
 * Refreshes whenever the screen regains focus (e.g. after returning from a chat).
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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/onboardingTypes';
import { logScreenView } from '../../services/firebaseAnalytics';
import { useHomeStrings } from '../../data/onboardingStrings';
import { fetchCharacters } from '../../services/characterService';
import { Character, characterImageSource } from '../../data/characters';
import { listConversations } from '../../services/chatHistoryService';
import { BottomNav } from './BottomNav';

type Props = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Home'>;
};

type Row = { character: Character; lastText: string; lastTs: number };

const relTime = (ts: number, justNow: string): string => {
  if (!ts) return '';
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return justNow;
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const strings = useHomeStrings();
  const [rows, setRows] = React.useState<Row[] | null>(null);

  const load = React.useCallback(async () => {
    const [convos, chars] = await Promise.all([listConversations(), fetchCharacters()]);
    const byId: Record<string, Character> = {};
    chars.forEach((c) => { byId[c.id] = c; });
    const built: Row[] = convos
      .map((c) => ({ character: byId[c.characterId], lastText: c.lastText, lastTs: c.lastTs }))
      .filter((r): r is Row => !!r.character);
    setRows(built);
  }, []);

  React.useEffect(() => {
    logScreenView('Home');
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 64 + 16, paddingBottom: insets.bottom + 110 },
        ]}
      >
        <View style={styles.heading}>
          <Text style={styles.title}>{strings.recentTitle}</Text>
          <Text style={styles.subtitle}>{strings.recentSubtitle}</Text>
        </View>

        {rows === null ? (
          <ActivityIndicator color="#ff5070" style={{ marginTop: 40 }} />
        ) : rows.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={40} color="#5a5a65" />
            <Text style={styles.emptyTitle}>{strings.emptyTitle}</Text>
            <Text style={styles.emptySubtitle}>{strings.emptySubtitle}</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Discover')}
            >
              <Ionicons name="compass" size={18} color="#ffb2b9" />
              <Text style={styles.emptyBtnText}>{strings.navDiscover}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {rows.map(({ character: c, lastText, lastTs }) => (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.8}
                style={styles.row}
                onPress={() => navigation.navigate('Chat', { character: c })}
              >
                <View style={styles.avatarWrap}>
                  <Image source={characterImageSource(c)} style={styles.avatar} />
                  <View style={styles.onlineDot} />
                </View>
                <View style={styles.rowText}>
                  <View style={styles.rowTop}>
                    <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.time}>{relTime(lastTs, strings.justNow)}</Text>
                  </View>
                  <Text style={styles.preview} numberOfLines={1}>{lastText}</Text>
                </View>
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
        active="messages"
        onDiscover={() => navigation.navigate('Discover')}
        onSettings={() => navigation.navigate('Settings')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131315' },
  scroll: { paddingHorizontal: 20, gap: 24 },
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
  heading: { gap: 4 },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    lineHeight: 35,
    color: '#e5e1e4',
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#a0a0a5',
  },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1c1b1d',
  },
  avatarWrap: { width: 56, height: 56 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00e475',
    borderWidth: 2,
    borderColor: '#1c1b1d',
  },
  rowText: { flex: 1, gap: 4 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    lineHeight: 27,
    color: '#e5e1e4',
  },
  time: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 16.8,
    color: '#5a5a65',
    marginLeft: 8,
  },
  preview: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#e6bcbf',
  },
  // Empty state
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: '#e5e1e4',
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#a0a0a5',
    textAlign: 'center',
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#5c3f41',
    backgroundColor: 'rgba(255,80,112,0.08)',
  },
  emptyBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#ffb2b9',
  },
});

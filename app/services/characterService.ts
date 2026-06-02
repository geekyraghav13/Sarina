/**
 * Character service — loads the character roster for the new onboarding flow.
 *
 * Source of truth: Firestore `characters` collection, read over the plain
 * Firestore REST API (no native Firebase module, no auth token required —
 * the collection has public read). Results are cached in AsyncStorage and
 * fall back to the bundled roster when offline.
 *
 * Kept self-contained (only `fetch` + AsyncStorage) so it runs in Expo Go.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, FALLBACK_CHARACTERS } from '../data/characters';

const PROJECT_ID = 'sarina-ai-2b2c1';
const API_KEY = 'AIzaSyCoso8vP9ZY6fCGq3g-bgOyEdLDja9Dyo0';
const CHARACTERS_URL =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
  `/databases/(default)/documents/characters?key=${API_KEY}&pageSize=100`;

const CACHE_KEY = 'cached_characters_v1';

// ── Firestore REST value parsing ─────────────────────────────────────────────
type FsValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  arrayValue?: { values?: FsValue[] };
};

const fsString = (v?: FsValue): string => v?.stringValue ?? '';
const fsNumber = (v?: FsValue): number =>
  v?.integerValue != null
    ? parseInt(v.integerValue, 10)
    : v?.doubleValue ?? 0;
const fsArray = (v?: FsValue): string[] =>
  (v?.arrayValue?.values ?? []).map((x) => fsString(x)).filter(Boolean);

const parseDocument = (doc: any, index: number): Character | null => {
  const f = doc?.fields;
  if (!f || !f.name) return null;
  // Firestore doc path: .../documents/characters/<docId>
  const id = fsString(f.id) || String(doc.name).split('/').pop() || String(index);
  return {
    id,
    name: fsString(f.name),
    tagline: fsString(f.tagline),
    appearance: fsString(f.appearance) || 'realistic',
    personality: fsArray(f.personality),
    interests: fsArray(f.interests),
    tone: fsArray(f.tone),
    imageUrl: fsString(f.imageUrl) || undefined,
    order: f.order ? fsNumber(f.order) : index,
  };
};

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch the character roster. Tries Firestore first; on any failure returns the
 * last cached list, or the bundled fallback roster. Never throws.
 */
export const fetchCharacters = async (): Promise<Character[]> => {
  try {
    const res = await fetch(CHARACTERS_URL);
    if (!res.ok) throw new Error(`Firestore HTTP ${res.status}`);

    const data = await res.json();
    const docs: any[] = data.documents ?? [];
    const characters = docs
      .map(parseDocument)
      .filter((c): c is Character => c !== null)
      .sort((a, b) => a.order - b.order);

    if (characters.length === 0) throw new Error('Empty characters collection');

    // Cache for offline use
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(characters));
    return characters;
  } catch (err) {
    console.warn('[characterService] Firestore fetch failed, using cache/fallback:', err);
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached) as Character[];
    } catch {
      // ignore cache read errors
    }
    return FALLBACK_CHARACTERS;
  }
};

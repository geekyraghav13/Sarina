/**
 * Character roster + types for the new onboarding flow.
 *
 * The live source of truth is the Firestore `characters` collection
 * (fetched in characterService). This file provides:
 *   - the Character type
 *   - the 6 Figma "hero" characters (with bundled images as offline fallback)
 *   - a combined FALLBACK roster (Figma 6 first, then the legacy app roster,
 *     de-duplicated by name) used when the network/Firestore is unavailable.
 */

import rawAppCharacters from '../../firebase-characters.json';

/**
 * Category filter taxonomy (drives the top scrollable bar on the character
 * grids). A character can belong to several (e.g. ["Latina","Realistic"]).
 * "All" is a virtual tab handled in the UI — it is never stored on a character.
 */
export const CHARACTER_CATEGORIES = [
  'Realistic',
  'Anime',
  'Latina',
  'Asian',
  'Ebony',
  'Fantasy',
  'Cosplay',
] as const;

export type CharacterCategory = (typeof CHARACTER_CATEGORIES)[number];

/** The virtual "show everything" tab shown first in the filter bar. */
export const ALL_CATEGORY = 'All';

export interface Character {
  id: string;
  name: string;
  /** Short card subtitle — Figma archetype ("The Boss") or legacy emoji tagline. */
  tagline: string;
  appearance: string;
  personality: string[];
  interests: string[];
  tone: string[];
  /** Filter categories for the top bar (e.g. ["Latina","Realistic"]). */
  categories: string[];
  /** Bespoke opening-story bubbles (overrides the generic story when present). */
  story?: string[];
  /** Remote (Firebase Storage) image URL — present once seeded to the backend. */
  imageUrl?: string;
  /** Bundled fallback image (Figma 6 only) used when there's no remote URL. */
  localImage?: number;
  /** Sort order; lower shows first. Figma heroes occupy 0..5. */
  order: number;
}

/**
 * Map a legacy `appearance` value to filter categories, so the existing roster
 * shows up under the new bar even before the generated characters land.
 */
export const categoriesFromAppearance = (appearance?: string): string[] => {
  switch ((appearance || '').toLowerCase()) {
    case 'realistic':
      return ['Realistic'];
    case 'anime':
      return ['Anime'];
    case 'fantasy':
      return ['Fantasy'];
    default:
      return ['Realistic'];
  }
};

// Bundled images for the 6 Figma hero characters (offline fallback).
const figmaImages: Record<string, number> = {
  victoria: require('../../assets/characters/victoria.jpg'),
  jax: require('../../assets/characters/jax.jpg'),
  elena: require('../../assets/characters/elena.jpg'),
  maya: require('../../assets/characters/maya.jpg'),
  luna: require('../../assets/characters/luna.jpg'),
  sophia: require('../../assets/characters/sophia.jpg'),
};

/**
 * The 6 hero characters from the Figma design. Personality/interests/tone are
 * crafted from each archetype and can be refined later (they drive chat/voice).
 */
export const FIGMA_CHARACTERS: Character[] = [
  {
    id: 'victoria',
    name: 'Victoria',
    tagline: 'The Boss',
    appearance: 'realistic',
    personality: ['Confident', 'Ambitious'],
    interests: ['Business', 'Fine Wine'],
    tone: ['Commanding', 'Sophisticated'],
    categories: ['Realistic'],
    localImage: figmaImages.victoria,
    order: 0,
  },
  {
    id: 'jax',
    name: 'Jax',
    tagline: 'The Rebel',
    appearance: 'realistic',
    personality: ['Bold', 'Free-spirited'],
    interests: ['Music', 'Motorcycles'],
    tone: ['Edgy', 'Playful'],
    categories: ['Realistic'],
    localImage: figmaImages.jax,
    order: 1,
  },
  {
    id: 'elena',
    name: 'Elena',
    tagline: 'The Bold',
    appearance: 'realistic',
    personality: ['Daring', 'Passionate'],
    interests: ['Travel', 'Dancing'],
    tone: ['Fiery', 'Direct'],
    categories: ['Latina', 'Realistic'],
    localImage: figmaImages.elena,
    order: 2,
  },
  {
    id: 'maya',
    name: 'Maya',
    tagline: 'The Seductive',
    appearance: 'realistic',
    personality: ['Flirty', 'Alluring'],
    interests: ['Poetry', 'Wine Tasting'],
    tone: ['Sultry', 'Teasing'],
    categories: ['Realistic'],
    localImage: figmaImages.maya,
    order: 3,
  },
  {
    id: 'luna',
    name: 'Luna',
    tagline: 'The Mysterious',
    appearance: 'realistic',
    personality: ['Enigmatic', 'Deep'],
    interests: ['Astrology', 'Art'],
    tone: ['Mysterious', 'Soft'],
    categories: ['Fantasy', 'Realistic'],
    localImage: figmaImages.luna,
    order: 4,
  },
  {
    id: 'sophia',
    name: 'Sophia',
    tagline: 'The Fierce',
    appearance: 'realistic',
    personality: ['Strong', 'Independent'],
    interests: ['Fitness', 'Adventure'],
    tone: ['Bold', 'Warm'],
    categories: ['Realistic'],
    localImage: figmaImages.sophia,
    order: 5,
  },
];

// Names already covered by the Figma heroes — legacy dupes are dropped.
const FIGMA_NAMES = new Set(FIGMA_CHARACTERS.map((c) => c.name.toLowerCase()));

const legacyCharacters: Character[] = (rawAppCharacters as any[])
  .filter((c) => !FIGMA_NAMES.has(String(c.name).toLowerCase()))
  .map((c, i) => ({
    id: String(c.id),
    name: c.name,
    tagline: c.tagline,
    appearance: c.appearance,
    personality: c.personality ?? [],
    interests: c.interests ?? [],
    tone: c.tone ?? [],
    categories: c.categories ?? categoriesFromAppearance(c.appearance),
    imageUrl: c.imageUrl,
    order: FIGMA_CHARACTERS.length + i,
  }));

/** Combined offline roster: Figma heroes first, then the legacy app roster. */
export const FALLBACK_CHARACTERS: Character[] = [
  ...FIGMA_CHARACTERS,
  ...legacyCharacters,
];

/** Image source helper that prefers a remote URL, falling back to bundled. */
export const characterImageSource = (c: Character) =>
  c.imageUrl ? { uri: c.imageUrl } : c.localImage;

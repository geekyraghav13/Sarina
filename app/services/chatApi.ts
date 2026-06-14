/**
 * Chat AI client for the new flow.
 *
 * Calls the existing backend Gemini proxy (POST /api/chat) — the Gemini key
 * lives server-side and is NEVER shipped to the client. Authentication uses the
 * current Firebase user's ID token, read directly from config/firebase (works
 * for both guest/anonymous and Google users). Deliberately does NOT import
 * authService, so it pulls in no native Google-Sign-In module.
 */

import { auth } from '../config/firebase';
import { Character } from '../data/characters';
import type { PendingNotifications } from './userEngagementService';
import { logAiReplyReceived, logAiReplyFailed } from './firebaseAnalytics';

const BACKEND_URL = 'https://sarina-voice-backend-1051121433445.us-central1.run.app';

export type ChatTurn = { sender: 'ai' | 'user'; text: string };

// Localized "something went wrong" line, shown in-bubble on a network/backend
// error so a non-English user never sees an English blip.
const FALLBACKS: Record<string, string> = {
  en: 'Sorry, my mind wandered for a second... what were you saying? 😊',
  es: 'Perdona, me distraje un momento... ¿qué decías? 😊',
  fr: "Désolée, je me suis évadée une seconde... tu disais ? 😊",
  de: 'Entschuldige, ich war kurz abgelenkt... was hast du gesagt? 😊',
  ja: 'ごめん、少しぼーっとしてた…何て言ってた？😊',
  pt: 'Desculpa, me distraí um instante... o que você dizia? 😊',
  zh: '抱歉，我走神了一下……你刚说什么？😊',
  tr: 'Pardon, bir an daldım... ne diyordun? 😊',
  ru: 'Прости, я на секунду задумалась... что ты говорил? 😊',
  hi: 'माफ़ करना, ज़रा ध्यान भटक गया... तुम क्या कह रहे थे? 😊',
  it: 'Scusa, mi sono distratta un attimo... cosa dicevi? 😊',
  nl: 'Sorry, ik was even afgeleid... wat zei je? 😊',
  id: 'Maaf, aku melamun sebentar... tadi bilang apa? 😊',
  th: 'ขอโทษนะ เผลอใจลอยไปแป๊บ... เมื่อกี้ว่าไงนะ? 😊',
  ar: 'آسفة، شرد ذهني للحظة... ماذا كنت تقول؟ 😊',
};

const fallbackFor = (lang: string | undefined): string => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return FALLBACKS[code] || FALLBACKS.en;
};

// App language code → English name of the language, sent to the backend so the
// companion always replies in the user's selected language.
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese',
  pt: 'Portuguese', zh: 'Chinese', tr: 'Turkish', ru: 'Russian', hi: 'Hindi',
  it: 'Italian', nl: 'Dutch', id: 'Indonesian', th: 'Thai', ar: 'Arabic',
};

const languageNameFor = (lang: string | undefined): string => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return LANGUAGE_NAMES[code] || 'English';
};

/** Shape the Character into the profile the backend expects. */
const toProfile = (c: Character) => ({
  id: c.id,
  name: c.name,
  tagline: c.tagline,
  appearance: c.appearance,
  personality: c.personality,
  interests: c.interests,
  tone: c.tone,
  imageUrl: c.imageUrl,
});

/**
 * Generate the companion's reply. Returns a friendly fallback line on any
 * network/auth/backend error (never throws), so the chat keeps flowing.
 */
export const generateReply = async (
  userMessage: string,
  character: Character,
  history: ChatTurn[],
  userName: string,
  lang: string
): Promise<string> => {
  const startedAt = Date.now();
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const token = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: userMessage,
        characterProfile: toProfile(character),
        chatHistory: history.slice(-10).map((t) => ({ sender: t.sender, text: t.text })),
        userName: userName || 'You',
        language: (lang || 'en').split('-')[0].toLowerCase(),
        languageName: languageNameFor(lang),
      }),
    });

    if (!response.ok) {
      console.warn('Chat API error:', response.status, await response.text());
      logAiReplyFailed(`http_${response.status}`, character.id);
      return fallbackFor(lang);
    }

    const data = await response.json();
    const reply = data?.response as string | undefined;
    if (!reply) {
      logAiReplyFailed('empty_response', character.id);
      return fallbackFor(lang);
    }
    logAiReplyReceived(character.id, Date.now() - startedAt);
    return reply;
  } catch (error) {
    console.warn('generateReply failed:', error);
    logAiReplyFailed('exception', character.id);
    return fallbackFor(lang);
  }
};

/**
 * Generate the 3 re-engagement notifications from the user's recent messages
 * (in their language). Returns null on failure so the caller can skip writing.
 */
export const generateNotifications = async (
  character: Character,
  userName: string,
  lastMessages: string[],
  lang: string
): Promise<PendingNotifications | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        characterProfile: toProfile(character),
        userName: userName || 'You',
        lastMessages: lastMessages.slice(-7),
        language: (lang || 'en').split('-')[0].toLowerCase(),
        languageName: languageNameFor(lang),
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (data?.n1?.body && data?.n2?.body && data?.n3?.body) {
      return data as PendingNotifications;
    }
    return null;
  } catch (error) {
    console.warn('generateNotifications failed:', error);
    return null;
  }
};

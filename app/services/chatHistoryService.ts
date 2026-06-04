/**
 * Local (on-device) chat history — per character.
 *
 * Stored in AsyncStorage only (no cloud for now; a server-side store may be
 * added later). Fully Expo-Go-safe — no Firebase/native imports. Keeps the same
 * loadConversation / saveConversation interface the ChatScreen already uses.
 *
 * Only the REAL conversation turns are stored — the predefined opening story is
 * re-rendered fresh on each open (so it always matches the user's language) and
 * is NOT persisted.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredTurn = { sender: 'ai' | 'user'; text: string; ts: number };
export type ConversationSummary = { characterId: string; lastText: string; lastTs: number };

const PREFIX = '@chat_history:';
const keyFor = (characterId: string) => `${PREFIX}${characterId}`;

/** Load saved conversation turns for a character (empty if none/corrupt). */
export const loadConversation = async (characterId: string): Promise<StoredTurn[]> => {
  try {
    const raw = await AsyncStorage.getItem(keyFor(characterId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredTurn[]) : [];
  } catch (e) {
    console.warn('loadConversation error:', e);
    return [];
  }
};

/** Overwrite the saved conversation for a character (best-effort, never throws). */
export const saveConversation = async (
  characterId: string,
  messages: StoredTurn[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(keyFor(characterId), JSON.stringify(messages));
  } catch (e) {
    console.warn('saveConversation error:', e);
  }
};

/**
 * List all characters the user has a saved conversation with, most-recent first.
 * Used by the Home / Messages screen ("Recent Connections").
 */
export const listConversations = async (): Promise<ConversationSummary[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const convKeys = keys.filter((k) => k.startsWith(PREFIX));
    if (convKeys.length === 0) return [];
    const entries = await AsyncStorage.multiGet(convKeys);
    const out: ConversationSummary[] = [];
    for (const [key, raw] of entries) {
      if (!raw) continue;
      try {
        const turns = JSON.parse(raw) as StoredTurn[];
        if (Array.isArray(turns) && turns.length > 0) {
          const last = turns[turns.length - 1];
          out.push({
            characterId: key.slice(PREFIX.length),
            lastText: last.text,
            lastTs: last.ts || 0,
          });
        }
      } catch {}
    }
    out.sort((a, b) => b.lastTs - a.lastTs);
    return out;
  } catch (e) {
    console.warn('listConversations error:', e);
    return [];
  }
};

/** Remove a character's saved conversation. */
export const clearConversation = async (characterId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(keyFor(characterId));
  } catch (e) {
    console.warn('clearConversation error:', e);
  }
};

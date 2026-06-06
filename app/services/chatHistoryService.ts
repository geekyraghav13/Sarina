/**
 * Chat history — per character, stored in the cloud (Firestore) with a local
 * (AsyncStorage) cache.
 *
 * Cloud is the source of truth so a conversation follows the signed-in user
 * across reinstalls and devices, and so the AI can read past turns as context
 * on any device. The local cache gives instant render + offline resilience and
 * is refreshed from the cloud on every load.
 *
 * Implemented over the Firestore REST API (auth token from config/firebase) —
 * NO native imports, fully Expo-Go-safe — mirroring userEngagementService.
 * Path: users/{uid}/conversations/{characterId}. Same
 * loadConversation / saveConversation / listConversations / clearConversation
 * interface the ChatScreen + Home screen already use.
 *
 * Only the REAL conversation turns are stored — the predefined opening story is
 * re-rendered fresh on each open (so it always matches the user's language) and
 * is NOT persisted.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

export type StoredTurn = { sender: 'ai' | 'user'; text: string; ts: number };
export type ConversationSummary = { characterId: string; lastText: string; lastTs: number };

const PROJECT_ID = 'sarina-ai-2b2c1';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const PREFIX = '@chat_history:';
const keyFor = (characterId: string) => `${PREFIX}${characterId}`;
const docUrl = (uid: string, characterId: string) =>
  `${BASE}/users/${uid}/conversations/${encodeURIComponent(characterId)}`;

// ── Auth context (Expo-Go-safe — firebase/auth only, no native modules) ───────
const getCtx = async (): Promise<{ token: string; uid: string } | null> => {
  const u = auth.currentUser;
  if (!u) return null;
  try {
    return { token: await u.getIdToken(), uid: u.uid };
  } catch {
    return null;
  }
};

// ── Firestore REST value encode / decode ──────────────────────────────────────
const sv = (s: string) => ({ stringValue: s });
const iv = (n: number) => ({ integerValue: String(n) });
const tv = (d: Date) => ({ timestampValue: d.toISOString() });

const encodeTurn = (t: StoredTurn) => ({
  mapValue: { fields: { sender: sv(t.sender), text: sv(t.text), ts: iv(t.ts || 0) } },
});

const decodeTurn = (v: any): StoredTurn | null => {
  const f = v?.mapValue?.fields;
  if (!f) return null;
  return {
    sender: f.sender?.stringValue === 'user' ? 'user' : 'ai',
    text: f.text?.stringValue ?? '',
    ts: Number(f.ts?.integerValue ?? 0),
  };
};

const decodeTurns = (doc: any): StoredTurn[] => {
  const vals = doc?.fields?.messages?.arrayValue?.values ?? [];
  return (vals as any[]).map(decodeTurn).filter(Boolean) as StoredTurn[];
};

const characterIdFromName = (name: string) => name.slice(name.lastIndexOf('/') + 1);

// ── Local cache helpers ───────────────────────────────────────────────────────
const readLocal = async (characterId: string): Promise<StoredTurn[]> => {
  try {
    const raw = await AsyncStorage.getItem(keyFor(characterId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredTurn[]) : [];
  } catch {
    return [];
  }
};

const writeLocal = async (characterId: string, turns: StoredTurn[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(keyFor(characterId), JSON.stringify(turns));
  } catch {}
};

const listLocal = async (): Promise<ConversationSummary[]> => {
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
          out.push({ characterId: key.slice(PREFIX.length), lastText: last.text, lastTs: last.ts || 0 });
        }
      } catch {}
    }
    return out;
  } catch {
    return [];
  }
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Load saved conversation turns for a character. Reads from the cloud (and
 * refreshes the local cache); falls back to the local cache when offline, not
 * signed in, or the cloud has no record yet (e.g. history saved before cloud
 * sync existed — it then gets pushed up on the next save).
 */
export const loadConversation = async (characterId: string): Promise<StoredTurn[]> => {
  const ctx = await getCtx();
  if (ctx) {
    try {
      const res = await fetch(docUrl(ctx.uid, characterId), {
        headers: { Authorization: `Bearer ${ctx.token}` },
      });
      if (res.ok) {
        const turns = decodeTurns(await res.json());
        await writeLocal(characterId, turns);
        return turns;
      }
      // 404 = no cloud record yet → fall through to the local cache.
    } catch (e) {
      console.warn('loadConversation cloud error:', e);
    }
  }
  return readLocal(characterId);
};

/**
 * Overwrite the saved conversation for a character. Writes the local cache
 * immediately (instant + offline) and upserts the full turn list to Firestore
 * (best-effort, never throws). The cloud doc also carries lastText/lastTs so the
 * conversation list can be built without reading every message array.
 */
export const saveConversation = async (
  characterId: string,
  messages: StoredTurn[]
): Promise<void> => {
  await writeLocal(characterId, messages);

  const ctx = await getCtx();
  if (!ctx) return;
  try {
    const last = messages[messages.length - 1];
    const fields = {
      messages: { arrayValue: { values: messages.map(encodeTurn) } },
      lastText: sv(last?.text || ''),
      lastTs: iv(last?.ts || 0),
      updatedAt: tv(new Date()),
    };
    // PATCH upserts the doc; the updateMask writes exactly these fields (the
    // messages array is replaced wholesale, which is what we want).
    const mask = ['messages', 'lastText', 'lastTs', 'updatedAt']
      .map((p) => `updateMask.fieldPaths=${p}`)
      .join('&');
    const res = await fetch(`${docUrl(ctx.uid, characterId)}?${mask}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) console.warn('saveConversation cloud failed:', res.status, await res.text());
  } catch (e) {
    console.warn('saveConversation cloud error:', e);
  }
};

/**
 * List all characters the user has a saved conversation with, most-recent first.
 * Used by the Home / Messages screen ("Recent Connections"). Merges cloud + local
 * by characterId (newest wins) so nothing is lost during the local→cloud
 * migration, then returns the merged set sorted by recency.
 */
export const listConversations = async (): Promise<ConversationSummary[]> => {
  const local = await listLocal();
  let cloud: ConversationSummary[] = [];

  const ctx = await getCtx();
  if (ctx) {
    try {
      const res = await fetch(`${BASE}/users/${ctx.uid}/conversations?pageSize=300`, {
        headers: { Authorization: `Bearer ${ctx.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        for (const doc of data?.documents ?? []) {
          const characterId = characterIdFromName(doc?.name || '');
          const f = doc?.fields || {};
          let lastText: string | undefined = f.lastText?.stringValue;
          let lastTs = Number(f.lastTs?.integerValue ?? 0);
          // Older docs may predate lastText/lastTs — derive from the messages.
          if (lastText === undefined) {
            const turns = decodeTurns(doc);
            if (turns.length) {
              const l = turns[turns.length - 1];
              lastText = l.text;
              lastTs = l.ts;
            }
          }
          if (characterId && lastText) cloud.push({ characterId, lastText, lastTs: lastTs || 0 });
        }
      }
    } catch (e) {
      console.warn('listConversations cloud error:', e);
    }
  }

  const merged = new Map<string, ConversationSummary>();
  for (const c of [...local, ...cloud]) {
    const existing = merged.get(c.characterId);
    if (!existing || c.lastTs > existing.lastTs) merged.set(c.characterId, c);
  }
  return [...merged.values()].sort((a, b) => b.lastTs - a.lastTs);
};

/** Remove a character's saved conversation (local cache + cloud). */
export const clearConversation = async (characterId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(keyFor(characterId));
  } catch {}

  const ctx = await getCtx();
  if (!ctx) return;
  try {
    await fetch(docUrl(ctx.uid, characterId), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
  } catch (e) {
    console.warn('clearConversation cloud error:', e);
  }
};

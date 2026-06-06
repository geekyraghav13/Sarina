/**
 * Re-engagement user state — writes the notification fields on users/{uid}
 * that the scheduled Cloud Function reads to send push notifications.
 *
 * Self-contained Firestore REST (auth token from config/firebase) — no native
 * imports, Expo-Go-safe. CRITICAL: every write uses an updateMask so it only
 * touches notification fields and never clobbers the user's credits /
 * subscription data on the same document.
 *
 * Fields (see PUSH-NOTIFICATIONS.md §7):
 *   pushToken, lastAppOpenAt, lastChatAt, leftChatAt, lastMessages[7],
 *   lastCharacterId, lastCharacterName, userName, notifyCount, nextNotifyAt,
 *   expireAt (TTL = now + 10 days), pendingNotifications { n1, n2, n3 }
 */

import { auth } from '../config/firebase';

const PROJECT_ID = 'sarina-ai-2b2c1';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

// Random 0–50 min added to each scheduled time so notifications don't arrive at
// suspiciously exact intervals — feels like a person, not a cron job.
const jitterMs = () => Math.floor(Math.random() * 50 * 60 * 1000);

export type NotifText = { title: string; body: string };
export type PendingNotifications = { n1: NotifText; n2: NotifText; n3: NotifText };

// ── Firestore REST value builders ─────────────────────────────────────────────
const sv = (s: string) => ({ stringValue: s });
const iv = (n: number) => ({ integerValue: String(n) });
const tv = (d: Date) => ({ timestampValue: d.toISOString() });
const asv = (arr: string[]) => ({ arrayValue: { values: arr.map(sv) } });
const notifMap = (n: NotifText) => ({
  mapValue: { fields: { title: sv(n.title || ''), body: sv(n.body || '') } },
});
const pendingMap = (p: PendingNotifications) => ({
  mapValue: { fields: { n1: notifMap(p.n1), n2: notifMap(p.n2), n3: notifMap(p.n3) } },
});

const getCtx = async (): Promise<{ token: string; uid: string } | null> => {
  const u = auth.currentUser;
  if (!u) return null;
  try {
    return { token: await u.getIdToken(), uid: u.uid };
  } catch {
    return null;
  }
};

/** PATCH users/{uid} with an updateMask covering only the given field paths. */
const patchUser = async (
  fields: Record<string, any>,
  maskPaths: string[]
): Promise<void> => {
  try {
    const ctx = await getCtx();
    if (!ctx) return;
    const mask = maskPaths.map((p) => `updateMask.fieldPaths=${encodeURIComponent(p)}`).join('&');
    const res = await fetch(`${BASE}/users/${ctx.uid}?${mask}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) console.warn('patchUser failed:', res.status, await res.text());
  } catch (e) {
    console.warn('patchUser error:', e);
  }
};

/**
 * App opened / foregrounded: refresh TTL + last-open, and save the push token.
 * Does NOT change the notification cycle.
 */
export const updateAppOpen = async (pushToken?: string | null): Promise<void> => {
  const now = new Date();
  const fields: Record<string, any> = {
    lastAppOpenAt: tv(now),
    expireAt: tv(new Date(now.getTime() + TEN_DAYS_MS)),
  };
  const mask = ['lastAppOpenAt', 'expireAt'];
  if (pushToken) {
    fields.pushToken = sv(pushToken);
    mask.push('pushToken');
  }
  await patchUser(fields, mask);
};

/**
 * User is actively in chat: pause any pending cycle so nothing fires while
 * they're here. Called on chat open and on each sent message.
 */
export const pauseCycle = async (): Promise<void> => {
  await patchUser(
    { notifyCount: iv(0), nextNotifyAt: { nullValue: null }, lastChatAt: tv(new Date()) },
    ['notifyCount', 'nextNotifyAt', 'lastChatAt']
  );
};

/**
 * Record chat activity and (re)arm the re-engagement cycle, called after each
 * AI reply while the app is in the FOREGROUND (reliable — no dependency on
 * catching a background/leave event). Sets nextNotifyAt = now + 3h: while the
 * user keeps chatting it's pushed forward; when they stop it fires 3h after the
 * last message. Opening a chat cancels it via pauseCycle().
 *
 * `notifications` is optional — pass it when freshly (re)generated; omit to keep
 * the existing stored ones while still refreshing the schedule + messages.
 */
export const recordActivity = async (params: {
  characterId: string;
  characterName: string;
  userName: string;
  lastMessages: string[];
  notifications?: PendingNotifications;
}): Promise<void> => {
  const now = new Date();
  const fields: Record<string, any> = {
    lastChatAt: tv(now),
    leftChatAt: tv(now),
    lastCharacterId: sv(params.characterId),
    lastCharacterName: sv(params.characterName),
    userName: sv(params.userName),
    lastMessages: asv(params.lastMessages.slice(-7)),
    notifyCount: iv(0),
    nextNotifyAt: tv(new Date(now.getTime() + THREE_HOURS_MS + jitterMs())),
    expireAt: tv(new Date(now.getTime() + TEN_DAYS_MS)),
  };
  const mask = [
    'lastChatAt', 'leftChatAt', 'lastCharacterId', 'lastCharacterName',
    'userName', 'lastMessages', 'notifyCount', 'nextNotifyAt', 'expireAt',
  ];
  if (params.notifications) {
    fields.pendingNotifications = pendingMap(params.notifications);
    mask.push('pendingNotifications');
  }
  await patchUser(fields, mask);
};

/**
 * User left the chat: store context + the 3 pre-generated notifications and
 * start the cycle (first notification fires +3h).
 */
export const onChatLeave = async (params: {
  characterId: string;
  characterName: string;
  userName: string;
  lastMessages: string[];
  notifications: PendingNotifications;
}): Promise<void> => {
  const now = new Date();
  await patchUser(
    {
      lastChatAt: tv(now),
      leftChatAt: tv(now),
      lastCharacterId: sv(params.characterId),
      lastCharacterName: sv(params.characterName),
      userName: sv(params.userName),
      lastMessages: asv(params.lastMessages.slice(-7)),
      notifyCount: iv(0),
      nextNotifyAt: tv(new Date(now.getTime() + THREE_HOURS_MS + jitterMs())),
      expireAt: tv(new Date(now.getTime() + TEN_DAYS_MS)),
      pendingNotifications: pendingMap(params.notifications),
    },
    [
      'lastChatAt',
      'leftChatAt',
      'lastCharacterId',
      'lastCharacterName',
      'userName',
      'lastMessages',
      'notifyCount',
      'nextNotifyAt',
      'expireAt',
      'pendingNotifications',
    ]
  );
};

/**
 * Voice-call credits — per-plan minute bucket, stored on users/{uid}.
 *
 * Voice calling is premium-only. Each plan grants a fixed allowance that is
 * deducted by call time and RESET to the full allowance at the start of every
 * billing period (so a renewal "gives the same" rather than stacking):
 *   weekly → 60s (1 min)   yearly → 3000s (50 min)
 *
 * Self-contained Firestore REST (auth token from config/firebase) — NO native
 * imports, Expo-Go-safe — mirroring chatHistoryService / userEngagementService.
 * Field: users/{uid}.voice_balance_seconds (integer seconds). Period tracking:
 * voice_period_end (the RevenueCat expiration string of the period we last
 * allocated for) + voice_tier.
 *
 * The RevenueCat side (reading the active plan + expiration) lives in
 * revenueCatService.syncVoiceAllowance(), which calls ensureAllowanceForPeriod()
 * here — keeping this module free of native dependencies.
 */

import { auth } from '../config/firebase';

const PROJECT_ID = 'sarina-ai-2b2c1';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/** Per-plan call allowance, in seconds. */
export const PLAN_SECONDS: Record<string, number> = {
  weekly: 60, // 1 minute
  yearly: 3000, // 50 minutes
};

const getCtx = async (): Promise<{ token: string; uid: string } | null> => {
  const u = auth.currentUser;
  if (!u) return null;
  try {
    return { token: await u.getIdToken(), uid: u.uid };
  } catch {
    return null;
  }
};

// ── REST value builders ───────────────────────────────────────────────────────
const sv = (s: string) => ({ stringValue: s });
const iv = (n: number) => ({ integerValue: String(n) });

/** Read the current voice balance (seconds). 0 if missing / not signed in. */
export const getVoiceBalance = async (): Promise<number> => {
  const ctx = await getCtx();
  if (!ctx) return 0;
  try {
    const res = await fetch(`${BASE}/users/${ctx.uid}`, {
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
    if (!res.ok) return 0;
    const doc = await res.json();
    return Number(doc?.fields?.voice_balance_seconds?.integerValue ?? 0);
  } catch (e) {
    console.warn('getVoiceBalance error:', e);
    return 0;
  }
};

/**
 * Read the subscription balance, the purchased top-up balance, and the plan tier
 * in one request.
 *   balance → voice_balance_seconds (subscription allowance, reset each period)
 *   topup   → voice_topup_seconds   (purchased consumable, never reset)
 *   tier    → 'weekly' | 'yearly' | null (for the plan-aware renew message)
 * The effective remaining call time is `balance + topup`; calls spend `balance`
 * first, then `topup`.
 */
export const getVoiceState = async (): Promise<{
  balance: number;
  topup: number;
  tier: string | null;
}> => {
  const ctx = await getCtx();
  if (!ctx) return { balance: 0, topup: 0, tier: null };
  try {
    const res = await fetch(`${BASE}/users/${ctx.uid}`, {
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
    if (!res.ok) return { balance: 0, topup: 0, tier: null };
    const doc = await res.json();
    return {
      balance: Number(doc?.fields?.voice_balance_seconds?.integerValue ?? 0),
      topup: Number(doc?.fields?.voice_topup_seconds?.integerValue ?? 0),
      tier: doc?.fields?.voice_tier?.stringValue ?? null,
    };
  } catch (e) {
    console.warn('getVoiceState error:', e);
    return { balance: 0, topup: 0, tier: null };
  }
};

/**
 * Atomically decrement the voice balance by `seconds` using a Firestore commit
 * transform (prevents double-spend across sessions). Returns the new balance, or
 * null on failure.
 */
export const decrementVoiceBalance = async (seconds: number): Promise<number | null> => {
  if (seconds <= 0) return null;
  const ctx = await getCtx();
  if (!ctx) return null;
  try {
    const res = await fetch(`${BASE}:commit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writes: [
          {
            transform: {
              document: `projects/${PROJECT_ID}/databases/(default)/documents/users/${ctx.uid}`,
              fieldTransforms: [
                {
                  fieldPath: 'voice_balance_seconds',
                  increment: { integerValue: String(-Math.round(seconds)) },
                },
              ],
            },
          },
        ],
      }),
    });
    if (!res.ok) {
      console.warn('decrementVoiceBalance failed:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const result = data?.writeResults?.[0]?.transformResults?.[0]?.integerValue;
    return result !== undefined ? Number(result) : null;
  } catch (e) {
    console.warn('decrementVoiceBalance error:', e);
    return null;
  }
};

/**
 * Atomically decrement the two credit buckets in a single commit. Calls spend the
 * subscription allowance (`voice_balance_seconds`) first and the purchased top-up
 * (`voice_topup_seconds`) second — the caller computes the split from the values
 * it read at call start (see VoiceCallScreen), so each field stays a pure atomic
 * increment (no read-modify-write race, no double-spend across sessions).
 * Returns true on success.
 */
export const decrementVoiceCredits = async ({
  allowanceSecs,
  topupSecs,
}: {
  allowanceSecs: number;
  topupSecs: number;
}): Promise<boolean> => {
  const a = Math.max(0, Math.round(allowanceSecs));
  const t = Math.max(0, Math.round(topupSecs));
  if (a <= 0 && t <= 0) return false;
  const ctx = await getCtx();
  if (!ctx) return false;

  const fieldTransforms: any[] = [];
  if (a > 0) {
    fieldTransforms.push({
      fieldPath: 'voice_balance_seconds',
      increment: { integerValue: String(-a) },
    });
  }
  if (t > 0) {
    fieldTransforms.push({
      fieldPath: 'voice_topup_seconds',
      increment: { integerValue: String(-t) },
    });
  }

  try {
    const res = await fetch(`${BASE}:commit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writes: [
          {
            transform: {
              document: `projects/${PROJECT_ID}/databases/(default)/documents/users/${ctx.uid}`,
              fieldTransforms,
            },
          },
        ],
      }),
    });
    if (!res.ok) {
      console.warn('decrementVoiceCredits failed:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.warn('decrementVoiceCredits error:', e);
    return false;
  }
};

/**
 * Grant purchased top-up seconds (one-time consumable) — increments
 * `voice_topup_seconds` and records the store transaction id in
 * `voice_topup_txns` so the same purchase is never granted twice. The increment
 * and the dedup-append run in one atomic commit. Returns true if credits were
 * granted, false if this transaction was already processed (or on failure).
 */
export const addTopupCredits = async (seconds: number, txnId: string): Promise<boolean> => {
  const secs = Math.max(0, Math.round(seconds));
  if (secs <= 0 || !txnId) return false;
  const ctx = await getCtx();
  if (!ctx) return false;

  try {
    // Dedup: skip if this transaction was already granted.
    const read = await fetch(`${BASE}/users/${ctx.uid}`, {
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
    if (read.ok) {
      const doc = await read.json();
      const existing: any[] = doc?.fields?.voice_topup_txns?.arrayValue?.values ?? [];
      if (existing.some((v) => v?.stringValue === txnId)) {
        console.log('addTopupCredits: transaction already processed, skipping:', txnId);
        return false;
      }
    }

    const res = await fetch(`${BASE}:commit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writes: [
          {
            transform: {
              document: `projects/${PROJECT_ID}/databases/(default)/documents/users/${ctx.uid}`,
              fieldTransforms: [
                {
                  fieldPath: 'voice_topup_seconds',
                  increment: { integerValue: String(secs) },
                },
                {
                  fieldPath: 'voice_topup_txns',
                  appendMissingElements: { values: [sv(txnId)] },
                },
              ],
            },
          },
        ],
      }),
    });
    if (!res.ok) {
      console.warn('addTopupCredits failed:', res.status, await res.text());
      return false;
    }
    console.log(`✅ addTopupCredits: granted ${secs}s top-up (txn ${txnId})`);
    return true;
  } catch (e) {
    console.warn('addTopupCredits error:', e);
    return false;
  }
};

/**
 * Ensure the balance is allocated for the current billing period.
 *
 * Compares the period we last allocated for (voice_period_end) with the plan's
 * current expiration. On a NEW period (initial purchase OR renewal) it RESETS the
 * balance to the plan's full allowance. Within the same period it leaves the
 * (possibly partly-spent) balance untouched — so a depleted user genuinely waits
 * for renewal. Returns the resulting balance.
 *
 * @param tier       'weekly' | 'yearly' (anything else → no-op)
 * @param periodEnd  RevenueCat expiration string for the active period (may be null)
 */
export const ensureAllowanceForPeriod = async (
  tier: string,
  periodEnd: string | null
): Promise<number> => {
  const allowance = PLAN_SECONDS[tier] ?? 0;
  const ctx = await getCtx();
  if (!ctx || allowance <= 0) return getVoiceBalance();

  // Period key — fall back to the tier when the expiration is unknown so we still
  // allocate exactly once for that subscription.
  const periodKey = periodEnd || `${tier}-current`;

  try {
    const res = await fetch(`${BASE}/users/${ctx.uid}`, {
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
    const doc = res.ok ? await res.json() : null;
    const storedEnd = doc?.fields?.voice_period_end?.stringValue;
    const hasBalanceField = doc?.fields?.voice_balance_seconds !== undefined;
    const currentBalance = Number(doc?.fields?.voice_balance_seconds?.integerValue ?? 0);

    const isNewPeriod = !hasBalanceField || storedEnd !== periodKey;
    if (!isNewPeriod) return currentBalance;

    const mask = ['voice_balance_seconds', 'voice_period_end', 'voice_tier']
      .map((p) => `updateMask.fieldPaths=${p}`)
      .join('&');
    const patch = await fetch(`${BASE}/users/${ctx.uid}?${mask}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          voice_balance_seconds: iv(allowance),
          voice_period_end: sv(periodKey),
          voice_tier: sv(tier),
        },
      }),
    });
    if (!patch.ok) {
      console.warn('ensureAllowanceForPeriod patch failed:', patch.status, await patch.text());
      return currentBalance;
    }
    return allowance;
  } catch (e) {
    console.warn('ensureAllowanceForPeriod error:', e);
    return getVoiceBalance();
  }
};

/** Format seconds as M:SS (e.g. 125 → "2:05"). */
export const formatSeconds = (seconds: number): string => {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
};

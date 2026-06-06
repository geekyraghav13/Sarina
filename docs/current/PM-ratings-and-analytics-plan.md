# Sarina — Ratings Strategy + Firebase Event Plan

**Author:** PM (draft for review) · **Date:** 2026-06-06
**Scope:** (1) Where/when to ask for Play Store ratings (free + paid). (2) The full Firebase event taxonomy from first open → returning user, structured for funnels.

---

## Part 1 — Google Play Ratings Strategy

### Goal
More **5★** reviews and more **volume**, without nagging — and without funneling unhappy users to a public 1★. We already have most of the plumbing in `app/services/reviewPromptService.ts`:
- `shouldShowSoftPrompt()` — 60-day cooldown gate
- Soft prompt with 😍 / 😐 / 😞 sentiment routing
- 😍 → native in-app review widget (`StoreReview.requestReview`)
- 😐 / 😞 → pre-filled feedback email (keeps complaints private)
- Google caps the native widget at ~4–5 prompts/user/year, so **every trigger must pass the cooldown gate**.

**The strategy below is about *when* to fire the soft prompt — pick high-emotion "peak" moments, never interrupt a task.**

### Golden rules
1. **Only ask at a peak / win** — right after the user got value, never before or mid-task.
2. **Never ask on an error, paywall, crash, or empty state.**
3. **One ask per cooldown window** (already enforced — 60 days).
4. **Sentiment-gate first** (the 😍/😐/😞 modal) so only happy users hit the public review sheet.
5. **Different triggers for free vs paid** — free users hit emotional peaks; paid users hit "I committed" peaks.

### Trigger map

#### A. Free users (the big pool — most important)
| # | Trigger moment | Why it works | Event to gate on |
|---|----------------|--------------|------------------|
| 1 | **After N-th meaningful message in a session** (e.g. 15–20 messages, session ≥ 3 min) | Peak engagement, they're enjoying the chat | `message_sent` count |
| 2 | **Returning for the 3rd day** (D3 retained, opens app) | Habit forming = genuine fans | `app_open` + day-streak |
| 3 | **After a great voice-call demo / first voice call ends positively** (duration ≥ 30s, ended normally) | Emotional high after hearing her voice | `voice_call_end` (end_reason = user_ended) |
| 4 | **After receiving/viewing a photo** they reacted to | Delight moment | `photo_viewed` |
| 5 | **3rd app open overall** with ≥1 completed chat session | Proven they're not a bounce | `app_open` count + `chat_session_end` |

> Free-user principle: ask after the **emotional peak of the free experience**, not when they hit a wall. Hitting the credits wall = paywall, *not* a review ask.

#### B. Paid users (lower volume, higher intent)
| # | Trigger moment | Why it works | Event to gate on |
|---|----------------|--------------|------------------|
| 1 | **3–5 days after subscribing**, on a positive session (not immediately — let them get value first) | They've validated the purchase | `subscription_purchased` + later `chat_session_end` |
| 2 | **After a long voice call** (≥ 2 min) — premium's hero feature | They used what they paid for and loved it | `voice_call_end` |
| 3 | **On successful renewal** (month 2+) | Renewal = strongest possible satisfaction signal | `subscription_renewed` |
| 4 | **After buying a credit top-up** and using it happily | Repeat spend = advocate | `credits_purchased` → later positive session |

> Paid-user principle: tie the ask to **commitment + usage**, never to the moment of payment itself (too transactional).

### Placements (surfaces)
1. **In-context soft prompt** (modal/bottom sheet) — fired by the triggers above. Primary channel.
2. **Settings → "Rate Sarina ⭐"** — passive, always-available manual entry (already wired via `maybeAskForReview`). Good for fans who proactively want to rate.
3. **Post-positive-feedback loop** — if a user sends positive in-app feedback or taps a 👍 somewhere, route the 😍 path → native widget.

### What NOT to do
- ❌ No review ask on first launch / before they've experienced value.
- ❌ No ask on the paywall, on credit-exhaustion, or after a failed purchase.
- ❌ No ask after an error/crash.
- ❌ No second ask inside the 60-day cooldown (already enforced — keep it).

### Instrumentation needed (small gaps)
- Add a **per-session message counter** + **session duration** check to fire trigger A1 (data already in `chat_session_end`).
- Add a **day-streak / open-count** read (we already track app-open via `userEngagementService`) to fire A2/A5 and B1.
- Wire the soft prompt into **VoiceCall end** and **photo viewed** handlers (triggers A3/A4/B2).
- Add `subscription_renewed` event (see Part 2) to fire B3.

---

## Part 2 — Firebase Event Taxonomy (for funnels)

### 🚨 Reality check — what's ACTUALLY in the new app (verified in code)
I grepped every screen in `app/screens/onboarding/*` (the new Figma flow). The honest state:

- **Every new-flow screen logs exactly ONE event: `logScreenView('Onboarding_X')`** (Welcome, Disclaimer, Language, CharacterSelect, Interests, Topics, Name, Auth, Chat, IncomingCall, VoiceCall, Home, Discover, Settings). SplashScreen logs nothing.
- **No step/action events are wired in the new flow** — `language_selected`, `character_selected`, `interests_selected`, `topics_selected`, `message_sent`, `voice_call_started`, `paywall_shown`, `onboarding_completed`, etc. **all exist as helper functions but are NOT called anywhere in the new screens.**
- The rich helpers are only invoked in the **OLD** screens (`app/screens/ChatScreen.tsx`, `app/screens/VoiceCallScreen.tsx`).
- **The review/rating prompt is NOT wired into the new flow at all.** `reviewPromptService` / `SoftReviewPrompt` / `useSoftReviewPrompt` are only used in old screens (`SummaryScreen`, old `ChatScreen`, `NewPaywallScreen`, old `VoiceCallScreen`).

**So in the new app today: only screen_view tracking exists. Funnels can be built on screen_view, but you have no step-completion, activation, monetization, or rating events yet.** The status column below is updated to reflect this: ✅ = helper exists, 🔌 = helper exists but **NOT wired in the new flow** (needs hooking up), ❌ = missing entirely.

> **Bottom line for the new flow:** screen_view ✅ on 14/15 screens. Everything else is 🔌 or ❌. The implementation work in Part 1/Part 2 is mostly *wiring existing helpers into the new screens*, not building from scratch.

### ⚠️ Cleanup first (important)
We currently have **two analytics services with duplicated / inconsistently-named events**:
- `app/services/analyticsService.ts` → `onboarding_started`, `message_sent`, `voice_call_started`…
- `app/services/firebaseAnalytics.ts` → `onboarding_start`, `message_sent`, `voice_call_start`…

Also several events describe the **OLD** character-creation flow (`personality_selected`, `mode_selected`, `tone_selected`, `appearance_selected`, `character_created`) that **doesn't match the NEW Figma flow** (Welcome → Disclaimer → Language → CharacterSelect → Interests → Topics → Name → Auth → Chat).

**Recommendation:** pick **one** canonical event name per action (table below), standardize on `snake_case` past-tense, deprecate the duplicates, and route everything through a single `logAnalyticsEvent()`. Funnels break when the same step has two event names.

### Canonical event list — mapped to the NEW flow

Legend: ✅ = wired & firing in the new flow · 🔌 = helper exists but **NOT wired into the new flow** (needs hooking up) · 🟡 = exists but wrong-flow / needs rename · ❌ = missing, add it.

> Note: in the new flow, the only ✅ events today are `logScreenView` per screen (Stage 1 screens all fire it) and Firebase's automatic `first_open`/`app_open`. Helper functions marked 🔌 below are written but never called in `app/screens/onboarding/*` — wiring them is the main task.

#### Stage 0 — Acquisition / Launch
| Event | When | Key params | Status |
|-------|------|-----------|--------|
| `first_open` | First ever launch (auto by Firebase SDK) | — | ✅ auto |
| `app_open` | Every launch | `is_returning_user`, `days_since_install` | ✅ |
| `splash_shown` | Splash screen displayed | — | ❌ (optional) |

#### Stage 1 — Onboarding funnel (the core funnel)
Each screen fires a **screen_view** AND a step event so you can build a clean ordered funnel.

| Step | Event | Screen | Key params | Status |
|------|-------|--------|-----------|--------|
| 1 | `onboarding_started` | Welcome | `entry_point` | 🟡 unify name |
| 2 | `welcome_cta_tapped` | Welcome → continue | — | ❌ |
| 3 | `disclaimer_viewed` | Disclaimer | — | ❌ |
| 4 | `disclaimer_accepted` | Disclaimer → continue | — | ❌ |
| 5 | `language_selected` | Language | `language` | ✅ |
| 6 | `character_selected` | CharacterSelect | `character_id`, `character_name` | ✅ |
| 7 | `interests_selected` | Interests | `interest_count`, `selected_interests` | ✅ |
| 8 | `topics_selected` | Topics | `topic_count`, `selected_topics` | ❌ (new screen) |
| 9 | `name_entered` | Name | `has_custom_name` | 🟡 (`character_named`) |
| 10 | `auth_viewed` | Auth | `method_options` | ❌ |
| 11 | `auth_completed` | Auth success | `method` (`google`/`guest`) | ❌ |
| 12 | `onboarding_completed` | end of flow | `language`, `character_id`, `interest_count` | 🟡 unify name |

> **Funnel A (Onboarding):** `onboarding_started` → `language_selected` → `character_selected` → `interests_selected` → `topics_selected` → `name_entered` → `auth_completed` → `onboarding_completed`. This is the #1 funnel to watch for drop-off.

#### Stage 2 — Activation (first value)
| Event | When | Key params | Status |
|-------|------|-----------|--------|
| `chat_started` | First chat opened | `character_id`, `is_first_chat` | ✅ |
| `message_sent` | Each user message | `message_number`, `message_length`, `is_first_message` | ✅ |
| `ai_reply_received` | AI responds | `latency_ms` | ❌ |
| `chat_session_end` | Chat session closes | `duration_seconds`, `message_count` | ✅ |
| `first_message_sent` | The very first message ever | `character_id` | ❌ (or derive from `message_sent` #1) |

> **Activation = `onboarding_completed` → `chat_started` → `first_message_sent`.** This is your "aha moment" funnel.

#### Stage 3 — Engagement / Feature use
| Event | When | Key params | Status |
|-------|------|-----------|--------|
| `tab_changed` | Home/Discover/Settings switch | `tab_name` | ✅ |
| `discover_character_opened` | Tap a character in Discover | `character_id` | ❌ |
| `incoming_call_shown` | IncomingCall screen appears | `character_name` | ❌ |
| `incoming_call_answered` | User answers | `character_name` | ❌ |
| `incoming_call_declined` | User declines | — | ❌ |
| `voice_call_started` | Call connects | `character_name`, `is_premium`, `initial_balance` | ✅ |
| `voice_call_ended` | Call ends | `duration_seconds`, `credits_used`, `end_reason` | ✅ |
| `photo_request` | User asks for a photo | `character_name` | ✅ |
| `photo_viewed` | Photo displayed | `character_name` | ✅ |

#### Stage 4 — Monetization funnel
| Event | When | Key params | Status |
|-------|------|-----------|--------|
| `paywall_shown` | Paywall displayed | `source` / `reason` (`credits_exhausted`, `voice_call`, `settings`) | ✅ |
| `paywall_dismissed` | Closed without buying | `source` | ✅ |
| `plan_selected` | Plan tapped | `plan_type`, `value` | ✅ |
| `begin_checkout` | Continue/purchase tapped | `plan_type`, `value`, `currency` | ✅ |
| `purchase` (standard) | Purchase success | `transaction_id`, `value`, `currency`, `items` | ✅ |
| `subscription_purchased` | Sub success (custom mirror) | `tier`, `price` | ✅ |
| `credits_purchased` | Top-up success | `seconds_purchased`, `price` | ✅ |
| `purchase_failed` | Purchase error | `plan_type`, `error_message` | ✅ |
| `subscription_restored` | Restore | `is_premium` | ✅ |
| `subscription_renewed` | Renewal (month 2+) | `tier`, `renewal_count` | ❌ (needed for rating trigger B3) |
| `subscription_cancel` | Cancel | `subscription_type`, `reason` | ✅ |
| `credits_exhausted` | Credits hit 0 | `last_action` | ✅ |

> **Funnel B (Monetization):** `paywall_shown` → `plan_selected` → `begin_checkout` → `purchase`. Segment by `source` to see which paywall trigger converts best (credits-exhausted vs voice-call vs settings).

#### Stage 5 — Retention / Returning users
| Event | When | Key params | Status |
|-------|------|-----------|--------|
| `app_open` (returning) | Open with existing session | `days_since_install`, `day_streak` | ✅ (add params) |
| `notification_received` | Push delivered | `notification_type` | ❌ (re-engagement) |
| `notification_opened` | Push tapped → app | `notification_type` | ❌ (re-engagement) |
| `session_start` / `session_end` | per session | `duration` | partial |
| `dau_active` | derive in GA4 (no event needed) | — | n/a |

> **Funnel C (Re-engagement):** `notification_received` → `notification_opened` → `chat_started`. Critical for the FCM/Gemini re-engagement cycle.

#### Stage 6 — Ratings (so you can measure the rating strategy itself)
| Event | When | Status |
|-------|------|--------|
| `review_soft_prompt_shown` | Soft modal shown | ✅ (`trigger` param) |
| `review_native_widget_requested` | 😍 → native sheet | ✅ |
| `review_feedback_email_opened` | 😐/😞 → email | ✅ (`sentiment`) |
| `review_sentiment_selected` | Which emoji tapped | ❌ (add to measure happy %) |

### Recommended **user properties** (for segmentation in every funnel)
Set via `setUserProperties()`:
- `is_premium` (true/false)
- `plan_tier` (free / weekly / yearly)
- `language`
- `selected_character`
- `acquisition_day` / cohort
- `lifetime_messages` (bucketed)
- `voice_credits_remaining` (bucketed)

---

## Suggested next actions (for your review)
1. ✅/❌ Approve the **canonical event names** + deprecate the duplicate service.
2. Approve the **rating trigger map** (free A1–A5, paid B1–B4).
3. I implement: unify analytics into one module, add the ❌ missing events, wire soft-prompt into the 4–5 peak moments.
4. Build the 3 funnels in GA4: **Onboarding**, **Activation**, **Monetization** + **Re-engagement**.

> Nothing here is built yet beyond what's marked ✅ — this is the plan for you to react to first.

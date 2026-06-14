# Sarina — Analytics Event Spec & Funnels

**Owner:** Product
**Last updated:** 2026-06-14
**Canonical implementation:** `app/services/firebaseAnalytics.ts`
**Firebase project:** `sarina-ai-2b2c1` · **Android package:** `com.x8284.katrina`

This is the single source of truth for *what we measure and why*. It maps every
Firebase Analytics event to a place in the user journey, flags what's actually
firing today vs. what's missing, and defines the funnels we use to read user
behaviour.

---

## 0. TL;DR — Why you currently see "only ~40 events, very low counts"

Three root causes, all fixable:

1. **Orphaned helpers (defined but never called).** ~18 event helpers exist in
   `firebaseAnalytics.ts` but **nothing in the app calls them** — e.g.
   `chat_session_end`, `begin_checkout`, `plan_selected`, `purchase_failed`,
   `paywall_dismissed`, `credits_depleted`, `app_open`, `photo_request`. They
   show up in code (so it *looks* instrumented) but produce **zero data**. This
   is why the monetization funnel has a hole between `paywall_viewed` and
   `purchase` — the middle steps were never wired.
2. **New features ship with no tracking.** The **category filter bar**, the
   **per-character stories**, **Discover browsing**, and **AI replies / failures**
   have **no events at all**. A huge part of real user behaviour is invisible.
3. **Low counts are partly expected, partly structural.** Many live events fire
   **once per session at most** (screen views, onboarding steps), and we have no
   *engagement-depth* events (message milestones, session length, return visits)
   to generate the volume that shows "what users actually do."

> The sections below mark each event with its status so we know exactly what to
> wire up. Target: a complete, gap-free funnel from install → activation →
> engagement → revenue → retention.

### ✅ Implementation update — 2026-06-14 (shipped in build 98)
The following P0/P1 events were **wired and are now live** (status in the tables
below predates this; treat these as ✅):
`chat_session_end`, `message_milestone` (1/5/10/25/50), `free_limit_reached`,
`story_viewed`, `ai_reply_received`, `ai_reply_failed`, `category_selected`
(onboarding + discover), `character_card_tapped`, `paywall_dismissed`
(subscription + topup), `purchase_failed`, `voice_credits_depleted`,
`account_signed_out`. Also added `character_id` + `category` to `chat_start`,
`message_sent`, and `character_selected`.

**Not client-wireable (by design):** `plan_selected` and `begin_checkout` happen
*inside* RevenueCat's hosted paywall UI, which exposes no per-step callbacks — we
only get `paywall_viewed` (open), `purchase` (success), and `paywall_dismissed`
(closed without buying). `subscription_cancel`/renewals come from RevenueCat
**webhooks** server-side, not the client. Push-notification events (§3.7) remain
a follow-up (need FCM handler instrumentation).

---

## 1. Conventions

**Naming:** `snake_case`, object_action where possible (`paywall_viewed`,
`message_sent`). Keep ≤ 40 chars. Don't rename live events (breaks history).

**Standard params on every custom event:**
| Param | Type | Notes |
|---|---|---|
| `timestamp` | number | `Date.now()` (we already do this) |
| `character_id` | string | when in a character context (we mostly send `character_name` today — **add `character_id`** so we can join to the 350-char roster) |
| `category` | string | character category context (Realistic/Anime/Latina/… ) — **new** |
| `is_premium` | bool | user's entitlement at event time |

**Reserved/auto events** (Firebase logs these for free — don't re-implement):
`first_open`, `session_start`, `screen_view`, `app_update`, `os_update`,
`in_app_purchase` (Play-linked), `app_remove`.

**Status legend:**
- ✅ **Live** — wired and firing in the current build
- ⚠️ **Orphan** — helper exists in code but is never called (no data) → wire or delete
- 🆕 **Proposed** — not implemented; recommended to add

---

## 2. User Properties & Audiences

Set via `setUserProperty` / `setUserId`. These segment every report.

| Property | Status | Values | Why |
|---|---|---|---|
| `user_id` | ✅ (set on auth) | Firebase UID | cross-session stitching |
| `app_language` | 🆕 | en/es/hi/… | localize funnels; the app is 15-language |
| `is_premium` | 🆕 | true/false | free vs paid behaviour |
| `plan_type` | 🆕 | weekly/yearly/none | revenue cohorts |
| `auth_method` | 🆕 | google/guest | guests convert differently |
| `fav_category` | 🆕 | Realistic/Anime/… | which content drives the user |
| `companion_id` | 🆕 | character id | "who is their main girl" |
| `lifetime_messages` | 🆕 | bucket (0,1-10,11-50,50+) | engagement tier |
| `voice_minutes_left` | 🆕 | number | top-up targeting |

**Suggested audiences:** `Activated (sent ≥1 message)`, `Power chatter (≥50 msgs)`,
`Paywall abandoner (viewed, no purchase, 24h)`, `Trial-eligible guest`,
`Lapsed 7d`, `Voice caller`, `Top-up buyer`.

---

## 3. Event Catalog (grouped by funnel stage)

### 3.1 Acquisition & App Lifecycle
| Event | Status | Trigger | Key params |
|---|---|---|---|
| `first_open` | ✅ auto | first launch | — |
| `session_start` | ✅ auto | each session | — |
| `app_open` | ⚠️ orphan | every foreground | `timestamp` → wire to root/AppState |
| `app_foregrounded` / `app_backgrounded` | 🆕 | AppState change | session shape, multitasking |

### 3.2 Onboarding (Activation) funnel
| Event | Status | Screen | Key params |
|---|---|---|---|
| `screen_view` (Welcome) | ✅ | WelcomeScreen | `screen_name` |
| `onboarding_start` | ✅ | WelcomeScreen | — |
| `language_selected` | ✅ | LanguageScreen | `language` |
| `screen_view` (Disclaimer) | ✅ | DisclaimerScreen | — |
| `disclaimer_accepted` | 🆕 | DisclaimerScreen | age-gate accept (compliance) |
| `interests_selected` | ✅ | InterestsScreen | `selected_interests`, `interest_count` |
| `topics_selected` | ✅ | TopicsScreen | `selected_topics`, `topic_count` |
| `name_entered` | ✅ | NameScreen | `has_custom_name` |
| `character_selected` | ✅ | CharacterSelectScreen | `character_id`, `character_name` |
| `auth_completed` | ✅ | AuthScreen | `method` (google/guest) |
| `onboarding_complete` | ✅ | AuthScreen | — |
| `onboarding_step` | ⚠️ orphan | generic step helper | `step_number`, `step_name` |
| `onboarding_abandoned` | 🆕 | app close mid-flow | `last_step` — measures drop-off cause |

> ⚠️ **Legacy character-creation events are dead.** `personality_selected`,
> `appearance_selected`, `mode_selected`, `tone_selected`, `character_named`,
> `character_created`, `character_regenerated` belonged to the old "build your
> own" flow that was removed. **Delete these helpers** to stop them masquerading
> as instrumentation.

### 3.3 Character Discovery (NEW — currently 0% tracked) 🆕
The category bar + 350-character roster is brand new and **completely untracked**.
This is the highest-value gap to close.
| Event | Status | Trigger | Key params |
|---|---|---|---|
| `category_selected` | 🆕 | tap a category pill | `category`, `surface` (onboarding/discover) |
| `discover_opened` | 🆕 | open Discover tab | — |
| `character_card_tapped` | 🆕 | tap a card to open chat | `character_id`, `category`, `position` |
| `character_profile_viewed` | 🆕 | view a character's story/bio | `character_id`, `category` |
| `roster_scrolled` | 🆕 | scroll depth in grid | `category`, `max_index` (content discovery depth) |

### 3.4 Chat Engagement
| Event | Status | Trigger | Key params |
|---|---|---|---|
| `chat_start` | ✅ | open a chat | `character_name` (**add `character_id`, `category`**) |
| `story_viewed` | 🆕 | opening story shown | `character_id` — measures the new story hook |
| `message_sent` | ✅ | user sends | `character_name`, `message_length` |
| `ai_reply_received` | 🆕 | AI reply rendered | `character_id`, `latency_ms` |
| `ai_reply_failed` | 🆕 | backend/network fallback used | `reason` — quality/health metric |
| `message_milestone` | 🆕 | hit 1/5/10/25/50 msgs in a chat | `count` — engagement depth (drives volume) |
| `free_limit_reached` | 🆕 | hit `FREE_MESSAGE_LIMIT` | `character_id` — the core monetization trigger |
| `suggested_reply_tapped` | 🆕 | tap a suggestion chip | `character_id` |
| `chat_session_end` | ⚠️ orphan | leave chat | `duration_seconds`, `message_count` → **wire it; this is our depth metric** |
| `conversation_reported` | 🆕 | 3-dot → report | `character_id` (safety/abuse signal) |
| `conversation_cleared` | 🆕 | clear chat history | `character_id` |

### 3.5 Monetization — Subscription paywall funnel
| Event | Status | Trigger | Key params |
|---|---|---|---|
| `paywall_viewed` | ✅ | paywall shown | `source` (chat/incoming_call/…) |
| `plan_selected` | ⚠️ orphan | tap a plan | `plan_type`, `value` → **wire** |
| `begin_checkout` | ⚠️ orphan | tap Continue/Subscribe | `plan_type`, `value`, `currency` → **wire** |
| `purchase` | ✅ | purchase success | `transaction_id`, `value`, `currency`, `items` |
| `purchase_failed` | ⚠️ orphan | purchase error/cancel | `plan_type`, `error_message` → **wire** |
| `paywall_dismissed` | ⚠️ orphan | close paywall no buy | `source` → **wire (measures abandonment)** |
| `subscription_restored` | ⚠️ orphan | Restore tapped | `is_premium` → wire in Settings |
| `subscription_cancel` | ⚠️ orphan | cancel detected | `subscription_type`, `reason` (server/webhook) |

> Without `plan_selected`, `begin_checkout`, `paywall_dismissed`, the paywall
> funnel today is just **`paywall_viewed` → (black box) → `purchase`**. We can't
> see *where* people drop. Wiring the 3 orphans makes the funnel readable.

### 3.6 Voice Calling + Top-up funnel
| Event | Status | Trigger | Key params |
|---|---|---|---|
| `incoming_call_shown` | ✅ | incoming-call screen | `character_name`, `source` (manual/auto_after_messages) |
| `incoming_call_answered` | ✅ | answer | `character_name`, `is_premium` |
| `incoming_call_declined` | ✅ | decline | `character_name` |
| `voice_call_start` | ✅ | call connects | `character_name` |
| `voice_call_end` | ✅ | call ends | `character_name`, `duration_seconds` |
| `call_start_record_failed` | ✅ | mic/record error | error context (health metric) |
| `topup_paywall_viewed` | ✅ | top-up sheet shown | `source: voice_call` |
| `topup_purchased` | ✅ | top-up bought | `seconds` |
| `voice_credits_depleted` | ⚠️ orphan (`credits_depleted`) | minutes hit 0 | `last_action` → **wire (top-up trigger)** |

### 3.7 Re-engagement (Push notifications) 🆕
We have an FCM + Gemini 3-notification re-engagement cycle (client + backend +
Cloud Function) but **no analytics on it** — we can't measure if it works.
| Event | Status | Trigger | Key params |
|---|---|---|---|
| `notification_received` | 🆕 | FCM delivered (foreground) | `notif_type`, `cycle_step` (1/2/3) |
| `notification_opened` | 🆕 | tap notification → app open | `notif_type`, `character_id` |
| `notification_permission` | 🆕 | OS prompt result | `granted` (bool) |
| `reengagement_converted` | 🆕 | sends a message within 1h of open | attribution to the push cycle |

### 3.8 Ratings & Reviews
| Event | Status | Trigger | Key params |
|---|---|---|---|
| `review_soft_prompt_shown` | ✅ | soft prompt shown | placement |
| `review_native_widget_requested` | ✅ | native in-app review asked | — |
| `review_feedback_email_opened` | ✅ | unhappy → email | — |
| `review_prompt_dismissed` | 🆕 | soft prompt dismissed | placement (completes the funnel) |

### 3.9 Settings / Account
| Event | Status | Trigger | Key params |
|---|---|---|---|
| `screen_view` (Settings) | ✅ | open Settings | — |
| `language_changed_in_app` | 🆕 | change language post-onboarding | `from`, `to` |
| `account_signed_out` | 🆕 | sign out | — |
| `account_deleted` | 🆕 | delete account | — (compliance) |

---

## 4. The Funnels (how we read behaviour)

### Funnel A — Install → Activation (the make-or-break)
```
first_open
  → onboarding_start
    → language_selected
      → interests_selected
        → topics_selected
          → name_entered
            → character_selected
              → auth_completed
                → onboarding_complete
                  → chat_start
                    → message_sent   ⭐ ACTIVATION = first message
```
**North-star activation metric:** % of `first_open` that reach **`message_sent`**.
Watch the biggest single drop — historically Auth and first-message are the
cliffs. `onboarding_abandoned` (proposed) tells us the *last step* before churn.

### Funnel B — Discovery → Chat (new content engine)
```
discover_opened / category_selected
  → character_card_tapped
    → story_viewed
      → message_sent
```
Answers: *which categories convert browsers into chatters?* Needs §3.3 events.

### Funnel C — Engagement depth (drives DAU & retention)
```
chat_start → message_sent → message_milestone(5) → (10) → (25) → (50)
                                                      ↘ chat_session_end (duration, count)
```
Volume + depth live here. Today we only have `chat_start` + `message_sent`
(once) — **no milestones, no session_end** → engagement looks flat.

### Funnel D — Free → Paid (subscription)
```
message_sent … → free_limit_reached
  → paywall_viewed (source=chat)
    → plan_selected
      → begin_checkout
        → purchase ✅   |   purchase_failed / paywall_dismissed ✗
```
**Conversion metric:** `purchase / paywall_viewed`. Mid-funnel (`plan_selected`,
`begin_checkout`) currently missing → wire to see *where* buyers drop.

### Funnel E — Voice call → Top-up
```
incoming_call_shown → incoming_call_answered
  → (is_premium?) paywall_viewed  ▸ purchase
  → voice_call_start → voice_call_end
      → voice_credits_depleted → topup_paywall_viewed → topup_purchased
```

### Funnel F — Resurrection (push re-engagement)
```
notification_received(cycle_step) → notification_opened
  → chat_start → message_sent  ⭐ reengagement_converted
```
Measures ROI of the Gemini notification cycle (§3.7) — currently unmeasured.

### Funnel G — Advocacy (reviews)
```
(engagement peak) → review_soft_prompt_shown
   → happy  → review_native_widget_requested
   → unhappy→ review_feedback_email_opened
   → dismissed → review_prompt_dismissed
```

---

## 5. KPI dashboard (what to chart)
| Stage | KPI | From |
|---|---|---|
| Acquisition | DAU/MAU, new installs | `first_open`, `session_start` |
| Activation | % install→first message | Funnel A |
| Onboarding | step-by-step drop-off | Funnel A |
| Discovery | category → chat conversion; top categories | Funnel B |
| Engagement | msgs/user/day, session length, D1/D7/D30 retention | Funnel C |
| Monetization | paywall view→purchase %, ARPU, ARPPU, plan mix | Funnel D |
| Voice | call answer rate, avg duration, top-up rate | Funnel E |
| Resurrection | notif open rate, reengagement conversion | Funnel F |
| Health | `ai_reply_failed` rate, `purchase_failed`, `call_start_record_failed` | §3 |

---

## 6. Prioritized action backlog

**P0 — close the blind spots (highest signal, low effort):**
1. Wire the **orphans that break funnels:** `chat_session_end`, `plan_selected`,
   `begin_checkout`, `purchase_failed`, `paywall_dismissed`,
   `credits_depleted` (→ `voice_credits_depleted`).
2. Add **activation depth:** `message_milestone`, `free_limit_reached`,
   `ai_reply_received`, `ai_reply_failed`.
3. Add **`character_id` + `category`** to `chat_start` / `message_sent` /
   `character_selected` (join behaviour to the roster).

**P1 — measure the new content engine:**
4. `category_selected`, `discover_opened`, `character_card_tapped`,
   `story_viewed`, `character_profile_viewed`.

**P2 — measure growth loops:**
5. Push funnel (§3.7) + `reengagement_converted`.
6. `onboarding_abandoned`, `app_open`/AppState, `disclaimer_accepted`.

**P3 — housekeeping:**
7. **Delete dead legacy helpers** (§3.2 note) so the codebase reflects reality.
8. Set the **user properties** in §2 (esp. `is_premium`, `app_language`,
   `fav_category`) — they unlock segmentation on *every* existing event.

**Verification:** test with Firebase **DebugView**:
`adb shell setprop debug.firebase.analytics.app com.x8284.katrina`

---

## 7. Appendix — current implementation status counts
- **Live & firing:** ~25 custom events + `screen_view` across 14 screens + auto events.
- **Orphan (defined, 0 data):** `app_open`, `onboarding_step`, `personality_selected`,
  `appearance_selected`, `mode_selected`, `tone_selected`, `character_named`,
  `character_created`, `character_regenerated`, `chat_session_end`, `photo_request`,
  `photo_viewed`, `begin_checkout`, `plan_selected`, `purchase_failed`,
  `subscription_restored`, `subscription_cancel`, `paywall_dismissed`,
  `credits_depleted`.
- **Proposed (missing):** all 🆕 rows above (discovery, engagement depth, push,
  health, account).

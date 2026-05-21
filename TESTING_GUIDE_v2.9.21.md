# Testing Guide — v2.9.21 (versionCode 81)

## What Changed in This Release

### 1. Gemini API Key Security
The Gemini API key has been completely removed from the frontend (APK/AAB). All AI chat calls now go through the backend proxy on Cloud Run.

**What to test:**
- [ ] Open a chat with any girlfriend → messages should reply normally
- [ ] No Gemini key appears in the APK (key is only on the Cloud Run backend)
- [ ] Open the app with no internet → chat shows a network error (expected; not a crash)

---

### 2. New User Flow: Summary → Chat → Home
Previously new users skipped Chat and went straight to Home after onboarding. This is fixed.

**Test steps (fresh install or new account):**
1. Install the app fresh (or delete account, sign in again)
2. Complete onboarding (all 8 steps)
3. Tap "Start" on the Summary screen
4. **Expected:** lands on Chat screen — NOT Home directly
5. Send one message in Chat
6. Tap the Home button or back
7. **Expected:** lands on the Home / Main Tabs screen

---

### 3. Deleted Account = New User Flow
After account deletion the user must follow the exact same path as a brand-new user.

**Test steps:**
1. Sign in with an existing account that has completed onboarding
2. Go to Settings → Delete Account → confirm
3. App returns to Sign In screen
4. Sign in with the same Google account (new UID is created)
5. **Expected path:** Disclaimer → Onboarding (all 8 steps) → Summary → Chat → Home
6. **NOT expected:** skipping straight to Home or Chat without onboarding

---

### 4. Play Store Review / Rating Prompt
A soft sentiment picker shows before the app navigates to Chat after onboarding. Users who rate 😍 get the native Play Store review widget.

**Test steps:**
1. Complete onboarding on a device that has NOT seen the prompt in the last 60 days
2. On the Summary screen, tap "Start"
3. **Expected:** a modal appears with three options — 😍 Loving it / 😐 It's okay / 😞 Not really
4. Tap 😍 → native Play Store "Rate this app" dialog should appear (on a real device, not emulator)
5. Tap 😐 or 😞 → email feedback sheet should open (mailto:geekyraghav13@gmail.com)
6. After closing the modal, app navigates to Chat

**Cooldown logic:** the prompt will NOT show again for 60 days per device. To force it in testing, clear AsyncStorage key `@review_prompt_last_shown`.

**Note:** The native review widget only works on real Android devices connected to the Play Store. It will silently no-op on emulators.

---

### 5. TypeScript / Build Health
All 16 pre-existing TypeScript errors are fixed. `npx tsc --noEmit` exits clean (zero errors).

**Fixes included:**
- `firebase.ts`: Removed invalid `useFetchStreams` Firestore setting; suppressed `getReactNativePersistence` type resolution
- `i18n/index.ts`: `compatibilityJSON` updated from `'v3'` to `'v4'`
- `WelcomeScreen.tsx`: Fixed missing `@react-navigation/native-stack` module
- `CustomCreditsPaywallScreen.tsx` / `PaywallScreen.tsx`: Removed non-existent `logAdImpression` import
- `NewPaywallScreen.tsx`: Removed invalid `requiredEntitlementIdentifier` param from `presentPaywall()`
- `creditService.ts`: Fixed `getDoc(query)` → `getDocs(query)` for collection queries
- `revenueCatService.ts`: Fixed `transactionId` → `transaction_id`; fixed nullable date cast
- `subscriptionService.ts`: Suppressed missing `react-native-iap` module; added explicit `any` types

---

## Build Info

| Field | Value |
|---|---|
| versionCode | 81 |
| versionName | 2.9.21 |
| Build type | release (AAB) |
| Min SDK | as per rootProject |
| Signing | katrina-release.jks |

---

## Quick Smoke Test Checklist

- [ ] App launches without crash
- [ ] Sign in with Google works
- [ ] Disclaimer screen appears for new users
- [ ] Onboarding flow (all 8 steps) completes correctly
- [ ] Review prompt appears at Summary → Start (first run)
- [ ] New user lands on Chat, not Home
- [ ] Chat messages get AI replies
- [ ] Settings → Sign Out works
- [ ] Settings → Delete Account works (returns to Sign In, re-onboards from scratch)
- [ ] Paywall opens and closes without crash
- [ ] Voice call screen launches (requires premium)

# Purchase Flow - Testing Guide

**Date:** March 3, 2026
**Status:** Ready for Testing
**Branch:** feature/ios-subscriptions
**Commit:** 7082499

---

## Overview

This guide provides step-by-step testing procedures for verifying all purchase flow fixes.

**Total Testing Time:** ~2-3 hours
**Required:** Real iOS device with App Store Sandbox account

---

## Pre-Testing Setup

### 1. Configure iOS Sandbox Tester

1. Go to App Store Connect → Users and Access → Sandbox Testers
2. Create new sandbox tester (or use existing)
3. Sign out of your real Apple ID on the test device
4. Don't sign in with sandbox account yet (iOS will prompt during first purchase)

### 2. Clean Build

```bash
# Clean and rebuild the iOS app
cd /home/raghav/Vibe\ COded\ Apps/sarina

# Clean build cache
npx expo prebuild --clean

# Build for iOS
npx eas build --platform ios --profile preview

# Or run locally
npx expo run:ios
```

### 3. Reset App State

```bash
# If testing on simulator
xcrun simctl uninstall booted com.sarina.app

# If testing on device
# Uninstall app from device
# Reinstall from TestFlight or build
```

---

## Test Suite

### Test 1: Fresh Purchase Flow ✅

**Objective:** Verify purchase completes within 90s and premium activates

**Steps:**

1. Launch app and complete onboarding
2. Navigate to Chat screen
3. Tap phone icon (should show paywall)
4. In paywall, select "Weekly" plan
5. Tap "Continue" button
6. **Observe:** Loading spinner appears
7. iOS prompts for App Store authentication
8. Sign in with sandbox tester account
9. Confirm purchase in App Store dialog
10. **Observe:** Loading spinner should stop within 90 seconds
11. **Expect:** Success alert "Premium Activated!"
12. Tap "OK" on alert
13. **Expect:** Navigates to MainTabs (Home screen)
14. Navigate back to Chat screen
15. Tap phone icon
16. **Expect:** Voice call screen opens (NO paywall)

**Pass Criteria:**
- ✅ Loading spinner stops within 90 seconds
- ✅ Success alert appears
- ✅ Premium features unlock immediately
- ✅ Voice calling works without app restart
- ✅ No stuck loading state

**What This Tests:**
- Fix #1: Purchase timeout and cleanup
- Fix #2: Premium state reload
- Fix #3: Voice call premium check

---

### Test 2: Purchase Cancellation ✅

**Objective:** Verify cancel doesn't leave app in stuck state

**Steps:**

1. If premium from Test 1, uninstall and reinstall app
2. Complete onboarding
3. Navigate to paywall
4. Select "Yearly" plan
5. Tap "Continue"
6. In App Store dialog, tap "Cancel"
7. **Observe:** Loading spinner should stop
8. **Expect:** Alert "Purchase cancelled" or similar
9. **Expect:** Still on paywall screen
10. **Expect:** Can tap "Continue" again

**Pass Criteria:**
- ✅ Loading spinner stops after cancel
- ✅ Error/cancel alert shown
- ✅ User can retry purchase
- ✅ No frozen UI

**What This Tests:**
- Fix #1: Purchase timeout and cleanup (cancel path)

---

### Test 3: Restore Purchases (With Existing Purchase) ✅

**Objective:** Verify restore works by trusting store validation

**Steps:**

1. Complete Test 1 (have active subscription)
2. Uninstall app from device
3. Reinstall app
4. Complete onboarding (or skip if remembered)
5. Navigate to paywall
6. Tap "Restore Purchases" button
7. **Observe:** Loading spinner appears
8. iOS may prompt for App Store password
9. **Observe:** Loading spinner stops
10. **Expect:** Success alert "Your purchases have been restored!"
11. Tap "OK"
12. **Expect:** Navigates to MainTabs (Home screen)
13. Navigate to Chat screen
14. Tap phone icon
15. **Expect:** Voice call screen opens (NO paywall)

**Pass Criteria:**
- ✅ Restore completes successfully
- ✅ Premium features restored
- ✅ Works without backend validation
- ✅ Voice calling works immediately

**What This Tests:**
- Fix #5: Restore purchases trusts store validation

---

### Test 4: Restore Purchases (No Purchase) ✅

**Objective:** Verify restore handles "no purchases" gracefully

**Steps:**

1. Use fresh iOS simulator or device
2. Sign in with NEW sandbox tester (never purchased)
3. Complete onboarding
4. Navigate to paywall
5. Tap "Restore Purchases"
6. **Observe:** Loading spinner appears
7. **Observe:** Loading spinner stops
8. **Expect:** Alert "No Purchases Found"
9. **Expect:** Still on paywall screen
10. **Expect:** Can proceed to purchase

**Pass Criteria:**
- ✅ Restore completes without error
- ✅ "No purchases" message shown
- ✅ User can still purchase
- ✅ No crashes or frozen UI

**What This Tests:**
- Fix #5: Restore purchases error handling

---

### Test 5: Voice Calling After Purchase (Focus Effect) ✅

**Objective:** Verify useFocusEffect reloads premium status

**Steps:**

1. Launch app (premium not active)
2. Navigate to Chat screen
3. Tap phone icon → Paywall opens
4. Complete purchase in paywall
5. Tap "OK" on success alert
6. **Expect:** Returns to Chat screen (or Home)
7. If on Home, tap on Chat to open it
8. **Immediately** tap phone icon (without closing app)
9. **Expect:** Voice call screen opens (NO paywall)

**Pass Criteria:**
- ✅ Premium status reloads when ChatScreen gains focus
- ✅ Voice calling works immediately after purchase
- ✅ No app restart required

**What This Tests:**
- Fix #3: Voice call premium check with useFocusEffect

---

### Test 6: App Restart After Purchase ✅

**Objective:** Verify premium state persists across app restarts

**Steps:**

1. Complete purchase (Test 1)
2. Force close app completely
3. Relaunch app
4. Navigate to Chat screen
5. Tap phone icon
6. **Expect:** Voice call screen opens (NO paywall)

**Pass Criteria:**
- ✅ Premium status persists
- ✅ AsyncStorage saved correctly
- ✅ Voice calling works after restart

**What This Tests:**
- Fix #2: Premium state reload with loadSubscriptionStatus

---

### Test 7: Purchase Timeout (Edge Case) ⚠️

**Objective:** Verify 90s timeout works

**Steps:**

1. Launch app (not premium)
2. Navigate to paywall
3. Select plan and tap "Continue"
4. In App Store dialog, **DO NOT CONFIRM OR CANCEL**
5. Wait 90 seconds
6. **Expect:** Loading spinner stops
7. **Expect:** Alert "Purchase timeout" or similar
8. **Expect:** Can retry purchase

**Pass Criteria:**
- ✅ Timeout triggers after 90s
- ✅ Listeners cleaned up
- ✅ Can retry purchase
- ✅ No stuck state

**What This Tests:**
- Fix #1: Purchase timeout (90s timeout)

---

### Test 8: Multiple Rapid Purchase Attempts ✅

**Objective:** Verify no duplicate listeners or race conditions

**Steps:**

1. Launch app (not premium)
2. Navigate to paywall
3. Tap "Continue" → Cancel immediately
4. Wait 2 seconds
5. Tap "Continue" again → Cancel immediately
6. Wait 2 seconds
7. Tap "Continue" → Complete purchase
8. **Expect:** Purchase completes normally
9. **Expect:** No duplicate success alerts
10. **Expect:** Premium activates once

**Pass Criteria:**
- ✅ No duplicate listeners
- ✅ No race conditions
- ✅ Purchase completes correctly
- ✅ No duplicate alerts or state updates

**What This Tests:**
- Fix #4: Remove duplicate listeners

---

### Test 9: Backend Down (Restore Purchases) ✅

**Objective:** Verify restore works without backend validation

**Note:** This test requires temporarily disabling backend or using invalid backend URL

**Steps:**

1. Update `BACKEND_URL` in NewPaywallScreen.tsx to invalid URL
2. Rebuild app
3. Complete purchase (Test 1)
4. Uninstall and reinstall app
5. Navigate to paywall
6. Tap "Restore Purchases"
7. **Expect:** Restore completes successfully
8. **Expect:** "Your purchases have been restored!"
9. **Expect:** Premium features work

**Pass Criteria:**
- ✅ Restore works without backend
- ✅ Trusts App Store validation
- ✅ Premium features restored

**What This Tests:**
- Fix #5: Restore trusts store validation (no backend dependency)

---

## Test Results Template

```markdown
# Purchase Flow Test Results

**Date:** [Date]
**Tester:** [Name]
**Device:** [iPhone model, iOS version]
**Build:** [Build number]

## Test Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Fresh Purchase | ✅ / ❌ | |
| 2 | Purchase Cancel | ✅ / ❌ | |
| 3 | Restore (With Purchase) | ✅ / ❌ | |
| 4 | Restore (No Purchase) | ✅ / ❌ | |
| 5 | Voice After Purchase | ✅ / ❌ | |
| 6 | App Restart | ✅ / ❌ | |
| 7 | Purchase Timeout | ✅ / ❌ | |
| 8 | Rapid Attempts | ✅ / ❌ | |
| 9 | Backend Down | ✅ / ❌ | |

## Issues Found

[List any issues or unexpected behavior]

## Overall Assessment

- [ ] All tests passed
- [ ] Ready for production
- [ ] Requires additional fixes
```

---

## Common Issues & Troubleshooting

### Issue: "Cannot connect to App Store"

**Solution:**
- Check internet connection
- Verify sandbox tester is valid
- Try signing out and back into App Store
- Reset network settings

### Issue: Purchase doesn't complete

**Solution:**
- Check iOS Console logs for errors
- Verify product IDs match App Store Connect
- Ensure In-App Purchases are enabled in Apple Developer
- Check Agreements in App Store Connect are up to date

### Issue: Premium status doesn't persist

**Solution:**
- Check AsyncStorage writes in logs
- Verify `loadSubscriptionStatus()` is called
- Check for any AsyncStorage errors
- Ensure `setIsPremium` is awaited

### Issue: Voice calling still shows paywall

**Solution:**
- Verify `useFocusEffect` is running (check logs for "🔄 ChatScreen focused")
- Force close and reopen app
- Check `isPremium` state in paymentStore
- Verify AsyncStorage has premium status

---

## Monitoring

### Console Logs to Watch

```
✅ IAP connection established
📦 Fetching products from store...
✅ Fetched 2 products from store
💳 Initiating purchase for: com.sarina.app.weekly on ios
📦 Purchase received: <purchase object>
✅ First chat screen marked as seen
🔄 ChatScreen focused - reloading premium status
```

### Error Logs to Watch For

```
❌ IAP initialization failed
❌ Purchase error from listener
❌ requestPurchase error
❌ Error checking first chat status
❌ Restore error
```

---

## Post-Testing

### If All Tests Pass ✅

1. Mark build as ready for production
2. Create production build:
```bash
npx eas build --platform ios --profile production
```
3. Submit to App Store
4. Monitor Crashlytics for any purchase errors
5. Track analytics for purchase success rate

### If Tests Fail ❌

1. Document exact failure scenario
2. Check Console logs for errors
3. Review relevant fix in PURCHASE_FLOW_FIXES.md
4. Create issue in GitHub
5. Re-apply fix if needed
6. Retest after fix

---

## Success Metrics

After deploying to production, monitor:

1. **Purchase Success Rate**
   - Target: >95% of purchase attempts succeed
   - Track: Firebase Analytics "purchase_completed" events

2. **Purchase Timeout Rate**
   - Target: <1% timeout after 90s
   - Track: "purchase_timeout" errors in Crashlytics

3. **Restore Success Rate**
   - Target: >98% of restore attempts succeed
   - Track: Firebase Analytics "subscription_restored" events

4. **Premium Feature Access**
   - Target: 100% of premium users can access voice calling
   - Track: "voice_call_started" events by premium users

5. **App Crash Rate During Purchase**
   - Target: 0% crashes during purchase flow
   - Track: Crashlytics purchase-related crashes

---

## Contact

If you encounter any issues during testing:

1. Check logs in Xcode Console
2. Review PURCHASE_FLOW_FIXES.md for detailed fix information
3. Create GitHub issue with:
   - Test number that failed
   - Console logs
   - Device/iOS version
   - Screenshots/video

---

**Status:** Ready for Testing
**Next Step:** Run Test Suite on Real Device
**Estimated Time:** 2-3 hours for complete suite

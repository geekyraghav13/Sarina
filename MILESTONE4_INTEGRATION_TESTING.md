# 🧪 Milestone 4 - Integration Testing & QA

**Date Started:** February 14, 2026
**Status:** In Progress
**Goal:** Verify entire system works together without issues before production

---

## 📋 Overview

This milestone focuses on comprehensive testing of the complete user journey from onboarding to voice calling, ensuring all components work seamlessly together.

**Testing Scope:**
- ✅ First-time user journey (onboarding → paywall → voice calls)
- ✅ Returning user experience
- ✅ Purchase flow (mock and real IAP)
- ✅ Credit system accuracy
- ✅ Voice calling quality
- ✅ Edge cases and error scenarios
- ✅ Performance benchmarks

---

## 🎯 Test Suites

### Suite 1: First-Time User Journey (Critical Path)

**Duration:** 5-7 minutes per test
**Priority:** P0 - Must Pass

#### Test Case 1.1: Happy Path - Full Conversion Flow

**Objective:** Verify complete user journey from install to first voice call

**Prerequisites:**
- Fresh device or uninstalled previous version
- Internet connectivity
- Google account for sign-in

**Test Steps:**

```bash
1. Installation
   → Uninstall any existing Sarina app
   → Install APK: adb install app-debug.apk
   → Launch app
   ✓ App launches without crash
   ✓ No permissions errors

2. Sign-In Screen
   → App shows Google Sign-In button
   → Tap "Continue with Google"
   → Select Google account
   ✓ Sign-in succeeds
   ✓ User redirected to Disclaimer screen

3. Disclaimer Screen
   → Read disclaimer text
   → Tap "Accept and Continue"
   ✓ Navigates to Mode selection

4. Mode Selection
   → Shows "Girlfriend" and "Friend" options
   → Tap "Girlfriend"
   ✓ Navigates to Onboarding

5. Onboarding (8 screens)
   → Complete all onboarding screens
   → Make selections as prompted
   → Tap "Continue" on each screen
   ✓ All 8 screens display correctly
   ✓ Summary screen shows selections
   ✓ Tap "Continue" on Summary

6. Chat Screen (First Launch)
   → Summary → Navigate to Chat
   ✓ Chat screen appears (NOT Home screen)
   ✓ Within 1-2 seconds: Incoming call appears
   ✓ Character name matches selection
   ✓ Character image displays correctly

7. First Paywall Trigger
   → Incoming call is showing
   → Tap "Pick" button
   ✓ Paywall screen appears
   ✓ Shows Weekly (₹299) and Yearly (₹1299) plans
   ✓ Character info displayed correctly
   ✓ "Continue" button is enabled

8. Purchase Flow (Mock Mode)
   → Select Weekly plan
   → Tap "Continue"
   ✓ Loading indicator appears
   ✓ Success message: "Weekly plan activated! You got 60 seconds..."
   ✓ Alert has "Start Calling" button

9. First Voice Call
   → Tap "Start Calling" from success alert
   ✓ VoiceCall screen appears
   ✓ Character avatar displays
   ✓ "Connecting..." status shows
   ✓ Within 3 seconds: Backend connects
   ✓ "Connected" status appears
   ✓ Balance displays: "1:00" (60 seconds)

10. Voice Interaction
    → Speak into microphone
    ✓ Audio is captured (waveform animates)
    ✓ Sent to backend
    ✓ Gemini AI responds (audio plays)
    ✓ Balance decrements: 1:00 → 0:55 → 0:50...
    ✓ Color coding works:
      - Green when >30s
      - Yellow when 11-30s
      - Red when ≤10s

11. Balance Depletion
    → Let call run until balance = 0
    ✓ At 10s: Warning appears "Low Balance!"
    ✓ At 5s: Warning persists
    ✓ At 0s: Call ends automatically
    ✓ Message: "Your balance is exhausted"
    ✓ Navigates back to Chat or Paywall

12. Firestore Verification
    → Open Firebase Console
    → Navigate to Firestore Database
    → Find user document in 'users' collection
    ✓ subscription_tier = "weekly"
    ✓ voice_balance_seconds = 0
    ✓ total_seconds_used ≥ 60

    → Check 'credit_transactions' collection
    ✓ Has 12 deduction entries (60s ÷ 5s)
    ✓ Each entry: -5 seconds
    ✓ Has 1 subscription entry: +60 seconds

    → Check 'call_sessions' collection
    ✓ Has completed call session
    ✓ Duration ≈ 60 seconds
```

**Pass Criteria:**
- ✅ All 12 steps complete without errors
- ✅ No app crashes
- ✅ Balance accuracy: ±1 second tolerance
- ✅ Firestore data matches expected state

**Time Limit:** 10 minutes maximum

---

#### Test Case 1.2: Paywall Decline Path

**Objective:** Verify paywall repeat trigger after decline

**Test Steps:**

```bash
1. Complete onboarding (same as 1.1, steps 1-6)

2. First Incoming Call
   → Incoming call appears
   → Tap "Decline" button (NOT "Pick")
   ✓ Paywall appears
   ✓ Shows subscription options

3. Cancel Paywall
   → Tap back button or "Cancel"
   ✓ Returns to Chat screen
   ✓ No incoming call visible

4. Wait for Repeat Trigger
   → Start timer (2 minutes)
   → Stay on Chat screen
   ✓ At exactly 2:00 minutes: Incoming call appears again
   ✓ Character is same as before

5. Decline Again
   → Tap "Decline" on incoming call
   ✓ Paywall appears again

6. Complete Purchase This Time
   → Select Yearly plan (₹1299)
   → Tap "Continue"
   ✓ Success message: "Yearly plan activated! You got 3000 seconds..."
   ✓ Balance = 50:00 (50 minutes)

7. Premium User - No More Interruptions
   → Return to Chat
   → Wait 2+ minutes
   ✓ No incoming call appears (premium user)
   → Tap call button in header
   ✓ Incoming call appears immediately
   → Tap "Pick"
   ✓ Goes DIRECTLY to VoiceCall (no paywall)
```

**Pass Criteria:**
- ✅ 2-minute repeat trigger works accurately
- ✅ Premium users bypass paywall
- ✅ Yearly plan allocates 3000 seconds

---

#### Test Case 1.3: Returning User Experience

**Objective:** Verify app behavior for returning premium users

**Prerequisites:**
- User already has active subscription
- App was closed completely

**Test Steps:**

```bash
1. App Launch
   → Close app completely (kill process)
   → Reopen app
   ✓ Goes directly to Home screen (NOT onboarding)
   ✓ Shows character selection

2. Character Selection
   → Select previously chosen character
   ✓ Chat screen appears
   ✓ NO incoming call appears immediately
   ✓ Premium status recognized

3. Initiate Voice Call
   → Tap call button in header
   ✓ Incoming call appears
   → Tap "Pick"
   ✓ Goes DIRECTLY to VoiceCall screen
   ✓ NO paywall interruption
   ✓ Balance shows remaining credits

4. Call Functionality
   → Start voice call
   ✓ Connects normally
   ✓ Balance decrements from last saved amount
   ✓ Can talk and interact
```

**Pass Criteria:**
- ✅ Premium status persists across app restarts
- ✅ No paywall for premium users
- ✅ Balance preserved correctly

---

### Suite 2: Credit System Accuracy Tests

**Duration:** 5-10 minutes per test
**Priority:** P0 - Must Pass

#### Test Case 2.1: Precise Balance Deduction

**Objective:** Verify 5-second heartbeat accuracy

**Test Steps:**

```bash
1. Setup
   → Firebase Console → Firestore
   → Find your user in 'users' collection
   → Set voice_balance_seconds = 30
   → Save changes

2. Start Call with Stopwatch
   → Open app, start voice call
   → Start external stopwatch simultaneously
   → Watch both call timer and Firebase

3. Deduction Verification (Use Firebase real-time updates)
   At 5s: Check Firestore
   ✓ voice_balance_seconds = 25

   At 10s: Check Firestore
   ✓ voice_balance_seconds = 20

   At 15s: Check Firestore
   ✓ voice_balance_seconds = 15

   At 20s: Check Firestore
   ✓ voice_balance_seconds = 10

   At 25s: Check Firestore
   ✓ voice_balance_seconds = 5

   At 30s: Check Firestore
   ✓ voice_balance_seconds = 0
   ✓ Call ends automatically
   ✓ "Out of Credits" message

4. Transaction Logging
   → Check 'credit_transactions' collection
   ✓ Has 6 deduction entries (30s ÷ 5s)
   ✓ Each entry: -5 seconds
   ✓ Timestamps are 5 seconds apart
```

**Pass Criteria:**
- ✅ Deductions happen every 5 seconds (±0.5s tolerance)
- ✅ Each deduction is exactly 5 seconds
- ✅ Call auto-ends at balance = 0
- ✅ All transactions logged correctly

**Tolerance:** ±1 second total over 30 seconds

---

#### Test Case 2.2: Insufficient Balance Prevention

**Objective:** Verify pre-call balance check

**Test Steps:**

```bash
1. Setup - Low Balance
   → Set voice_balance_seconds = 8 (less than 10)

2. Attempt Call
   → Try to start voice call
   ✓ Alert appears: "Insufficient balance"
   ✓ Message: "You need at least 10 seconds. Current: 8s"
   ✓ Options: "Purchase More" | "Cancel"

3. Purchase More
   → Tap "Purchase More"
   ✓ Navigates to Paywall
   → Complete purchase (mock)
   ✓ Balance updated: 68 seconds (8 + 60)

4. Successful Call
   → Try to start call again
   ✓ Call connects successfully
   ✓ No error message
```

**Pass Criteria:**
- ✅ Blocks calls with <10 seconds
- ✅ Clear error message
- ✅ Easy upgrade path

---

### Suite 3: Edge Cases & Error Handling

**Duration:** 15-20 minutes
**Priority:** P1 - Should Pass

#### Test Case 3.1: Network Interruption During Call

**Objective:** Verify graceful handling of connection loss

**Test Steps:**

```bash
1. Start Call with Full Balance
   → Set balance to 120 seconds
   → Start voice call
   ✓ Call connects

2. Disable Network After 30 Seconds
   → After 30s of active call
   → Turn off WiFi/Mobile data
   ✓ Call disconnects
   ✓ Error message: "Connection lost"
   ✓ Option to "Retry" or "End Call"

3. Check Balance After Disconnect
   → Firebase Console → Check balance
   ✓ Balance = 90 seconds (120 - 30)
   ✓ Deductions stopped at disconnect
   ✓ No credit loss beyond actual usage

4. Reconnect and Resume
   → Turn WiFi back on
   → Tap "Retry" or start new call
   ✓ Call connects
   ✓ Balance continues from 90 seconds
   ✓ No duplicate deductions
```

**Pass Criteria:**
- ✅ No credit loss during disconnection
- ✅ Graceful error handling
- ✅ Can resume after reconnection

---

#### Test Case 3.2: App Backgrounding During Call

**Objective:** Verify call behavior when app is minimized

**Test Steps:**

```bash
1. Start Active Call
   → Start voice call with 120s balance
   → Talk for 15 seconds

2. Background App
   → Press home button (minimize app)
   → Wait 20 seconds
   → Reopen app

3. Verify Call State
   ✓ Call either:
     a) Still active and continuing, OR
     b) Properly ended with "Call ended" message
   ✓ Balance reflects accurate time (35s deducted)
   ✓ No unexpected credit loss

4. Check Firestore
   → Verify deductions match actual call time
   ✓ If call ended: Last deduction ≤ time backgrounded
   ✓ If call active: Deductions continue accurately
```

**Pass Criteria:**
- ✅ No credit loss bugs
- ✅ Accurate tracking during background
- ✅ Clear state on resume

---

#### Test Case 3.3: Multiple Rapid Purchase Attempts

**Objective:** Verify duplicate purchase prevention

**Test Steps:**

```bash
1. Setup (Requires 2 Devices with Same Account)
   → Sign in with same account on Device A
   → Sign in with same account on Device B

2. Simultaneous Purchase
   → Open paywall on both devices
   → Select Weekly plan on both
   → Tap "Continue" on both simultaneously

3. Expected Behavior
   ✓ Only ONE purchase processes
   ✓ Second device shows: "Already subscribed"
   ✓ No double charge
   ✓ No double credit allocation

4. Verify in Firestore
   → Check 'users' collection
   ✓ subscription_tier = "weekly" (single entry)
   ✓ voice_balance_seconds = 60 (not 120)

   → Check 'credit_transactions'
   ✓ Only ONE subscription transaction
```

**Pass Criteria:**
- ✅ Race condition handled
- ✅ No duplicate purchases
- ✅ No double credits

---

### Suite 4: Performance Benchmarks

**Duration:** 30 minutes
**Priority:** P1 - Should Pass

#### Benchmark 4.1: App Launch Speed

**Objective:** Measure cold and warm start times

**Test Steps:**

```bash
1. Cold Start (Fresh Launch)
   → Kill app completely
   → Clear app from recent apps
   → Wait 5 seconds
   → Launch app
   → Start timer
   ✓ Stop timer when Chat/Home screen appears

   Target: <3 seconds
   Acceptable: <5 seconds

2. Warm Start (From Background)
   → Minimize app
   → Wait 10 seconds
   → Reopen app
   → Start timer
   ✓ Stop timer when previous screen appears

   Target: <1.5 seconds
   Acceptable: <2 seconds

3. Repeat 5 Times
   → Average the results
   ✓ Cold start average: _____ seconds
   ✓ Warm start average: _____ seconds
```

**Pass Criteria:**
- ✅ Cold start: <5 seconds (90th percentile)
- ✅ Warm start: <2 seconds (90th percentile)

---

#### Benchmark 4.2: Voice Call Connection Speed

**Objective:** Measure time to first Gemini response

**Test Steps:**

```bash
1. Initiate Call
   → Start voice call
   → Start stopwatch at "Pick" button tap

2. Measure Milestones
   Stop 1: VoiceCall screen appears
   ✓ Target: <300ms

   Stop 2: "Connecting..." status
   ✓ Target: <500ms

   Stop 3: "Connected" status
   ✓ Target: <3 seconds

   Stop 4: First Gemini AI response (audio plays)
   ✓ Target: <5 seconds total

3. Repeat 5 Times
   → Average connection times
   ✓ Screen transition: _____ ms
   ✓ Backend connection: _____ seconds
   ✓ First response: _____ seconds
```

**Pass Criteria:**
- ✅ Screen appears: <500ms
- ✅ Backend connects: <3 seconds
- ✅ First AI response: <5 seconds

---

#### Benchmark 4.3: Paywall Load Time

**Objective:** Measure paywall display speed

**Test Steps:**

```bash
1. Trigger Paywall
   → Tap "Pick" on incoming call
   → Start timer

2. Measure Display
   ✓ Stop when paywall fully visible

   Components to check:
   - Paywall layout appears
   - Product prices displayed
   - Images loaded
   - Buttons enabled

   Target: <1 second
   Acceptable: <2 seconds

3. Product Fetch Time (Real IAP Only)
   → For real IAP mode
   → Measure time to fetch prices from Play Store

   Target: <1 second
   Acceptable: <3 seconds
```

**Pass Criteria:**
- ✅ Paywall displays: <2 seconds
- ✅ Products fetched (real IAP): <3 seconds

---

#### Benchmark 4.4: Credit Deduction Latency

**Objective:** Verify heartbeat timing precision

**Test Steps:**

```bash
1. Monitor Backend Logs
   → Start call
   → Watch backend logs in real-time:

   gcloud run logs tail sarina-voice-backend \
     --region us-central1 \
     --project sarina-ai-2b2c1

2. Measure Heartbeat Intervals
   → Look for "💳 Deducting 5 seconds" logs
   → Note timestamps

   Interval 1: _____ seconds
   Interval 2: _____ seconds
   Interval 3: _____ seconds
   Interval 4: _____ seconds
   Interval 5: _____ seconds

   Average: _____ seconds

   Target: 5.0s ±0.1s

3. Firestore Write Latency
   → Measure time from heartbeat to Firestore update

   Target: <200ms
   Acceptable: <500ms
```

**Pass Criteria:**
- ✅ Heartbeat interval: 5.0s ±0.2s
- ✅ Firestore updates: <500ms
- ✅ Client receives update: <100ms after Firestore write

---

## 📊 Test Results Template

Use this template to record test results:

```markdown
## Test Execution Report

**Date:** ___________
**Tester:** ___________
**Build Version:** ___________
**Device:** ___________
**OS Version:** ___________

---

### Suite 1: First-Time User Journey

| Test Case | Status | Notes | Duration |
|-----------|--------|-------|----------|
| 1.1 Happy Path | ☐ Pass ☐ Fail | | |
| 1.2 Decline Path | ☐ Pass ☐ Fail | | |
| 1.3 Returning User | ☐ Pass ☐ Fail | | |

**Issues Found:**
-
-

---

### Suite 2: Credit System Accuracy

| Test Case | Status | Accuracy | Notes |
|-----------|--------|----------|-------|
| 2.1 Deduction Accuracy | ☐ Pass ☐ Fail | ±___s | |
| 2.2 Insufficient Balance | ☐ Pass ☐ Fail | N/A | |

**Issues Found:**
-
-

---

### Suite 3: Edge Cases

| Test Case | Status | Notes |
|-----------|--------|-------|
| 3.1 Network Interruption | ☐ Pass ☐ Fail | |
| 3.2 App Backgrounding | ☐ Pass ☐ Fail | |
| 3.3 Duplicate Purchases | ☐ Pass ☐ Fail | |

**Issues Found:**
-
-

---

### Suite 4: Performance Benchmarks

| Benchmark | Target | Result | Status |
|-----------|--------|--------|--------|
| Cold Start | <5s | ___s | ☐ Pass ☐ Fail |
| Warm Start | <2s | ___s | ☐ Pass ☐ Fail |
| Call Connection | <3s | ___s | ☐ Pass ☐ Fail |
| Paywall Load | <2s | ___s | ☐ Pass ☐ Fail |
| Heartbeat Precision | 5.0s ±0.2s | ___s | ☐ Pass ☐ Fail |

---

### Overall Summary

**Total Tests:** ___
**Passed:** ___
**Failed:** ___
**Pass Rate:** ___%

**Critical Issues:** ___
**Non-Critical Issues:** ___

**Ready for Production:** ☐ Yes ☐ No

**Recommendations:**
-
-
```

---

## 🔍 Monitoring & Debugging Tools

### 1. Real-Time Backend Logs

```bash
# View live backend logs
gcloud run logs tail sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1

# Filter for specific events
gcloud run logs read sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --filter "textPayload:deduct" \
  --limit 50
```

### 2. Firestore Real-Time Monitoring

Open Firebase Console and monitor these collections during testing:
- `users` - Watch balance changes in real-time
- `credit_transactions` - Verify all deductions logged
- `call_sessions` - Track active and completed calls

### 3. Android Logcat Filtering

```bash
# App-specific logs
adb logcat -s "ReactNativeJS"

# Error logs only
adb logcat *:E

# Specific tag filtering
adb logcat -s "VoiceCall" "IAP" "Credits"
```

### 4. Network Monitoring

```bash
# Monitor network requests
adb shell am instrument -w -e class com.sarina.app.NetworkTest

# Check WebSocket connection
# Look for WS connection in Chrome DevTools (Remote Debugging)
```

---

## ✅ Production Readiness Criteria

Before marking Milestone 4 as complete, ensure:

### Functionality Checklist
- [ ] User journey complete (onboarding → voice calling)
- [ ] IAP working (test purchases succeed)
- [ ] Voice calling stable (no crashes in 10 consecutive calls)
- [ ] Credit system accurate (±1s tolerance over 60s)
- [ ] Paywall triggers correctly (first-time + repeat)
- [ ] Premium users bypass paywall
- [ ] Balance exhaustion handled gracefully
- [ ] Backend heartbeat working (5s interval ±0.2s)
- [ ] Firestore transactions logged (100% of calls)
- [ ] Receipt validation active (for real IAP)

### Performance Checklist
- [ ] Cold start: <5 seconds
- [ ] Warm start: <2 seconds
- [ ] Voice call connection: <3 seconds
- [ ] Paywall load: <2 seconds
- [ ] Heartbeat precision: 5.0s ±0.2s
- [ ] No memory leaks (tested with multiple calls)
- [ ] UI responsive (no ANR - Application Not Responding)

### Error Handling Checklist
- [ ] Network errors handled gracefully
- [ ] Insufficient balance prevents calls
- [ ] Duplicate purchases prevented
- [ ] Backend errors don't crash app
- [ ] User sees helpful error messages
- [ ] All errors logged to backend

### Security Checklist
- [ ] Fake receipts rejected (real IAP only)
- [ ] Server-side validation only
- [ ] No client-side balance manipulation possible
- [ ] Firebase Auth tokens verified
- [ ] Secure API keys (Secret Manager)
- [ ] HTTPS/WSS only (no plain HTTP)

### Documentation Checklist
- [ ] All test cases documented
- [ ] Test results recorded
- [ ] Known issues listed
- [ ] Troubleshooting guide complete
- [ ] Production deployment guide ready

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Create Test Report** - Document all results
2. **Fix Critical Issues** - Address any failures
3. **Performance Optimization** - Improve any slow areas
4. **Security Audit** - Final security review
5. **Prepare for Production** - Build release version
6. **Monitor Post-Launch** - Set up alerting and monitoring

---

**Document Version:** 1.0
**Last Updated:** February 14, 2026
**Status:** Ready for Testing
**Next Action:** Execute Test Suite 1

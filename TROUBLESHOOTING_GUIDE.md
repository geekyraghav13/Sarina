# 🔧 Troubleshooting Guide & Edge Cases

**Purpose:** Quick reference for debugging common and edge case issues
**Date:** February 14, 2026
**Last Updated:** February 14, 2026

---

## 📚 Table of Contents

1. [Installation & Setup Issues](#installation--setup-issues)
2. [Authentication Problems](#authentication-problems)
3. [Purchase Flow Issues](#purchase-flow-issues)
4. [Voice Calling Problems](#voice-calling-problems)
5. [Credit System Issues](#credit-system-issues)
6. [Backend Connection Issues](#backend-connection-issues)
7. [Firestore Data Problems](#firestore-data-problems)
8. [Performance Issues](#performance-issues)
9. [Edge Cases](#edge-cases)
10. [Emergency Procedures](#emergency-procedures)

---

## 1. Installation & Setup Issues

### Issue: App crashes on launch

**Symptoms:**
- App opens briefly then closes
- White screen then crash
- Error in logcat: "Unable to load script"

**Causes:**
- Corrupted build
- Missing dependencies
- Incompatible device/OS

**Solutions:**

```bash
# Solution 1: Clean rebuild
cd "/home/raghav/Vibe COded Apps/sarina"
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
cd android && ./gradlew assembleDebug

# Solution 2: Clear app data
adb shell pm clear com.sarina.app

# Solution 3: Reinstall
adb uninstall com.sarina.app
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Solution 4: Check device compatibility
adb shell getprop ro.build.version.sdk
# Should be ≥ 24 (Android 7.0)
```

**Prevention:**
- Always clean build before release
- Test on multiple devices/OS versions
- Use latest stable React Native version

---

### Issue: "Unable to connect to development server"

**Symptoms:**
- Red error screen in app
- "Could not connect to development server"
- Only happens in dev mode

**Solutions:**

```bash
# Solution 1: Start Metro bundler
npx expo start --clear

# Solution 2: Check network connection
adb shell ip addr | grep inet
# Device and computer should be on same network

# Solution 3: Reverse port (if using USB)
adb reverse tcp:8081 tcp:8081

# Solution 4: Use production build instead
cd android && ./gradlew assembleRelease
```

---

## 2. Authentication Problems

### Issue: Google Sign-In fails

**Symptoms:**
- "Sign in failed" alert
- Returns to sign-in screen
- Console error: "SIGN_IN_CANCELLED" or "SIGN_IN_FAILED"

**Causes:**
- Incorrect SHA-1 certificate fingerprint
- Google Sign-In not configured in Firebase
- Network connectivity issues

**Solutions:**

```bash
# Check current SHA-1
cd android
./gradlew signingReport | grep SHA1
# Copy the SHA-1 hash

# Add to Firebase Console:
# 1. Go to Firebase Console → Project Settings
# 2. Select your Android app
# 3. Add fingerprint (SHA-1)
# 4. Download new google-services.json
# 5. Replace android/app/google-services.json
# 6. Rebuild app

# For debug builds:
keytool -list -v -keystore android/app/debug.keystore \
  -alias androiddebugkey \
  -storepass android -keypass android
```

**Prevention:**
- Always add SHA-1 for both debug and release keystores
- Test sign-in on fresh install
- Keep google-services.json up to date

---

### Issue: User data not saving after sign-in

**Symptoms:**
- Sign-in succeeds
- User redirected properly
- But on app restart, asked to sign in again

**Causes:**
- AsyncStorage not persisting
- Firebase Auth session not maintained
- Token expiration issues

**Solutions:**

```typescript
// Check AsyncStorage is working
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test write
await AsyncStorage.setItem('test', 'value');
const value = await AsyncStorage.getItem('test');
console.log('AsyncStorage test:', value); // Should be 'value'

// Check Firebase Auth state
import { getAuth } from 'firebase/auth';
const auth = getAuth();
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user?.uid);
});
```

**Firestore Rules Check:**
```javascript
// Ensure users can read/write their own data
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 3. Purchase Flow Issues

### Issue: "Product not found" error

**Symptoms:**
- Paywall shows products
- Tap "Continue"
- Error: "Product not available"
- Purchase doesn't initiate

**Causes:**
- Products not created in Google Play Console
- App not uploaded to Play Console yet
- Product IDs don't match code
- Products not yet propagated (takes 2-4 hours)

**Solutions:**

```bash
# 1. Verify product IDs in code
# File: app/services/subscriptionService.ts
const PRODUCT_IDS = {
  android: {
    WEEKLY: 'sarina_weekly_299',    # Must match Play Console
    YEARLY: 'sarina_yearly_1299',   # Must match Play Console
  }
};

# 2. Check Play Console configuration
# Go to: Play Console → Monetization → Products
# Verify products exist with exact same IDs

# 3. Wait for propagation
# After first upload, wait 2-4 hours before testing

# 4. Use test account
# Play Console → Testing → License testing
# Add your Gmail account as license tester

# 5. Test with mock mode while waiting
# app/screens/NewPaywallScreen.tsx
const USE_MOCK_PURCHASES = true;  # Temporary for testing
```

**Debugging:**

```bash
# Check IAP connection logs
adb logcat | grep -i "IAP\|InAppPurchase\|Product"

# Should see:
# "🔌 Connecting to IAP..."
# "✅ IAP connection established"
# "📦 Fetching products..."
# "✅ Fetched 2 products"
```

---

### Issue: Purchase succeeds but credits not added

**Symptoms:**
- Purchase completes in Google Play
- Success alert appears
- But Firestore balance unchanged
- Can't make voice calls

**Causes:**
- Backend validation failed
- Network timeout
- Invalid receipt
- Firestore rules preventing write

**Solutions:**

```bash
# 1. Check backend logs
gcloud run logs read sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --filter "textPayload:validate-purchase" \
  --limit 20

# Look for:
# ✅ "Purchase validated and processed"
# ❌ "Receipt validation failed: ..."

# 2. Check Firestore console
# users/{userId}
# Verify subscription_tier and voice_balance_seconds updated

# 3. Manual credit allocation (emergency only)
# Firebase Console → Firestore → users → {userId}
# Update fields:
#   subscription_tier: "weekly"
#   voice_balance_seconds: 60

# 4. Check service account permissions
# Cloud Console → IAM
# Service account needs "Secret Manager Secret Accessor"
```

**Prevention:**
- Always validate backend response before showing success
- Implement retry logic for network failures
- Log all purchase attempts for debugging

---

### Issue: Duplicate purchase charges

**Symptoms:**
- User charged twice
- Multiple entries in Firestore
- Double credits allocated

**Causes:**
- User tapped purchase button multiple times
- Network retry caused duplicate
- Race condition in backend

**Solutions:**

```javascript
// Backend duplicate prevention
// File: backend/iapValidator.js

// Check for existing order ID
const existingPurchase = await db.collection('credit_transactions')
  .where('metadata.orderId', '==', orderId)
  .limit(1)
  .get();

if (!existingPurchase.empty) {
  console.log('❌ Duplicate purchase detected:', orderId);
  return { valid: false, error: 'Purchase already processed' };
}
```

**Manual Fix:**
```bash
# 1. Identify duplicate transactions
# Firestore → credit_transactions
# Find entries with same orderId

# 2. Remove duplicate credits
# Calculate: total credits - duplicate amount
# Update users/{userId}/voice_balance_seconds

# 3. Process refund if necessary
# Google Play Console → Orders
# Find order → Issue refund
```

---

## 4. Voice Calling Problems

### Issue: Voice call won't connect

**Symptoms:**
- Stuck on "Connecting..." forever
- Never reaches "Connected" status
- No audio plays

**Causes:**
- Backend is down
- WebSocket connection failed
- Network firewall blocking WSS
- Insufficient balance (not detected)

**Solutions:**

```bash
# 1. Check backend health
curl https://sarina-voice-backend-fv2lgy22ja-uc.a.run.app/health

# Expected: {"status":"healthy",...}
# If error: Backend is down

# 2. Test WebSocket connection
nc -zv sarina-voice-backend-fv2lgy22ja-uc.a.run.app 443

# Expected: "succeeded"
# If failed: Port blocked or backend down

# 3. Check device network
adb shell ping -c 3 google.com

# If ping fails: Network issue on device

# 4. Check balance in Firestore
# Firebase Console → users/{userId}
# voice_balance_seconds should be ≥ 10

# 5. Check backend logs
gcloud run logs tail sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1

# Look for WebSocket connection attempts
```

**Frontend Debugging:**

```typescript
// Add debug logging in voiceCallService.ts
const connectToBackend = async () => {
  console.log('🔌 Attempting WebSocket connection...');
  console.log('Backend URL:', WS_URL);

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('✅ WebSocket connected');
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };

  ws.onclose = (event) => {
    console.log('🔌 WebSocket closed:', event.code, event.reason);
  };
};
```

---

### Issue: Audio not working (can't hear AI)

**Symptoms:**
- Call connects successfully
- Balance decrements
- But no audio from AI
- Microphone works (user can speak)

**Causes:**
- Device volume muted
- Audio permissions not granted
- Gemini API error
- Audio encoding/decoding issue

**Solutions:**

```bash
# 1. Check device volume
adb shell media volume --show --stream 3
# Stream 3 = Music volume
# Should be > 0

# 2. Check microphone permissions
adb shell dumpsys package com.sarina.app | grep android.permission.RECORD_AUDIO
# Should show: granted=true

# 3. Check backend Gemini logs
gcloud run logs read sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --filter "textPayload:Gemini" \
  --limit 20

# Look for:
# ✅ "Gemini response received"
# ❌ "Gemini API error: ..."

# 4. Test audio playback directly
# Add test button in VoiceCallScreen.tsx
const testAudio = async () => {
  const { sound } = await Audio.Sound.createAsync(
    require('./assets/test.mp3')
  );
  await sound.playAsync();
};
```

**Common Audio Issues:**

| Issue | Solution |
|-------|----------|
| Silent device | Check volume, unmute |
| Permissions denied | Request RECORD_AUDIO permission |
| Bluetooth connected | Switch audio output source |
| App in background | Bring to foreground |
| Audio focus lost | Request audio focus again |

---

## 5. Credit System Issues

### Issue: Balance not decrementing

**Symptoms:**
- Call starts successfully
- Balance shows initial amount
- After 5+ seconds, still same value
- Never decreases

**Causes:**
- Backend heartbeat not running
- WebSocket not sending balance updates
- Frontend not listening for updates
- Backend can't write to Firestore

**Solutions:**

```bash
# 1. Check backend heartbeat logs
gcloud run logs tail sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 | grep "deduct"

# Should see every 5 seconds:
# "💳 Deducting 5 seconds from user {userId}"

# 2. Check WebSocket messages (frontend)
# Add logging in VoiceCallScreen.tsx
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Received message:', data);

  if (data.type === 'balance_update') {
    console.log('💰 Balance update:', data.balance);
  }
};

# 3. Verify Firestore permissions
# Backend service account needs write access
# Cloud Console → IAM
# Check: {project-id}-compute@developer.gserviceaccount.com
# Role: Service Account User + Secret Manager Secret Accessor

# 4. Manual test deduction
# Firebase Console → Firestore → users/{userId}
# Watch voice_balance_seconds in real-time
# Should decrease by 5 every 5 seconds
```

---

### Issue: Balance deduction too fast/slow

**Symptoms:**
- Balance decreases faster than 5 seconds per heartbeat
- Or slower than expected
- After 60s call, balance off by >2 seconds

**Causes:**
- Heartbeat interval misconfigured
- Multiple heartbeat timers running
- Clock drift
- Network latency affecting timing

**Solutions:**

```javascript
// Check heartbeat interval in backend/creditManager.js
const HEARTBEAT_INTERVAL = 5000; // Should be 5000ms (5 seconds)
const DEDUCTION_AMOUNT = 5;      // Should match interval

// Verify only one heartbeat per session
let heartbeatInterval;

function startHeartbeat(userId, sessionId) {
  // Clear any existing interval first
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  heartbeatInterval = setInterval(async () => {
    console.log('💓 Heartbeat at:', new Date().toISOString());
    await deductCredits(userId, DEDUCTION_AMOUNT, sessionId);
  }, HEARTBEAT_INTERVAL);
}

// Ensure cleanup on disconnect
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}
```

**Testing Accuracy:**

```bash
# Use external stopwatch
# 1. Set balance to 30 seconds in Firestore
# 2. Start call and stopwatch simultaneously
# 3. Watch Firestore real-time updates

# At 5s: balance should be 25
# At 10s: balance should be 20
# At 15s: balance should be 15
# At 20s: balance should be 10
# At 25s: balance should be 5
# At 30s: balance should be 0, call ends

# Tolerance: ±1 second over 30 seconds is acceptable
```

---

## 6. Backend Connection Issues

### Issue: Backend returns 500/503 errors

**Symptoms:**
- Health check fails
- Calls fail to connect
- Error logs show server errors

**Causes:**
- Backend crashed
- Out of memory
- Firestore connection timeout
- Secret Manager access failed

**Solutions:**

```bash
# 1. Check backend status
gcloud run services describe sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --format="value(status.conditions)"

# 2. View recent errors
gcloud run logs read sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --filter "severity>=ERROR" \
  --limit 50

# 3. Restart backend service
gcloud run services update sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1

# 4. Check resource limits
gcloud run services describe sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --format="value(spec.template.spec.containers.resources)"

# If memory/CPU maxed out, increase:
gcloud run services update sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --memory 1Gi \
  --cpu 2
```

**Emergency Rollback:**

```bash
# List recent revisions
gcloud run revisions list \
  --service sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1

# Rollback to previous revision
gcloud run services update-traffic sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --to-revisions {previous-revision-name}=100
```

---

## 7. Firestore Data Problems

### Issue: User data not found

**Symptoms:**
- "User not found" errors
- Fresh sign-in, but no user document
- Features don't work (no balance, no subscription)

**Causes:**
- User document not created on sign-up
- Firestore rules blocking read
- Wrong collection/document path

**Solutions:**

```typescript
// Ensure user document created on sign-in
// File: app/services/authService.ts

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const createUserIfNotExists = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Create new user document
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      subscription_tier: 'free',
      voice_balance_seconds: 0,
      created_at: serverTimestamp(),
      last_login: serverTimestamp(),
    });
    console.log('✅ User document created:', user.uid);
  } else {
    // Update last login
    await setDoc(userRef, {
      last_login: serverTimestamp(),
    }, { merge: true });
  }
};
```

**Manual Creation:**

```bash
# Firebase Console → Firestore → users collection
# Click "Add document"
# Document ID: {user's Firebase UID}
# Fields:
{
  "email": "user@example.com",
  "subscription_tier": "free",
  "voice_balance_seconds": 0,
  "created_at": {timestamp},
  "total_seconds_used": 0
}
```

---

## 8. Performance Issues

### Issue: App is slow/laggy

**Symptoms:**
- Animations stutter
- Long delays between screens
- UI feels unresponsive

**Solutions:**

```bash
# 1. Enable performance monitoring
adb logcat | grep -i "fps\|dropped frames"

# 2. Profile memory usage
adb shell dumpsys meminfo com.sarina.app

# Look for:
# - High memory usage (>500 MB on low-end devices)
# - Memory leaks (increasing over time)

# 3. Check for unnecessary re-renders
# Add logging in components:
useEffect(() => {
  console.log('Component re-rendered:', Date.now());
});

# 4. Optimize images
# Compress all images before bundling
# Use appropriate resolutions (don't use 4K for small icons)

# 5. Enable Hermes engine (should already be enabled)
# android/app/build.gradle
project.ext.react = [
    enableHermes: true,  // ✓ Should be true
]

# 6. Build release version
# Debug builds are slower
cd android && ./gradlew assembleRelease
```

---

## 9. Edge Cases

### Edge Case 1: User changes timezone mid-call

**Scenario:**
User travels across timezone while on a call

**Expected Behavior:**
- Timestamps adjust to new timezone
- Balance deduction continues normally
- No credit loss or gain

**Testing:**

```bash
# Simulate timezone change
adb shell setprop persist.sys.timezone "America/New_York"
adb shell date $(date +%m%d%H%M%Y.%S)
```

---

### Edge Case 2: User force-quits app during call

**Scenario:**
User swipes app away while voice call active

**Expected Behavior:**
- Backend detects disconnection
- Heartbeat stops immediately
- Credits charged only for actual call time
- Call session marked as "interrupted"

**Testing:**

```bash
# Start call with 120s balance
# After 15s, force quit:
adb shell am force-stop com.sarina.app

# Check Firestore:
# - voice_balance_seconds should be ~105 (120 - 15)
# - call_sessions should show interrupted status
```

---

### Edge Case 3: Multiple devices, same account

**Scenario:**
User signs in on two devices simultaneously

**Expected Behavior:**
- Both devices work independently
- Balance is shared (single source of truth)
- Purchase on one device reflects on other

**Testing:**

```bash
# Device A: Sign in
# Device B: Sign in with same account

# Device A: Make purchase (weekly plan)
# Device B: Should show premium status after refresh

# Device A: Start call (60s balance)
# Device A: Use 30s, end call (30s remaining)
# Device B: Start call
# Device B: Should show 30s balance
```

---

### Edge Case 4: System kills app for memory

**Scenario:**
Android kills app in background to free memory

**Expected Behavior:**
- User state preserved
- Balance accurate on restart
- No data loss

**Testing:**

```bash
# Start call
# Background app
# Simulate low memory kill:
adb shell am kill com.sarina.app

# Reopen app
# Should restore state correctly
```

---

## 10. Emergency Procedures

### 🚨 Emergency: App broken in production

**Immediate Actions:**

```bash
# 1. STOP THE ROLLOUT
# Google Play Console → Production → Halt rollout

# 2. Assess severity
Severity Levels:
- P0 (Critical): Crashes for all users, no functionality → Rollback immediately
- P1 (High): Major feature broken for most users → Rollback or hotfix within 4 hours
- P2 (Medium): Minor feature broken, workaround exists → Fix in next release
- P3 (Low): Cosmetic issues, doesn't affect functionality → Fix when convenient

# 3. If P0 or P1: Rollback
# Play Console → Production → Select previous version
# Rollout 100% to last stable version

# 4. Investigate issue
# Pull crash logs from Play Console
# Check backend logs
# Try to reproduce locally

# 5. Implement fix
# Create hotfix branch
# Fix issue
# Test thoroughly
# Deploy patched version

# 6. Communicate
# Update Play Console release notes
# Post in community/social (if applicable)
# Notify affected users (if possible)
```

---

### 🚨 Emergency: Backend down

```bash
# 1. Check status
gcloud run services list \
  --project sarina-ai-2b2c1 \
  --filter="metadata.name:sarina-voice-backend"

# 2. View errors
gcloud run logs read sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --filter "severity=ERROR" \
  --limit 100

# 3. Restart service
gcloud run services update sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --clear-env-vars

# Wait 30 seconds, then re-add env vars

# 4. If restart doesn't help, redeploy
cd backend
gcloud builds submit --config cloudbuild.yaml --project=sarina-ai-2b2c1

# 5. Monitor recovery
watch -n 5 'curl -s https://sarina-voice-backend-fv2lgy22ja-uc.a.run.app/health'
```

---

### 🚨 Emergency: Firestore rules locked out users

```bash
# 1. Check current rules
firebase firestore:rules:list

# 2. Temporarily open read access (emergency only!)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;  // TEMPORARY - allows all reads
      allow write: if request.auth != null;
    }
  }
}

# Deploy emergency rules
firebase deploy --only firestore:rules

# 3. Fix proper rules
# Restore correct rules with proper authentication

# 4. Deploy corrected rules
firebase deploy --only firestore:rules

# 5. Verify access restored
# Test with actual app
```

---

## 📞 Support Escalation

**When to escalate:**
- Multiple users reporting same critical issue
- Revenue-impacting bug (purchases not working)
- Data loss or corruption
- Security breach

**Escalation Process:**
1. Document issue with logs and screenshots
2. Attempt standard troubleshooting steps
3. If unresolved within 30 minutes (P0) or 4 hours (P1), escalate
4. Contact: [Your escalation contacts here]

---

## 📝 Logging Best Practices

**Add contextual logs:**

```typescript
// Good logging
console.log('[VoiceCall] Starting call for user:', userId, 'balance:', balance);
console.error('[VoiceCall] Connection failed:', error.message, { userId, timestamp });

// Bad logging
console.log('Starting call');  // No context
console.log(error);  // Too verbose
```

**Log levels:**
- `console.log`: Normal flow events
- `console.warn`: Unexpected but handled situations
- `console.error`: Errors that prevent functionality

---

**Document Version:** 1.0
**Last Updated:** February 14, 2026
**Maintained By:** Development Team

For additional help, check:
- `MILESTONE4_INTEGRATION_TESTING.md` - Test procedures
- `PRODUCTION_READINESS_CHECKLIST.md` - Pre-launch checklist
- `README.md` - General project documentation

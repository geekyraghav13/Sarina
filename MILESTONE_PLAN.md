# Sarina AI - Milestone-Based Implementation Plan

**Project**: User Journey + Purchase + Voice Calling Integration
**Date**: February 6, 2026
**Objective**: Working conversion funnel with functional IAP and voice calling
**Total Duration**: 5-7 days

---

## 🎯 Project Goals

1. ✅ **100% of users see paywall** before accessing premium features
2. ✅ **Purchase flow works end-to-end** (mock and real)
3. ✅ **Voice calling credits system** integrated with subscriptions
4. ✅ **Call limits enforced** (1 min weekly, 50 min yearly)
5. ✅ **Revenue generation enabled** with proper tracking

---

## 📊 Success Metrics Dashboard

### Conversion Funnel KPIs
```
Target Metrics (Post-Implementation):
├─ Paywall Impression Rate: 100% (first-time users)
├─ Paywall View Rate: 80%+ (all sessions)
├─ Purchase Conversion: Track weekly vs yearly
├─ Voice Call Completion: >90% (no crashes)
├─ Credit Deduction Accuracy: 100% (±1 second tolerance)
└─ Revenue Generation: Functional end-to-end
```

### Technical Success Criteria
```
Performance Benchmarks:
├─ App Launch to Chat: <3 seconds
├─ Incoming Call Display: 1-2 seconds after trigger
├─ Paywall Load Time: <1 second
├─ Voice Call Connection: <3 seconds
├─ Credit Deduction Delay: Exactly 5 seconds (heartbeat)
└─ Backend Response Time: <500ms average
```

---

## 🏗️ MILESTONE 1: Mock Purchase Flow (Day 1-2) ✅ COMPLETED

**Duration**: 1.5-2 days
**Priority**: P0 (Critical)
**Goal**: Working user journey with mock purchases for testing
**Status**: ✅ COMPLETED - February 9, 2026

### Deliverables

#### 1.1 Navigation Flow Fix ⏱️ 2 hours
**Files**: `SummaryScreen.tsx`, `ChatScreen.tsx`, `navigation/types.ts`

**Acceptance Criteria**:
- ✅ Onboarding completes → Navigate directly to Chat (NOT Home)
- ✅ Pass `fromOnboarding: true, isFirstLaunch: true` params
- ✅ Incoming call appears within 1-2 seconds
- ✅ No manual user action required

**Benchmark Test**:
```bash
Test: Fresh Install Flow
1. Uninstall app completely
2. Install and launch
3. Complete onboarding (8 screens)
4. Timer starts when "Summary" screen shows
5. PASS: Chat screen appears within 500ms
6. PASS: Incoming call appears within 1-2 seconds
7. FAIL: If Home screen appears OR incoming call doesn't show
```

**Code Changes**:
```typescript
// SummaryScreen.tsx
navigation.replace('Chat', {
  fromOnboarding: true,
  isFirstLaunch: true,
});

// ChatScreen.tsx
useEffect(() => {
  if (route.params?.isFirstLaunch) {
    setTimeout(() => {
      navigation.navigate('IncomingCall', {
        characterName: girlfriendName,
        characterImageUrl: selectedGirlfriend?.imageUrl,
        isFirstTime: true,
      });
    }, 1000); // 1 second
  }
}, [route.params]);
```

---

#### 1.2 Paywall Integration ⏱️ 3 hours
**Files**: `IncomingCallScreen.tsx`, `NewPaywallScreen.tsx`

**Acceptance Criteria**:
- ✅ "Pick Call" → Navigate to Paywall (not VoiceCall)
- ✅ "Decline Call" → Navigate to Paywall
- ✅ Paywall shows correct character info
- ✅ Paywall cancel → Return to Chat
- ✅ Paywall purchase → Success flow

**Benchmark Test**:
```bash
Test: Paywall Trigger (First-Time User)
1. Complete onboarding
2. Wait for incoming call
3. Tap "Pick" button
4. PASS: Paywall screen appears within 300ms
5. PASS: Character name/image displayed correctly
6. Tap "Cancel"
7. PASS: Return to Chat screen
8. Repeat with "Decline" button
9. PASS: Paywall appears again
```

**Mock Purchase Flow**:
```typescript
// NewPaywallScreen.tsx
const handleMockPurchase = async (plan: 'weekly' | 'yearly') => {
  console.log('🧪 MOCK PURCHASE:', plan);

  // Simulate processing delay
  setIsLoading(true);
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Update Firestore (real database writes)
  const userId = getCurrentUser()?.uid;
  await updateDoc(doc(db, 'users', userId), {
    subscription_tier: plan,
    subscription_start_date: serverTimestamp(),
    voice_balance_seconds: plan === 'weekly' ? 60 : 3000,
  });

  // Update local state
  setIsPremium(true);
  setSubscriptionType(plan);

  // Show success
  Alert.alert('✅ Purchase Successful (Mock)',
    `You now have ${plan === 'weekly' ? '1 minute' : '50 minutes'} of voice time!`,
    [{ text: 'Start Calling', onPress: handleStartCall }]
  );
};
```

---

#### 1.3 Premium Status Detection ⏱️ 1 hour
**Files**: `subscriptionService.ts`, `paymentStore.ts`

**Acceptance Criteria**:
- ✅ New users: `isPremium = false` by default
- ✅ After mock purchase: `isPremium = true`
- ✅ Read from Firestore: `subscription_tier` field
- ✅ Persist to AsyncStorage for offline access

**Benchmark Test**:
```bash
Test: Premium Status Detection
1. Fresh install → Check: isPremium = false
2. Complete onboarding → Check: isPremium = false
3. Mock purchase weekly plan
4. Check Firestore: subscription_tier = 'weekly'
5. Check AsyncStorage: isPremium = true
6. Close and reopen app
7. PASS: isPremium still true (persisted)
8. PASS: No paywall on incoming call (premium user)
```

**Implementation**:
```typescript
// subscriptionService.ts
export const checkPremiumStatus = async (): Promise<boolean> => {
  const userId = getCurrentUser()?.uid;
  if (!userId) return false;

  const userDoc = await getDoc(doc(db, 'users', userId));
  const tier = userDoc.data()?.subscription_tier || 'free';

  return tier !== 'free'; // 'weekly' or 'yearly' = premium
};

export const syncSubscriptionStatus = async () => {
  const isPremium = await checkPremiumStatus();
  usePaymentStore.getState().setIsPremium(isPremium);

  const userDoc = await getDoc(doc(db, 'users', getCurrentUser()?.uid));
  const tier = userDoc.data()?.subscription_tier;
  usePaymentStore.getState().setSubscriptionType(tier);
};
```

---

#### 1.4 Repeat Paywall Trigger ⏱️ 1 hour
**Files**: `callStore.ts`, `ChatScreen.tsx`

**Acceptance Criteria**:
- ✅ Non-premium users: Incoming call every 2 minutes
- ✅ Premium users: No repeat incoming calls
- ✅ Timer resets on each decline
- ✅ Works in background (app minimized)

**Benchmark Test**:
```bash
Test: Repeat Paywall (Non-Premium User)
1. Be on Chat screen (non-premium)
2. Decline incoming call
3. Start 2-minute timer
4. PASS: At exactly 2:00, incoming call appears
5. Decline again
6. Start timer again
7. PASS: At 2:00, incoming call appears
8. Minimize app at 1:30
9. Reopen app
10. PASS: Incoming call appears at 2:00 mark
```

**Implementation**:
```typescript
// callStore.ts
shouldShowCall: () => {
  const { isPremium } = usePaymentStore.getState();
  if (isPremium) return false;

  if (!state.hasSeenCall) return true;

  if (state.lastDeclinedTime) {
    const TWO_MINUTES = 2 * 60 * 1000;
    return (Date.now() - state.lastDeclinedTime) >= TWO_MINUTES;
  }

  return false;
}
```

---

### Milestone 1 Checkpoint

**Testing Procedure**: Complete User Journey Test
```bash
CHECKPOINT 1: Fresh Install to Mock Purchase

Step 1: Fresh Install
→ Uninstall app
→ Install from APK
→ Launch app

Step 2: Onboarding
→ Google Sign-In ✓
→ Accept Disclaimer ✓
→ Complete all 8 onboarding screens ✓

Step 3: First Paywall Interaction
→ Chat screen appears (NOT Home) ✓
→ Incoming call within 1-2 seconds ✓
→ Tap "Pick" → Paywall appears ✓
→ Cancel → Return to chat ✓

Step 4: Repeat Paywall
→ Wait exactly 2 minutes ✓
→ Incoming call appears again ✓
→ Tap "Decline" → Paywall appears ✓

Step 5: Mock Purchase
→ Select "Weekly Plan" ✓
→ Tap "Subscribe" button ✓
→ Loading spinner (2 seconds) ✓
→ Success alert appears ✓
→ Check Firestore: subscription_tier = 'weekly' ✓
→ Check Firestore: voice_balance_seconds = 60 ✓

Step 6: Premium User Behavior
→ Tap call button in header ✓
→ Incoming call appears ✓
→ Tap "Pick" → GOES DIRECTLY TO VOICE CALL ✓
→ (NO paywall for premium users) ✓

Step 7: Returning User
→ Close app completely
→ Reopen app
→ Goes directly to Home screen ✓
→ Select character → Chat ✓
→ No immediate incoming call ✓
→ Tap call button → Direct to voice call ✓

PASS CRITERIA: All steps ✓ with no errors
```

**Deliverable**: Screen recording showing full flow

---

## 🎤 MILESTONE 2: Voice Calling Integration (Day 3-4)

**Duration**: 1.5-2 days
**Priority**: P0 (Critical)
**Goal**: Voice calls work with credit system and subscription limits

### Deliverables

#### 2.1 Credit Balance Check ⏱️ 2 hours
**Files**: `VoiceCallScreen.tsx`, `creditService.ts`

**Acceptance Criteria**:
- ✅ Before call starts: Check balance ≥10 seconds
- ✅ If insufficient: Show "Purchase More" alert
- ✅ If sufficient: Start call normally
- ✅ Display real-time balance during call

**Benchmark Test**:
```bash
Test: Insufficient Balance Protection
1. Set user balance to 5 seconds (Firestore)
2. Tap call button
3. Incoming call → Pick
4. PASS: Alert appears: "Insufficient Balance"
5. PASS: Options: "Purchase More" | "Cancel"
6. Tap "Purchase More"
7. PASS: Navigate to Paywall
8. Mock purchase → Balance = 60 seconds
9. Start call again
10. PASS: Call connects successfully
```

**Implementation**:
```typescript
// VoiceCallScreen.tsx
useEffect(() => {
  const checkBalanceBeforeCall = async () => {
    const userId = getCurrentUser()?.uid;
    const balance = await getCreditBalance(userId);

    if (balance < 10) {
      Alert.alert(
        'Insufficient Balance',
        `You need at least 10 seconds. Current: ${balance}s`,
        [
          { text: 'Purchase More', onPress: () => navigation.replace('Paywall', {...}) },
          { text: 'Cancel', onPress: () => navigation.goBack(), style: 'cancel' }
        ]
      );
      return;
    }

    // Sufficient balance, proceed
    connectToBackend();
  };

  checkBalanceBeforeCall();
}, []);
```

---

#### 2.2 Backend Credit Deduction ⏱️ 2 hours
**Files**: `backend/creditManager.js`, `backend/server.js`

**Acceptance Criteria**:
- ✅ Heartbeat runs every 5 seconds exactly
- ✅ Deducts 5 seconds per heartbeat
- ✅ Atomic Firestore updates (no race conditions)
- ✅ Logs transaction for every deduction
- ✅ Auto-ends call when balance = 0

**Benchmark Test**:
```bash
Test: Credit Deduction Accuracy
1. Set balance to 30 seconds
2. Start voice call
3. Use stopwatch to time exactly
4. At 5s: Check Firestore balance = 25s ✓
5. At 10s: Check Firestore balance = 20s ✓
6. At 15s: Check Firestore balance = 15s ✓
7. At 20s: Check Firestore balance = 10s ✓
8. At 25s: Check Firestore balance = 5s ✓
9. At 30s: Check Firestore balance = 0s ✓
10. PASS: Call auto-ends at exactly 30 seconds
11. PASS: "Out of Credits" message appears
12. PASS: Paywall shown automatically

Tolerance: ±0.5 seconds acceptable
```

**Implementation** (Enable Production Code):
```javascript
// backend/creditManager.js
// UNCOMMENT ALL FIRESTORE OPERATIONS

const HEARTBEAT_INTERVAL = 5000; // 5 seconds
const DEDUCTION_AMOUNT = 5; // 5 seconds per heartbeat

async function startHeartbeat(userId, sessionId, ws) {
  const interval = setInterval(async () => {
    try {
      const result = await deductCredits(userId, DEDUCTION_AMOUNT, sessionId);

      if (!result.success) {
        // Out of credits
        clearInterval(interval);
        ws.send(JSON.stringify({
          type: 'call_ended',
          reason: 'out_of_credits',
          message: 'Voice credits exhausted',
        }));
        ws.close();
        return;
      }

      // Send balance update to client
      ws.send(JSON.stringify({
        type: 'balance_update',
        balance: result.newBalance,
      }));

    } catch (error) {
      console.error('Heartbeat error:', error);
      clearInterval(interval);
    }
  }, HEARTBEAT_INTERVAL);

  return interval;
}

async function deductCredits(userId, amount, sessionId) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  const currentBalance = userDoc.data().voice_balance_seconds || 0;

  if (currentBalance < amount) {
    return { success: false, newBalance: 0 };
  }

  // Atomic update
  await userRef.update({
    voice_balance_seconds: admin.firestore.FieldValue.increment(-amount),
    total_seconds_used: admin.firestore.FieldValue.increment(amount),
  });

  // Log transaction
  await db.collection('credit_transactions').add({
    userId,
    type: 'deduction',
    amount_seconds: -amount,
    call_session_id: sessionId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, newBalance: currentBalance - amount };
}
```

---

#### 2.3 Real-Time Balance Display ⏱️ 1 hour
**Files**: `VoiceCallScreen.tsx`

**Acceptance Criteria**:
- ✅ Balance displays in MM:SS format
- ✅ Updates every 5 seconds (matches heartbeat)
- ✅ Color changes as balance decreases:
  - Green: >30 seconds
  - Yellow: 11-30 seconds
  - Red: ≤10 seconds
- ✅ Shows warning at 10 seconds remaining

**Benchmark Test**:
```bash
Test: Real-Time Balance UI
1. Start call with 60 seconds
2. Watch balance counter
3. At 0:55 → PASS: Green color ✓
4. At 0:25 → PASS: Yellow color ✓
5. At 0:10 → PASS: Red color + "Low Balance!" warning ✓
6. At 0:05 → PASS: Red + warning persists ✓
7. At 0:00 → PASS: Call ends + paywall ✓
```

**Implementation**:
```typescript
// VoiceCallScreen.tsx
const [balance, setBalance] = useState<number>(0);
const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(false);

useEffect(() => {
  // Listen for balance updates from backend
  const handleBalanceUpdate = (data: any) => {
    if (data.type === 'balance_update') {
      setBalance(data.balance);

      if (data.balance <= 10) {
        setShowLowBalanceWarning(true);
      }
    }
  };

  // ... WebSocket listener
}, []);

const formatBalance = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getBalanceColor = (seconds: number) => {
  if (seconds > 30) return '#10B981'; // Green
  if (seconds > 10) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
};

// In render:
<View style={styles.balanceContainer}>
  <Text style={[styles.balanceText, { color: getBalanceColor(balance) }]}>
    {formatBalance(balance)}
  </Text>
  {showLowBalanceWarning && (
    <Text style={styles.warningText}>⚠️ Low Balance!</Text>
  )}
</View>
```

---

#### 2.4 Subscription Tier Limits ⏱️ 2 hours
**Files**: `creditService.ts`, Backend Cloud Functions

**Acceptance Criteria**:
- ✅ Weekly plan: Exactly 60 seconds total
- ✅ Yearly plan: Exactly 3000 seconds total
- ✅ Free users: 0 seconds (can't call)
- ✅ Balance resets correctly per tier
- ✅ No way to exceed allocated time

**Benchmark Test**:
```bash
Test: Weekly Plan Limit (60 seconds)
1. Mock purchase weekly plan
2. Check Firestore: voice_balance_seconds = 60
3. Start call #1 → Talk for 20 seconds → End call
4. Check balance: 40 seconds remaining ✓
5. Start call #2 → Talk for 25 seconds → End call
6. Check balance: 15 seconds remaining ✓
7. Start call #3 → Talk for 15 seconds
8. At 15 seconds → Auto-end ✓
9. Check balance: 0 seconds ✓
10. Try to start call #4
11. PASS: "Insufficient Balance" alert ✓
12. PASS: Paywall appears ✓

Test: Yearly Plan Limit (3000 seconds = 50 minutes)
1. Mock purchase yearly plan
2. Check Firestore: voice_balance_seconds = 3000
3. Start call → Verify can talk for at least 5 minutes ✓
4. End call → Check balance decreased correctly ✓
5. PASS: Math checks out (3000 - call_duration) ✓
```

**Implementation**:
```typescript
// creditService.ts
export const allocateCreditsForTier = async (
  userId: string,
  tier: 'free' | 'weekly' | 'yearly'
) => {
  const credits = {
    free: 0,
    weekly: 60,
    yearly: 3000,
  }[tier];

  await updateDoc(doc(db, 'users', userId), {
    voice_balance_seconds: credits,
    subscription_tier: tier,
    last_reset_date: serverTimestamp(),
  });

  // Log allocation
  await addDoc(collection(db, 'credit_transactions'), {
    userId,
    type: 'subscription',
    amount_seconds: credits,
    timestamp: serverTimestamp(),
    metadata: { tier, source: 'tier_allocation' },
  });
};
```

---

### Milestone 2 Checkpoint

**Testing Procedure**: Voice Calling End-to-End Test
```bash
CHECKPOINT 2: Voice Calling + Credits

Step 1: Weekly Plan Purchase
→ Fresh user (0 balance)
→ Mock purchase weekly plan
→ Verify: voice_balance_seconds = 60 ✓

Step 2: Successful Call
→ Start voice call
→ Backend connects ✓
→ Gemini responds ✓
→ Balance displays correctly ✓
→ Heartbeat deducts every 5s ✓

Step 3: Balance Depletion
→ Let call run for 60 seconds
→ At 55s: Yellow warning ✓
→ At 10s: Red + "Low Balance!" ✓
→ At 0s: Auto-end call ✓
→ Paywall appears ✓

Step 4: Transaction Logging
→ Check Firestore: credit_transactions collection
→ Verify: 12 deduction entries (60s ÷ 5s = 12) ✓
→ Each entry: -5 seconds ✓
→ Total deducted: -60 seconds ✓

Step 5: Yearly Plan Test
→ Purchase yearly plan
→ Verify: voice_balance_seconds = 3000 ✓
→ Start call → Talk for 30 seconds → End
→ Check: balance = 2970 seconds ✓
→ Math: 3000 - 30 = 2970 ✓

Step 6: Premium User Call Flow
→ Premium user with 120s balance
→ Tap call button → Incoming call ✓
→ Pick → Goes to VoiceCall (no paywall) ✓
→ Call connects immediately ✓
→ Balance decrements correctly ✓

PASS CRITERIA: All voice calls work, credits accurate to ±1s
```

**Deliverable**: Video recording showing 60-second call with real-time balance

---

## 💳 MILESTONE 3: Real IAP Integration (Day 5-6)

**Duration**: 1.5-2 days
**Priority**: P1 (High)
**Goal**: Production-ready in-app purchases with receipt validation

### Deliverables

#### 3.1 Install Expo IAP Library ⏱️ 1 hour
**Files**: `package.json`, `app.json`

**Acceptance Criteria**:
- ✅ `expo-in-app-purchases` installed successfully
- ✅ Android configuration complete
- ✅ Build compiles without errors
- ✅ IAP connection initializes on app launch

**Benchmark Test**:
```bash
Test: Library Installation
1. npm install expo-in-app-purchases
2. npx expo prebuild --clean
3. PASS: Build succeeds with no errors
4. Launch app
5. Check logs: "✅ IAP initialized"
6. PASS: No crashes or warnings
```

**Implementation**:
```bash
# Install
npx expo install expo-in-app-purchases

# app.json
{
  "expo": {
    "plugins": [
      "expo-av",
      "expo-in-app-purchases"
    ]
  }
}

# Rebuild
npx expo prebuild --clean --platform android
```

---

#### 3.2 Configure IAP Products ⏱️ 2 hours
**Files**: `iapService.ts` (new), Google Play Console

**Acceptance Criteria**:
- ✅ Products created in Play Console:
  - `com.sarina.app.weekly` ($2.99/week)
  - `com.sarina.app.yearly` ($12.99/year)
- ✅ Products fetch successfully from API
- ✅ Prices display correctly in app
- ✅ Test purchases work (Google test account)

**Benchmark Test**:
```bash
Test: Product Configuration
1. Open app
2. Navigate to Paywall
3. PASS: Weekly shows "$2.99/week" (real price from Play Store)
4. PASS: Yearly shows "$12.99/year"
5. PASS: "Save 83%" badge calculates correctly
6. Add Google test account (license testers)
7. Tap "Subscribe" on weekly
8. PASS: Google Play purchase dialog appears
9. Complete test purchase
10. PASS: Purchase succeeds (no real charge)
```

**Implementation**:
```typescript
// app/services/iapService.ts
import * as InAppPurchases from 'expo-in-app-purchases';

const PRODUCT_IDS = {
  weekly: 'com.sarina.app.weekly',
  yearly: 'com.sarina.app.yearly',
};

export const initializeIAP = async () => {
  try {
    await InAppPurchases.connectAsync();
    console.log('✅ IAP initialized');
    return true;
  } catch (error) {
    console.error('❌ IAP init failed:', error);
    return false;
  }
};

export const getProducts = async () => {
  try {
    const { results } = await InAppPurchases.getProductsAsync([
      PRODUCT_IDS.weekly,
      PRODUCT_IDS.yearly,
    ]);

    return results.map(product => ({
      id: product.productId,
      title: product.title,
      description: product.description,
      price: product.price,
      priceString: product.priceString,
      type: product.type,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const purchaseProduct = async (productId: string) => {
  try {
    const result = await InAppPurchases.purchaseItemAsync(productId);

    if (result.responseCode === InAppPurchases.IAPResponseCode.OK) {
      return { success: true, purchase: result.results[0] };
    } else {
      return { success: false, error: 'Purchase cancelled or failed' };
    }
  } catch (error) {
    console.error('Purchase error:', error);
    return { success: false, error };
  }
};
```

---

#### 3.3 Receipt Validation ⏱️ 3 hours
**Files**: `backend/iapValidator.js` (new), Cloud Functions

**Acceptance Criteria**:
- ✅ Backend validates Google Play receipts
- ✅ Prevents duplicate purchase processing
- ✅ Detects fraudulent/fake receipts
- ✅ Updates Firestore only after validation
- ✅ Handles refunds/cancellations

**Benchmark Test**:
```bash
Test: Receipt Validation
1. Make test purchase (weekly plan)
2. Backend receives receipt data
3. Backend calls Google Play API for verification
4. PASS: Receipt validated successfully
5. PASS: Firestore updated with subscription
6. PASS: Credits allocated (60 seconds)
7. Try to process same receipt again
8. PASS: Duplicate detected, rejected
9. PASS: No double-credit allocation

Test: Fake Receipt Protection
1. Send fabricated receipt to backend
2. Backend calls Google Play API
3. PASS: Validation fails (invalid signature)
4. PASS: No credits allocated
5. PASS: Error logged for monitoring
```

**Implementation**:
```javascript
// backend/iapValidator.js
const { google } = require('googleapis');
const androidpublisher = google.androidpublisher('v3');

async function validateAndroidPurchase(packageName, productId, purchaseToken) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './service-account.json',
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const authClient = await auth.getClient();

    const result = await androidpublisher.purchases.subscriptions.get({
      auth: authClient,
      packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });

    // Check if subscription is valid and active
    const isValid = result.data.paymentState === 1; // 1 = purchased, 0 = pending
    const expiryTime = parseInt(result.data.expiryTimeMillis);
    const isActive = Date.now() < expiryTime;

    return {
      valid: isValid && isActive,
      expiryTime,
      orderId: result.data.orderId,
    };
  } catch (error) {
    console.error('Validation error:', error);
    return { valid: false, error: error.message };
  }
}

module.exports = { validateAndroidPurchase };
```

---

#### 3.4 Purchase Flow Integration ⏱️ 2 hours
**Files**: `NewPaywallScreen.tsx`

**Acceptance Criteria**:
- ✅ Replace mock purchase with real IAP call
- ✅ Show loading state during purchase
- ✅ Handle errors gracefully (network, cancelled, etc.)
- ✅ Success → Allocate credits → Navigate to voice call
- ✅ Failure → Show retry option

**Benchmark Test**:
```bash
Test: Real Purchase Flow
1. Non-premium user on paywall
2. Tap "Weekly Plan - $2.99"
3. PASS: Loading spinner appears
4. PASS: Google Play dialog shows
5. Complete purchase (test account, no charge)
6. PASS: Receipt sent to backend for validation
7. PASS: Backend validates receipt
8. PASS: Firestore updated:
   - subscription_tier = 'weekly'
   - voice_balance_seconds = 60
9. PASS: Success alert: "✅ Purchase Complete!"
10. PASS: Navigate to VoiceCall screen
11. PASS: Call starts immediately

Test: Purchase Cancellation
1. Tap "Yearly Plan - $12.99"
2. Google Play dialog appears
3. Tap "Cancel" or back button
4. PASS: Returns to paywall (no error)
5. PASS: Can try again

Test: Network Error Handling
1. Disable internet
2. Tap "Subscribe"
3. PASS: Error alert: "Network error. Check connection."
4. PASS: Option to retry
5. Enable internet
6. Tap retry
7. PASS: Purchase proceeds normally
```

**Implementation**:
```typescript
// NewPaywallScreen.tsx
const handlePurchase = async (plan: 'weekly' | 'yearly') => {
  setIsLoading(true);

  try {
    // Real IAP purchase
    const productId = plan === 'weekly'
      ? 'com.sarina.app.weekly'
      : 'com.sarina.app.yearly';

    const result = await purchaseProduct(productId);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Send receipt to backend for validation
    const validated = await validatePurchaseWithBackend({
      productId,
      purchaseToken: result.purchase.purchaseToken,
      userId: getCurrentUser()?.uid,
    });

    if (!validated.success) {
      throw new Error('Receipt validation failed');
    }

    // Success! Backend already updated Firestore
    // Update local state
    await syncSubscriptionStatus();

    // Show success
    Alert.alert(
      '✅ Purchase Complete!',
      `You now have ${plan === 'weekly' ? '1 minute' : '50 minutes'} of AI voice calling!`,
      [{
        text: 'Start Calling',
        onPress: () => navigation.replace('VoiceCall', {
          characterName: route.params.characterName,
          characterImageUrl: route.params.characterImageUrl,
          characterId: selectedGirlfriend?.id,
          characterProfile: selectedGirlfriend,
        }),
      }]
    );

  } catch (error: any) {
    console.error('Purchase error:', error);

    if (error.message.includes('cancelled')) {
      // User cancelled, no action needed
      return;
    }

    Alert.alert(
      'Purchase Failed',
      error.message || 'Something went wrong. Please try again.',
      [
        { text: 'Retry', onPress: () => handlePurchase(plan) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  } finally {
    setIsLoading(false);
  }
};
```

---

### Milestone 3 Checkpoint

**Testing Procedure**: Real IAP End-to-End Test
```bash
CHECKPOINT 3: Production IAP

Prerequisites:
→ Google Play Console configured ✓
→ App uploaded (internal test track) ✓
→ Test account added as license tester ✓

Step 1: Product Fetch
→ Open paywall screen
→ Verify real prices from Play Store ✓
→ Weekly: Shows $2.99/week ✓
→ Yearly: Shows $12.99/year ✓

Step 2: Test Purchase (Weekly)
→ Tap "Subscribe" on weekly
→ Google Play dialog appears ✓
→ Complete purchase (test account) ✓
→ Receipt sent to backend ✓
→ Backend validates with Google API ✓
→ Firestore updated ✓
→ Success alert appears ✓

Step 3: Verify Subscription Active
→ Check Play Console → Orders
→ Find order with test account email ✓
→ Status: "Active" ✓
→ Check Firestore: subscription_tier = 'weekly' ✓
→ Check Firestore: voice_balance_seconds = 60 ✓

Step 4: Use Subscription
→ Start voice call
→ Call works normally ✓
→ Balance decrements ✓
→ No paywall interruptions (premium user) ✓

Step 5: Exhausted Balance
→ Wait until balance = 0
→ Try to start new call
→ Alert: "Insufficient Balance" ✓
→ Options: "Upgrade to Yearly" | "Purchase Pack" ✓
→ Paywall offers shown ✓

Step 6: Restore Purchases
→ Uninstall app
→ Reinstall app
→ Sign in with same Google account
→ Tap "Restore Purchases" in paywall
→ PASS: Subscription restored ✓
→ PASS: isPremium = true ✓
→ PASS: Can make calls immediately ✓

PASS CRITERIA: Real money flow (test mode) works end-to-end
```

**Deliverable**: Successful test purchase with receipt validation

---

## 🧪 MILESTONE 4: Integration Testing & QA (Day 7)

**Duration**: 1 day
**Priority**: P0 (Critical)
**Goal**: Verify entire system works together without issues

### Test Suites

#### Suite 4.1: First-Time User Journey ⏱️ 2 hours

**Complete Flow Test**:
```bash
Test Case 1: Happy Path (Purchase → Call → Exhaust)
Duration: ~5 minutes

1. Fresh install
2. Google Sign-In
3. Accept Disclaimer
4. Complete Onboarding (8 screens)
5. Chat screen appears
6. Incoming call within 1-2 seconds ✓
7. Tap "Pick"
8. Paywall appears ✓
9. Purchase weekly plan ($2.99 test)
10. Google Play dialog → Complete ✓
11. Success alert ✓
12. Navigate to VoiceCall ✓
13. Call connects to backend ✓
14. Gemini responds ✓
15. Balance shows 60s ✓
16. Talk for 60 seconds
17. Balance counts down (55, 50, 45...) ✓
18. At 10s: Red warning ✓
19. At 0s: Call auto-ends ✓
20. Paywall appears ✓
21. Option to upgrade or purchase pack ✓

PASS: All steps complete without errors

Test Case 2: Decline Path
Duration: ~6 minutes

1-6. Same as above
7. Tap "Decline" (not Pick)
8. Paywall appears ✓
9. Tap "Cancel"
10. Return to chat ✓
11. Start 2-minute timer
12. At 2:00 exactly: Incoming call appears ✓
13. Decline again
14. Paywall appears ✓
15. Cancel again
16. Wait 2 more minutes
17. Incoming call appears again ✓
18. This time: Tap "Pick"
19. Paywall appears
20. Purchase yearly plan ($12.99 test)
21. Success ✓
22. Balance = 3000 seconds ✓
23. Start call
24. Talk for 2 minutes (120s)
25. End call manually
26. Check balance: 2880s remaining ✓

PASS: Repeat trigger works, yearly plan correct
```

---

#### Suite 4.2: Edge Cases ⏱️ 2 hours

**Test Case 1: Network Interruption During Call**
```bash
1. Start voice call with 120s balance
2. After 30 seconds, disable WiFi
3. EXPECTED: Call drops, balance = 90s
4. Check Firestore: Last deduction logged correctly ✓
5. Re-enable WiFi
6. Start new call
7. EXPECTED: Resumes from 90s balance ✓

PASS: No credit loss, graceful handling
```

**Test Case 2: App Backgrounding During Call**
```bash
1. Start voice call
2. After 15 seconds, minimize app
3. Wait 20 seconds (app in background)
4. Reopen app
5. EXPECTED: Call still active or properly ended ✓
6. EXPECTED: Balance reflects accurate time (35s deducted) ✓

PASS: Background behavior correct
```

**Test Case 3: Simultaneous Purchase Attempts**
```bash
1. Open paywall on Device A (same account)
2. Open paywall on Device B (same account)
3. Tap purchase on both simultaneously
4. EXPECTED: Only one purchase succeeds
5. EXPECTED: Other device shows "Already subscribed"
6. Check Firestore: Only 1 subscription entry ✓
7. Check Play Console: Only 1 order ✓

PASS: Race condition handled
```

**Test Case 4: Fraudulent Receipt**
```bash
1. Intercept purchase receipt
2. Modify productId or token
3. Send to backend
4. EXPECTED: Validation fails ✓
5. EXPECTED: No credits allocated ✓
6. EXPECTED: Error logged ✓
7. EXPECTED: Alert: "Invalid purchase" ✓

PASS: Fraud protection works
```

**Test Case 5: Refund Scenario**
```bash
1. Make real test purchase
2. Request refund from Play Console
3. Refund approved
4. EXPECTED: Webhook notifies backend
5. EXPECTED: subscription_tier reverts to 'free'
6. EXPECTED: balance set to 0
7. User tries to call
8. EXPECTED: Paywall appears ✓

PASS: Refund handling works (requires webhook setup)
```

---

#### Suite 4.3: Performance Benchmarks ⏱️ 1 hour

**Load Testing**:
```bash
Benchmark 1: App Launch Speed
→ Cold start: <3 seconds to Chat screen ✓
→ Warm start: <1.5 seconds ✓

Benchmark 2: Voice Call Connection
→ Tap "Pick" to Gemini response: <3 seconds ✓
→ WebSocket connection: <1 second ✓

Benchmark 3: Credit Deduction Latency
→ Heartbeat interval: 5.0s ±0.1s ✓
→ Firestore write time: <200ms ✓
→ Balance update display: <100ms ✓

Benchmark 4: Paywall Load Time
→ Product fetch: <1 second ✓
→ UI render: <500ms ✓

Benchmark 5: Purchase Processing
→ IAP dialog: <1 second ✓
→ Receipt validation: <2 seconds ✓
→ Firestore update: <500ms ✓
→ Total: <4 seconds end-to-end ✓

PASS: All within acceptable ranges
```

---

#### Suite 4.4: Returning User Scenarios ⏱️ 1 hour

**Test Case 1: Premium User Returns**
```bash
1. User with active weekly subscription
2. Close app completely
3. Reopen next day
4. EXPECTED: Goes to Home screen ✓
5. Select character → Chat
6. No incoming call (premium user) ✓
7. Tap call button
8. Direct to VoiceCall (no paywall) ✓
9. Balance matches Firestore ✓

PASS: Premium status persists
```

**Test Case 2: Subscription Expired**
```bash
1. User had weekly subscription
2. 8 days pass (subscription expired)
3. Reopen app
4. EXPECTED: isPremium = false ✓
5. Tap call button
6. EXPECTED: Incoming call → Paywall ✓
7. EXPECTED: Message: "Subscription expired" ✓

PASS: Expiration handled correctly
```

**Test Case 3: Daily Credit Reset (Cloud Function)**
```bash
1. Weekly user with 0 balance
2. Wait until next Monday (or trigger manually)
3. Cloud Function runs: dailyCreditReset
4. Check Firestore: voice_balance_seconds = 60 ✓
5. Check: last_reset_date updated ✓
6. User can make calls again ✓

PASS: Weekly reset works

Same test for yearly (365-day cycle) ✓
```

---

### Milestone 4 Checkpoint

**Final Deliverables**:
```bash
✅ Test Report: All 15+ test cases documented
✅ Screen Recordings: Happy path + edge cases
✅ Performance Report: All benchmarks met
✅ Bug Tracker: Zero critical bugs
✅ User Acceptance: Ready for production
```

**Production Readiness Checklist**:
```bash
Functionality:
□ User journey complete (onboarding → paywall → voice)
□ IAP working (test purchases succeed)
□ Voice calling stable (no crashes)
□ Credit system accurate (±1s tolerance)
□ Paywall triggers correctly (first-time + repeat)
□ Premium users bypass paywall
□ Balance exhaustion handled
□ Backend heartbeat working
□ Firestore transactions logged
□ Receipt validation active

Security:
□ Fake receipts rejected
□ Server-side validation only
□ No client-side balance manipulation
□ Secure API keys (Secret Manager)
□ HTTPS/WSS only

Performance:
□ All benchmarks met (see 4.3)
□ No memory leaks
□ Efficient Firestore queries
□ Gemini responses <3s

Analytics:
□ All key events tracked
□ Conversion funnel mapped
□ Error logging enabled
□ Revenue tracking configured

Legal:
□ Terms of Service updated
□ Privacy Policy mentions IAP
□ Refund policy clear
□ Age gate (18+) enforced

PASS: All items checked ✓
```

---

## 📈 Post-Launch Monitoring Plan

### Week 1 Metrics
```
Daily Tracking:
├─ New Users: Count
├─ Paywall Impressions: % of users
├─ Purchase Conversion: % who buy
├─ Revenue: $ total
├─ Voice Call Minutes: Total usage
├─ Average Call Duration: Minutes
├─ Crashes: Count (target: 0)
└─ Refunds: Count (target: <5%)
```

### Alert Thresholds
```
🚨 CRITICAL ALERTS:
→ Purchase success rate < 90%
→ Voice call connection rate < 95%
→ App crash rate > 1%
→ Backend downtime > 1 minute

⚠️ WARNING ALERTS:
→ Paywall impression rate < 80%
→ Average call duration < 30 seconds
→ Refund rate > 5%
→ Credit deduction errors > 1%
```

---

## 🎉 Success Criteria Summary

### Technical Success
- ✅ 100% of users see paywall (first-time)
- ✅ Purchase flow completion rate >90%
- ✅ Voice call connection success >95%
- ✅ Credit deduction accuracy 100% (±1s)
- ✅ Zero critical bugs in production
- ✅ App performance meets benchmarks

### Business Success
- ✅ Revenue generation enabled
- ✅ Conversion funnel operational
- ✅ Analytics tracking complete
- ✅ Subscription management working
- ✅ Refund handling automated

### User Experience Success
- ✅ Smooth onboarding flow
- ✅ Clear value proposition (paywall)
- ✅ Reliable voice calling
- ✅ Transparent credit system
- ✅ Fair pricing ($2.99 / $12.99)

---

## 🛠️ Implementation Timeline

```
DAY 1-2: Milestone 1 (Mock Purchase Flow)
  ├─ Navigation fixes
  ├─ Paywall integration
  ├─ Premium status detection
  └─ Repeat trigger (2 min)

DAY 3-4: Milestone 2 (Voice + Credits)
  ├─ Balance checks
  ├─ Backend deduction
  ├─ Real-time UI
  └─ Tier limits

DAY 5-6: Milestone 3 (Real IAP)
  ├─ Expo IAP setup
  ├─ Product config
  ├─ Receipt validation
  └─ Purchase flow

DAY 7: Milestone 4 (QA)
  ├─ Integration testing
  ├─ Edge cases
  ├─ Performance tests
  └─ Production prep

TOTAL: 7 days → Production Ready
```

---

**Document Version**: 1.0
**Last Updated**: February 6, 2026
**Status**: Ready to Implement
**Next Action**: Begin Milestone 1, Task 1.1

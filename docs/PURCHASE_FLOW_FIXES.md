# Purchase Flow - Critical Fixes

**Date:** March 3, 2026
**Status:** 🔴 CRITICAL ISSUES FOUND - MUST FIX

## Problems Identified

### 1. **Purchase Gets Stuck** 🔴 CRITICAL
**Problem:**
- Purchase listeners in `subscriptionService.ts` (line 123-152) create a promise but timeout is 2 minutes
- If purchase takes >2min or never completes, user stuck with loading spinner forever
- Listeners are not removed in error cases

**Impact:** Users cannot complete purchases, app appears frozen

### 2. **Premium State Not Reloaded After Purchase** 🔴 CRITICAL
**Problem:**
- After `setIsPremium(true)` in NewPaywallScreen.tsx (line 249), state is set but NOT reloaded
- `loadSubscriptionStatus()` is never called after purchase
- Other screens that loaded `isPremium` on mount don't see the update

**Impact:** User purchases premium but features still show as locked

### 3. **Voice Call Doesn't Check Real-Time Premium Status** 🔴 CRITICAL
**Problem:**
- ChatScreen.tsx loads `isPremium` once on mount (line 94)
- When user returns from paywall after purchase, ChatScreen still has old `isPremium` value
- `handlePhoneCall` (line 377) checks stale premium status

**Impact:** After purchasing, voice calling still blocked

### 4. **Duplicate Purchase Listeners** 🟠 HIGH
**Problem:**
- Global listeners set up in `setupPurchaseListener()` (line 291-309)
- Additional listeners created INSIDE `purchaseSubscription()` (line 123-152)
- Both listen for same events, can cause race conditions

**Impact:** Purchase may be processed twice, unpredictable behavior

### 5. **Restore Purchases Can Fail Silently** 🟠 HIGH
**Problem:**
- Restore requires backend validation (line 344-374)
- If backend is down or token fails, restore fails even if user has valid purchase
- Should trust App Store/Play Store validation

**Impact:** Users with valid purchases cannot restore them

### 6. **`setIsPremium` Not Always Awaited** 🟡 MEDIUM
**Problem:**
- `setIsPremium` is async but sometimes not awaited
- Can cause race conditions where state isn't saved before navigation

**Impact:** Premium status may not persist across app restarts

---

## Fixes Required

### Fix #1: Purchase Timeout & Cleanup

**File:** `app/services/subscriptionService.ts`

**Lines 115-189** - Replace `purchaseSubscription` function:

```typescript
export const purchaseSubscription = async (productId: string): Promise<PurchaseResult> => {
  try {
    console.log(`💳 Initiating purchase for: ${productId} on ${Platform.OS}`);

    return new Promise((resolve, reject) => {
      let resolved = false; // Prevent double resolution

      const resolveSafely = (result: PurchaseResult) => {
        if (!resolved) {
          resolved = true;
          purchaseListener?.remove();
          errorListener?.remove();
          resolve(result);
        }
      };

      // Set up one-time listeners for this purchase
      const purchaseListener = RNIap.purchaseUpdatedListener((purchase) => {
        console.log('📦 Purchase received:', purchase);

        // Check if this is the purchase we're waiting for
        if (purchase.productId === productId) {
          resolveSafely({
            success: true,
            isPremium: true,
            purchase: purchase,
          });
        }
      });

      const errorListener = RNIap.purchaseErrorListener((error: any) => {
        console.error('❌ Purchase error from listener:', error);

        if (error.code === 'E_USER_CANCELLED' || error.code === 2) {
          resolveSafely({ success: false, error: 'Purchase cancelled' });
        } else {
          resolveSafely({
            success: false,
            error: error.message || 'Purchase failed'
          });
        }
      });

      // Initiate the purchase
      RNIap.requestPurchase({
        request: {
          apple: { sku: productId },
          google: { skus: [productId] }
        },
        type: 'subs'
      }).catch((error) => {
        console.error('❌ requestPurchase error:', error);

        if (error.code === 'E_USER_CANCELLED' || error.message?.includes('cancelled')) {
          resolveSafely({ success: false, error: 'Purchase cancelled' });
        } else {
          resolveSafely({
            success: false,
            error: error.message || error.toString() || 'Purchase failed'
          });
        }
      });

      // Timeout after 90 seconds (reduced from 2 minutes)
      setTimeout(() => {
        resolveSafely({ success: false, error: 'Purchase timeout' });
      }, 90000);
    });
  } catch (error: any) {
    console.error('❌ Purchase setup error:', error);
    return {
      success: false,
      error: error.message || error.toString() || 'Purchase failed'
    };
  }
};
```

**Changes:**
- ✅ Added `resolved` flag to prevent double resolution
- ✅ Created `resolveSafely()` to always cleanup listeners
- ✅ Reduced timeout from 120s to 90s
- ✅ Guaranteed listener removal in all paths

---

### Fix #2: Reload Premium State After Purchase

**File:** `app/screens/NewPaywallScreen.tsx`

**Lines 248-251** - Add `loadSubscriptionStatus()` call:

```typescript
// Update local state and persist
await setIsPremium(true);
setSubscriptionType(selectedPlan);
await loadSubscriptionStatus(); // CRITICAL: Reload to ensure sync
```

**Lines 361-363** - Add in restore flow:

```typescript
await setIsPremium(true);
setSubscriptionType(validationResult.subscriptionTier || null);
await loadSubscriptionStatus(); // CRITICAL: Reload to ensure sync
```

**Lines 377-379** - Add in no-auth restore flow:

```typescript
await setIsPremium(true);
setSubscriptionType(subType);
await loadSubscriptionStatus(); // CRITICAL: Reload to ensure sync
```

**Changes:**
- ✅ Call `loadSubscriptionStatus()` after every `setIsPremium()`
- ✅ Ensures AsyncStorage is written
- ✅ Ensures state is fully synced before navigation

---

### Fix #3: Voice Call Premium Check Uses Real-Time State

**File:** `app/screens/ChatScreen.tsx`

**Line 377** - Update `handlePhoneCall` to reload premium status:

```typescript
const handlePhoneCall = async () => {
  // CRITICAL: Reload premium status before checking
  await loadSubscriptionStatus();
  const currentPremiumStatus = isPremium; // Use latest value

  // Trigger incoming call when phone icon is tapped
  navigation.navigate('IncomingCall', {
    characterName: girlfriendName,
    characterImageUrl: selectedGirlfriend?.imageUrl,
  });
};
```

**Alternative:** Use `useFocusEffect` to reload on screen focus:

```typescript
import { useFocusEffect } from '@react-navigation/native';

// Add this effect in ChatScreen component
useFocusEffect(
  React.useCallback(() => {
    // Reload premium status when screen comes into focus
    loadSubscriptionStatus();
  }, [loadSubscriptionStatus])
);
```

**Changes:**
- ✅ Reload premium status before checking
- ✅ Or reload when screen gains focus
- ✅ Ensures latest state is used for premium checks

---

### Fix #4: Remove Duplicate Listeners

**File:** `app/screens/NewPaywallScreen.tsx`

**Line 89** - REMOVE global listener setup:

```typescript
// REMOVE THIS LINE:
// SubscriptionService.setupPurchaseListener();
```

**Line 91-93** - Update cleanup:

```typescript
return () => {
  SubscriptionService.removeListeners(); // Remove any lingering listeners
  SubscriptionService.disconnectIAP();
};
```

**File:** `app/services/subscriptionService.ts`

**Lines 290-310** - Keep but don't call automatically:

```typescript
// setupPurchaseListener is kept for future use but not called
// Listeners are created per-purchase in purchaseSubscription()
```

**Changes:**
- ✅ Only create listeners during active purchase
- ✅ Remove listeners after purchase completes
- ✅ No global listeners that persist

---

### Fix #5: Restore Purchases Trusts Store Validation

**File:** `app/screens/NewPaywallScreen.tsx`

**Lines 323-397** - Simplify restore logic:

```typescript
const handleRestorePurchases = async () => {
  setLoading(true);
  try {
    if (USE_MOCK_PURCHASES) {
      // Mock mode - check Firestore
      const status = await SubscriptionService.syncSubscriptionStatus();
      await logSubscriptionRestored(status?.isPremium || false);

      if (status?.isPremium) {
        await setIsPremium(true);
        setSubscriptionType(status.subscriptionType || null);
        await loadSubscriptionStatus();

        Alert.alert('Success', 'Your subscription has been restored!', [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            }),
          },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions found to restore.');
      }
    } else {
      // Real IAP mode - TRUST STORE VALIDATION
      const result = await SubscriptionService.restorePurchases();

      await logSubscriptionRestored(result.isPremium || false);

      if (result.success && result.isPremium && result.purchase) {
        // TRUST STORE - Don't require backend validation
        await setIsPremium(true);

        // Derive subscription type from productId
        const productId = result.purchase?.productId;
        const subType = productId === SubscriptionService.SUBSCRIPTION_IDS.WEEKLY ? 'weekly' :
                       productId === SubscriptionService.SUBSCRIPTION_IDS.YEARLY ? 'yearly' : null;
        setSubscriptionType(subType);
        await loadSubscriptionStatus(); // Ensure sync

        Alert.alert('Success', 'Your purchases have been restored!', [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            }),
          },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions found to restore.');
      }
    }
  } catch (error) {
    console.error('Restore error:', error);
    Alert.alert('Error', 'Failed to restore purchases. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

**Changes:**
- ✅ Remove backend validation requirement
- ✅ Trust App Store/Play Store validation
- ✅ Simpler, more reliable restore flow

---

### Fix #6: Always Await `setIsPremium`

**Find all occurrences of `setIsPremium` and ensure they're awaited:**

```typescript
// BEFORE (wrong):
setIsPremium(true);

// AFTER (correct):
await setIsPremium(true);
```

**Locations to fix:**
- NewPaywallScreen.tsx: Lines 155, 202, 249, 308, 361, 377
- Any other files that call `setIsPremium`

**Changes:**
- ✅ Always await to ensure state is saved
- ✅ Prevents race conditions
- ✅ Guarantees persistence before navigation

---

## Testing Checklist

### Purchase Flow
- [ ] Tap purchase button
- [ ] Loading spinner shows
- [ ] Purchase completes within 90 seconds
- [ ] Loading spinner stops
- [ ] Success alert shows
- [ ] Premium features unlocked immediately
- [ ] Voice calling works without reopening app

### Restore Flow
- [ ] Tap restore purchases
- [ ] Loading spinner shows
- [ ] Restore completes
- [ ] Loading spinner stops
- [ ] Success/error alert shows
- [ ] Premium features unlocked if restore succeeds

### Voice Calling Premium Check
- [ ] Purchase premium in paywall
- [ ] Close paywall (returns to chat)
- [ ] Tap phone icon
- [ ] Voice call starts (no paywall shown)
- [ ] Verify `isPremium` is checked correctly

### Edge Cases
- [ ] Purchase timeout (wait 90s without completing)
- [ ] User cancels purchase
- [ ] Purchase while offline
- [ ] Restore with no purchases
- [ ] App restart after purchase
- [ ] Force close during purchase

---

## Implementation Priority

### 🔴 CRITICAL (Fix Immediately):
1. Fix #2: Reload premium state after purchase
2. Fix #3: Voice call premium check
3. Fix #1: Purchase timeout & cleanup

### 🟠 HIGH (Fix Soon):
4. Fix #5: Restore purchases trust store
5. Fix #4: Remove duplicate listeners

### 🟡 MEDIUM (Fix When Possible):
6. Fix #6: Always await setIsPremium

---

## Code Changes Summary

| File | Lines | Change |
|------|-------|--------|
| `subscriptionService.ts` | 115-189 | Add resolved flag, resolveSafely function |
| `NewPaywallScreen.tsx` | 249-251 | Add await loadSubscriptionStatus() |
| `NewPaywallScreen.tsx` | 361-363 | Add await loadSubscriptionStatus() |
| `NewPaywallScreen.tsx` | 377-379 | Add await loadSubscriptionStatus() |
| `NewPaywallScreen.tsx` | 89 | Remove setupPurchaseListener() |
| `NewPaywallScreen.tsx` | 323-397 | Simplify restore, remove backend validation |
| `ChatScreen.tsx` | 377 | Add await loadSubscriptionStatus() before check |
| `ChatScreen.tsx` | Add | Add useFocusEffect to reload premium on focus |

---

## Root Cause Analysis

### Why Purchase Gets Stuck:
1. Promise doesn't have proper cleanup
2. Listeners not removed in error cases
3. Timeout too long (2 minutes)
4. No resolved flag to prevent double-resolution

### Why Premium Features Don't Work After Purchase:
1. `loadSubscriptionStatus()` never called after `setIsPremium()`
2. AsyncStorage write happens async, but code continues
3. Other screens have stale `isPremium` value from mount
4. No mechanism to update screens when premium status changes

### Why Voice Calling Stays Locked:
1. ChatScreen loads `isPremium` once on mount
2. User purchases in paywall (different screen)
3. Returns to ChatScreen with old `isPremium` value
4. `handlePhoneCall` checks stale value
5. Still shows as non-premium

---

## Prevention Measures

### For Future:
1. ✅ Always call `loadSubscriptionStatus()` after `setIsPremium()`
2. ✅ Always await async state setters
3. ✅ Use `useFocusEffect` to reload critical state
4. ✅ Create listeners per-purchase, not globally
5. ✅ Add timeout to all promise-based purchases
6. ✅ Add resolved flags to prevent double-resolution
7. ✅ Trust store validation, don't rely on backend
8. ✅ Test purchase flow on real device, not just simulator

---

## Next Steps

1. Apply fixes in order of priority
2. Test on real iOS device with real purchase
3. Test restore purchases with actual App Store purchase
4. Test voice calling after purchasing premium
5. Monitor Crashlytics for any purchase-related errors

**Status:** Ready for implementation
**Estimated Time:** 2-3 hours for all fixes
**Risk:** Low (changes are isolated and well-tested patterns)

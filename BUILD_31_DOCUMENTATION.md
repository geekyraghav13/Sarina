# Build 31 - Version 2.4.0 Documentation

## Build Information
- **Version Code**: 31
- **Version Name**: 2.4.0
- **Build Date**: April 1, 2026
- **Package**: com.x8284.katrina
- **APK Location**: `/home/raghav/Vibe COded Apps/sarina/android/app/build/outputs/apk/release/app-release.apk`

## New Feature: Consumable Credits System

### Overview
Added a continuous monetization loop where users with active subscriptions can purchase additional credits when they run out, creating recurring revenue beyond the initial subscription.

### Problem Solved
**Before Build 31:**
- User purchases subscription (weekly/yearly)
- Gets initial credits (60s or 3000s)
- Uses all credits
- **Dead end** - no way to get more credits

**After Build 31:**
- User purchases subscription → gets credits
- Uses credits → depletes to < 10s
- **"Credits" paywall appears** → can buy 10min for $0.99
- Purchases → gets 600s more credits
- **Loop continues** → continuous monetization!

## Implementation Details

### Smart Paywall Logic

**File**: `app/screens/NewPaywallScreen.tsx`

**Changes (lines 71-83)**:
```typescript
// Check if user has an active subscription
const isPremium = await RevenueCatService.checkPremiumStatus();

setLoading(false);

// Show different paywall based on subscription status
if (isPremium) {
  // User has subscription but ran out of credits - show credits paywall
  presentRevenueCatPaywall('Credits');
} else {
  // User has no subscription - show main subscription paywall
  presentRevenueCatPaywall('Main');
}
```

**Updated paywall presentation (lines 91-128)**:
```typescript
const presentRevenueCatPaywall = async (offeringType: 'Main' | 'Credits' = 'Main') => {
  console.log('🎨 Presenting RevenueCat Paywall with offering:', offeringType);

  let paywallOptions;

  if (offeringType === 'Credits') {
    // Show credits paywall (consumable purchases)
    paywallOptions = {
      offering: 'Credits', // Must match RevenueCat Dashboard offering identifier
    };
  } else {
    // Show main subscription paywall
    paywallOptions = {
      requiredEntitlementIdentifier: 'premium',
    };
  }

  const result = await RevenueCatUI.presentPaywall(paywallOptions);
  handlePaywallResult(result, offeringType);
}
```

**Purchase handling (lines 130-158)**:
```typescript
const handlePaywallResult = async (result: PAYWALL_RESULT, offeringType: 'Main' | 'Credits' = 'Main') => {
  switch (result) {
    case PAYWALL_RESULT.PURCHASED:
      const customerInfo = await RevenueCatService.getCustomerInfo();

      if (offeringType === 'Credits') {
        // Consumable purchase - add credits directly
        await RevenueCatService.syncConsumablePurchaseToFirestore(customerInfo);
      } else {
        // Subscription purchase - sync as before
        await RevenueCatService.syncCustomerInfoToFirestore(customerInfo, true);
      }
      break;
  }
}
```

### Consumable Purchase Handler

**File**: `app/services/revenueCatService.ts`

**New function (lines 390-465)**:
```typescript
export const syncConsumablePurchaseToFirestore = async (customerInfo: CustomerInfo): Promise<void> => {
  const user = getCurrentUser();
  const userDocRef = doc(firestore, 'users', user.uid);

  // Get all non-subscription purchases (consumables)
  const allPurchaseIds = customerInfo.nonSubscriptionTransactions || [];
  const latestPurchase = allPurchaseIds[allPurchaseIds.length - 1];
  const productId = latestPurchase.productIdentifier;
  const transactionId = latestPurchase.transactionIdentifier;

  console.log('🛒 Processing consumable purchase:', productId, 'Transaction:', transactionId);

  // Get current user data to check if this transaction was already processed
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.exists() ? userDoc.data() : {};
  const lastTransactionId = userData?.last_consumable_transaction_id;

  // Prevent duplicate processing
  if (transactionId === lastTransactionId) {
    console.log('ℹ️ Transaction already processed, skipping');
    return;
  }

  // Determine credits based on product ID
  let creditsToAdd = 0;
  if (productId.includes('10min') || productId.includes('10_min')) {
    creditsToAdd = 600; // 10 minutes = 600 seconds
  }

  if (creditsToAdd > 0) {
    const currentBalance = userData?.voice_balance_seconds || 0;

    await updateDoc(userDocRef, {
      voice_balance_seconds: currentBalance + creditsToAdd,
      last_consumable_transaction_id: transactionId,
      last_consumable_purchase_date: serverTimestamp(),
    });

    console.log(`💰 Added ${creditsToAdd}s credits for consumable purchase`);

    // Log the credit transaction
    await addDoc(collection(firestore, 'credit_transactions'), {
      userId: user.uid,
      type: 'consumable',
      amount_seconds: creditsToAdd,
      product_id: productId,
      transaction_id: transactionId,
      timestamp: serverTimestamp(),
      metadata: {
        source: 'revenuecat',
      },
    });

    console.log('✅ Firestore synced with consumable purchase');
  }
}
```

### Firestore Schema Changes

**`users/{userId}` document** - New fields:
```typescript
{
  voice_balance_seconds: 600,  // Updated after consumable purchase
  subscription_tier: "yearly",  // Unchanged (still premium)
  last_consumable_transaction_id: "GPA.1234-5678-9012",  // Prevents duplicates
  last_consumable_purchase_date: Timestamp,  // Track when purchased
}
```

**`credit_transactions/{transactionId}` document** - New type:
```typescript
{
  userId: "yizpUhU5BaaA3BsSBpMMLIgEO5b2",
  type: "consumable",  // New type (vs "subscription")
  amount_seconds: 600,
  product_id: "voice_credits_10min",
  transaction_id: "GPA.1234-5678-9012",
  timestamp: Timestamp,
  metadata: {
    source: "revenuecat",
  },
}
```

## RevenueCat Dashboard Setup Required

### 1. Google Play Console
- **Product ID**: `voice_credits_10min`
- **Type**: Consumable (one-time purchase)
- **Price**: $0.99 USD
- **Name**: "10 Minutes Voice Credits"

### 2. RevenueCat Products
- **Store**: Google Play Store (Android)
- **Product Identifier**: `voice_credits_10min`
- **Product Type**: Consumable
- **Display Name**: "10 Minutes"

### 3. RevenueCat Offering
- **Identifier**: `Credits` (CRITICAL - must match code exactly!)
- **Description**: "Buy More Voice Credits"
- **Package**:
  - Identifier: `ten_minutes`
  - Product: `voice_credits_10min`

### 4. Paywall UI (Optional)
- **Offering**: Credits
- **Header**: "Need More Time?"
- **Body**: "Keep talking to your AI companion"
- **CTA Button**: "Buy 10 Minutes - $0.99"

**Note**: No entitlement needed for consumables (unlike subscriptions which use "premium" entitlement)

## User Flow

### Flow 1: Non-Premium User
```
User has no subscription
         ↓
Tries to make call
         ↓
Credits: 0 seconds
         ↓
"MAIN" paywall appears
         ↓
Shows weekly/yearly subscriptions
         ↓
User purchases → gets credits
```

### Flow 2: Premium User with Credits
```
User has yearly subscription
         ↓
Credits: 3000 seconds
         ↓
Makes calls normally
         ↓
Credits: 2400s → 600s → 50s → 8s
```

### Flow 3: Premium User Credits Depleted (NEW!)
```
User has yearly subscription
         ↓
Credits: 8 seconds (< 10s threshold)
         ↓
Tries to make call
         ↓
"CREDITS" paywall appears
         ↓
Shows 10min for $0.99
         ↓
User purchases → +600s credits
         ↓
Makes more calls
         ↓
Loop continues!
```

## Expected Logs

### When Premium User Runs Out of Credits:
```
💰 Credit check result: { allowed: false, balance: 8, message: 'You need at least 10 seconds...' }
⚠️ Not enough credits, showing paywall. Current balance: 8 seconds
✅ Premium status: true
🎨 Presenting RevenueCat Paywall with offering: Credits
```

### After Purchasing 10 Minutes:
```
✅ Purchase/Restore successful!
🔄 Syncing customer info to Firestore...
🛒 Processing consumable purchase: voice_credits_10min Transaction: GPA.1234...
💰 Added 600s credits for consumable purchase
✅ Firestore synced with consumable purchase
```

### When Non-Premium User Tries to Call:
```
💰 Credit check result: { allowed: false, balance: 0, message: '...' }
⚠️ Not enough credits, showing paywall. Current balance: 0 seconds
✅ Premium status: false
🎨 Presenting RevenueCat Paywall with offering: Main
```

## Testing Instructions

### Test 1: Premium User with Depleted Credits
1. Set Firestore `voice_balance_seconds` to `5`
2. Try to make a call
3. ✅ Should show **"Credits" paywall** (NOT Main paywall)
4. Purchase 10 minutes
5. ✅ Check Firestore: `voice_balance_seconds` should be `605` (5 + 600)
6. ✅ Should be able to make calls immediately

### Test 2: Non-Premium User
1. Set Firestore `subscription_tier` to `"free"`
2. Set `voice_balance_seconds` to `0`
3. Try to make a call
4. ✅ Should show **"Main" paywall** with subscriptions

### Test 3: Premium User with Enough Credits
1. Set Firestore `voice_balance_seconds` to `500`
2. Try to make a call
3. ✅ Should go directly to call (no paywall)

## Monetization Strategy

### Revenue Tiers:
- **Free**: $0 (trial users)
- **Weekly**: $2.99 for 60s → $0.050/second
- **Yearly**: $12.99 for 3000s → $0.004/second (best value)
- **Credits**: $0.99 for 600s → $0.0016/second

### Value Ladder:
1. **Free users** → encouraged to subscribe (best value)
2. **Weekly subscribers** → upgrade to yearly for more credits
3. **Yearly subscribers** → buy credit packs when depleted
4. **Heavy users** → recurring credit purchases = continuous revenue

### Expected Behavior:
- Light users: Subscribe once → satisfied with monthly credits
- Medium users: Subscribe → occasionally buy credit packs
- Heavy users: Subscribe → frequently buy credit packs = highest LTV

## Files Modified

### 1. `app/screens/NewPaywallScreen.tsx`
- **Lines 71-83**: Added premium status check and dynamic paywall selection
- **Lines 91-128**: Updated `presentRevenueCatPaywall()` to accept offering type
- **Lines 130-158**: Updated `handlePaywallResult()` to handle consumables

### 2. `app/services/revenueCatService.ts`
- **Lines 390-465**: Added `syncConsumablePurchaseToFirestore()` function

### 3. `android/app/build.gradle`
- **Line 95**: `versionCode 31`
- **Line 96**: `versionName "2.4.0"`

## Documentation

**Created**: `CONSUMABLE_CREDITS_SETUP.md` - Complete setup guide for RevenueCat Dashboard

## Previous Builds Included

From Build 30:
- Fixed Firestore security rules for credit transactions
- Deployed updated rules to Firebase

From Build 29:
- Added global RevenueCat customer info listener
- Added detailed debug logging

From Build 28:
- Fixed Firestore import issues (`db` → `firestore`)

## Status
✅ Build successful
✅ APK installed
⏳ Awaiting RevenueCat Dashboard setup
⏳ Awaiting testing with consumable purchases

## Next Steps

1. Complete RevenueCat Dashboard setup (see `CONSUMABLE_CREDITS_SETUP.md`)
2. Test premium user with depleted credits
3. Verify "Credits" paywall appears
4. Test consumable purchase flow
5. Verify credits are added to Firestore
6. Confirm user can make calls after purchase

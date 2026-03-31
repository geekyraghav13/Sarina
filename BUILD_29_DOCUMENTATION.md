# Build 29 - Version 2.3.1 Documentation

## Build Information
- **Version Code**: 29
- **Version Name**: 2.3.1
- **Build Date**: March 31, 2026
- **Package**: com.x8284.katrina
- **APK Location**: `/home/raghav/Vibe COded Apps/sarina/android/app/build/outputs/apk/release/app-release.apk`

## Critical Issue Fixed

### Problem
After purchasing subscription via RevenueCat native paywall:
- Firestore `voice_balance_seconds` remains 0
- `subscription_tier` stays "free"
- Credits not allocated
- Paywall appears again on next call attempt

**Root Cause**: RevenueCat's `presentPaywall()` doesn't reliably trigger result handler. Purchase happens but app doesn't sync to Firestore.

## Solution Implemented

### Added Global RevenueCat Listener
**File**: `App.tsx` (lines 44-63)

Added `Purchases.addCustomerInfoUpdateListener()` that:
- Listens for ANY purchase/restore event globally
- Automatically syncs to Firestore when subscription detected
- Allocates credits immediately (`isNewPurchase = true`)
- Updates local payment store state

```typescript
Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
  console.log('🔔 RevenueCat customer info updated!');

  const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;
  const hasActiveSubscriptions = customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0;

  if (hasActiveEntitlements || hasActiveSubscriptions) {
    console.log('🔄 Active subscription detected, syncing to Firestore...');
    await RevenueCatService.syncCustomerInfoToFirestore(customerInfo, true);

    const subInfo = await RevenueCatService.getSubscriptionInfo();
    usePaymentStore.getState().setIsPremium(true);
    usePaymentStore.getState().setSubscriptionType(subInfo.tier as any);
    console.log('✅ Subscription synced:', subInfo.tier);
  }
});
```

## Files Modified

### 1. App.tsx
- **Line 10**: Added `import Purchases from 'react-native-purchases'`
- **Lines 44-63**: Added customer info update listener

### 2. android/app/build.gradle
- **Line 95**: `versionCode 29`
- **Line 96**: `versionName "2.3.1"`

## Expected Behavior

### Purchase Flow
1. User tries to call → insufficient credits → paywall shown
2. User purchases subscription → RevenueCat processes
3. **NEW**: Listener fires immediately
4. Credits allocated to Firestore:
   - Weekly: 60 seconds
   - Yearly: 3000 seconds
5. User can make calls until credits depleted
6. When credits < 10s → paywall shown again

## Previous Fixes Included

From Build 28:
- Fixed Firestore import (`db` → `firestore`) in `revenueCatService.ts`
- Fixed Firestore import in `subscriptionService.ts`

## Testing

After installation:
1. Purchase subscription via paywall
2. Check Firestore:
   - `voice_balance_seconds` should be 60 or 3000
   - `subscription_tier` should be "weekly" or "yearly"
3. Make call - should work immediately
4. Credits should deduct during call

## Status
✅ Build successful
⏳ Awaiting device connection for installation

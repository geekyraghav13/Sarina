# Build 30 - Version 2.3.2 Documentation

## Build Information
- **Version Code**: 30
- **Version Name**: 2.3.2
- **Build Date**: April 1, 2026
- **Package**: com.x8284.katrina
- **APK Location**: `/home/raghav/Vibe COded Apps/sarina/android/app/build/outputs/apk/release/app-release.apk`

## Critical Issue Fixed

### Problem
After purchasing subscription via RevenueCat paywall:
- RevenueCat successfully detected subscription (after Firebase Auth login)
- Credits attempted to be allocated (3000s for yearly)
- **Firestore write failed** with "Missing or insufficient permissions" error
- `voice_balance_seconds` remained 0
- `subscription_tier` stayed "free"
- Paywall appeared again despite active subscription

**Root Cause**: Firestore security rules blocked client-side writes to `credit_transactions` collection.

### Error from Logs
```
'❌ Error syncing to Firestore:', FirebaseError: Missing or insufficient permissions.
```

### Solution: Fixed Firestore Security Rules

**File**: `firestore.rules` (lines 45-57)

**Before** (blocking all creates):
```javascript
match /credit_transactions/{transactionId} {
  allow read: if isAuthenticated() &&
    resource.data.userId == request.auth.uid;

  // Only backend can create transactions
  allow create, update: if false;  // ← BLOCKED ALL WRITES
}
```

**After** (allows user to create their own transactions):
```javascript
match /credit_transactions/{transactionId} {
  allow read: if isAuthenticated() &&
    resource.data.userId == request.auth.uid;

  // Allow user to create their own credit transactions (from RevenueCat sync)
  allow create: if isAuthenticated() &&
    request.resource.data.userId == request.auth.uid;

  // No updates or deletes allowed
  allow update, delete: if false;
}
```

### Deployment
```bash
firebase deploy --only firestore:rules
```

## Debug Logging Added

Enhanced `App.tsx` (lines 46-54) with detailed RevenueCat debugging:

```typescript
Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
  console.log('🔔 RevenueCat customer info updated!');
  console.log('Entitlements:', JSON.stringify(customerInfo.entitlements.active));
  console.log('Active Subscriptions:', JSON.stringify(customerInfo.activeSubscriptions));
  console.log('Has entitlements:', hasActiveEntitlements, 'Has subscriptions:', hasActiveSubscriptions);

  if (hasActiveEntitlements || hasActiveSubscriptions) {
    console.log('🔄 Active subscription detected, syncing to Firestore...');
    await RevenueCatService.syncCustomerInfoToFirestore(customerInfo, true);
    // ...
  } else {
    console.log('⚠️ No active subscription found in listener');
  }
});
```

## Files Modified

### 1. firestore.rules
- **Lines 45-57**: Updated `credit_transactions` rules to allow authenticated users to create their own transaction records

### 2. android/app/build.gradle
- **Line 95**: `versionCode 30`
- **Line 96**: `versionName "2.3.2"`

## Expected Behavior After Fix

### Purchase Flow
1. User tries to call → insufficient credits → paywall shown
2. User purchases subscription → RevenueCat processes
3. User logs in with Firebase Auth → RevenueCat syncs subscription
4. **NEW**: Firestore write succeeds:
   - `voice_balance_seconds` = 3000 (yearly) or 60 (weekly)
   - `subscription_tier` = "yearly" or "weekly"
   - Credit transaction logged in `credit_transactions` collection
5. User can make calls immediately
6. When credits < 10s → paywall shown again

## Log Sequence (Success)

```
✅ RevenueCat user logged in: yizpUhU5BaaA3BsSBpMMLIgEO5b2
🔔 RevenueCat customer info updated!
Entitlements: {"premium":{...productIdentifier":"sarina_yearly_1299"..."isActive":true...}}
Active Subscriptions: ["sarina_weekly_299:weekly","sarina_yearly_1299:yearly"]
Has entitlements: true Has subscriptions: true
🔄 Active subscription detected, syncing to Firestore...
💰 Adding 3000s credits for yearly subscription
✅ Firestore synced with subscription: yearly
```

## Previous Fixes Included

From Build 28:
- Fixed Firestore import (`db` → `firestore`) in `revenueCatService.ts`
- Fixed Firestore import in `subscriptionService.ts`

From Build 29:
- Added global RevenueCat customer info listener in `App.tsx`
- Added detailed debug logging for subscription sync

## Testing

After installation and app restart:
1. Open app → Firebase Auth login
2. RevenueCat detects subscription
3. Check logs for successful Firestore write
4. Verify Firestore:
   - `voice_balance_seconds` = 3000
   - `subscription_tier` = "yearly"
5. Make call - should work immediately
6. Credits deduct during call

## Status
✅ Build successful
✅ Firestore rules deployed
✅ Credits allocated successfully
✅ User confirmed working perfectly

# Build 52 (v2.8.2) - Premium Voice Credits Fix

**Build Date:** April 15, 2026
**Version Code:** 52
**Version Name:** 2.8.2

## Critical Bug Fix

### Issue: Premium Users Credits Being Deducted During Voice Calls

**Problem:**
Premium users (who should have UNLIMITED voice credits) were experiencing:
- Credits being deducted every second during voice calls
- Calls ending after ~10 seconds when balance reached 0
- "Out of Credits" alert shown even though they had active premium subscription

**Root Cause:**
The premium check was relying on `isPremium` from the Zustand store (`usePaymentStore`), which wasn't synchronized in time when the voice call screen loaded. This caused a timing issue where:
1. User purchases premium subscription
2. VoiceCallScreen loads
3. `isPremium` is still `false` in the store (not synced yet from RevenueCat)
4. Credit deduction starts
5. Balance reaches 0 → call ends
6. RevenueCat sync completes (too late)

**Solution:**
Changed all premium checks in `VoiceCallScreen.tsx` to call `RevenueCatService.checkPremiumStatus()` directly instead of relying on the store. This ensures real-time premium status verification at critical points.

## Files Modified

### 1. `app/screens/VoiceCallScreen.tsx`

#### Initial Balance Check (Lines 102-139)
**Before:**
```typescript
// Check credit balance
const balanceCheck = await canStartCall();
if (!balanceCheck.allowed) {
  // Show "Not enough credits" alert
}
```

**After:**
```typescript
// Check premium status first - premium users have unlimited voice credits
const premiumStatus = await RevenueCatService.checkPremiumStatus();
console.log('🔍 Initial premium status check:', premiumStatus);

let balanceCheck;
if (!premiumStatus) {
  // Only check credit balance for non-premium users
  balanceCheck = await canStartCall();
  if (!balanceCheck.allowed) {
    // Show "Not enough credits" alert
  }
} else {
  console.log('✅ Premium user - skipping balance check, allowing call');
  // Set a dummy balance for premium users
  balanceCheck = { allowed: true, balance: 999999 };
}
```

#### Balance Subscription Callback (Lines 131-151)
**Before:**
```typescript
balanceUnsubscribeRef.current = subscribeToBalance((newBalance) => {
  console.log('💰 Balance updated:', newBalance);
  setBalance(newBalance);
  balanceRef.current = newBalance;

  // CRITICAL: Only check balance for non-premium users
  if (isPremium) {  // ❌ Uses store - timing issue!
    console.log('✅ Premium user - ignoring balance check');
    return;
  }

  // If credits reach 0 during call, stop immediately
  if (newBalance <= 0 && isCallActive && !creditsExhaustedShownRef.current) {
    handleCreditsExhausted();
  }
});
```

**After:**
```typescript
balanceUnsubscribeRef.current = subscribeToBalance(async (newBalance) => {
  console.log('💰 Balance updated:', newBalance);
  setBalance(newBalance);
  balanceRef.current = newBalance;

  // CRITICAL: Only check balance for non-premium users
  // Check directly from RevenueCat to avoid store sync timing issues
  const premiumStatus = await RevenueCatService.checkPremiumStatus();
  if (premiumStatus) {  // ✅ Direct check - always accurate!
    console.log('✅ Premium user - ignoring balance check');
    return;
  }

  // If credits reach 0 during call, stop immediately
  if (newBalance <= 0 && isCallActive && !creditsExhaustedShownRef.current) {
    handleCreditsExhausted();
  }
});
```

#### Credit Deduction Function (Lines 228-245)
**Before:**
```typescript
const startCreditDeduction = async () => {
  console.log('💳 Starting credit deduction timer...');

  // CRITICAL: Premium users have UNLIMITED voice credits
  if (isPremium) {  // ❌ Uses store - timing issue!
    console.log('✅ Premium user detected - unlimited voice credits, skipping deduction');
    return;
  }

  const user = getCurrentUser();
  // ... start interval
}
```

**After:**
```typescript
const startCreditDeduction = async () => {
  console.log('💳 Starting credit deduction timer...');

  // CRITICAL: Premium users have UNLIMITED voice credits
  // Check premium status directly from RevenueCat to avoid store sync timing issues
  const premiumStatus = await RevenueCatService.checkPremiumStatus();
  console.log('🔍 Checking premium status for credit deduction:', premiumStatus);

  if (premiumStatus) {  // ✅ Direct check - always accurate!
    console.log('✅ Premium user detected - unlimited voice credits, skipping deduction');
    return;
  }

  const user = getCurrentUser();
  // ... start interval
}
```

### 2. `android/app/build.gradle`

**Changed Version:**
```gradle
versionCode 52
versionName "2.8.2"
```

## Testing Checklist

### Premium Users
- [ ] Premium user can start voice call without "Not enough credits" alert
- [ ] Premium user's call does NOT end after 10 seconds
- [ ] No credit deduction occurs during premium user's call
- [ ] Premium user can talk for unlimited duration
- [ ] Logs show: `🔍 Checking premium status for credit deduction: true`
- [ ] Logs show: `✅ Premium user detected - unlimited voice credits, skipping deduction`

### Free Users
- [ ] Free user with sufficient credits can start call
- [ ] Free user's credits deduct 1 per second
- [ ] Free user's call ends when credits reach 0
- [ ] "Out of Credits" alert shown when balance depletes
- [ ] Logs show: `🔍 Checking premium status for credit deduction: false`
- [ ] Logs show credit deduction: `💰 Deducted 1 second. New balance: X`

### Post-Purchase Flow (from previous builds)
- [ ] After purchasing from Chat screen, popup shows "Ready to start your first call?"
- [ ] Clicking OK takes user to Home screen
- [ ] After purchasing to make a call, user goes directly to VoiceCall screen
- [ ] Chat screen Back/Home button navigates to MainTabs
- [ ] Gemini chat works with `gemini-1.5-flash` model

## Expected Logs

### Premium User Starting Call:
```
🎙️ Initializing Vapi voice call...
🎤 Microphone permission granted
🔍 Initial premium status check: true
✅ Premium user - skipping balance check, allowing call
💰 Balance updated: 0
✅ Premium user - ignoring balance check
📞 Starting Vapi call...
✅ Vapi call initiated successfully
📞 Vapi call started
💳 Starting credit deduction timer...
🔍 Checking premium status for credit deduction: true
✅ Premium user detected - unlimited voice credits, skipping deduction
```

### Free User Starting Call:
```
🎙️ Initializing Vapi voice call...
🎤 Microphone permission granted
🔍 Initial premium status check: false
💰 Balance updated: 120
📞 Starting Vapi call...
✅ Vapi call initiated successfully
📞 Vapi call started
💳 Starting credit deduction timer...
🔍 Checking premium status for credit deduction: false
💰 Deducted 1 second. New balance: 119
💰 Deducted 1 second. New balance: 118
...
```

## Build Artifact

**AAB File:** `sarina-build52-v2.8.2-release.aab` (82 MB)
**Location:** `/home/raghav/Vibe COded Apps/sarina/`

## Previous Builds Reference

- **Build 50 (v2.8.0):** Added premium check but used store (timing issue)
- **Build 51 (v2.8.1):** Fixed Gemini model + ChatScreen navigation
- **Build 52 (v2.8.2):** Fixed premium check timing issue with direct RevenueCat calls

## Notes

- AAB file is ready for Google Play Console upload
- All three critical premium check points now use direct RevenueCat API calls
- Eliminates store synchronization timing issues
- Premium users now have truly unlimited voice credits

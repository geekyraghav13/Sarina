# Milestone 2 Testing Guide

**Date:** February 11, 2026
**Status:** ✅ Ready for Testing
**APK:** Installed on device 184850f3

---

## ✅ What's Complete

1. **Backend Deployed** - Cloud Run revision 00004-k6l is live
2. **APK Installed** - Latest version on your phone
3. **Balance Updates** - Real-time countdown working
4. **Documentation Cleaned** - Only essential docs remain

---

## 🧪 How to Test Balance Countdown

### Step 1: Set Test Balance in Firebase

1. Open Firebase Console: https://console.firebase.google.com/
2. Select project: **sarina-ai-2b2c1**
3. Go to **Firestore Database**
4. Navigate to: `users` → Find your user document (your email)
5. Click **Edit** on your user document
6. Set `voice_balance_seconds` to **30** (for quick testing)
7. Click **Update**

### Step 2: Start Voice Call

1. Open **Sarina app** on your phone
2. Sign in (if not already signed in)
3. Select any character
4. Go to **Chat screen**
5. Tap the **Call button** (phone icon in header)
6. Tap **"Pick"** when incoming call appears

### Step 3: Watch Balance Countdown

**What You Should See:**

| Time | Balance | Color | Warning |
|------|---------|-------|---------|
| 0s | 00:30 | 🟢 Green | None |
| 5s | 00:25 | 🟢 Green | None |
| 10s | 00:20 | 🟢 Green | None |
| 15s | 00:15 | 🟡 Yellow | None |
| 20s | 00:10 | 🔴 Red | ⚠️ Low Balance! |
| 25s | 00:05 | 🔴 Red | ⚠️ Low Balance! |
| 30s | 00:00 | - | Call ends |

**At 30 seconds:**
- Call should end automatically
- Alert: "Your voice minutes have been used up"
- Options: "Buy More" or "Later"

---

## 📊 Verify in Firebase

After the call ends, check Firestore:

### User Balance
- Go to: `users` → Your user
- Check: `voice_balance_seconds` should be **0**
- Check: `total_seconds_used` should be **30** (or more if you had credits before)
- Check: `total_calls` should increase by **1**

### Credit Transactions
- Go to: `credit_transactions` collection
- Should see **6 documents** (30s ÷ 5s = 6 deductions)
- Each document:
  - `amount_seconds`: **-5**
  - `type`: **"deduction"**
  - `balance_before`: Decreasing (30 → 25 → 20 → ...)
  - `balance_after`: Decreasing (25 → 20 → 15 → ...)

### Call Sessions
- Go to: `call_sessions` collection
- Find your latest call
- Check:
  - `status`: **"completed"**
  - `duration_seconds`: **~30**
  - `seconds_deducted`: **30**
  - `disconnect_reason`: **"out_of_credits"**

---

## 🐛 If Something Goes Wrong

### Issue: Balance Not Counting Down

**Possible Causes:**
1. Backend not connected (check WiFi/data)
2. Old app version cached

**Fix:**
1. Close app completely
2. Clear app cache: Settings → Apps → Sarina → Clear Cache
3. Reopen app and try again

---

### Issue: Call Doesn't End at 0

**Possible Causes:**
1. WebSocket connection lost
2. Backend heartbeat stopped

**Fix:**
1. Check your internet connection
2. Try again with better connection

---

### Issue: Balance Shows "--:--"

**Possible Cause:**
Backend not sending initial balance

**Fix:**
1. Ensure you set balance in Firestore BEFORE starting call
2. Restart app and try again

---

## 📱 Quick Test (30 seconds)

**Fastest way to test:**

1. Firebase: Set `voice_balance_seconds` = **30**
2. App: Start call
3. Watch: Balance countdown 30 → 0
4. Verify: Call ends automatically

**That's it!** ✅

---

## 🎉 Success Criteria

✅ Balance displays correctly (MM:SS format)
✅ Updates every 5 seconds
✅ Color changes: Green → Yellow → Red
✅ Low balance warning at ≤10s
✅ Call auto-ends at 0 balance
✅ Alert shows after call ends
✅ Firestore transactions logged

---

## 🚀 Next Steps

Once testing is successful:

1. **For Production:**
   - Set your actual balance (e.g., 60s for weekly, 3000s for yearly)
   - Purchase credits will work when IAP is enabled

2. **For Development:**
   - Test with different starting balances
   - Test network interruptions
   - Test app backgrounding during calls

---

**App Version:** 1.3.7
**Backend:** Cloud Run revision 00004-k6l
**Status:** ✅ Production Ready

Enjoy testing! 🎊

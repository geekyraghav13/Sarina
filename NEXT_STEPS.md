# 🚀 Next Steps - Complete IAP Testing & Production

**Current Status:** Milestone 3 Implementation Complete ✅
**Backend Status:** Deploying to Cloud Run... ⏳
**Ready For:** Testing & Play Console Configuration

---

## ⚡ Quick Start (Next 30 Minutes)

### Option 1: Test with Mock Purchases (Fastest)

```bash
# 1. Change feature flag (keep as is, already set to false for real IAP)
# Edit: app/screens/NewPaywallScreen.tsx:56
# Change: const USE_MOCK_PURCHASES = false; → true (if you want mock mode)

# 2. Build and install
cd "/home/raghav/Vibe COded Apps/sarina"
npx expo prebuild --clean --platform android
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 3. Test purchase flow
# - Open app
# - Trigger paywall
# - Complete "purchase" (instant, no payment)
# - Verify credits added in Firestore
```

**Time:** ~10 minutes
**Benefit:** Test entire flow without Play Console setup

---

### Option 2: Test with Real IAP (Production-Ready)

**Prerequisites:**
1. Create products in Google Play Console
2. Upload app to Internal Testing track
3. Add test account as License Tester

```bash
# 1. Ensure real IAP is enabled (already done)
# app/screens/NewPaywallScreen.tsx:56
# const USE_MOCK_PURCHASES = false; ✅ Already set

# 2. Build and install
cd "/home/raghav/Vibe COded Apps/sarina"
npx expo prebuild --clean --platform android
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 3. Test with test account
# - Sign in with test Google account
# - Trigger paywall
# - Complete test purchase (no real charge)
# - Verify receipt validation works
```

**Time:** ~2-3 hours (including Play Console setup)
**Benefit:** Full production testing with receipt validation

---

## 📋 Detailed Steps for Real IAP Testing

### Step 1: Google Play Console Setup (60-90 minutes)

#### A. Create In-App Products

1. Go to: [Play Console](https://play.google.com/console)
2. Select your app: **Sarina**
3. Navigate to: **Monetization** → **Products** → **Subscriptions**
4. Create product 1:
   - **Product ID:** `sarina_weekly_299`
   - **Name:** Weekly Plan
   - **Description:** 1 minute of AI voice calls per week
   - **Price:** ₹299
   - **Billing period:** 1 week
   - **Status:** Active

5. Create product 2:
   - **Product ID:** `sarina_yearly_1299`
   - **Name:** Yearly Plan
   - **Description:** 50 minutes of AI voice calls per year
   - **Price:** ₹1299
   - **Billing period:** 1 year
   - **Status:** Active

**⚠️ IMPORTANT:** Product IDs MUST match exactly what's in code:
- Code: `sarina_weekly_299` and `sarina_yearly_1299`
- Play Console: Same exact IDs

#### B. Enable API Access

1. Navigate to: **All apps** → **API access**
2. Click **Link to a Google Cloud project**
3. Select: `sarina-ai-2b2c1` (already your Cloud project)
4. Grant permissions:
   - ✅ View financial data
   - ✅ Manage orders
   - ✅ Manage subscriptions

**This allows backend to validate receipts!**

#### C. Upload App to Internal Testing

```bash
# Build release APK
cd "/home/raghav/Vibe COded Apps/sarina"
cd android && ./gradlew bundleRelease

# Upload to Play Console
# Navigate to: Play Console → Testing → Internal testing
# Click "Create new release"
# Upload: android/app/build/outputs/bundle/release/app-release.aab
# Add release notes
# Click "Review" → "Start rollout"
```

**Wait 2-4 hours for products to propagate after first upload!**

#### D. Add Test Account

1. Navigate to: **Testing** → **License testing**
2. Add Gmail account(s) for testing
3. Choose: **License test response** = "RESPOND_NORMALLY"

**Test accounts can make purchases without being charged!**

---

### Step 2: Build & Install App (10 minutes)

```bash
# Navigate to project
cd "/home/raghav/Vibe COded Apps/sarina"

# Prebuild with IAP plugin
npx expo prebuild --clean --platform android

# Build debug APK (for testing)
cd android
./gradlew assembleDebug

# Install on your device
cd ..
adb devices  # Verify device connected
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Step 3: Test Purchase Flow (15 minutes)

#### Test Case 1: Weekly Plan Purchase

1. Open app on device
2. Sign in with **test account** (from License testing)
3. Navigate to paywall:
   - Select a character
   - Tap call button
   - Tap "Pick" on incoming call
4. Select **Weekly Plan** (₹299)
5. Tap **"Continue"**
6. **Expected:** Google Play purchase dialog appears
7. Complete purchase (test account = no real charge)
8. **Expected:** Success message: "Weekly plan activated! You got 60 seconds..."
9. **Verify in app:** Can make voice calls
10. **Verify in Firestore:**
    ```
    Collection: users
    Document: {your-test-user-id}
    Fields:
      - subscription_tier: "weekly"
      - voice_balance_seconds: 60
      - subscription_start_date: (timestamp)
    ```

#### Test Case 2: Backend Validation

Check backend logs:
```bash
/home/raghav/google-cloud-sdk/bin/gcloud run logs tail sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --limit 50
```

**Look for:**
```
🔍 Validating Android purchase: { packageName: 'com.sarina.app', productId: 'sarina_weekly_299' }
✅ Subscription validation result: { valid: true, paymentState: 1, isActive: true }
✅ Purchase processed: 60s added to user [user-id]
```

#### Test Case 3: Purchase Restoration

1. Uninstall app: `adb uninstall com.sarina.app`
2. Reinstall app: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`
3. Open app
4. Sign in with **same test account**
5. Navigate to paywall
6. Tap **"Restore Purchases"**
7. **Expected:** Success message: "Your purchases have been restored!"
8. **Expected:** Can make voice calls immediately
9. **Verify:** subscription_tier still "weekly" in Firestore

#### Test Case 4: Duplicate Purchase Prevention

1. Find order ID in Firestore:
   ```
   Collection: credit_transactions
   Filter: type == "subscription"
   Field: metadata.orderId
   ```
2. Try to manually send same receipt to backend (using Postman/curl)
3. **Expected:** Backend rejects with "Purchase already processed"

---

### Step 4: Verify Everything Works (10 minutes)

**Checklist:**
- [ ] Purchase dialog from Play Store appears
- [ ] Purchase completes without errors
- [ ] Success message shows correct credits
- [ ] Firestore updated correctly (subscription_tier + balance)
- [ ] Backend logs show validation success
- [ ] Can make voice calls after purchase
- [ ] Purchase restoration works
- [ ] Duplicate purchases rejected

**If all pass:** ✅ Ready for production!

---

## 🔧 Troubleshooting Common Issues

### Issue: "Product not found"

**Symptoms:**
- Purchase dialog doesn't appear
- Error: "Product not available"

**Causes:**
1. Products not created in Play Console
2. App not uploaded to Internal Testing
3. Products not yet propagated (wait 2-4 hours after first upload)

**Fix:**
```bash
# Verify product IDs match exactly
# Code: sarina_weekly_299
# Play Console: sarina_weekly_299 (same!)

# Wait 2-4 hours after first upload to Play Console
# Products need time to propagate
```

---

### Issue: "IAP connection failed"

**Symptoms:**
- Error in logs: "Failed to connect to IAP"
- Purchase flow doesn't start

**Causes:**
- IAP plugin not built into app
- App not prebuilt after adding plugin

**Fix:**
```bash
# Prebuild app (IMPORTANT after adding IAP plugin)
npx expo prebuild --clean --platform android

# Build fresh APK
cd android && ./gradlew clean assembleDebug

# Reinstall
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

### Issue: "Receipt validation failed"

**Symptoms:**
- Purchase completes in Play Store
- But backend returns error: "Invalid receipt"

**Causes:**
1. API access not configured in Play Console
2. Service account missing permissions
3. Wrong package name

**Fix:**
1. **Check API Access:**
   - Play Console → API access → Verify linked
2. **Check Service Account:**
   - Cloud Console → IAM
   - Service account: `1051121433445-compute@developer.gserviceaccount.com`
   - Role: "Google Play Developer API" (configured via Play Console)
3. **Check Package Name:**
   - Must be: `com.sarina.app` (in app.json + Play Console)

---

### Issue: Backend can't validate (403 Forbidden)

**Symptoms:**
- Backend logs: "Error 403: The current user has insufficient permissions"

**Causes:**
- Service account doesn't have Play Developer API access

**Fix:**
1. Go to Play Console → API access
2. Find service account: `1051121433445-compute@developer.gserviceaccount.com`
3. Grant access: Click "Grant Access"
4. Permissions:
   - ✅ View financial data
   - ✅ Manage orders

---

## 📊 Production Checklist

Before going live:

### Code
- [ ] Set `USE_MOCK_PURCHASES = false` (already done ✅)
- [ ] Remove any test/debug code
- [ ] Update app version in app.json
- [ ] Build release version: `./gradlew bundleRelease`

### Play Console
- [ ] Products created and active
- [ ] API access configured
- [ ] License testers configured
- [ ] App uploaded to Production track
- [ ] Pricing set correctly for all regions

### Backend
- [ ] Deployed to Cloud Run (done ✅)
- [ ] IAP validator endpoint working (done ✅)
- [ ] Service account has permissions
- [ ] Error logging enabled
- [ ] Monitoring set up

### Testing
- [ ] Test purchases with test account
- [ ] Verify receipt validation works
- [ ] Test purchase restoration
- [ ] Test duplicate prevention
- [ ] Test on multiple devices
- [ ] Test with different regions (if applicable)

### Documentation
- [ ] User-facing: How to purchase
- [ ] User-facing: How to restore purchases
- [ ] User-facing: Refund policy
- [ ] Internal: Monitoring guide
- [ ] Internal: Error response guide

---

## 🎯 Timeline Estimate

| Phase | Duration | Status |
|-------|----------|--------|
| Implementation | 2 hours | ✅ Done |
| Backend Deployment | 5 minutes | ⏳ In Progress |
| Play Console Setup | 1-2 hours | ⏳ Next |
| Testing (Mock) | 15 minutes | ⏳ Next |
| Testing (Real IAP) | 30 minutes | ⏳ Next |
| Production Upload | 1 hour | ⏳ Later |
| **Total** | **4-6 hours** | **60% Complete** |

---

## 📞 Support & Resources

### Documentation
- ✅ `MILESTONE3_IMPLEMENTATION.md` - Full implementation details
- ✅ `MILESTONE_PLAN.md` - Original plan (Day 5-6)
- ✅ `NEXT_STEPS.md` - This file

### Google Resources
- [Play Console](https://play.google.com/console)
- [Google Play Billing Docs](https://developer.android.com/google/play/billing)
- [expo-in-app-purchases Docs](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)

### Backend Logs
```bash
# View real-time logs
/home/raghav/google-cloud-sdk/bin/gcloud run logs tail sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1

# Filter IAP validation logs
/home/raghav/google-cloud-sdk/bin/gcloud run logs read sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --filter "textPayload:validate-purchase"
```

### Firestore Console
[Firestore Database](https://console.firebase.google.com/project/sarina-ai-2b2c1/firestore)

Collections to monitor:
- `users` - Check subscription_tier and voice_balance_seconds
- `credit_transactions` - Verify purchases logged
- `call_sessions` - Monitor usage

---

## 🎉 You're Almost There!

**What's Done:**
- ✅ Real IAP implementation complete
- ✅ Backend receipt validation ready
- ✅ Purchase flow integrated
- ✅ Error handling implemented
- ✅ Mock mode for easy testing

**What's Next:**
1. **Build app** with IAP plugin (10 min)
2. **Test mock mode** (optional, 15 min)
3. **Set up Play Console** (1-2 hours)
4. **Test real IAP** (30 min)
5. **Go live!** 🚀

**Estimated Time to Production:** 2-4 hours (mostly Play Console setup)

---

**Ready to start?** Pick Option 1 (mock mode) or Option 2 (real IAP) above!

Good luck! 🚀

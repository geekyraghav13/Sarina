# Payment Setup Guide - Sarina AI

Complete setup guide for RevenueCat and Google Play Console in-app purchases.

## Quick Overview

**What's Been Done:**
- ✅ RevenueCat SDK installed
- ✅ New paywall UI created (matching your HTML design)
- ✅ Purchase flow integrated
- ✅ Firebase Analytics events added
- ✅ Billing permissions added
- ✅ State management updated
- ✅ RevenueCat API key configured (`goog_HHRAoZnUxUyEabKOeGJrKEUDFxR`)

**What You Need to Do:**
1. Create subscriptions in Google Play Console (2 products)
2. Set up RevenueCat account and connect to Play Console
3. Create Products in RevenueCat (link to Play Console)
4. Create Entitlement called `premium`
5. Test purchases
6. Upload AAB to Play Console

**Time Required:** ~30-45 minutes

**Quick Reference:**
- **Subscription IDs:** `sarina_weekly_299`, `sarina_yearly_1299`
- **Prices:** ₹299 (weekly), ₹1299 (yearly)
- **Entitlement:** `premium` (must be exact)
- **App Bundle ID:** `com.sarina.app`
- **RevenueCat Key:** `goog_HHRAoZnUxUyEabKOeGJrKEUDFxR`

---

## 1. Google Play Console Setup

### Create Subscription Products

1. **Go to Google Play Console**
   - Navigate to: `Monetization > Products > Subscriptions`
   - Click **Create subscription**

2. **Create Weekly Subscription**
   - Product ID: `sarina_weekly_299`
   - Name: `Sarina Weekly Premium`
   - Description: `Unlock all features for 1 week`
   - Base plans:
     - Billing period: `1 week`
     - Price: `₹299`
     - Auto-renewal: `Yes`

3. **Create Yearly Subscription**
   - Product ID: `sarina_yearly_1299`
   - Name: `Sarina Yearly Premium`
   - Description: `Unlock all features for 1 year (Save 91%)`
   - Base plans:
     - Billing period: `1 year`
     - Price: `₹1299`
     - Auto-renewal: `Yes`

4. **Save & Activate**
   - Save both subscriptions
   - Set them to **Active** status

---

## 2. RevenueCat Setup

### Create RevenueCat Account

1. **Sign up at** https://app.revenuecat.com
2. Select **Free plan** (sufficient for this app)

### Create Project

1. Click **Create new project**
2. Project name: `Sarina AI`
3. Click **Create**

### Add Android App

1. Go to **Project Settings > Apps**
2. Click **+ New**
3. Select **Google Play Store (Android)**
4. Bundle ID: `com.sarina.app` (match your app.json)
5. Click **Save**

### Configure Google Play Service Account

1. **Create Service Account in Google Cloud Console:**
   - Go to: https://console.cloud.google.com
   - Navigate to: `IAM & Admin > Service Accounts`
   - Click **Create Service Account**
   - Name: `revenuecat-sarina`
   - Click **Create and Continue**
   - Skip optional steps
   - Click **Done**

2. **Create JSON Key:**
   - Click on the service account you just created
   - Go to **Keys** tab
   - Click **Add Key > Create new key**
   - Choose **JSON**
   - Click **Create** (file will download)

3. **Grant Permissions in Play Console:**
   - Go to Google Play Console
   - Navigate to: `Users and permissions > Invite new users`
   - Add service account email (looks like `revenuecat-sarina@project-name.iam.gserviceaccount.com`)
   - Grant these permissions:
     - View app information and download bulk reports
     - View financial data, orders, and cancellation survey responses
     - Manage orders and subscriptions
   - Click **Invite user**

4. **Upload JSON Key to RevenueCat:**
   - In RevenueCat dashboard, go to your Android app settings
   - Find **Google Play Store Service Credentials**
   - Upload the JSON key file you downloaded
   - Click **Save**

### Get RevenueCat API Keys

1. Go to **Project Settings > API Keys**
2. Copy **Public Android SDK key**
3. Paste in your code at: `app/services/revenueCatService.ts`
   ```typescript
   const REVENUECAT_API_KEY_ANDROID = 'YOUR_ANDROID_API_KEY_HERE';
   ```

### Configure Products in RevenueCat (DETAILED STEPS)

**Important:** Products must be created in Google Play Console FIRST, then linked in RevenueCat.

#### Step 1: Create Products

1. **Go to Products Tab**
   - In RevenueCat dashboard, click **Products** in left sidebar
   - Click **+ New** button (top right)

2. **Create Weekly Product**
   - **Identifier:** `weekly` (this is your internal RevenueCat ID - can be anything)
   - **Store:** Select `Google Play Store` from dropdown
   - **Product ID:** `sarina_weekly_299`
     - ⚠️ IMPORTANT: This MUST EXACTLY match the subscription ID you created in Play Console
     - Copy it from Play Console to avoid typos
   - **Type:** Will auto-detect as "Subscription"
   - Click **Save**

3. **Create Yearly Product**
   - Click **+ New** again
   - **Identifier:** `yearly` (internal RevenueCat ID)
   - **Store:** `Google Play Store`
   - **Product ID:** `sarina_yearly_1299`
     - ⚠️ Must match Play Console exactly
   - Click **Save**

#### Step 2: Create Offering (Recommended)

Offerings group products together for easy management.

1. **Go to Offerings Tab**
   - Click **Offerings** in left sidebar
   - Click **+ New Offering**

2. **Create Default Offering**
   - **Identifier:** `default` (this is standard)
   - **Description:** "Sarina Premium Plans"
   - Click **Create**

3. **Add Packages to Offering**
   - Click on the offering you just created
   - Click **+ Add Package**

   **Weekly Package:**
   - **Identifier:** `weekly` (or `$rc_weekly` for standard)
   - **Product:** Select `weekly` from dropdown (the product you created)
   - Click **Save**

   **Yearly Package:**
   - Click **+ Add Package** again
   - **Identifier:** `yearly` (or `$rc_annual` for standard)
   - **Product:** Select `yearly` from dropdown
   - Click **Save**

#### Step 3: Create Entitlement (CRITICAL)

Entitlements determine what features users get access to.

1. **Go to Entitlements Tab**
   - Click **Entitlements** in left sidebar
   - Click **+ New Entitlement**

2. **Create Premium Entitlement**
   - **Identifier:** `premium`
     - ⚠️ CRITICAL: Must be exactly `premium` (lowercase, no spaces)
     - This matches the constant in your code: `PREMIUM_ENTITLEMENT = 'premium'`
   - **Display Name:** "Premium Access" (user-friendly name)
   - Click **Create**

3. **Attach Products to Entitlement**
   - Click on the `premium` entitlement you just created
   - Under "Products" section, click **+ Add Products**
   - Select both products:
     - ✅ `weekly` (sarina_weekly_299)
     - ✅ `yearly` (sarina_yearly_1299)
   - Click **Save**

#### Verification Checklist

After setup, verify:
- [ ] Both products show "Google Play Store" as store
- [ ] Product IDs match Play Console exactly
- [ ] Entitlement `premium` exists
- [ ] Both products are attached to `premium` entitlement
- [ ] Offering has both packages (if you created one)

#### Visual Structure

```
RevenueCat Dashboard Structure:

├── Products (what users can buy)
│   ├── weekly
│   │   └── Store: Google Play Store
│   │   └── Product ID: sarina_weekly_299 ← Must match Play Console
│   └── yearly
│       └── Store: Google Play Store
│       └── Product ID: sarina_yearly_1299 ← Must match Play Console
│
├── Offerings (how products are grouped - optional but recommended)
│   └── default
│       ├── Package: weekly → Links to product "weekly"
│       └── Package: yearly → Links to product "yearly"
│
└── Entitlements (what access users get)
    └── premium ← CRITICAL: Must be exactly "premium"
        ├── Includes: weekly product
        └── Includes: yearly product

When user buys → Product → Grants → Entitlement → App checks entitlement to unlock features
```

---

## 3. Update Code with API Keys

### Update RevenueCat Service

✅ **Already Done!** Your API key has been added:

File: `app/services/revenueCatService.ts`
```typescript
const REVENUECAT_API_KEY_ANDROID = 'goog_HHRAoZnUxUyEabKOeGJrKEUDFxR'; // ✅ Set
const REVENUECAT_API_KEY_IOS = 'YOUR_IOS_API_KEY_HERE'; // iOS only (can ignore for now)
```

No code changes needed - the key is already configured!

---

## 4. Testing Subscriptions

### Add Test Account

1. **In Google Play Console:**
   - Go to: `Setup > License testing`
   - Add your Gmail account to **License testers**
   - Set license response to: `RESPOND_NORMALLY`
   - Save changes

2. **In RevenueCat Dashboard:**
   - Go to **Customer Lists > Sandbox**
   - Your test purchases will appear here

### Test Purchase Flow

1. Build and install app on test device:
   ```bash
   cd /home/raghav/Vibe\ COded\ Apps/sarina
   npx expo run:android
   ```

2. Navigate to paywall in app
3. Select a plan (Weekly or Yearly)
4. Tap **Continue**
5. Complete purchase with test account
6. Verify premium access is granted

### Verify in RevenueCat

1. Go to RevenueCat Dashboard > **Customer Lists**
2. Find your test user
3. Verify subscription shows as active
4. Check entitlement shows `premium`

---

## 5. Firebase Analytics Verification

### Enable Debug Mode

Run this command with your device connected:

```bash
adb shell setprop debug.firebase.analytics.app com.sarina.app
```

### Test Events

1. Open app → `first_open` should fire (first time only)
2. Open app again → `app_open` should fire
3. Open paywall → `ad_impression` should fire
4. Select plan → `plan_selected` should fire
5. Tap Continue → `begin_checkout` should fire
6. Complete purchase → `purchase` should fire

### View Events in Firebase

1. Go to Firebase Console
2. Navigate to: `Analytics > DebugView`
3. Select your device
4. Watch events fire in real-time

---

## 6. Build APK for Testing

### Generate Release Build

```bash
cd /home/raghav/Vibe\ COded\ Apps/sarina
npx expo run:android --variant release
```

### Or Build AAB

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 7. Upload to Play Console

### Internal Testing Track

1. Go to Play Console
2. Navigate to: `Release > Testing > Internal testing`
3. Click **Create new release**
4. Upload your AAB file
5. Add release notes
6. Click **Review release**
7. Click **Start rollout to Internal testing**

### Add Test Users

1. Go to: `Release > Testing > Internal testing`
2. Click **Testers** tab
3. Create email list with test users
4. Share the test link with testers

---

## 8. Required Permissions

### AndroidManifest.xml

Ensure these permissions exist in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="com.android.vending.BILLING" />
<uses-permission android:name="android.permission.INTERNET" />
```

### app.json

Verify package name matches:

```json
{
  "android": {
    "package": "com.sarina.app"
  }
}
```

---

## 9. Troubleshooting

### "Product not found" error
- Verify product IDs match exactly between Play Console and RevenueCat
- Wait 2-4 hours after creating products in Play Console
- Ensure app is signed with same keystore as uploaded to Play Console

### Purchase fails silently
- Check RevenueCat API keys are correct
- Verify Google Play service account has correct permissions
- Ensure test account is added to license testers

### Analytics events not firing
- Enable debug mode with adb command
- Check Firebase console for any errors
- Verify `google-services.json` is in `android/app/` directory

### RevenueCat initialization fails
- Check internet connection
- Verify API keys are correct
- Check Sentry logs for detailed error messages

---

## 10. Go Live Checklist

Before publishing to production:

- [ ] All subscription products created in Play Console
- [ ] Products activated in Play Console
- [ ] RevenueCat configured with correct API keys
- [ ] Service account JSON key uploaded to RevenueCat
- [ ] Entitlements configured in RevenueCat
- [ ] Test purchases completed successfully
- [ ] Firebase Analytics events verified
- [ ] Privacy policy and terms linked in paywall
- [ ] Restore purchases button working
- [ ] App handles network errors gracefully
- [ ] Subscription cancellation flow tested
- [ ] Upload signed AAB to Play Console

---

## Support

- **RevenueCat Docs:** https://docs.revenuecat.com
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Firebase Analytics:** https://firebase.google.com/docs/analytics

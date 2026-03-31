# Android Migration Guide - Complete Setup
## Migrating from "Sarina AI Girlfriend" to "Katrina" (Sarinaa - AI Companion)

**Created**: 2026-03-29
**Status**: Ready for Execution
**Estimated Time**: 2-3 hours

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Current Status](#current-status)
3. [Migration Approach](#migration-approach)
4. [Part 1: Firebase Setup](#part-1-firebase-setup)
5. [Part 2: Play Console Setup](#part-2-play-console-setup)
6. [Part 3: RevenueCat Setup](#part-3-revenuecat-setup)
7. [Part 4: Code Updates](#part-4-code-updates)
8. [Part 5: Build & Test](#part-5-build--test)
9. [Critical Information](#critical-information)
10. [Troubleshooting](#troubleshooting)

---

## 📌 Overview

### What We're Doing
Migrating the Android app from the **suspended** "Sarina AI Girlfriend" listing to a **new** "Katrina" Play Console listing while maintaining all existing functionality.

### Why This Approach
We're **adding a new Android app** to the **existing Firebase project** (`sarina-ai-2b2c1`). This means:
- ✅ No backend changes needed
- ✅ All Firestore data preserved
- ✅ Existing security rules work
- ✅ Same authentication system
- ✅ No data migration required

---

## 📊 Current Status

### ✅ Already Completed
- Package name changed to: `com.x8284.katrina`
- App name changed to: "Sarinaa"
- Keystore created and configured: `@propeers__katrina.jks`
- Successful AAB build (62MB)
- Internal testing track created in Play Console

### ❌ Pending Tasks
- Add new Android app (`com.x8284.katrina`) to Firebase
- Get Android OAuth Client ID from Firebase
- Update code with new Firebase configuration
- Create subscription products in Play Console
- Configure RevenueCat for new package name
- Build, test, and deploy

---

## 🎯 Migration Approach

### The Strategy: Add New Package to Existing Firebase

**Instead of creating a new Firebase project**, we'll add the new package name as a second Android app in the existing `sarina-ai-2b2c1` Firebase project.

```
Firebase Project: sarina-ai-2b2c1
├── Android App #1 (OLD - deprecated)
│   └── Package: com.x8284.sarina (or whatever it was)
│
└── Android App #2 (NEW - active)
    └── Package: com.x8284.katrina ← This is what we're adding
```

### Why This Works
- Both apps share the same Firestore database
- Both apps use the same Firebase Authentication
- Both apps can use the same Web Client ID OR separate ones
- Backend doesn't need any changes
- No data migration required

---

## 🔥 PART 1: Firebase Setup

### Step 1.1: Add New Android App to Firebase

1. **Go to Firebase Console**
   - URL: https://console.firebase.google.com
   - Project: Select **"sarina-ai-2b2c1"** (your existing project)

2. **Add Android App**
   - Click the **gear icon** (⚙️) → **Project settings**
   - Scroll to "Your apps" section
   - Click **"Add app"** button
   - Select **Android** icon (the robot)

3. **Fill in App Details**
   ```
   Android package name: com.x8284.katrina
   App nickname (optional): Sarinaa - AI Companion
   Debug signing certificate SHA-1: 59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0
   ```

   **CRITICAL**: The package name MUST be exactly `com.x8284.katrina`

4. **Click "Register app"**

### Step 1.2: Add SHA-1 Fingerprint

The SHA-1 fingerprint is **critical** for Google Sign-In to work.

**Release Keystore SHA-1** (Production):
```
59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0
```

**Where to Add**:
- After registering the app, you'll see "SHA certificate fingerprints"
- Click **"Add fingerprint"**
- Paste: `59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0`
- Click **Save**

**Optional - Debug SHA-1** (for local testing):
If you want to test on debug builds, also add your debug SHA-1:
```bash
# Run this command to get your debug SHA-1:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Step 1.3: Download google-services.json

1. **Download the File**
   - On the same screen, you'll see **"Download google-services.json"** button
   - Click it to download
   - This file is **specific** to the `com.x8284.katrina` package

2. **Verify the Contents**
   - Open the file and verify:
     - `package_name` = `"com.x8284.katrina"`
     - `project_id` = `"sarina-ai-2b2c1"`

3. **Save for Later**
   - Keep this file handy (we'll use it in Part 4)

### Step 1.4: Get Android OAuth Client ID

This is the **most critical step** for Google Sign-In on Android.

1. **Navigate to OAuth Clients**
   - In Firebase Console → Project settings
   - Scroll down to **"Your apps"**
   - Find the app you just added (`com.x8284.katrina`)
   - Click on it to expand

2. **Find OAuth 2.0 Client IDs**
   - You'll see a section called **"Web SDK configuration"**
   - Below that, you'll see **"OAuth 2.0 Client IDs"**
   - Look for the **Android client**

3. **Copy the Android Client ID**
   - It will look like: `713023465818-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
   - **This is NOT the Web Client ID** - it's specific to Android
   - Save this somewhere safe

**Alternative Method** (if not showing):
1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select project: `sarina-ai-2b2c1`
3. Navigate to: **APIs & Services** → **Credentials**
4. Look for an OAuth 2.0 Client ID with:
   - Type: **Android**
   - Package name: `com.x8284.katrina`
   - SHA-1: `59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0`

**If it doesn't exist**, Firebase should auto-create it. If not, create manually:
1. Click **"Create Credentials"** → **OAuth 2.0 Client ID**
2. Application type: **Android**
3. Name: `Sarinaa Android`
4. Package name: `com.x8284.katrina`
5. SHA-1: `59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0`
6. Click **Create**

### Step 1.5: Get Web Client ID (for iOS compatibility)

Your current code uses a Web Client ID for cross-platform compatibility.

**Current Web Client ID** (from existing code):
```
1051121433445-8sehc92iuvth1aq4ej5fb8452pcf61mt.apps.googleusercontent.com
```

**What to do**:
1. Go to Firebase Console → Authentication → Sign-in method → Google
2. Expand the Google provider
3. Copy the **Web client ID** shown there
4. It should be the same as above, but **verify it**

**Note**: You can use the SAME Web Client ID for both the old and new app since they're in the same Firebase project.

### ✅ Firebase Setup Checklist

Before proceeding, verify you have:

- [ ] New Android app added to Firebase (`com.x8284.katrina`)
- [ ] SHA-1 fingerprint added to Firebase
- [ ] `google-services.json` downloaded
- [ ] Android OAuth Client ID copied
- [ ] Web Client ID verified
- [ ] Both client IDs saved somewhere safe

**Collect This Information**:
```
Android OAuth Client ID: [paste here]
Web Client ID: [paste here]
```

---

## 🎮 PART 2: Play Console Setup

### Step 2.1: Verify App Listing

1. **Go to Play Console**
   - URL: https://play.google.com/console
   - Select app: **"Katrina"**

2. **Verify Package Name**
   - Go to: **Dashboard** or **Setup** → **App Integrity**
   - Confirm package name: `com.x8284.katrina`

3. **Check App Signing**
   - Go to: **Setup** → **App signing**
   - Verify that **Google Play App Signing** is enabled
   - Verify the upload certificate matches your keystore SHA-1

### Step 2.2: Create Subscription Products

Your app currently uses these subscription product IDs:
```typescript
Weekly:  sarina_weekly_299   → $2.99/week
Yearly:  sarina_yearly_1299  → $12.99/year
```

**Decision Point**: Do you want to:
- **Option A**: Keep the same product IDs (`sarina_weekly_299`, `sarina_yearly_1299`)
- **Option B**: Create new product IDs for the new app

**Recommendation**: Keep the same IDs for consistency.

### Step 2.3: Create Subscriptions in Play Console

1. **Navigate to Subscriptions**
   - Play Console → **Monetize** → **Subscriptions**

2. **Create Weekly Subscription**
   - Click **"Create subscription"**
   - **Product ID**: `sarina_weekly_299`
   - **Name**: Weekly Subscription
   - **Description**: Full access to Sarinaa AI Companion
   - **Billing period**: 1 week
   - **Price**: $2.99 USD (set for all countries or specific ones)
   - **Free trial**: Optional (e.g., 3 days, 7 days)
   - Click **Save**

3. **Create Yearly Subscription**
   - Click **"Create subscription"**
   - **Product ID**: `sarina_yearly_1299`
   - **Name**: Yearly Subscription
   - **Description**: Full year access to Sarinaa AI Companion
   - **Billing period**: 1 year
   - **Price**: $12.99 USD
   - **Free trial**: Optional
   - Click **Save**

4. **Activate Subscriptions**
   - After creating, make sure both subscriptions are **Active**
   - Status should show as "Active" (not "Inactive" or "Draft")

### ✅ Play Console Setup Checklist

- [ ] App listing verified (package: `com.x8284.katrina`)
- [ ] App signing verified
- [ ] Subscription `sarina_weekly_299` created and active
- [ ] Subscription `sarina_yearly_1299` created and active
- [ ] Pricing set for target countries

---

## 💰 PART 3: RevenueCat Setup

RevenueCat manages subscriptions and provides a unified API across iOS and Android.

### Step 3.1: Access RevenueCat Dashboard

1. **Go to RevenueCat**
   - URL: https://app.revenuecat.com
   - Log in to your account

2. **Select Your Project**
   - Find your existing project (likely named "Sarina" or similar)

**Current RevenueCat API Key** (from code):
```
appl_cGMSHwaYbbRwdhOiEgBPbOPykYP
```

### Step 3.2: Add Android App to RevenueCat

1. **Navigate to Apps**
   - Dashboard → **Apps**

2. **Add New App OR Update Existing**

   **Option A - If you have a separate iOS app in RevenueCat**:
   - Click **"Add new app"**
   - Select **Android**
   - App name: `Sarinaa Android`
   - Bundle ID: `com.x8284.katrina`
   - Click **Create**

   **Option B - If you want one unified app**:
   - Click on your existing app
   - Go to **App settings**
   - Update the Android package name to `com.x8284.katrina`

3. **Connect to Google Play**
   - Go to app settings → **Google Play**
   - Follow RevenueCat's guide to connect:
     - Upload Play Console service account JSON
     - Grant RevenueCat permissions in Play Console

### Step 3.3: Configure Products in RevenueCat

1. **Navigate to Products**
   - Dashboard → **Products** (or **Entitlements** → **Products**)

2. **Add Weekly Subscription**
   - Click **"Add product"** or **"New"**
   - **Identifier**: `sarina_weekly_299`
   - **Type**: Subscription
   - Click **Save**
   - Then configure:
     - **Android product ID**: `sarina_weekly_299` (matches Play Console)
     - **iOS product ID**: (if you have iOS) - likely same or similar

3. **Add Yearly Subscription**
   - Click **"Add product"** or **"New"**
   - **Identifier**: `sarina_yearly_1299`
   - **Type**: Subscription
   - Click **Save**
   - Configure Android and iOS product IDs

### Step 3.4: Create Entitlement

RevenueCat uses "Entitlements" to group products.

1. **Navigate to Entitlements**
   - Dashboard → **Entitlements**

2. **Create Premium Entitlement**
   - Click **"New entitlement"**
   - **Identifier**: `premium` (or whatever you want)
   - **Attached products**:
     - Add `sarina_weekly_299`
     - Add `sarina_yearly_1299`
   - Click **Save**

### Step 3.5: Create Offering (Paywall Configuration)

1. **Navigate to Offerings**
   - Dashboard → **Offerings**

2. **Create Default Offering**
   - Click **"New offering"**
   - **Identifier**: `default`
   - **Description**: Default subscription offering
   - Click **Save**

3. **Add Packages to Offering**
   - Click on the `default` offering
   - Click **"Add package"**

   **Weekly Package**:
   - Package identifier: `weekly`
   - Product: `sarina_weekly_299`
   - Click **Save**

   **Yearly Package**:
   - Package identifier: `yearly`
   - Product: `sarina_yearly_1299`
   - Click **Save**

4. **Set as Current Offering**
   - Make sure the `default` offering is marked as **Current**

### Step 3.6: Verify API Keys

1. **Get Android API Key**
   - Dashboard → **Apps** → Your Android app → **API keys**
   - Copy the **Public Android SDK key**
   - It should start with `goog_` or similar

2. **Update Code** (we'll do this in Part 4)

**Current code shows**:
```typescript
const REVENUECAT_API_KEYS = {
  ios: 'appl_cGMSHwaYbbRwdhOiEgBPbOPykYP',
  android: 'appl_cGMSHwaYbbRwdhOiEgBPbOPykYP', // Same key for both
};
```

**What you need**:
- If the key works for both iOS and Android, keep it
- If you created a separate Android app in RevenueCat, get the new Android key

### ✅ RevenueCat Setup Checklist

- [ ] RevenueCat project accessed
- [ ] Android app added/updated (`com.x8284.katrina`)
- [ ] Google Play connected to RevenueCat
- [ ] Product `sarina_weekly_299` created
- [ ] Product `sarina_yearly_1299` created
- [ ] Premium entitlement created
- [ ] Default offering created with packages
- [ ] API keys verified

**Collect This Information**:
```
RevenueCat Android API Key: [paste here]
(Or confirm using same key: appl_cGMSHwaYbbRwdhOiEgBPbOPykYP)
```

---

## 💻 PART 4: Code Updates

**This is where Claude will help you update the code.**

Once you've completed Parts 1-3, provide Claude with:

```
=== FIREBASE INFORMATION ===
Android OAuth Client ID: [from Part 1.4]
Web Client ID: [from Part 1.5]
google-services.json path: /home/raghav/Downloads/google-services (1).json

=== REVENUECAT INFORMATION ===
Android API Key: [from Part 3.6]

=== PLAY CONSOLE INFORMATION ===
Subscription Products Created: ✅ Yes
Product IDs: sarina_weekly_299, sarina_yearly_1299
```

### Changes Claude Will Make

#### 4.1: Replace google-services.json
**File**: `android/app/google-services.json`
- Replace with the new file from Firebase

#### 4.2: Update Firebase Web Config (Optional)
**File**: `app/config/firebase.ts`
- Currently has old web config - but since we're using the same project, **no changes needed**
- Unless you want to update it for consistency

#### 4.3: Update Google Sign-In Client IDs
**File**: `app/services/authService.ts:23-26`

**Current**:
```typescript
const WEB_CLIENT_ID = '1051121433445-8sehc92iuvth1aq4ej5fb8452pcf61mt.apps.googleusercontent.com';
const IOS_CLIENT_ID = '1051121433445-rqjvp9kqjdkqvoctr14ac57eilstg0v3.apps.googleusercontent.com';
```

**Update to**:
```typescript
const WEB_CLIENT_ID = '[YOUR_WEB_CLIENT_ID_FROM_PART_1.5]';
const IOS_CLIENT_ID = '1051121433445-rqjvp9kqjdkqvoctr14ac57eilstg0v3.apps.googleusercontent.com'; // Keep same
```

**Note**: You might not need to change WEB_CLIENT_ID if it's the same (same Firebase project).

#### 4.4: Update RevenueCat API Keys (if needed)
**File**: `app/services/revenueCatService.ts:14-17`

**Current**:
```typescript
const REVENUECAT_API_KEYS = {
  ios: 'appl_cGMSHwaYbbRwdhOiEgBPbOPykYP',
  android: 'appl_cGMSHwaYbbRwdhOiEgBPbOPykYP',
};
```

**Update if you got a new Android key**:
```typescript
const REVENUECAT_API_KEYS = {
  ios: 'appl_cGMSHwaYbbRwdhOiEgBPbOPykYP',
  android: '[YOUR_NEW_ANDROID_KEY_IF_DIFFERENT]',
};
```

#### 4.5: Verify Subscription Product IDs (No Changes Needed)
**File**: `app/services/revenueCatService.ts`
- The code dynamically detects product IDs from RevenueCat
- No hardcoded IDs to update
- As long as you used `sarina_weekly_299` and `sarina_yearly_1299` in Play Console and RevenueCat, it will work

---

## 🔨 PART 5: Build & Test

### Step 5.1: Clean Build

```bash
cd "/home/raghav/Vibe COded Apps/sarina"

# Clean Android build
cd android
./gradlew clean

# Go back to root
cd ..

# Build release AAB
cd android
./gradlew bundleRelease
```

**Expected Output**:
```
BUILD SUCCESSFUL
AAB location: android/app/build/outputs/bundle/release/app-release.aab
Size: ~62MB
```

### Step 5.2: Verify AAB

```bash
# Check the file exists
ls -lh android/app/build/outputs/bundle/release/app-release.aab

# Verify signing
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

Should show: `jar verified.`

### Step 5.3: Install Debug Build for Testing

Before uploading to Play Console, test locally:

```bash
# Build and install debug build
npx expo run:android --variant debug

# Or build release variant locally (if you have a device connected)
npx expo run:android --variant release
```

### Step 5.4: Testing Checklist

Test these features on a physical device:

**Basic Functionality**:
- [ ] App launches successfully
- [ ] App name shows as "Sarinaa"
- [ ] No crashes on startup

**Authentication**:
- [ ] Google Sign-In button appears
- [ ] Click Google Sign-In
- [ ] Google account selector appears
- [ ] Successfully signs in
- [ ] User profile loads
- [ ] Check Firebase Console → Authentication → Users (verify user created)

**Firestore**:
- [ ] User document created in Firestore
- [ ] Check Firebase Console → Firestore → users collection
- [ ] Verify user data is correct

**Subscriptions**:
- [ ] Subscription paywall appears
- [ ] Weekly and Yearly options display with correct prices
- [ ] Prices match Play Console configuration ($2.99, $12.99)
- [ ] (Optional) Initiate test purchase (don't complete unless using test card)

**RevenueCat**:
- [ ] Check RevenueCat Dashboard → Customers
- [ ] Verify your user appears (after sign-in)

**App Features**:
- [ ] Voice call functionality works
- [ ] Chat functionality works
- [ ] Character selection works
- [ ] All screens load without errors

**Logs**:
```bash
# Monitor app logs
adb logcat | grep -i "sarina\|firebase\|revenuecat\|google"

# Watch for errors
adb logcat *:E
```

### Step 5.5: Upload to Play Console

1. **Go to Play Console**
   - URL: https://play.google.com/console
   - Select: "Katrina" app

2. **Create New Release**
   - Go to: **Release** → **Production** (or **Internal testing** first)
   - Click: **"Create new release"**

3. **Upload AAB**
   - Click: **"Upload"**
   - Select: `android/app/build/outputs/bundle/release/app-release.aab`
   - Wait for upload and processing

4. **Fill Release Details**
   - **Release name**: `Build 20 - Migration to Sarinaa` (or whatever version)
   - **Release notes**:
     ```
     Initial release of Sarinaa - AI Companion
     • Brand new AI companion experience
     • Google Sign-In authentication
     • Weekly and Yearly subscription options
     • Voice calling with AI characters
     • Chat functionality
     ```

5. **Review and Rollout**
   - Click **"Review release"**
   - Fix any errors or warnings
   - Click **"Start rollout to Internal testing"** (test first)
   - Or **"Start rollout to Production"** (if confident)

### Step 5.6: Post-Upload Verification

1. **Check Release Status**
   - Wait for Play Console to process (can take 1-2 hours)
   - Status should change to "Available"

2. **Install from Play Console**
   - Use the internal testing link
   - Install on a fresh device
   - Repeat testing checklist

3. **Monitor Crashes**
   - Play Console → **Quality** → **Android vitals** → **Crashes**
   - Watch for any crash reports

---

## 🔐 Critical Information

### Keystore Details (SECURE)

**NEVER LOSE THIS FILE OR CREDENTIALS**

```
Keystore File: @propeers__katrina.jks
Location: /home/raghav/Vibe COded Apps/sarina/android/app/
Backup Location: /home/raghav/Downloads/aa/

SHA-1: 59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0
SHA-256: CB:74:30:60:C8:9C:38:73:30:34:4D:62:3A:D1:2D:03:1A:8A:31:D5:60:18:61:34:54:14:98:AC:F0:A8:64:22

Key Alias: bbabcdda9c8eb0477e426fe11be469b7
Keystore Password: a143b5cfe4ecd6dab8634e3534c7aa8b
Key Password: 494b078f33042e97e86675b3436ac1f2
```

**Actions**:
- [ ] Keystore backed up to cloud storage
- [ ] Keystore backed up to external drive
- [ ] Credentials saved in password manager

### Package Name (PERMANENT)

```
com.x8284.katrina
```

**CRITICAL**: This CANNOT be changed after publishing to Play Store. All configurations MUST use this exact package name.

### Firebase Project

```
Project ID: sarina-ai-2b2c1
Project Number: 1051121433445
```

This is your EXISTING Firebase project. The new Android app is added to this project.

---

## 🔧 Troubleshooting

### Issue: Google Sign-In Fails

**Error**: "Developer Error" or "Sign-In failed"

**Causes**:
1. SHA-1 not added to Firebase
2. Wrong Web Client ID in code
3. Android OAuth client not created
4. Package name mismatch

**Fixes**:
1. Verify SHA-1 in Firebase Console → Project settings → Your apps → com.x8284.katrina
2. Verify Web Client ID in `authService.ts` matches Firebase Console → Authentication → Google
3. Verify Android OAuth client exists in Google Cloud Console → Credentials
4. Verify package name is `com.x8284.katrina` everywhere

### Issue: Subscriptions Not Showing

**Error**: "No offerings found" or empty paywall

**Causes**:
1. Products not created in Play Console
2. Products not created in RevenueCat
3. Offering not configured in RevenueCat
4. Products not activated

**Fixes**:
1. Check Play Console → Monetize → Subscriptions (both should be Active)
2. Check RevenueCat → Products (both should exist)
3. Check RevenueCat → Offerings → default (should have packages)
4. Wait 15-30 minutes for Play Console to sync with RevenueCat

### Issue: "Item is already owned"

**Error**: When testing subscriptions

**Cause**: You already purchased this subscription in testing

**Fixes**:
1. Use a different Google account for testing
2. Refund the test purchase in Play Console
3. Use Play Console → License testing → Add test accounts

### Issue: Backend API Fails

**Error**: "Invalid token" or authentication errors

**Cause**: Backend might not recognize new package name

**Fixes**:
1. This shouldn't happen since we're using the same Firebase project
2. Check backend logs in Google Cloud Run
3. Verify backend is using `sarina-ai-2b2c1` Firebase credentials

### Issue: App Crashes on Startup

**Check**:
1. `google-services.json` is in `android/app/` directory
2. Package name in `google-services.json` is `com.x8284.katrina`
3. Run `adb logcat` to see crash logs
4. Check Firebase Console → Crashlytics

---

## 📋 Complete Migration Checklist

### Pre-Migration
- [ ] Read entire guide
- [ ] Firebase Console access verified
- [ ] Play Console access verified
- [ ] RevenueCat access verified
- [ ] Keystore backed up

### Part 1: Firebase
- [ ] New Android app added (`com.x8284.katrina`)
- [ ] SHA-1 fingerprint added
- [ ] google-services.json downloaded
- [ ] Android OAuth Client ID obtained
- [ ] Web Client ID verified

### Part 2: Play Console
- [ ] App listing verified
- [ ] Subscription `sarina_weekly_299` created
- [ ] Subscription `sarina_yearly_1299` created
- [ ] Both subscriptions activated

### Part 3: RevenueCat
- [ ] Android app added/updated
- [ ] Products created in RevenueCat
- [ ] Entitlement created
- [ ] Offering configured
- [ ] API keys verified

### Part 4: Code Updates
- [ ] google-services.json replaced
- [ ] Web Client ID updated (if needed)
- [ ] RevenueCat API keys updated (if needed)
- [ ] All changes reviewed

### Part 5: Build & Test
- [ ] Clean build successful
- [ ] AAB generated
- [ ] Debug build tested locally
- [ ] Google Sign-In works
- [ ] Subscriptions display correctly
- [ ] All features tested
- [ ] AAB uploaded to Play Console
- [ ] Internal testing release created
- [ ] App installed from Play Console
- [ ] Final testing complete

### Post-Launch
- [ ] Monitor crashes in Play Console
- [ ] Monitor user feedback
- [ ] Check RevenueCat dashboard for subscriptions
- [ ] Verify Firebase analytics

---

## 📞 Next Steps

### Ready to Start?

1. **Complete Part 1** - Firebase Setup (30-45 minutes)
2. **Complete Part 2** - Play Console Setup (15-20 minutes)
3. **Complete Part 3** - RevenueCat Setup (20-30 minutes)
4. **Return to Claude** with collected information
5. **Claude updates code** - Part 4 (10-15 minutes)
6. **Build, test, deploy** - Part 5 (30-45 minutes)

### Information to Collect

When you return to Claude, have ready:

```
=== FIREBASE ===
Android OAuth Client ID: [from Firebase Console → Credentials]
Web Client ID: [from Firebase Console → Authentication → Google]
google-services.json location: /home/raghav/Downloads/google-services (1).json

=== REVENUECAT ===
Android API Key: [confirm if using appl_cGMSHwaYbbRwdhOiEgBPbOPykYP or new key]

=== PLAY CONSOLE ===
Products created: ✅ Yes
Product IDs confirmed: sarina_weekly_299, sarina_yearly_1299

Ready for code updates: ✅ Yes
```

---

## 🎉 Success Criteria

Your migration is complete when:

✅ App builds successfully
✅ Google Sign-In works on Android
✅ User data syncs to Firestore
✅ Subscriptions display in app
✅ Can initiate purchase flow
✅ RevenueCat tracks users
✅ App uploaded to Play Console
✅ Internal testers can install
✅ No crashes in testing

---

**Good luck with the migration! 🚀**

**Questions?** Return to Claude with the collected information and we'll proceed with Part 4.

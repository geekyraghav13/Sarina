# Android Reconfiguration Guide - Sarinaa AI Companion

## 📌 Overview

**Objective**: Migrate the Android app from the old "Sarina AI Girlfriend" (suspended) to the new "Katrina" Play Console listing with proper Firebase and authentication setup.

**Timeline**: Multi-milestone approach for systematic completion

**Current Status**:
- ✅ Package name: `com.x8284.katrina`
- ✅ Keystore configured and working
- ✅ AAB build successful (62MB)
- ✅ App name changed to "Sarinaa"
- ❌ Firebase still using old project (`sarina-ai-2b2c1`)
- ❌ Google Sign-In using old OAuth credentials
- ❌ Need to verify backend compatibility

---

## 🔑 Critical Information Extracted

### Keystore Details (SECURE - Keep Safe)
```
File: @propeers__katrina.jks
Location: /home/raghav/Vibe COded Apps/sarina/android/app/
Backup: /home/raghav/Downloads/aa/

SHA-1: 59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0
SHA-256: CB:74:30:60:C8:9C:38:73:30:34:4D:62:3A:D1:2D:03:1A:8A:31:D5:60:18:61:34:54:14:98:AC:F0:A8:64:22

Key Alias: bbabcdda9c8eb0477e426fe11be469b7
Keystore Password: a143b5cfe4ecd6dab8634e3534c7aa8b
Key Password: 494b078f33042e97e86675b3436ac1f2
```

### Current Configuration
```
Package Name: com.x8284.katrina
App Name: Sarinaa
Version Code: 20
Version Name: 2.2.3

Play Console Listing: "Katrina" (internal testing)
Target Status: Production release as "Sarinaa - AI Companion"
```

---

## 🎯 MILESTONE 1: Firebase Project Setup (YOUR TASKS)

**Goal**: Create and configure new Firebase project for Sarinaa app

### What You Need to Do:

#### Step 1.1: Create/Select Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. **Option A**: Create new project called "Sarinaa" or "Katrina"
3. **Option B**: Use existing project if you have one for the new app
4. Enable Google Analytics (recommended)

#### Step 1.2: Add Android App to Firebase
1. Click "Add app" → Select Android icon
2. Fill in:
   - **Android package name**: `com.x8284.katrina` (CRITICAL - must match exactly)
   - **App nickname**: `Sarinaa - AI Companion`
   - **Debug signing certificate SHA-1**: `59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0`
3. Click "Register app"
4. **DOWNLOAD** `google-services.json` file (you'll give this to me)

#### Step 1.3: Enable Firebase Services

**Authentication**:
1. Go to Authentication → Get Started
2. Click "Sign-in method" tab
3. Enable "Google" provider
4. **IMPORTANT**: Copy the "Web client ID" (you'll need this)
   - Format: `XXXXXXX-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`

**Firestore Database**:
1. Go to Firestore Database → Create database
2. Start in **production mode** (you already have security rules from old app)
3. Choose location (same as old project if possible)

**Analytics** (Optional but recommended):
1. Should auto-enable with project creation
2. Verify it's enabled in Project Settings

**Crashlytics** (Optional):
1. Go to Crashlytics → Enable
2. No code changes needed (already integrated)

**Remote Config** (Optional):
1. Go to Remote Config → Get Started
2. Can configure parameters later

#### Step 1.4: Collect Information for Claude

Create a text file with:

```
=== FIREBASE PROJECT INFO ===
Project ID: [from Firebase Console → Project Settings]
Project Name: [your project name]

=== WEB CLIENT ID ===
[paste the Web client ID from Authentication → Sign-in method → Google]

=== GOOGLE-SERVICES.JSON ===
[paste entire content of downloaded google-services.json file]
```

**Where to find these**:
- Project ID: Firebase Console → Project Settings → General
- Web Client ID: Firebase Console → Authentication → Sign-in method → Google (expand it)
- google-services.json: The file you downloaded in Step 1.2

---

## 🎯 MILESTONE 2: Backend Verification (YOUR TASKS)

**Goal**: Ensure Cloud Run backend is compatible with new Firebase project

### What You Need to Check:

#### Step 2.1: Cloud Run Service Status
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to Cloud Run
3. Find your voice backend service
4. Check which **Firebase project** it's configured for

#### Step 2.2: Backend Environment Variables

Your backend needs these Firebase credentials:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (or service account JSON)

**Questions to answer**:
1. Is your Cloud Run backend in the SAME Google Cloud project as the new Firebase?
2. Or is it in the OLD "sarina-ai-2b2c1" project?

**If backend is in OLD project**:
- You'll need to either:
  - **Option A**: Migrate backend to new Firebase project
  - **Option B**: Update backend environment variables to accept both old AND new Firebase tokens (for transition period)
  - **Option C**: Deploy new backend instance in new project

**What to provide Claude**:
```
=== BACKEND INFO ===
Cloud Run Service URL: [your backend URL]
Current Firebase Project: [which project is it using?]
Action needed: [migrate / update variables / deploy new / none]
```

---

## 🎯 MILESTONE 3: Play Console Verification (YOUR TASKS)

**Goal**: Ensure Google Play Console is ready for new configuration

### What You Need to Check:

#### Step 3.1: App Status
1. Go to [Google Play Console](https://play.google.com/console)
2. Find "Katrina" app listing
3. Current status: Internal testing
4. Verify package name: `com.x8284.katrina`

#### Step 3.2: In-App Products & Subscriptions

**Current subscription IDs in code**:
- Weekly: `sarina_weekly_299`
- Yearly: `sarina_yearly_1299`

**Questions to answer**:
1. Have you created these subscription products in "Katrina" Play Console?
2. Or do you need to create NEW subscription IDs?
3. What are the pricing?
   - Weekly: $2.99?
   - Yearly: $12.99?

**If products don't exist yet**:
1. Go to Play Console → Monetize → Subscriptions
2. Create new subscriptions:
   - Product ID: `sarina_weekly_299` (or new ID)
   - Price: $2.99/week
   - Product ID: `sarina_yearly_1299` (or new ID)
   - Price: $12.99/year

**What to provide Claude**:
```
=== PLAY CONSOLE INFO ===
Subscription Products Status: [created / need to create new]

If existing:
- Weekly ID: sarina_weekly_299 (keep)
- Yearly ID: sarina_yearly_1299 (keep)

If new IDs needed:
- Weekly ID: [new ID]
- Yearly ID: [new ID]
```

#### Step 3.3: App Signing
1. Go to Play Console → Setup → App signing
2. Verify that Google Play App Signing is enabled
3. **Important**: The upload keystore we're using (`@propeers__katrina.jks`) should match what's registered

---

## 🎯 MILESTONE 4: Code Updates (CLAUDE'S TASKS)

**Goal**: Update all code to use new Firebase project and configurations

### What Claude Will Do (After You Provide Info):

#### Update 4.1: Firebase Configuration
**File**: `app/config/firebase.ts`

Current (OLD):
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCoso8vP9ZY6fCGq3g-bgOyEdLDja9Dyo0",
  authDomain: "sarina-ai-2b2c1.firebaseapp.com",
  projectId: "sarina-ai-2b2c1",
  storageBucket: "sarina-ai-2b2c1.firebasestorage.app",
  messagingSenderId: "1051121433445",
  appId: "1:1051121433445:web:b3d60bb5ea0190e09c7f8c",
  measurementId: "G-SX1919QG46"
};
```

New (from your google-services.json):
```typescript
// Claude will extract values from your google-services.json
// and update this configuration
```

#### Update 4.2: Google Sign-In OAuth
**File**: `app/services/authService.ts:18-22`

Current (OLD):
```typescript
const WEB_CLIENT_ID = '1051121433445-8sehc92iuvth1aq4ej5fb8452pcf61mt.apps.googleusercontent.com';
```

New (from your Firebase Auth settings):
```typescript
const WEB_CLIENT_ID = '[YOUR_NEW_WEB_CLIENT_ID]';
```

#### Update 4.3: Subscription IDs (if needed)
**File**: `app/services/subscriptionService.ts:16-17`

Only if you created NEW product IDs in Play Console

#### Update 4.4: Code Cleanup
- Search and replace remaining "Sarina" references
- Verify AndroidManifest.xml
- Check for hardcoded URLs or old project references

---

## 🎯 MILESTONE 5: Build & Test (COLLABORATIVE)

**Goal**: Generate production AAB and verify all functionality

### Step 5.1: Clean Build
```bash
cd /home/raghav/Vibe\ COded\ Apps/sarina/android
./gradlew clean
./gradlew bundleRelease
```

**Expected output**:
- AAB location: `android/app/build/outputs/bundle/release/app-release.aab`
- Size: ~62MB
- Signed with: `@propeers__katrina.jks`

### Step 5.2: Testing Checklist

**Test on physical device** (install debug build first):
```bash
npx expo run:android --variant release
```

Test these features:
- [ ] App launches successfully
- [ ] App name shows as "Sarinaa"
- [ ] Google Sign-In works (uses NEW Firebase project)
- [ ] User profile loads from Firestore
- [ ] Subscription paywall displays
- [ ] Can initiate subscription purchase (don't complete if testing)
- [ ] Voice call connects to backend
- [ ] AI chat responds
- [ ] Analytics events logged in NEW Firebase Console

### Step 5.3: Upload to Play Console

1. Go to Play Console → Katrina app
2. Go to Production → Create new release
3. Upload `app-release.aab`
4. Complete release notes
5. **Start with Internal Testing** first
6. Test with internal testers
7. Then promote to Production when ready

---

## 📊 MIGRATION CHECKLIST

Use this checklist to track progress:

### Preparation (Before Starting with Claude)
- [ ] Read this entire document
- [ ] Access to Firebase Console verified
- [ ] Access to Google Cloud Console verified
- [ ] Access to Play Console verified
- [ ] Understand what info needs to be collected

### Milestone 1: Firebase Setup
- [ ] Firebase project created/selected
- [ ] Android app added to Firebase with correct package name
- [ ] SHA-1 fingerprint added to Firebase
- [ ] Google Sign-In provider enabled
- [ ] Web Client ID copied
- [ ] Firestore Database created
- [ ] google-services.json downloaded
- [ ] All info collected for Claude

### Milestone 2: Backend Verification
- [ ] Cloud Run backend located
- [ ] Backend Firebase project identified
- [ ] Decision made on backend migration/update
- [ ] Backend credentials status documented

### Milestone 3: Play Console Verification
- [ ] "Katrina" app listing verified
- [ ] Package name confirmed: com.x8284.katrina
- [ ] Subscription products created (or existing IDs confirmed)
- [ ] App signing verified

### Milestone 4: Code Updates (Claude)
- [ ] Firebase config updated
- [ ] Google Sign-In Web Client ID updated
- [ ] Subscription IDs updated (if needed)
- [ ] Code cleanup completed
- [ ] All changes reviewed

### Milestone 5: Build & Test
- [ ] Clean build successful
- [ ] AAB generated and signed
- [ ] App launches on device
- [ ] Google Sign-In works with new Firebase
- [ ] Firestore data accessible
- [ ] Subscription flow works
- [ ] Voice calls work
- [ ] Analytics logging verified
- [ ] All tests passed

### Milestone 6: Deployment
- [ ] AAB uploaded to Play Console
- [ ] Internal testing release created
- [ ] Tested by internal testers
- [ ] Issues resolved (if any)
- [ ] Promoted to Production
- [ ] App live on Google Play

---

## 🚨 CRITICAL REMINDERS

### 🔒 Security
1. **NEVER** commit `google-services.json` to public repositories
2. **BACKUP** your keystore file (`@propeers__katrina.jks`) in multiple secure locations
3. **KEEP** keystore passwords secure (they're in `gradle.properties` - don't commit)

### 📱 Package Name
- Package name `com.x8284.katrina` is **PERMANENT** - cannot change after Play Store release
- Ensure it matches EVERYWHERE: Firebase, Play Console, code

### 🔑 Keystore
- You **MUST** use the same keystore for all future updates
- If you lose the keystore, you cannot update the app (must create new Play listing)
- Current keystore backup: `/home/raghav/Downloads/aa/@propeers__katrina.jks`

### 🔥 Firebase Project
- Once you add SHA-1 to Firebase, Google Sign-In will ONLY work with that signature
- For testing, you may need to add debug keystore SHA-1 separately

---

## 📝 INFORMATION TEMPLATE FOR CLAUDE

When you're ready to start with Claude tomorrow, copy and fill this:

```markdown
## FIREBASE CONFIGURATION

### Project Details
Project ID: [from Firebase Console]
Project Name: [your project name]

### Web Client ID
[paste from Firebase Console → Authentication → Google]

### google-services.json Content
```json
[paste entire file content]
```

## BACKEND STATUS

Cloud Run Service URL: [your backend URL]
Current Firebase Project: [which project?]
Action Required: [migrate / update / deploy new / none]

## PLAY CONSOLE STATUS

App Listing: Katrina
Package Name: com.x8284.katrina
Status: Internal Testing

### Subscription Products
- [ ] Using existing IDs (sarina_weekly_299, sarina_yearly_1299)
- [ ] Need new IDs: Weekly: [ID], Yearly: [ID]

## READY TO PROCEED
- [ ] All above information collected
- [ ] Firebase project fully configured
- [ ] Ready for Claude to update code
```

---

## 🤝 SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue**: Google Sign-In fails after migration
- **Cause**: SHA-1 not added to Firebase or wrong Web Client ID
- **Fix**: Verify SHA-1 in Firebase Console, verify Web Client ID in code

**Issue**: Firestore permission denied
- **Cause**: Security rules not configured for new project
- **Fix**: Copy security rules from old Firebase project

**Issue**: Subscriptions not showing in app
- **Cause**: Product IDs don't match Play Console
- **Fix**: Verify product IDs in Play Console match code

**Issue**: Backend API calls fail
- **Cause**: Backend still using old Firebase project tokens
- **Fix**: Update backend Firebase credentials

### Getting Help

1. Check Firebase Console logs
2. Check Play Console errors
3. Check Android Logcat: `adb logcat | grep Sarina`
4. Review Cloud Run logs for backend issues

---

## 📅 ESTIMATED TIMELINE

- **Milestone 1** (Firebase Setup): 30-45 minutes
- **Milestone 2** (Backend Verification): 15-30 minutes
- **Milestone 3** (Play Console): 15-20 minutes
- **Milestone 4** (Code Updates with Claude): 20-30 minutes
- **Milestone 5** (Build & Test): 30-45 minutes
- **Milestone 6** (Upload & Release): 15-20 minutes

**Total**: ~2.5-3 hours (assuming no major issues)

---

## ✅ NEXT STEPS FOR TOMORROW

1. **Read this document thoroughly**
2. **Start with Milestone 1** - Firebase project setup
3. **Collect all required information** using the template above
4. **Come back to Claude** with the filled template
5. **Claude will update all code** (Milestone 4)
6. **Build, test, and deploy together** (Milestones 5-6)

---

**Document Version**: 1.0
**Created**: 2026-02-21
**Last Updated**: 2026-02-21
**Status**: Ready for execution

---

Good luck! When you return tomorrow with the Firebase information, we'll knock out the code updates quickly and get your app reconfigured and deployed! 🚀

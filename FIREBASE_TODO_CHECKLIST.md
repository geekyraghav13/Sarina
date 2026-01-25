# Firebase Analytics - Quick Action Checklist

## ✅ ALREADY DONE (No Action Needed)

- [x] Installed `@react-native-firebase/analytics` package
- [x] Created `app/services/firebaseAnalytics.ts` with all 3 mandatory events
- [x] Updated `App.tsx` to initialize Firebase Analytics
- [x] Updated `PaywallScreen.tsx` to log `ad_impression` and `purchase` events
- [x] Package name configured: `com.sarina.app`

---

## 📋 TODO: Complete These 3 Steps

### Step 1: Register Android App in Firebase Console
**Time**: 2-3 minutes
**URL**: https://console.firebase.google.com/project/sarina-ai-2b2c1/overview

**Actions**:
1. Click "Add app" button
2. Click Android icon
3. Enter package name: `com.sarina.app`
4. Enter app nickname: `Sarina AI Android`
5. Click "Register app"

---

### Step 2: Download & Replace google-services.json
**Time**: 1 minute

**Actions**:
1. Download the `google-services.json` file from Firebase Console
2. Replace the existing file at:
   ```
   /home/raghav/Vibe COded Apps/sarina/android/app/google-services.json
   ```
3. ⚠️ **VERIFY**: Open the file and check that `mobilesdk_app_id` does NOT say "PLACEHOLDER"

---

### Step 3: Update Android Build Configuration
**Time**: 2 minutes

#### 3a. Edit `android/build.gradle`

**Location**: `/home/raghav/Vibe COded Apps/sarina/android/build.gradle`

**Add this line** to the `buildscript { dependencies {` section:
```gradle
classpath('com.google.gms:google-services:4.4.0')
```

**Full example**:
```gradle
buildscript {
    dependencies {
        classpath('com.android.tools.build:gradle')
        classpath('com.facebook.react:react-native-gradle-plugin')
        classpath('com.google.gms:google-services:4.4.0')  // ADD THIS LINE
    }
}
```

#### 3b. Edit `android/app/build.gradle`

**Location**: `/home/raghav/Vibe COded Apps/sarina/android/app/build.gradle`

**Add this line at the BOTTOM** of the file:
```gradle
apply plugin: 'com.google.gms.google-services'
```

---

## 🏗️ After Completing Steps 1-3: Build

Run these commands:

```bash
cd "/home/raghav/Vibe COded Apps/sarina/android"
./gradlew clean
./gradlew assembleDebug
cd ..
```

---

## 🧪 Testing Firebase Analytics

### Enable Debug Mode:
```bash
adb shell setprop debug.firebase.analytics.app com.sarina.app
```

### View Events in Firebase Console:
https://console.firebase.google.com/project/sarina-ai-2b2c1/analytics/app/android:com.sarina.app/debugview

### Test the 3 Mandatory Events:

| Event | How to Trigger | Expected Result |
|-------|----------------|-----------------|
| **first_open** | Clear app data → Launch app | Automatic (Firebase SDK) |
| **ad_impression** | Open app → Complete onboarding → View paywall | Logged when PaywallScreen mounts |
| **purchase** | On paywall → Tap "Subscribe Now" | Logged when subscribe button clicked |

---

## 🎯 Quick Commands

### Check if events are being logged:
```bash
adb logcat | grep "FA-SVC"
```

### Clear app data (to test first_open):
```bash
adb shell pm clear com.sarina.app
```

### Run the app:
```bash
cd "/home/raghav/Vibe COded Apps/sarina"
npx expo start --android
```

---

## ✨ Success Criteria

You'll know it's working when:
- ✅ App builds without errors
- ✅ You see "Firebase Analytics initialized" in logcat
- ✅ Events appear in Firebase Console DebugView
- ✅ No errors in logcat related to Firebase

---

## 📄 Full Documentation

For detailed instructions, see:
- `FIREBASE_REGISTRATION_STEPS.md` - Step-by-step guide
- `FIREBASE_ANALYTICS_SETUP.md` - Complete technical documentation
- `app/services/firebaseAnalytics.ts` - Analytics service code

---

## 🆘 Quick Help

**Issue**: Build fails
**Fix**: Check that google-services.json is in `android/app/` folder

**Issue**: Events not appearing
**Fix**: Enable debug mode with `adb shell setprop debug.firebase.analytics.app com.sarina.app`

**Issue**: "PLACEHOLDER" in google-services.json
**Fix**: Download new file from Firebase Console after registering Android app

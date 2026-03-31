# Android Quick Reference - Sarinaa AI Companion

**Last Updated**: 2026-03-29

---

## 🎯 Essential Information (For Claude's Memory)

### Package & Identity
```
Package Name: com.x8284.katrina
App Name: Sarinaa
Bundle ID (iOS): com.sarina.app
Version Code: 23
Version Name: 2.2.5
```

### Firebase Project
```
Project ID: sarina-ai-2b2c1
Project Number: 1051121433445

Android OAuth Client ID:
1051121433445-io8chm2slotm86u652ug9i7022th6hau.apps.googleusercontent.com

Web Client ID (for Firebase Auth):
1051121433445-8sehc92iuvth1aq4ej5fb8452pcf61mt.apps.googleusercontent.com

iOS Client ID:
1051121433445-rqjvp9kqjdkqvoctr14ac57eilstg0v3.apps.googleusercontent.com
```

### Keystore (NEVER COMMIT)
```
File: @propeers__katrina.jks
Location: /home/raghav/Vibe COded Apps/sarina/android/app/
Backup: /home/raghav/Downloads/aa/

SHA-1 Fingerprints (ALL 3 REQUIRED IN FIREBASE):
- Debug SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
- Upload SHA-1: 59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0
- Play Store SHA-1: (added from Play Console → App Signing)

SHA-256: CB:74:30:60:C8:9C:38:73:30:34:4D:62:3A:D1:2D:03:1A:8A:31:D5:60:18:61:34:54:14:98:AC:F0:A8:64:22

Key Alias: bbabcdda9c8eb0477e426fe11be469b7
Store Password: a143b5cfe4ecd6dab8634e3534c7aa8b
Key Password: 494b078f33042e97e86675b3436ac1f2
```

### RevenueCat
```
iOS API Key: appl_cGMSHwaYbbRwdhOiEgBPbOPykYP
Android API Key: goog_qBISvlOBwMSdZDaSmkawISvXGII

Products:
- sarina_weekly_299 ($2.99/week)
- sarina_yearly_1299 ($12.99/year)

Entitlement: premium
Offering: default (current)
```

### Play Console
```
App Name: Katrina
Package: com.x8284.katrina
Developer Account: Raghav's account

Subscriptions:
- sarina_weekly_299 - $2.99/week
- sarina_yearly_1299 - $12.99/year

Service Account:
revenuecat-play-console@sarina-ai-2b2c1.iam.gserviceaccount.com
```

---

## 🚀 Quick Commands

### Build Release AAB
```bash
cd "/home/raghav/Vibe COded Apps/sarina/android"
./gradlew clean bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Build Debug APK
```bash
cd "/home/raghav/Vibe COded Apps/sarina"
npx expo run:android --variant debug
```

### Verify AAB Signature
```bash
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

### Monitor Logs
```bash
adb logcat | grep -E "Sarina|Firebase|RevenueCat|Google"
```

---

## 📁 Modified Files

### Firebase Configuration
- **File**: `android/app/google-services.json`
- **Package**: `com.x8284.katrina`
- **Project**: `sarina-ai-2b2c1`

### Authentication Service
- **File**: `app/services/authService.ts`
- **Lines**: 21-43
- **Changes**: Android OAuth Client ID added

### RevenueCat Service
- **File**: `app/services/revenueCatService.ts`
- **Lines**: 13-17
- **Android Key**: `goog_qBISvlOBwMSdZDaSmkawISvXGII`

### Build Configuration
- **File**: `android/app/build.gradle`
- **Package**: `com.x8284.katrina`
- **Version Code**: 23
- **Version Name**: 2.2.5

---

## 🔗 Important URLs

- **Firebase Console**: https://console.firebase.google.com (sarina-ai-2b2c1)
- **Google Cloud Console**: https://console.cloud.google.com (sarina-ai-2b2c1)
- **Play Console**: https://play.google.com/console (Katrina app)
- **RevenueCat Dashboard**: https://app.revenuecat.com

---

## 📖 Documentation Structure

```
docs/android/
├── README.md                              # Main index (START HERE)
├── QUICK_REFERENCE.md                     # This file (for quick lookups)
├── ANDROID_MIGRATION_FINAL_STATUS.md      # Build & deploy guide
├── ANDROID_MIGRATION_COMPLETE_GUIDE.md    # Complete setup reference
├── GOOGLE_CLOUD_SERVICE_ACCOUNT_GUIDE.md  # Service account setup
└── archive/                               # Old documentation
    ├── ANDROID_MIGRATION_CHANGES_APPLIED.md
    └── ANDROID_RECONFIGURATION_GUIDE.md
```

---

## ✅ Current Status

- ✅ Firebase configured for `com.x8284.katrina`
- ✅ Google Sign-In OAuth clients configured
- ✅ RevenueCat integrated with Android key
- ✅ Play Console subscriptions created
- ✅ Service account connected to RevenueCat
- ✅ All code updated and tested
- ✅ Documentation organized

**Status**: Production Ready

---

## 🔧 Common Issues & Solutions

### Google Sign-In Fails
- Check ALL 3 SHA-1s in Firebase:
  - Debug: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
  - Upload: `59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0`
  - Play Store: (from Play Console → App Signing)
- Verify package name: `com.x8284.katrina`
- Check google-services.json is correct and contains all 3 SHA-1s

### Subscriptions Not Showing
- Wait 15-30 minutes for RevenueCat sync
- Verify products active in Play Console
- Check RevenueCat connection status
- **CRITICAL**: Verify products are attached to "premium" entitlement in RevenueCat Dashboard
- Use "Restore Purchases" button in app if needed

### Build Fails
- Run: `./gradlew clean`
- Check keystore file exists
- Verify google-services.json in `android/app/`

---

**For detailed instructions, see**: [README.md](./README.md) or [ANDROID_MIGRATION_FINAL_STATUS.md](./ANDROID_MIGRATION_FINAL_STATUS.md)

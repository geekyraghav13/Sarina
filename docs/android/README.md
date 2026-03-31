# Android Documentation - Sarinaa AI Companion

**Package Name**: `com.x8284.katrina`
**App Name**: Sarinaa
**Current Build**: 23 (v2.2.5)
**Status**: ✅ Production Ready

---

## 📚 Documentation Index

### 🎯 **Essential Documents** (READ THESE FIRST)

1. **[ANDROID_MIGRATION_FINAL_STATUS.md](./ANDROID_MIGRATION_FINAL_STATUS.md)**
   - **Most Important** - Current configuration status
   - Complete setup summary
   - Build and deploy instructions
   - Testing checklist
   - **USE THIS** for building and deploying the app

2. **[ANDROID_MIGRATION_COMPLETE_GUIDE.md](./ANDROID_MIGRATION_COMPLETE_GUIDE.md)**
   - **Reference Guide** - Complete migration documentation
   - Step-by-step setup instructions for Firebase, Play Console, RevenueCat
   - Troubleshooting guide
   - **USE THIS** if you need to reconfigure or understand the setup

3. **[GOOGLE_CLOUD_SERVICE_ACCOUNT_GUIDE.md](./GOOGLE_CLOUD_SERVICE_ACCOUNT_GUIDE.md)**
   - How to create service account for RevenueCat
   - Google Cloud Console instructions
   - Play Console permissions setup
   - **USE THIS** if RevenueCat connection fails or needs recreation

---

## 📦 Current Configuration

### Package & Version
```
Package Name: com.x8284.katrina
App Name: Sarinaa
Version Code: 23
Version Name: 2.2.5
Target SDK: 36
Min SDK: 24
```

### Firebase Configuration
```
Project ID: sarina-ai-2b2c1
Project Number: 1051121433445
Package: com.x8284.katrina

Android OAuth Client ID:
1051121433445-io8chm2slotm86u652ug9i7022th6hau.apps.googleusercontent.com

Web Client ID:
1051121433445-8sehc92iuvth1aq4ej5fb8452pcf61mt.apps.googleusercontent.com

iOS Client ID:
1051121433445-rqjvp9kqjdkqvoctr14ac57eilstg0v3.apps.googleusercontent.com
```

### Keystore Information
```
File: @propeers__katrina.jks
Location: /home/raghav/Vibe COded Apps/sarina/android/app/
Backup: /home/raghav/Downloads/aa/

SHA-1 Fingerprints (ALL 3 REQUIRED IN FIREBASE):
- Debug SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
- Upload SHA-1: 59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0
- Play Store SHA-1: (from Play Console → App Signing - required for Play Store sign-in)

SHA-256: CB:74:30:60:C8:9C:38:73:30:34:4D:62:3A:D1:2D:03:1A:8A:31:D5:60:18:61:34:54:14:98:AC:F0:A8:64:22

Alias: bbabcdda9c8eb0477e426fe11be469b7
Store Password: a143b5cfe4ecd6dab8634e3534c7aa8b
Key Password: 494b078f33042e97e86675b3436ac1f2
```

⚠️ **NEVER COMMIT KEYSTORE OR PASSWORDS TO GIT**

### RevenueCat Configuration
```
Android API Key: goog_qBISvlOBwMSdZDaSmkawISvXGII
iOS API Key: appl_cGMSHwaYbbRwdhOiEgBPbOPykYP

Products:
- sarina_weekly_299 ($2.99/week)
- sarina_yearly_1299 ($12.99/year)

Entitlement: premium
Offering: default (current)
```

### Play Console
```
App: Katrina
Package: com.x8284.katrina
Status: Internal Testing / Production

Subscriptions:
- sarina_weekly_299 - $2.99/week
- sarina_yearly_1299 - $12.99/year
```

---

## 🚀 Quick Commands

### Build Release AAB
```bash
cd "/home/raghav/Vibe COded Apps/sarina/android"
./gradlew clean
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Build Debug APK
```bash
cd "/home/raghav/Vibe COded Apps/sarina"
npx expo run:android --variant debug
```

### Install Release Build
```bash
cd "/home/raghav/Vibe COded Apps/sarina/android"
./gradlew installRelease
```

### Verify AAB Signature
```bash
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

### Monitor App Logs
```bash
adb logcat | grep -E "Sarina|Firebase|RevenueCat|Google"
```

### Check Keystore SHA-1
```bash
keytool -list -v -keystore "/home/raghav/Vibe COded Apps/sarina/android/app/@propeers__katrina.jks" -alias bbabcdda9c8eb0477e426fe11be469b7 -storepass a143b5cfe4ecd6dab8634e3534c7aa8b
```

---

## 📝 Code Files Modified

### Firebase Configuration
- **File**: `android/app/google-services.json`
- **Status**: Configured for `com.x8284.katrina`
- **Project**: `sarina-ai-2b2c1`

### Authentication Service
- **File**: `app/services/authService.ts`
- **Lines**: 21-43
- **Changes**: Android OAuth Client ID added

### RevenueCat Service
- **File**: `app/services/revenueCatService.ts`
- **Lines**: 13-17
- **Changes**: Android API key updated to `goog_qBISvlOBwMSdZDaSmkawISvXGII`

### Build Configuration
- **File**: `android/app/build.gradle`
- **Lines**: 89-95
- **Config**: Package name `com.x8284.katrina`, Version Code 20

---

## ✅ Testing Checklist

Use this before every release:

### Pre-Build
- [ ] Version code incremented
- [ ] Version name updated
- [ ] Release notes prepared
- [ ] Keystore file present and accessible

### Build
- [ ] Clean build successful (`./gradlew clean`)
- [ ] Release AAB generated (`./gradlew bundleRelease`)
- [ ] AAB signature verified (`jarsigner -verify`)
- [ ] AAB size reasonable (~60-70MB)

### Installation Testing
- [ ] App installs on test device
- [ ] App launches without crashes
- [ ] No ANR (Application Not Responding) issues

### Authentication
- [ ] Google Sign-In works
- [ ] User created in Firebase Authentication
- [ ] User document created in Firestore

### Subscriptions
- [ ] Paywall displays
- [ ] Products show correct prices
- [ ] Can initiate purchase
- [ ] RevenueCat tracks customer

### Core Features
- [ ] Character selection works
- [ ] Voice calls connect
- [ ] Chat functionality works
- [ ] All screens navigate correctly

### Firebase Console Checks
- [ ] Check Authentication → Users
- [ ] Check Firestore → users collection
- [ ] Check Analytics (if enabled)

### RevenueCat Console Checks
- [ ] Check Customers appear
- [ ] Check subscriptions sync
- [ ] Verify offering displays

### Upload to Play Console
- [ ] AAB uploaded successfully
- [ ] Release created (Internal/Production)
- [ ] Release notes added
- [ ] Rollout initiated

---

## 🔧 Troubleshooting

### Build Fails
**Issue**: Gradle build errors

**Solutions**:
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew bundleRelease --stacktrace

# Check dependencies
./gradlew dependencies

# Sync Gradle files
./gradlew --refresh-dependencies
```

### Google Sign-In Fails
**Issue**: "Developer Error" or sign-in doesn't work

**Check**:
1. **ALL 3 SHA-1s** in Firebase Console:
   - Debug: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Upload: `59:30:FA:30:BE:13:F5:EE:DB:83:DF:09:64:08:ED:92:92:EE:CE:A0`
   - **Play Store**: From Play Console → App Signing (CRITICAL for Play Store downloads)
2. Package name in google-services.json: `com.x8284.katrina`
3. Web Client ID in authService.ts matches Firebase Console
4. Google Sign-In enabled in Firebase Console → Authentication

**Fix**:
- Verify google-services.json contains all 3 SHA-1s
- Rebuild app completely
- Uninstall and reinstall app

**Note**: If sign-in works in sideloaded APK but fails from Play Store, you're missing the Play Store SHA-1!

### Subscriptions Not Showing
**Issue**: Paywall empty or no products

**Check**:
1. Products active in Play Console
2. RevenueCat connected (green checkmark)
3. Products imported to RevenueCat
4. **CRITICAL**: Products attached to "premium" entitlement in RevenueCat Dashboard
5. Offering is "Current"
6. Wait 15-30 minutes for sync

**Fix**:
- Re-import products in RevenueCat
- **Verify products are attached to "premium" entitlement** (RevenueCat Dashboard → Products)
- Check RevenueCat API key: `goog_qBISvlOBwMSdZDaSmkawISvXGII`
- Verify offering configuration
- Use "Restore Purchases" button in app

### Backend Issues
**Issue**: API calls fail

**Check**:
1. Backend using correct Firebase project: `sarina-ai-2b2c1`
2. User authenticated successfully
3. Cloud Run logs for errors

**Fix**:
- Check Cloud Run service status
- Verify Firebase credentials in backend
- Check backend environment variables

### Keystore Issues
**Issue**: Can't sign APK/AAB

**Check**:
1. Keystore file exists: `android/app/@propeers__katrina.jks`
2. gradle.properties has correct credentials
3. Passwords are correct

**Fix**:
- Copy keystore from backup: `/home/raghav/Downloads/aa/`
- Verify gradle.properties configuration
- Never lose the keystore (can't update app without it!)

---

## 🔗 Important Links

### Google Services
- **Firebase Console**: https://console.firebase.google.com (Project: sarina-ai-2b2c1)
- **Google Cloud Console**: https://console.cloud.google.com (Project: sarina-ai-2b2c1)
- **Play Console**: https://play.google.com/console (App: Katrina)

### RevenueCat
- **Dashboard**: https://app.revenuecat.com
- **Documentation**: https://docs.revenuecat.com

### Development
- **Expo**: https://expo.dev
- **React Native**: https://reactnative.dev

---

## 📊 Version History

### Build 23 (v2.2.5) - Current ✅
- ✅ **Fixed Google Sign-In from Play Store** (added Play Store SHA-1)
- ✅ **Fixed subscription premium access** (attached products to entitlement)
- ✅ Updated google-services.json with all 3 SHA-1 fingerprints
- ✅ RevenueCat entitlements properly configured
- Status: **Production Ready**
- [Full Documentation](./BUILD_23_DOCUMENTATION.md)

### Build 22 (v2.2.4)
- ✅ Migrated to new package: `com.x8284.katrina`
- ✅ Firebase configured for new package
- ✅ Google Sign-In updated
- ✅ RevenueCat integrated
- ✅ Play Console subscriptions configured
- [Full Documentation](./BUILD_22_DOCUMENTATION.md)

### Previous Builds
- Builds 1-21: Migration and setup phases

---

## 🔐 Security Notes

### Never Commit These Files
```
android/app/@propeers__katrina.jks
android/gradle.properties (contains passwords)
android/app/google-services.json (optional, but recommended)
.env files
```

### Backup These Files Securely
```
@propeers__katrina.jks → Multiple secure locations
Keystore passwords → Password manager
Service account JSONs → Encrypted storage
```

### Access Control
- Keep Firebase, Google Cloud, Play Console access limited
- Use service accounts for CI/CD
- Rotate keys if compromised
- Monitor access logs

---

## 📂 Directory Structure

```
docs/android/
├── README.md (this file)
├── ANDROID_MIGRATION_FINAL_STATUS.md (⭐ BUILD & DEPLOY GUIDE)
├── ANDROID_MIGRATION_COMPLETE_GUIDE.md (⭐ SETUP REFERENCE)
├── GOOGLE_CLOUD_SERVICE_ACCOUNT_GUIDE.md (⭐ SERVICE ACCOUNT SETUP)
└── archive/
    ├── ANDROID_MIGRATION_CHANGES_APPLIED.md (older migration notes)
    └── ANDROID_RECONFIGURATION_GUIDE.md (original migration plan)
```

---

## 🆘 Need Help?

### For Build Issues
1. Read: `ANDROID_MIGRATION_FINAL_STATUS.md` → Troubleshooting section
2. Check: Gradle build logs with `--stacktrace`
3. Clean and rebuild

### For Configuration Issues
1. Read: `ANDROID_MIGRATION_COMPLETE_GUIDE.md`
2. Verify all settings match this README
3. Check Firebase Console and Play Console

### For RevenueCat Issues
1. Read: `GOOGLE_CLOUD_SERVICE_ACCOUNT_GUIDE.md`
2. Verify service account permissions
3. Check RevenueCat connection status

---

## ✨ Quick Reference

**Package**: `com.x8284.katrina`
**Firebase**: `sarina-ai-2b2c1`
**RevenueCat Key**: `goog_qBISvlOBwMSdZDaSmkawISvXGII`
**SHA-1s**: Upload: `59:30:...CE:A0`, Debug: `5E:8F:...F6:25`, Play Store: (from Play Console)

**Build Command**: `cd android && ./gradlew clean bundleRelease`
**Output**: `android/app/build/outputs/bundle/release/app-release.aab`
**Current Build**: 23 (v2.2.5)

---

**Last Updated**: 2026-03-29 (Build 23)
**Status**: ✅ Production Ready
**Latest Build**: [BUILD_23_DOCUMENTATION.md](./BUILD_23_DOCUMENTATION.md)
**Maintained By**: Claude & Raghav

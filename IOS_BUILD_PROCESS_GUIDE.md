# 🍎 iOS Build Process - Complete Guide

**Date:** February 14, 2026
**Build Number:** 5
**Version:** 1.3.9
**Status:** In Progress - Fixing pod installation issues

---

## 📝 What We're Doing

Building iOS version of Sarina app with full feature parity to Android, including:
- Voice calling with AI
- In-app purchase subscriptions
- Credit system with balance tracking
- Backend WebSocket integration

---

## ✅ Steps Completed So Far

### 1. Updated app.json Configuration ✅
**File:** `app.json`

**Changes Made:**
- Incremented build number: `4` → `5`
- Added iOS permissions:
  - `NSMicrophoneUsageDescription` - For voice calling
  - `NSSpeechRecognitionUsageDescription` - For speech recognition
  - `UIBackgroundModes: ["audio"]` - For background audio
- Configured network security (NSAppTransportSecurity)
- **REMOVED** Apple Pay entitlement (was causing provisioning errors)

**Current iOS configuration:**
```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.sarina.app",
  "buildNumber": "5",
  "appStoreId": "6758547730",
  "config": {
    "usesNonExemptEncryption": false
  },
  "infoPlist": {
    "NSMicrophoneUsageDescription": "Sarina needs access to your microphone for AI voice conversations with your companion.",
    "NSSpeechRecognitionUsageDescription": "Sarina uses speech recognition to understand your voice during conversations.",
    "UIBackgroundModes": ["audio"],
    "NSAppTransportSecurity": {
      "NSAllowsArbitraryLoads": false,
      "NSExceptionDomains": {
        "sarina-voice-backend-fv2lgy22ja-uc.a.run.app": {
          "NSExceptionAllowsInsecureHTTPLoads": false,
          "NSIncludesSubdomains": true,
          "NSExceptionRequiresForwardSecrecy": true,
          "NSExceptionMinimumTLSVersion": "TLSv1.2"
        }
      }
    }
  }
}
```

### 2. Fixed Podfile for Firebase Compatibility ✅
**File:** `ios/Podfile`

**Issue:** Firebase Swift pods couldn't integrate as static libraries
**Fix:** Added `use_modular_headers!` before target declaration

```ruby
prepare_react_native_project!

# Fix for Firebase and GoogleUtilities Swift pod compatibility
use_modular_headers!

target 'Sarina' do
  use_expo_modules!
  # ... rest of config
end
```

### 3. Removed Apple Pay Entitlement ✅
**Issue:** Provisioning profile didn't support Apple Pay capability
**Fix:** Removed `com.apple.developer.in-app-payments` entitlement

**Note:** For IAP (In-App Purchases) with StoreKit, we don't need Apple Pay entitlements. StoreKit works without special entitlements.

### 4. Git Commits Made ✅

**Commits on branch `feature/ios-subscriptions`:**
1. `02b7e9c` - Configure iOS build 5 with full feature parity to Android
2. `6d2790e` - Add iOS Build 5 documentation and status
3. `a702f14` - Fix iOS build: Add use_modular_headers for Firebase compatibility
4. `91e8ab6` - Fix iOS: Remove Apple Pay entitlement, use StoreKit IAP only

**All changes pushed to GitHub** ✅

---

## 🔧 Current Issue

**Build failing at:** "Install pods" phase

**Error:** Unknown error during CocoaPods installation

**Likely causes:**
1. Pod dependency conflict
2. React Native version incompatibility
3. Firebase/Google pods version mismatch

---

## 🔄 How to Continue (If Laptop Switches Off)

### Quick Resume Steps:

```bash
# 1. Navigate to project
cd "/home/raghav/Vibe COded Apps/sarina"

# 2. Pull latest changes
git pull origin feature/ios-subscriptions

# 3. Check build status on EAS
npx eas build:list --platform ios --limit 5

# 4. If last build failed, try again:
npx eas build --platform ios --profile production --non-interactive
```

### Full Rebuild from Scratch:

```bash
cd "/home/raghav/Vibe COded Apps/sarina"

# 1. Clean prebuild
npx expo prebuild --platform ios --clean

# 2. Commit if changes
git add -A
git commit -m "Rebuild iOS native project"
git push origin feature/ios-subscriptions

# 3. Trigger build
npx eas build --platform ios --profile production --non-interactive
```

---

## 🐛 Troubleshooting Build Failures

### Issue: Pod Installation Fails

**Solution 1: Check package.json dependencies**
```bash
# Verify these packages are present:
cat package.json | grep -E "react-native-iap|@react-native-firebase"
```

**Solution 2: Try without Firebase Analytics Ad IDs**
Add to Podfile before `target 'Sarina'`:
```ruby
$RNFirebaseAnalyticsWithoutAdIdSupport = true
```

**Solution 3: Use dynamic frameworks instead of static**
In Podfile, after `use_modular_headers!`:
```ruby
use_frameworks! :linkage => :dynamic
```

### Issue: Provisioning Profile Errors

**Error:** "Profile doesn't support X capability"

**Solution:**
1. Remove the entitlement from app.json
2. Rebuild: `npx expo prebuild --platform ios --clean`
3. Try build again

### Issue: Code Signing Errors

**Solution:** EAS manages credentials automatically. If issues persist:
```bash
# Clear credentials and regenerate
npx eas credentials --platform ios
# Select "Remove all credentials" then rebuild
```

---

## 📦 Package Dependencies (iOS)

### Core Dependencies:
- `react-native-iap`: ^14.7.10 (for IAP/subscriptions)
- `@react-native-firebase/app`: For Firebase core
- `@react-native-firebase/analytics`: For analytics
- `@react-native-google-signin/google-signin`: For auth
- `expo-av`: For audio/voice
- `react-native-gesture-handler`: For gestures
- `react-native-safe-area-context`: For safe areas
- `react-native-screens`: For navigation

### iOS-Specific Pods (Auto-installed):
- GoogleSignIn
- Firebase (Core, Analytics, Installations)
- NitroIap (boost for react-native-iap)
- SDWebImage (for images)
- Hermes (JS engine)

---

## 🎯 Expected Build Process

When build succeeds, you'll see:

```
1. ✅ Install dependencies (2-3 min)
2. ✅ Read app config
3. ✅ Run expo doctor
4. ✅ Prepare credentials
5. ✅ Prebuild
6. ✅ Install pods (5-8 min) ← Currently failing here
7. ⏳ Run fastlane (10-15 min)
8. ⏳ Upload artifacts (2-3 min)
9. ⏳ Build complete!

Total ETA: 20-30 minutes
```

---

## 📱 After Successful Build

### 1. Download Build (Optional)
```bash
# Get build ID from logs
BUILD_ID="<build-id-from-output>"

# Download IPA
npx eas build:download --id $BUILD_ID --output ~/Downloads/Sarina.ipa
```

### 2. Submit to App Store
```bash
# Auto-submit (recommended)
npx eas submit --platform ios --latest

# Or specify build
npx eas submit --platform ios --id $BUILD_ID
```

### 3. Submission Details
**Apple ID:** geekyraghav13@gmail.com
**App Store Connect ID:** 6758547730
**Bundle ID:** com.sarina.app

**What happens:**
- IPA uploaded to App Store Connect
- Build appears in TestFlight within 10-15 minutes
- Can add testers or submit for App Review

---

## 🔑 App Store Connect Requirements

### Before Submission:

1. **Subscription Products Must Exist:**
   - `com.sarina.app.weekly` - Weekly subscription
   - `com.sarina.app.yearly` - Yearly subscription

2. **App Metadata:**
   - Privacy Policy URL
   - Terms of Service URL
   - App description
   - Screenshots (required)
   - Keywords

3. **Review Information:**
   - Demo account credentials (if needed)
   - Notes for reviewer
   - Contact information

---

## 💡 Alternative: Build Locally (If EAS Keeps Failing)

**Requirements:** macOS with Xcode

```bash
# On macOS:
cd "/home/raghav/Vibe COded Apps/sarina"

# Install pods
cd ios && pod install

# Open in Xcode
open Sarina.xcworkspace

# In Xcode:
# 1. Select "Sarina" scheme
# 2. Select "Any iOS Device" as destination
# 3. Product → Archive
# 4. Distribute App → App Store Connect
```

---

## 🔍 Current Build Attempts

| Build ID | Status | Issue | Fix Applied |
|----------|--------|-------|-------------|
| a8a47af5... | ❌ Failed | Firebase Swift pod error | Added `use_modular_headers!` |
| 73224d42... | ❌ Failed | Apple Pay entitlement error | Removed Apple Pay entitlement |
| e991adf5... | ❌ Failed | Same as above | (retry after Podfile fix) |
| 1230b9c5... | ❌ Failed | Pod installation error | Investigating... |

---

## 📊 Next Actions

### Immediate:
1. Check build logs for specific pod error
2. Try adding Firebase Analytics flag to Podfile
3. If still failing, consider:
   - Removing Firebase Analytics temporarily
   - Using different React Native Firebase version
   - Building locally on macOS

### Alternative Approach:
If EAS builds continue to fail, we can:
1. Build locally on macOS
2. Or simplify dependencies (remove Firebase Analytics)
3. Or wait for EAS support to investigate

---

## 📞 Getting Help

### EAS Build Issues:
- Expo Discord: https://chat.expo.dev
- EAS Support: https://expo.dev/support
- Build logs: https://expo.dev/accounts/8284/projects/sarina/builds

### CocoaPods Issues:
- Run `pod repo update` on macOS
- Check: https://github.com/CocoaPods/CocoaPods/issues
- Clear pod cache: `pod cache clean --all`

---

## 📝 Important Files

**Configuration:**
- `/home/raghav/Vibe COded Apps/sarina/app.json` - Main config
- `/home/raghav/Vibe COded Apps/sarina/eas.json` - EAS build config
- `/home/raghav/Vibe COded Apps/sarina/ios/Podfile` - iOS dependencies

**Documentation:**
- `IOS_BUILD_5_SUMMARY.md` - Build 5 overview
- `IOS_BUILD_PROCESS_GUIDE.md` - This file
- `MILESTONE_PLAN.md` - Original project plan

---

## 🎯 Success Criteria

When build succeeds:
- ✅ Build status: "Finished"
- ✅ IPA file available for download
- ✅ Can submit to App Store Connect
- ✅ TestFlight build appears within 15 min
- ✅ Can add testers or submit for review

---

## 🔄 Quick Reference Commands

```bash
# Check build status
npx eas build:list --platform ios --limit 5

# Start new build
npx eas build --platform ios --profile production --non-interactive

# View specific build
npx eas build:view

# Submit to App Store
npx eas submit --platform ios --latest

# Check EAS login
npx eas whoami

# Pull latest code
git pull origin feature/ios-subscriptions

# Rebuild iOS native
npx expo prebuild --platform ios --clean
```

---

**Document Created:** February 14, 2026, 1:20 AM IST
**Last Updated:** February 14, 2026, 1:20 AM IST
**Status:** Build in progress - troubleshooting pod installation
**Next Update:** After successful build or new fix attempt

---

## 💾 Save This Document!

This guide contains everything needed to continue the iOS build process if your laptop switches off or you need to resume later.

Key points:
1. All code is committed to GitHub (branch: `feature/ios-subscriptions`)
2. Build config is in `app.json` and `ios/Podfile`
3. Use EAS CLI commands above to check status and retry
4. If EAS fails repeatedly, can build locally on macOS

**Good luck! The build should succeed soon once we resolve the pod installation issue.** 🚀

# Sarina AI Companion - Documentation

Welcome to the Sarina project documentation. This folder contains all guides, build history, and milestone documentation.

## Quick Navigation

### 📱 Build Guides

#### Android (Primary) 🤖
- **[Android Documentation](android/README.md)** - ⭐ **START HERE** - Complete Android setup & build guide
- **[Android Build & Deploy](android/ANDROID_MIGRATION_FINAL_STATUS.md)** - Current build instructions
- **[Android Setup Reference](android/ANDROID_MIGRATION_COMPLETE_GUIDE.md)** - Complete configuration guide
- [Service Account Setup](android/GOOGLE_CLOUD_SERVICE_ACCOUNT_GUIDE.md) - RevenueCat connection guide

#### iOS 🍎
- **[iOS Build Guide](ios-builds/README.md)** - Complete guide for building and submitting iOS builds
- [iOS Build History](build-history/ios/) - Historical iOS build documentation

### 📚 Development Guides
- [Deployment Guide](guides/DEPLOYMENT_GUIDE.md) - Backend and cloud deployment
- [Testing Guide](guides/TESTING_GUIDE.md) - Testing procedures and best practices
- [Troubleshooting Guide](guides/TROUBLESHOOTING_GUIDE.md) - Common issues and solutions
- [Firestore Schema](guides/FIRESTORE_SCHEMA.md) - Database structure documentation

### 🎯 Project Milestones
- [Milestone Plan](milestones/MILESTONE_PLAN.md) - Original project roadmap
- [Milestone 2 Status](milestones/MILESTONE2_FINAL_STATUS.md)
- [Milestone 3 Status](milestones/MILESTONE3_READY_FOR_TESTING.md)
- [Milestone 4 Status](milestones/MILESTONE4_COMPLETION_SUMMARY.md)
- [Next Steps](milestones/NEXT_STEPS.md)

### ✅ Checklists
- [Production Readiness](guides/PRODUCTION_READINESS_CHECKLIST.md)
- [Test Automation](guides/TEST_AUTOMATION_CHECKLIST.md)

## Project Structure

```
docs/
├── README.md                              # This file
├── android/                               # ⭐ ANDROID DOCS (PRIMARY)
│   ├── README.md                          # Android documentation index
│   ├── ANDROID_MIGRATION_FINAL_STATUS.md  # Build & deploy guide
│   ├── ANDROID_MIGRATION_COMPLETE_GUIDE.md # Setup reference
│   ├── GOOGLE_CLOUD_SERVICE_ACCOUNT_GUIDE.md
│   └── archive/                           # Archived Android docs
├── ios-builds/                            # iOS build documentation
│   ├── README.md                          # iOS documentation index
│   ├── IOS_BUILD_GUIDE.md
│   ├── BUILD_*.md                         # iOS build records
│   └── ...
├── build-history/                         # Historical documentation
│   ├── ios/                               # Historical iOS builds
│   ├── BUILD_13_ALL_FIXES.md
│   ├── BUILD_13_CRITICAL_FIX.md
│   ├── CALL_FLOW_VERIFICATION.md
│   └── RELEASE_NOTES_v1.3.9.md
├── guides/                                # Development guides
│   ├── DEPLOYMENT_GUIDE.md
│   ├── FIRESTORE_SCHEMA.md
│   ├── PRODUCTION_READINESS_CHECKLIST.md
│   ├── TEST_AUTOMATION_CHECKLIST.md
│   ├── TESTING_GUIDE.md
│   └── TROUBLESHOOTING_GUIDE.md
└── milestones/                            # Project milestone documentation
    └── ...
```

## Key Information

### App Details
- **Name:** Sarina AI Companion
- **Platform:** iOS and Android (React Native/Expo)
- **Backend:** Google Cloud Run (Node.js)
- **Database:** Firebase Firestore
- **AI Provider:** Google Gemini

### iOS Configuration
- **Bundle ID:** com.sarina.app
- **App Store ID:** 6758547730
- **Current Version:** 1.3.9
- **Build Number:** 13

### Android Configuration
- **Package:** com.x8284.katrina
- **App Name:** Sarinaa
- **Version Code:** 23
- **Current Version:** 2.2.5
- **Play Console:** Katrina app
- **Status:** ✅ Production Ready

## Quick Start

### Building iOS
```bash
npx eas build --platform ios --profile production
```

### Submitting to App Store
```bash
npx eas submit --platform ios --latest
```

### Building Android
```bash
# Clean and build release AAB
cd android
./gradlew clean
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

See [Android Documentation](android/README.md) for complete instructions.

## Getting Help

- Check the [Troubleshooting Guide](guides/TROUBLESHOOTING_GUIDE.md)
- Review [iOS Build Guide](IOS_BUILD_GUIDE.md) for build issues
- See [Testing Guide](guides/TESTING_GUIDE.md) for testing help

## Recent Updates

### March 29, 2026 - Build 23 Released ✅
- ✅ **Fixed Google Sign-In from Play Store** (added Play Store SHA-1)
- ✅ **Fixed subscription premium access** (attached products to entitlement)
- ✅ Updated google-services.json with all 3 SHA-1 fingerprints
- ✅ RevenueCat entitlements properly configured
- ✅ Version 2.2.5 (Build 23) production ready

### March 29, 2026 - Android Migration Complete ✅
- ✅ Android migrated to new package: `com.x8284.katrina`
- ✅ Firebase configured for new package
- ✅ RevenueCat integrated with subscriptions
- ✅ Play Console products created
- ✅ All Android docs organized in `docs/android/`
- ✅ Created comprehensive Android documentation

### March 3, 2026
- ✅ Removed failed auto-submit iOS scripts
- ✅ Organized all documentation into structured folders
- ✅ Created comprehensive iOS Build Guide
- ✅ Cleaned up root directory

### Build History
- **Build 23 (Android):** Latest Android build - Critical fixes for sign-in and subscriptions (v2.2.5)
- **Build 22 (Android):** Android migration to Sarinaa (com.x8284.katrina) (v2.2.4)
- **Build 13 (iOS):** Latest iOS build with subscriptions and voice calling
- Previous build documentation available in `build-history/`

---

For main project information, see the [root README](../README.md).

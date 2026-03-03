# Sarina AI Companion - Documentation

Welcome to the Sarina project documentation. This folder contains all guides, build history, and milestone documentation.

## Quick Navigation

### 📱 Build Guides
- **[iOS Build Guide](IOS_BUILD_GUIDE.md)** - Complete guide for building and submitting iOS builds
- [iOS Build History](build-history/ios/) - Historical iOS build documentation
- [Android Build History](build-history/android/) - Android build documentation

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
├── README.md                     # This file
├── IOS_BUILD_GUIDE.md           # Main iOS build guide
├── build-history/               # Historical build documentation
│   ├── ios/                     # iOS-specific builds
│   ├── android/                 # Android-specific builds
│   ├── BUILD_13_ALL_FIXES.md
│   ├── BUILD_13_CRITICAL_FIX.md
│   ├── CALL_FLOW_VERIFICATION.md
│   └── RELEASE_NOTES_v1.3.9.md
├── guides/                      # Development guides
│   ├── DEPLOYMENT_GUIDE.md
│   ├── FIRESTORE_SCHEMA.md
│   ├── PRODUCTION_READINESS_CHECKLIST.md
│   ├── TEST_AUTOMATION_CHECKLIST.md
│   ├── TESTING_GUIDE.md
│   └── TROUBLESHOOTING_GUIDE.md
└── milestones/                  # Project milestone documentation
    ├── FINAL_UPDATE.md
    ├── MILESTONE_PLAN.md
    ├── MILESTONE2_FINAL_STATUS.md
    ├── MILESTONE3_IMPLEMENTATION.md
    ├── MILESTONE3_READY_FOR_TESTING.md
    ├── MILESTONE4_COMPLETION_SUMMARY.md
    ├── MILESTONE4_INTEGRATION_TESTING.md
    └── NEXT_STEPS.md
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
- **Version Code:** 20
- **Current Version:** 2.2.3

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
cd android
./gradlew assembleRelease
```

## Getting Help

- Check the [Troubleshooting Guide](guides/TROUBLESHOOTING_GUIDE.md)
- Review [iOS Build Guide](IOS_BUILD_GUIDE.md) for build issues
- See [Testing Guide](guides/TESTING_GUIDE.md) for testing help

## Recent Updates

### March 3, 2026
- ✅ Removed failed auto-submit iOS scripts
- ✅ Organized all documentation into structured folders
- ✅ Created comprehensive iOS Build Guide
- ✅ Cleaned up root directory

### Build History
- **Build 13 (iOS):** Latest iOS build with subscriptions and voice calling
- Previous build documentation available in `build-history/ios/`

---

For main project information, see the [root README](../README.md).

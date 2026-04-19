# Sarina AI - AI Companion Mobile App

A React Native mobile application featuring AI-powered conversations and voice calling with multiple AI characters.

![Version](https://img.shields.io/badge/version-2.8.2-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%2B%20Android-green.svg)
![Status](https://img.shields.io/badge/status-production-success.svg)

---

## Features

- 💬 **AI Chat** - Real-time conversations with AI characters
- 🎙️ **Voice Calling** - AI voice calls with credit system
- 🔐 **Authentication** - Google Sign-In with Firebase
- 💰 **Monetization** - Subscription + credit-based voice calls
- 📊 **Analytics** - Firebase Analytics integration
- ☁️ **Cloud Functions** - Automated credit management and crash recovery

---

## Tech Stack

**Frontend:**
- React Native (Expo SDK 54)
- TypeScript
- React Navigation
- Zustand (State Management)

**Backend:**
- Firebase (Auth, Firestore, Analytics, Cloud Functions)
- Vapi (Voice AI)
- RevenueCat (Subscriptions)
- Google Cloud Monitoring

---

## Project Structure

```
sarina/
├── app/
│   ├── components/      # Reusable UI components
│   ├── screens/         # App screens
│   ├── services/        # API and Firebase services
│   ├── store/           # Zustand state management
│   └── config/          # Configuration files
├── functions/           # Cloud Functions
├── docs/                # Documentation
├── android/             # Android native code
└── ios/                 # iOS native code
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI
- Firebase project
- Android Studio / Xcode

### Installation

```bash
# Clone repository
git clone <repository-url>
cd sarina

# Install dependencies
npm install

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

---

## Documentation

All documentation is organized in the `/docs` folder:

- **[docs/INDEX.md](./docs/INDEX.md)** - Complete documentation index
- **[docs/current/](./docs/current/)** - Current production documentation
- **[docs/guides/](./docs/guides/)** - Implementation guides

### Key Documents

- **[ANALYTICS_MONITORING_COMPLETE.md](./docs/current/ANALYTICS_MONITORING_COMPLETE.md)** - Analytics & monitoring implementation
- **[DEPLOYMENT_READY.md](./docs/current/DEPLOYMENT_READY.md)** - Production deployment guide
- **[IMPLEMENTATION_SUMMARY.md](./docs/current/IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

---

## Features Overview

### Voice Credit System

- Batched credit deduction (10s intervals)
- Atomic Firestore operations
- Crash recovery mechanism
- Zero-balance policy (no negative credits)
- 90% cost reduction vs per-second billing

### Analytics & Monitoring

- Firebase Analytics with 10+ monetization events
- Cloud Monitoring with automated alerts
- Flagged accounts review system
- Real-time dashboard for operations

### Security

- Server-side credit validation
- Firestore security rules
- Atomic transactions prevent double-charge
- Encrypted authentication with Firebase

---

## Deployment

### Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

### Mobile App

```bash
# Android Release
cd android && ./gradlew assembleRelease

# iOS Release (via Xcode or EAS)
eas build --platform ios
```

---

## Configuration

Required configuration files (not included in repository):

- `google-services.json` - Firebase config for Android
- `GoogleService-Info.plist` - Firebase config for iOS
- `.env` files - API keys and secrets

See [docs/guides/](./docs/guides/) for setup instructions.

---

## License

Private project - All rights reserved

---

## Support

For detailed documentation and guides, see the `/docs` folder.

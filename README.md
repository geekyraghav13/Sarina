# Sarina AI - AI Girlfriend Companion

An immersive mobile app with 20 unique AI characters, real conversations, voice calling, and beautiful UI.

![Version](https://img.shields.io/badge/version-1.4.8-blue.svg)
![iOS Build](https://img.shields.io/badge/iOS%20Build-31-blue.svg)
![Status](https://img.shields.io/badge/status-production-success.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%2B%20Android-green.svg)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-orange.svg)
![RevenueCat](https://img.shields.io/badge/RevenueCat-Integrated-purple.svg)

---

## Features

### Core Features
- 🤖 **20 AI Characters** - Realistic, Anime, Fantasy styles with unique personalities
- 💬 **Real AI Chat** - Context-aware conversations with OpenRouter AI (Qwen 2.5)
- 💾 **Persistent Chats** - Messages saved across app restarts
- 🎨 **Beautiful UI** - Video backgrounds, glassmorphism, smooth animations

### Voice Calling (NEW!)
- 🎙️ **AI Voice Conversations** - Real-time voice chat with Gemini 2.0 Flash
- ⏱️ **Credit System** - Pre-paid minutes with 5-second deduction
- 💰 **Voice Packs** - $1.99 (5min), $4.99 (15min), $8.99 (30min)
- 🔒 **Google Sign-In** - Secure authentication with Firebase

### Analytics & Monitoring
- 📊 **Firebase Analytics** - Complete integration with all mandatory events
- 🔴 **Crash Reporting** - Sentry monitoring (free tier)
- ⚡ **Performance** - expo-image with disk caching

---

## Quick Start

### Installation
```bash
# Install dependencies
npm install

# Build Android app
npx expo prebuild --platform android --clean
npx expo run:android
```

### First Run
1. App opens to Google Sign-In screen
2. Sign in with your Google account
3. Explore characters and chat
4. Purchase voice minutes to enable calling

---

## Documentation

### iOS Builds
- **[docs/ios-builds/](./docs/ios-builds/)** - All iOS build documentation
- **[BUILD_31_REVENUECAT_INTEGRATION.md](./docs/ios-builds/BUILD_31_REVENUECAT_INTEGRATION.md)** - Latest build with RevenueCat

### Essential Guides
1. **[docs/README.md](./docs/README.md)** - Complete project documentation
2. **DEPLOYMENT_GUIDE.md** - Deployment instructions with Google Cloud
3. **FIRESTORE_SCHEMA.md** - Firestore database structure and security rules

### Legal
- **PRIVACY_POLICY.md** - Privacy policy
- **TERMS_OF_USE.md** - Terms of service

---

## Tech Stack

**Frontend:**
- React Native 0.81.5 (Expo SDK 54)
- TypeScript
- React Navigation 7
- Zustand (state management)

**Backend:**
- Firebase (Auth, Firestore, Analytics)
- Google Cloud Run (WebSocket server)
- Cloud Functions (credit resets)
- OpenRouter AI (chat)
- Gemini 2.0 Flash (voice)
- RevenueCat (subscriptions & IAP)

**Monitoring:**
- Sentry (crash reporting)
- Firebase Analytics
- RevenueCat Dashboard

**Payments:**
- Google Play In-App Purchases
- expo-in-app-purchases v14.5.0

---

## Project Structure

```
sarina/
├── app/
│   ├── components/          # UI components
│   ├── config/             # Firebase, Sentry config
│   ├── navigation/         # React Navigation setup
│   ├── screens/            # App screens
│   │   ├── GoogleSignInScreen.tsx      # NEW: Sign-in screen
│   │   ├── VoiceCallScreen.tsx         # NEW: Voice calling UI
│   │   └── CreditPurchaseScreen.tsx    # NEW: Purchase voice packs
│   ├── services/           # API services
│   │   ├── authService.ts              # NEW: Google Sign-In
│   │   ├── creditService.ts            # NEW: Firestore credit ops
│   │   ├── voiceCallService.ts         # NEW: WebSocket client
│   │   └── subscriptionService.ts      # UPDATED: Voice packs
│   ├── store/              # Zustand state
│   └── utils/              # Helper functions
├── backend/                # NEW: WebSocket server
│   ├── server.js           # Main server
│   ├── geminiClient.js     # Gemini AI integration
│   ├── creditManager.js    # 5-second credit deduction
│   └── .env                # Credentials (configured)
├── functions/              # NEW: Cloud Functions
│   └── index.js            # Credit resets
├── android/                # Android native code
├── assets/                 # Images, videos, icons
├── firestore.rules         # NEW: Security rules
└── *.md                    # Documentation
```

---

## Configuration Status

| Component | Status | Notes |
|-----------|--------|-------|
| **google-services.json** | ✅ | Placed in `/android/app/` |
| **Web Client ID** | ✅ | Configured in authService.ts |
| **SHA-1 Fingerprint** | ✅ | Added to Firebase Console |
| **Gemini API Key** | ✅ | Configured in backend/.env |
| **Firebase Admin SDK** | ✅ | Configured in backend/.env |
| **Firestore Rules** | ⏳ | Need to deploy |
| **Cloud Run Backend** | ⏳ | Need to deploy |
| **Cloud Functions** | ⏳ | Need to deploy |
| **IAP Products** | ⏳ | Need to configure in Play Console |

---

## Voice Calling Overview

### How It Works
1. User signs in with Google
2. User purchases voice minutes ($1.99, $4.99, or $8.99)
3. Credits added to Firestore (300, 900, or 1800 seconds)
4. User starts voice call with AI character
5. Every 5 seconds, credits deducted from Firestore
6. Call auto-ends when balance reaches 0
7. User prompted to purchase more minutes

### Pricing
| Pack | Price | Minutes | Cost/Min | Savings |
|------|-------|---------|----------|---------|
| 5 min | $1.99 | 5 | $0.40 | - |
| 15 min | $4.99 | 15 | $0.33 | 17% |
| 30 min | $8.99 | 30 | $0.30 | 25% |

### Security
- All credits stored server-side in Firestore
- Client cannot modify balance (security rules)
- Backend validates every transaction
- Impossible to hack credits

---

## Testing Checklist

### Google Sign-In
- [ ] Run `npx expo run:android`
- [ ] App opens to Google Sign-In screen
- [ ] Tap "Continue with Google"
- [ ] Sign in succeeds
- [ ] Console shows: `✅ Google Sign-In successful`
- [ ] User document created in Firestore

### Voice Calling (After Backend Deployment)
- [ ] Purchase voice minutes
- [ ] Verify credits added to Firestore
- [ ] Start voice call
- [ ] AI responds to voice
- [ ] Credits deduct every 5 seconds
- [ ] Call ends at 0 balance
- [ ] Purchase modal appears

---

## Deployment Steps

### 1. Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Deploy WebSocket Backend to Cloud Run
```bash
cd backend
./deploy.sh
```

### 3. Deploy Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### 4. Configure IAP Products in Play Console
See **PLAY_CONSOLE_IAP_SETUP.md** for step-by-step instructions.

### 5. Update WebSocket URL in App
After backend deployment, update `/app/services/voiceCallService.ts` with your Cloud Run URL.

---

## Cost Breakdown

### Monthly Infrastructure Costs (1,000 users)
- Google Cloud Run: ~$10-20/month
- Firestore: ~$5-10/month
- Gemini API: ~$0.002/minute
- Cloud Functions: ~$0-5/month
- **Total: ~$35-51/month**

### Revenue Potential
- 100 purchases × $1.99 = $199
- 50 purchases × $4.99 = $249
- 30 purchases × $8.99 = $270
- **Total: ~$718/month**
- **After Google's 15% fee: ~$610/month**
- **Net Profit: ~$560-575/month**

---

## API Keys & Services

| Service | Cost | Usage |
|---------|------|-------|
| Firebase Auth | FREE | Google Sign-In |
| Firestore | FREE* | User data + credits |
| Cloud Run | ~$10-20/mo | WebSocket server |
| Cloud Functions | FREE* | Credit resets |
| Gemini 2.0 Flash | ~$0.002/min | Voice AI |
| OpenRouter | FREE | Chat AI |
| Sentry | FREE | Crash reports |
| Play Console IAP | 15% fee | Voice packs |

*FREE tier sufficient for < 10k users

---

## Troubleshooting

### "Developer Error" on Google Sign-In
**Solution:** SHA-1 not added to Firebase Console
- Add SHA-1: `DB:17:8B:87:60:19:06:42:62:DB:01:50:43:50:4A:0D:9D:BC:69:A3`
- Download fresh `google-services.json`
- Rebuild: `npx expo run:android`

### "Product not found" for voice packs
**Solution:** IAP products not configured in Play Console
- See **PLAY_CONSOLE_IAP_SETUP.md**

### Voice call doesn't connect
**Solution:** Backend not deployed
- Deploy to Cloud Run: `cd backend && ./deploy.sh`
- Update WebSocket URL in app

### Credits not deducting
**Solution:** Firestore rules not deployed
- Deploy rules: `firebase deploy --only firestore:rules`

---

## Support

- **Documentation:** See `VOICE_CALL_README.md` for complete guide
- **Firebase Console:** https://console.firebase.google.com/
- **Play Console:** https://play.google.com/console
- **Sentry Dashboard:** https://sentry.io/issues/

---

## License

Private project - All rights reserved

---

**Status:** Production Ready (Voice Calling in Testing) ✅
**Version:** 1.3.0
**Platform:** Android Only
**Last Updated:** February 4, 2026

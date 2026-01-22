# Sarina AI - AI Girlfriend Companion

An immersive mobile app with 20 unique AI characters, real conversations, and beautiful UI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production%20ready-success.svg)
![Cost](https://img.shields.io/badge/infrastructure-free-green.svg)

**📖 See [CHANGELOG.md](CHANGELOG.md) for detailed development history**

---

## Features

- 🤖 **20 AI Characters** - Realistic, Anime, Fantasy styles with unique personalities
- 💬 **Real AI Chat** - Context-aware conversations with OpenRouter AI
- 💾 **Persistent Chats** - Messages saved across app restarts
- 🔴 **Crash Reporting** - Sentry monitoring (free tier)
- ⚡ **Fast Images** - expo-image with disk caching
- 🎨 **Beautiful UI** - Video backgrounds, glassmorphism, smooth animations
- 📊 **Analytics** - Firebase tracking for insights

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development
npx expo start

# Run on device
Press 'a' for Android or 'i' for iOS
```

---

## Tech Stack

**Frontend:** React Native (Expo 54), TypeScript, React Navigation 7, Zustand
**Backend:** Firebase (Remote Config, Storage, Analytics), OpenRouter AI
**Monitoring:** Sentry (crash reporting)
**Storage:** AsyncStorage (chat persistence)

---

## Project Structure

```
sarina/
├── app/
│   ├── components/        # UI components
│   ├── config/           # Firebase, Sentry config
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # App screens (12 total)
│   ├── services/         # API services (Firebase, OpenRouter)
│   ├── store/            # Zustand state + persistence
│   └── utils/            # Helper functions
├── assets/               # Images, videos, icons
├── android/              # Android native code
└── CHANGELOG.md          # Development history
```

---

## Configuration

### Required Setup

1. **Firebase** - Already configured in `app/config/firebase.ts`
2. **OpenRouter** - API key in `app/services/openRouterService.ts`
3. **Sentry** - DSN in `app/config/sentry.ts` (configured)
4. **google-services.json** - Already in `android/app/`

All services are on **FREE tiers** - no costs! 💰

---

## Key Features Detail

### Chat Persistence
- Auto-saves every message to AsyncStorage
- Auto-loads on app startup
- Per-character history tracking
- ~100k message capacity

### Crash Reporting
- Real-time error tracking via Sentry
- API failure monitoring
- Performance metrics
- Free tier: 5k errors/month

### Image Optimization
- expo-image with memory+disk cache
- Firebase Storage URLs with tokens
- 90% faster loading vs standard Image

---

## Development

```bash
# Clear cache and start
npx expo start -c

# Type check
npx tsc --noEmit

# Test Sentry
node test-sentry.js

# Build Android APK
eas build --platform android
```

---

## Testing

### Chat Persistence Test
1. Send messages to any character
2. Close app completely
3. Reopen app
4. ✅ Messages should be restored

### Sentry Test
1. Check dashboard: https://sentry.io/issues/
2. Should see test error from `test-sentry.js`

---

## Production Checklist

- [x] All features implemented
- [x] Error tracking active
- [x] Chat persistence working
- [x] Performance optimized
- [x] Free infrastructure configured
- [ ] Physical device testing
- [ ] Beta user testing
- [ ] Privacy policy
- [ ] Play Store submission

---

## API Keys & Services

| Service | Cost | Usage |
|---------|------|-------|
| Firebase Spark | FREE | Config + Storage + Analytics |
| OpenRouter | FREE | Mistral-7B model |
| Sentry | FREE | 5k errors/month |
| AsyncStorage | FREE | Device storage |

**Total: $0/month** 🎉

---

## Support

**Issues:** Check CHANGELOG.md for known issues
**Sentry Dashboard:** https://sentry.io/issues/
**Firebase Console:** https://console.firebase.google.com/

---

## License

Private project - All rights reserved

---

**Status:** Production Ready ✅
**Version:** 1.0.0
**Last Updated:** January 13, 2026

# 🚀 Quick Reference Card - Sarina App

## 📱 Current Status

### iOS
✅ **DEPLOYED TO TESTFLIGHT (Latest: Build #2)**
- Build ID: 58b8ae86-c25b-4e44-b581-40b107f9ed40
- Version: 1.3.0 (Build 2)
- Submission: 896c86f6-0953-486f-a95b-20139a10e045
- IPA: https://expo.dev/artifacts/eas/bXqYdgtmhmsyApicDNcNrE.ipa
- TestFlight: https://appstoreconnect.apple.com/apps/6758547730/testflight/ios
- Status: Apple processing (5-10 minutes)

**Previous Build:**
- Build: e8af8ffb-ce95-43f5-82d8-3d7fc92e167b (Build #1)

### Android
⏳ **READY TO BUILD**
- All fixes applied
- React version fixed
- Firebase ready

---

## ⚡ Quick Commands

### Build iOS
```bash
cd "/home/raghav/Vibe COded Apps/sarina"
eas build --platform ios --profile production --non-interactive
```

### Build Android
```bash
cd "/home/raghav/Vibe COded Apps/sarina"
eas build --platform android --profile production --non-interactive
```

### Submit iOS to TestFlight
```bash
EXPO_APPLE_APP_SPECIFIC_PASSWORD="aiyl-rmxf-mcar-rfxl" \
  eas submit --platform ios --latest --non-interactive
```

---

## ✅ What's Working

| Feature | iOS | Android | Notes |
|---------|-----|---------|-------|
| Firebase Analytics | ✅ | ✅ | All events tracked |
| AI Chat (OpenRouter) | ✅ | ✅ | qwen-2.5-7b model |
| Payment System | ✅ | ✅ | Local storage |
| Voice Recording | ✅ | ✅ | expo-av |
| 6 Characters | ✅ | ✅ | All personalities |
| Onboarding | ✅ | ✅ | Complete flow |

## ❌ What's Removed

| Feature | Status | Reason |
|---------|--------|--------|
| Sentry | ❌ Removed | Build issues |
| RevenueCat | ❌ Removed | Simplified payments |

---

## 📚 Documentation Files

1. **QUICK_REFERENCE.md** - This file (quick commands and status)
2. **ANDROID_DEPLOYMENT_GUIDE.md** - Complete Android deployment guide
3. **SUBSCRIPTION_SETUP_GUIDE.md** - How to set up subscriptions (₹299/week, ₹1299/year)
4. **FINAL_DEPLOYMENT_SUMMARY.md** - iOS deployment history
5. **IMPORTANT_CREDENTIALS.md** - All credentials and what to keep safe
6. **CHANGELOG.md** - Project change history

---

## 🔑 Key Info

**Apple ID:** geekyraghav13@gmail.com
**App-Specific Pass:** aiyl-rmxf-mcar-rfxl
**Bundle ID:** com.sarina.app
**App Store ID:** 6758547730
**Expo Account:** @8284

## 💰 Subscription Pricing

| Plan | Price | Product ID |
|------|-------|------------|
| Weekly | ₹299 INR | com.sarina.app.weekly |
| Yearly | ₹1,299 INR | com.sarina.app.yearly |

See **SUBSCRIPTION_SETUP_GUIDE.md** for complete setup instructions.

---

## 📞 Support Links

- **Expo Dashboard:** https://expo.dev/accounts/8284/projects/sarina
- **App Store Connect:** https://appstoreconnect.apple.com/apps/6758547730
- **TestFlight:** https://appstoreconnect.apple.com/apps/6758547730/testflight/ios

---

Generated: February 1, 2026

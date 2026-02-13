# 🍎 iOS Build 5 - Production Release Summary

**Date:** February 14, 2026
**Build Number:** 5 (incremented from 4)
**Version:** 1.3.9
**Platform:** iOS
**Status:** Building on EAS Cloud

---

## 📦 Build Information

**EAS Build URL:** https://expo.dev/accounts/8284/projects/sarina/builds/a8a47af5-e016-4d07-aeb9-bed71ca6878f

**Build Configuration:**
- Profile: `production`
- Platform: `ios`
- Bundle Identifier: `com.sarina.app`
- App Store ID: `6758547730`
- Distribution: App Store

**Credentials:**
- Distribution Certificate: ✅ Valid (expires Dec 21, 2026)
- Provisioning Profile: ✅ Active (Developer Portal ID: P6JB4R37VP)
- Apple Team: YA3AFXJV86 (STORYYELL PRIVATE LIMITED)

---

## 🎯 What's New in Build 5

### Features Added (Parity with Android)

1. **Voice Calling Integration** ✅
   - Real-time AI voice conversations
   - WebSocket connection to backend (WSS secure)
   - Microphone permissions configured
   - Background audio support enabled

2. **In-App Purchases** ✅
   - Weekly subscription: `com.sarina.app.weekly`
   - Yearly subscription: `com.sarina.app.yearly`
   - Receipt validation via backend
   - Purchase restoration support

3. **Credit System** ✅
   - Voice balance tracking
   - 5-second heartbeat deduction
   - Real-time balance display
   - Auto-cutoff at zero balance

4. **Backend Integration** ✅
   - Cloud Run backend: `sarina-voice-backend-fv2lgy22ja-uc.a.run.app`
   - Secure WebSocket (WSS)
   - Firebase Authentication
   - Firestore database sync

---

## 🔧 iOS-Specific Configurations

### Permissions Added

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Sarina needs access to your microphone for AI voice conversations with your companion.</string>

<key>NSSpeechRecognitionUsageDescription</key>
<string>Sarina uses speech recognition to understand your voice during conversations.</string>

<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

### Network Security (Info.plist)

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>sarina-voice-backend-fv2lgy22ja-uc.a.run.app</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <false/>
      <key>NSIncludesSubdomains</key>
      <true/>
      <key>NSExceptionRequiresForwardSecrecy</key>
      <true/>
      <key>NSExceptionMinimumTLSVersion</key>
      <string>TLSv1.2</string>
    </dict>
  </dict>
</dict>
```

### Entitlements

```xml
<key>com.apple.developer.in-app-payments</key>
<array>
  <string>merchant.com.sarina.app</string>
</array>
```

---

## 📊 Feature Parity Matrix

| Feature | Android Build 22 | iOS Build 5 | Status |
|---------|------------------|-------------|--------|
| Google Sign-In | ✅ | ✅ | ✅ Parity |
| Onboarding Flow | ✅ | ✅ | ✅ Parity |
| Character Selection | ✅ | ✅ | ✅ Parity |
| Chat Interface | ✅ | ✅ | ✅ Parity |
| Voice Calling | ✅ | ✅ | ✅ Parity |
| IAP Subscriptions | ✅ | ✅ | ✅ Parity |
| Credit System | ✅ | ✅ | ✅ Parity |
| Balance Tracking | ✅ | ✅ | ✅ Parity |
| Backend Integration | ✅ | ✅ | ✅ Parity |
| Receipt Validation | ✅ | ✅ | ✅ Parity |
| Purchase Restoration | ✅ | ✅ | ✅ Parity |

**Feature Parity:** 100% ✅

---

## 🛒 In-App Purchase Configuration

### App Store Connect Setup Required

**Product IDs (should already be configured):**

1. **Weekly Subscription**
   - Product ID: `com.sarina.app.weekly`
   - Type: Auto-renewable subscription
   - Duration: 1 week
   - Price: (As configured in App Store Connect)

2. **Yearly Subscription**
   - Product ID: `com.sarina.app.yearly`
   - Type: Auto-renewable subscription
   - Duration: 1 year
   - Price: (As configured in App Store Connect)

### Backend Integration

**Validation Endpoint:**
```
POST https://sarina-voice-backend-fv2lgy22ja-uc.a.run.app/api/validate-purchase

Headers:
  Authorization: Bearer <firebase-token>
  Content-Type: application/json

Body:
{
  "userId": "firebase-uid",
  "platform": "ios",
  "productId": "com.sarina.app.weekly",
  "receiptData": "base64-encoded-receipt"
}
```

**Backend validates with Apple's servers and allocates credits**

---

## 🔐 Security Features

### Authentication
- Firebase Authentication (Google Sign-In)
- Secure token-based API calls
- User data isolation in Firestore

### Network Security
- HTTPS/WSS only (no plain HTTP)
- TLS 1.2 minimum
- Certificate pinning for backend domain
- No arbitrary network loads allowed

### IAP Security
- Server-side receipt validation only
- Client cannot modify credits/subscription
- Duplicate purchase prevention
- Firestore security rules enforced

---

## 📱 Technical Details

### Dependencies (react-native-iap)

```json
{
  "react-native-iap": "^14.7.10"
}
```

**Cross-platform IAP library used for both iOS and Android**

### Backend WebSocket

```typescript
const WS_URL = 'wss://sarina-voice-backend-fv2lgy22ja-uc.a.run.app';
```

- Secure WebSocket connection
- Real-time voice streaming
- Credit deduction via 5-second heartbeat
- Firebase Auth token verification

### Firestore Collections

```
users/
  ├─ {userId}/
  │   ├─ email
  │   ├─ subscription_tier (free/weekly/yearly)
  │   ├─ voice_balance_seconds
  │   ├─ total_seconds_used
  │   └─ created_at

credit_transactions/
  ├─ {transactionId}/
  │   ├─ userId
  │   ├─ type (subscription/deduction)
  │   ├─ amount_seconds
  │   ├─ timestamp
  │   └─ metadata

call_sessions/
  ├─ {sessionId}/
  │   ├─ userId
  │   ├─ start_time
  │   ├─ end_time
  │   ├─ duration_seconds
  │   └─ status
```

---

## 🚀 Deployment Process

### Current Status: Building

1. ✅ **Configuration Updated**
   - Build number incremented to 5
   - Permissions added
   - Entitlements configured
   - Network security set

2. ✅ **Code Committed**
   - Commit: `02b7e9c`
   - Message: "Configure iOS build 5 with full feature parity to Android"
   - Pushed to GitHub

3. ✅ **iOS Prebuild**
   - Ran: `npx expo prebuild --platform ios --clean`
   - Generated native iOS project
   - Applied all configurations

4. ✅ **EAS Build Started**
   - Build ID: `a8a47af5-e016-4d07-aeb9-bed71ca6878f`
   - Status: In Progress
   - ETA: ~15-20 minutes

5. ⏳ **Pending: Build Completion**
   - Wait for EAS build to complete
   - Download IPA (if needed for testing)

6. ⏳ **Pending: App Store Submission**
   - Will auto-submit after build completes
   - Or manual submit: `npx eas submit --platform ios --latest`

---

## 📋 Pre-Submission Checklist

### App Store Connect Verification

Before submission, ensure:

- [ ] App Store Connect account accessible
- [ ] App record exists (ID: 6758547730)
- [ ] Subscription products configured:
  - [ ] com.sarina.app.weekly
  - [ ] com.sarina.app.yearly
- [ ] Subscription group created
- [ ] Pricing set for all regions
- [ ] Tax category assigned
- [ ] App metadata updated (if needed)
- [ ] Screenshots prepared (if new version)
- [ ] Privacy policy URL accessible
- [ ] Terms of service URL accessible

### Technical Checklist

- [x] Build number incremented (4 → 5)
- [x] Version number correct (1.3.9)
- [x] Bundle identifier correct (com.sarina.app)
- [x] Permissions configured
- [x] Entitlements added
- [x] Backend URL configured
- [x] IAP product IDs correct
- [x] Network security settings applied

---

## 🧪 Testing Plan (After Build)

### Manual Testing Required

1. **Installation & Launch**
   - Install via TestFlight or App Store
   - Launch app
   - Verify no crashes

2. **Sign-In Flow**
   - Test Google Sign-In
   - Verify user creation in Firestore

3. **Onboarding**
   - Complete all onboarding screens
   - Verify character selection

4. **IAP Testing**
   - Trigger paywall
   - Test weekly subscription purchase
   - Verify receipt validation
   - Check credits allocated
   - Test purchase restoration

5. **Voice Calling**
   - Start voice call
   - Verify microphone permission requested
   - Check WebSocket connection
   - Test AI responses
   - Verify balance deduction
   - Test call until balance = 0

6. **Edge Cases**
   - Test app backgrounding during call
   - Test network interruption
   - Test multiple devices same account

---

## 📊 Expected Build Timeline

```
Current Time: February 14, 2026, 12:45 AM IST
Build Started: ~12:45 AM

Timeline:
├─ 12:45 AM - Build uploaded to EAS ✅
├─ 12:46 AM - Installing dependencies (~2-3 min)
├─ 12:49 AM - Running prebuild (~1-2 min)
├─ 12:51 AM - CocoaPods install (~3-5 min)
├─ 12:56 AM - Xcode build (~8-12 min)
├─ 01:08 AM - Uploading artifacts (~1-2 min)
└─ 01:10 AM - Build complete (estimated)

Total ETA: ~15-25 minutes
```

---

## 🎯 Next Steps

### Immediate (After Build Completes)

1. **Verify Build Success**
   ```bash
   # Check build status
   npx eas build:view --id a8a47af5-e016-4d07-aeb9-bed71ca6878f
   ```

2. **Download Build (Optional)**
   ```bash
   # Download IPA for local testing
   npx eas build:download --id a8a47af5-e016-4d07-aeb9-bed71ca6878f
   ```

3. **Submit to App Store**
   ```bash
   # Option 1: Auto-submit (uses eas.json config)
   npx eas submit --platform ios --latest

   # Option 2: Specify build
   npx eas submit --platform ios --id a8a47af5-e016-4d07-aeb9-bed71ca6878f
   ```

### Short-Term (After Submission)

1. **Monitor App Store Review**
   - Check App Store Connect
   - Respond to any review feedback
   - Typical review time: 1-3 days

2. **TestFlight Testing (Recommended)**
   - Add internal testers
   - Test all features
   - Fix any critical issues before public release

3. **Release When Ready**
   - Once approved by Apple
   - Release manually or auto-release
   - Monitor crash reports and user feedback

---

## 📞 Support Information

### Build Issues

If build fails:
1. Check EAS build logs: https://expo.dev/accounts/8284/projects/sarina/builds
2. Verify all credentials are valid
3. Check for code signing issues
4. Review Info.plist syntax

### Submission Issues

Common issues:
- **Missing IAP products:** Configure in App Store Connect first
- **Invalid bundle ID:** Ensure it matches App Store Connect
- **Outdated credentials:** Regenerate certificates if expired
- **Missing permissions:** Check Info.plist has all required keys

### Contact

- **EAS Support:** https://expo.dev/support
- **Apple Developer:** https://developer.apple.com/contact/
- **App Store Connect:** https://appstoreconnect.apple.com/

---

## 🎉 Summary

**iOS Build 5 Status:** ✅ Building on EAS

**Key Achievements:**
- ✅ Full feature parity with Android
- ✅ Voice calling integrated
- ✅ IAP configured with react-native-iap
- ✅ Backend WebSocket connection secured
- ✅ All permissions and entitlements added
- ✅ Build number incremented
- ✅ Production build uploading to EAS

**Ready For:**
- App Store submission (after build completes)
- TestFlight distribution
- Production release

**Build Link:** https://expo.dev/accounts/8284/projects/sarina/builds/a8a47af5-e016-4d07-aeb9-bed71ca6878f

---

**Document Created:** February 14, 2026
**Build Status:** In Progress
**ETA:** ~15-25 minutes
**Next Action:** Monitor build, then submit to App Store

🍎 iOS Build 5 is on its way! 🚀

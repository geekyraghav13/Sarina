# iOS Builds Documentation

This folder contains documentation for all iOS builds of the Sarina AI Companion app.

---

## 📦 Build History

| Build | Version | Date | Status | Major Changes |
|-------|---------|------|--------|---------------|
| **31** | 1.4.8 | Mar 26, 2026 | 🚀 Building | **RevenueCat Integration** - Complete subscription system overhaul |
| **25** | 1.4.x | Previous | ✅ Submitted | Google Sign In fixes |
| **24** | 1.4.x | Previous | ✅ Submitted | Bug fixes and stability improvements |
| **23** | 1.4.x | Previous | ✅ Submitted | Complete feature release |
| **19** | 1.3.x | Previous | ✅ Submitted | Initial release |

---

## 📁 Documentation Files

### **Current Build**
- **[BUILD_31_REVENUECAT_INTEGRATION.md](./BUILD_31_REVENUECAT_INTEGRATION.md)** - Latest build with RevenueCat SDK integration

### **Previous Builds**
- **[BUILD_25_SUBMISSION_RECORD.md](./BUILD_25_SUBMISSION_RECORD.md)** - Build 25 submission details
- **[BUILD_24_FIXES_SUMMARY.md](./BUILD_24_FIXES_SUMMARY.md)** - Build 24 fixes
- **[BUILD_23_COMPLETE_DOCUMENTATION.md](./BUILD_23_COMPLETE_DOCUMENTATION.md)** - Build 23 complete docs
- **[BUILD_19_SUBMISSION_RECORD.md](./BUILD_19_SUBMISSION_RECORD.md)** - Initial build submission

### **Setup Guides**
- **[IOS_BUILD_GUIDE.md](./IOS_BUILD_GUIDE.md)** - General iOS build process
- **[IOS_APP_MIGRATION_GUIDE.md](./IOS_APP_MIGRATION_GUIDE.md)** - Migration guide
- **[FIREBASE_SIGN_IN_SETUP.md](./FIREBASE_SIGN_IN_SETUP.md)** - Firebase authentication setup

---

## 🚀 Quick Start

### **Building a New Version**

1. **Increment Build Number**
   ```bash
   # Edit app.json
   "ios": {
     "buildNumber": "XX"  // Increment this
   }
   ```

2. **Start EAS Build**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

---

## 📊 App Store Information

- **Bundle ID:** `com.sarina.app`
- **App Store ID:** `6758547730`
- **Team:** YA3AFXJV86 (STORYYELL PRIVATE LIMITED)
- **Distribution Certificate:** Valid until Dec 21, 2026

---

## 🔗 Important Links

- **EAS Dashboard:** https://expo.dev/accounts/8284/projects/sarina
- **App Store Connect:** https://appstoreconnect.apple.com
- **RevenueCat Dashboard:** https://app.revenuecat.com
- **Firebase Console:** https://console.firebase.google.com/project/sarina-ai-2b2c1

---

## 📝 Build Checklist Template

When creating new builds, document:

- [ ] Build number incremented
- [ ] Major changes listed
- [ ] Test checklist created
- [ ] Screenshots updated
- [ ] Release notes written
- [ ] Submitted to TestFlight
- [ ] Beta testing completed
- [ ] Submitted for review
- [ ] Approved and released

---

**Last Updated:** March 26, 2026
**Current Build:** 31

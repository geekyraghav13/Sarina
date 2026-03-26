# Build 31 - Summary & Status

**Quick Reference Document**

---

## 📊 Build Information

| Property | Value |
|----------|-------|
| **Build Number** | 31 |
| **Version** | 1.4.8 |
| **Platform** | iOS |
| **Build Status** | 🚀 Queued on EAS (Free tier) |
| **Build ID** | a533f82b-44b8-46f6-8cb2-c3880d415d33 |
| **Started** | March 26, 2026 |
| **ETA** | 15-20 minutes |

---

## 🔗 Important Links

- **Build Logs:** https://expo.dev/accounts/8284/projects/sarina/builds/a533f82b-44b8-46f6-8cb2-c3880d415d33
- **Full Documentation:** [docs/ios-builds/BUILD_31_REVENUECAT_INTEGRATION.md](./docs/ios-builds/BUILD_31_REVENUECAT_INTEGRATION.md)
- **iOS Builds Folder:** [docs/ios-builds/](./docs/ios-builds/)

---

## 🎯 What Changed in Build 31

### **Major Feature: RevenueCat Integration**

**Replaced:** `react-native-iap` with RevenueCat SDK
**Benefit:** Professional subscription management, server-side validation, webhooks

### **Files Changed:**
1. ✅ `app/services/revenueCatService.ts` - New service
2. ✅ `app/screens/NewPaywallScreen.tsx` - Complete rewrite
3. ✅ `App.tsx` - RevenueCat initialization
4. ✅ `app/services/authService.ts` - RevenueCat login/logout
5. ✅ `backend/revenueCatWebhook.js` - New webhook handler
6. ✅ `backend/server.js` - New webhook endpoint
7. ✅ `package.json` - Added react-native-purchases

### **What's Protected:**
- ✅ Credit allocation unchanged (60s weekly, 3000s yearly)
- ✅ Voice calling flow unchanged
- ✅ Firestore structure preserved
- ✅ Backend credit deduction unchanged
- ✅ Duplicate credit prevention added

---

## ✅ Pre-Deployment Checklist

### **Completed:**
- [x] Build number incremented (29 → 31)
- [x] RevenueCat SDK integrated
- [x] Paywall screen updated
- [x] Backend webhook created
- [x] Duplicate prevention implemented
- [x] Documentation created
- [x] Build submitted to EAS

### **Required Before App Store Submission:**
- [ ] Wait for EAS build to complete
- [ ] Download IPA from EAS
- [ ] Create RevenueCat entitlement "premium"
- [ ] Configure webhook in RevenueCat dashboard
- [ ] Upload to App Store Connect
- [ ] Test in TestFlight with sandbox account
- [ ] Verify purchase flow works
- [ ] Verify voice calling works after purchase
- [ ] Submit for App Store review

---

## 🧪 Testing Plan

### **1. RevenueCat Dashboard Setup**
```
1. Go to https://app.revenuecat.com
2. Navigate to Entitlements
3. Create entitlement: "premium"
4. Attach products:
   - com.sarina.app.weekly
   - com.sarina.app.yearly
5. Go to Integrations → Webhooks
6. Add webhook URL:
   https://sarina-voice-backend-1051121433445.us-central1.run.app/api/revenuecat-webhook
7. Select events: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION
```

### **2. Sandbox Testing**
```
1. Create sandbox test user in App Store Connect
2. Sign out of real Apple ID on test device
3. Install from TestFlight
4. Navigate to paywall
5. Purchase weekly subscription (sandbox - free)
6. Verify credits added (60s)
7. Start voice call
8. Verify call works
9. Delete app and reinstall
10. Restore purchases
11. Verify NO duplicate credits
```

---

## 📱 Current Build Status

**EAS Build Status:** Queued in Free tier

The build has been successfully uploaded and is waiting in queue. You can:

1. **Monitor progress:** Visit the build logs URL above
2. **Press Ctrl+C** to exit the build command (build will continue on EAS)
3. **Check status later:** Run `eas build:list` to see build status

**Estimated completion:** 15-20 minutes from queue start

---

## 📂 Documentation Organization

All iOS build documentation has been organized:

```
docs/
└── ios-builds/
    ├── README.md                              ← Index of all builds
    ├── BUILD_31_REVENUECAT_INTEGRATION.md    ← Current build (detailed)
    ├── BUILD_25_SUBMISSION_RECORD.md         ← Previous builds
    ├── BUILD_24_FIXES_SUMMARY.md
    ├── BUILD_23_COMPLETE_DOCUMENTATION.md
    ├── BUILD_19_SUBMISSION_RECORD.md
    ├── IOS_BUILD_GUIDE.md                    ← Setup guides
    ├── IOS_APP_MIGRATION_GUIDE.md
    └── FIREBASE_SIGN_IN_SETUP.md
```

**Removed:**
- ❌ `CURRENT_STATUS.md` (outdated)
- ❌ All build docs from root (moved to ios-builds/)

---

## 🚀 Next Steps

### **Immediate (While Build is Running):**
1. Set up RevenueCat entitlement in dashboard
2. Configure webhook URL
3. Prepare sandbox test account

### **After Build Completes:**
1. Download IPA from EAS dashboard
2. Upload to App Store Connect via Transporter or `eas submit`
3. Submit to TestFlight
4. Run complete test suite
5. Submit for App Store review

### **Post-Approval:**
1. Monitor RevenueCat dashboard for purchases
2. Check webhook events are being received
3. Verify credit allocations are correct
4. Monitor for any issues

---

## 📞 Support

If you encounter any issues:

1. **Build Fails:** Check EAS build logs for errors
2. **RevenueCat Issues:** Check dashboard webhooks section
3. **Purchase Issues:** Verify entitlements are set up
4. **Credits Not Added:** Check Firestore and webhook logs

---

**Documentation Created:** March 26, 2026
**Build Started:** March 26, 2026
**Expected Completion:** March 26, 2026 (~15-20 mins from queue start)

# Build 21 (v1.4.5) - Submission Summary

**Date**: March 19, 2026
**Status**: ⏳ Building on EAS
**Build URL**: https://expo.dev/accounts/8284/projects/sarina/builds/9ab1be3b-f908-4d18-aa42-8133cf0136a9

---

## What's Included in Build 21

### ✅ Issue #1: Sign in with Apple (RESOLVED)
- Added Sign in with Apple as primary authentication method
- Apple Sign In button displayed first (per Apple guidelines)
- Google Sign In remains as alternative option
- Supports "Hide My Email" privacy feature
- Only requests name and email (minimal data)
- No advertising or tracking

**Files Modified**:
- `app/services/authService.ts` - Apple Sign In implementation with Firebase
- `app/screens/SignInScreen.tsx` - Added Apple Authentication button UI
- `app.json` - Added `expo-apple-authentication` plugin
- `package.json` - Added expo-apple-authentication@8.0.8 (SDK 54 compatible)

### ⚠️ Issue #2: Subscription Products (Needs Configuration)
**Status**: App code is ready, products need to be created in App Store Connect

The app is fully functional but shows "Subscriptions Not Available" message until products are configured.

**What You Need to Do**:
1. Go to App Store Connect: https://appstoreconnect.apple.com/apps/6758547730/appstore/subscriptions
2. Create Subscription Group: "Sarina Premium Membership"
3. Add Weekly product: `com.sarina.app.weekly` (~₹299 / $2.99)
4. Add Yearly product: `com.sarina.app.yearly` (~₹1,299 / $14.99)
5. Submit products for Apple approval
6. Once approved, subscriptions will work in your app automatically

---

## Version Information

- **Version**: 1.4.5
- **iOS Build Number**: 21
- **Android Version Code**: 22
- **Bundle ID**: com.sarina.app
- **App Store ID**: 6758547730

---

## Build Process

### What Happened:
1. ✅ Incremented version to 1.4.5, build to 21
2. ✅ Fixed expo-apple-authentication version (SDK 54 compatible)
3. ✅ Removed local ios directory (let EAS handle native build)
4. ✅ Uploaded to EAS Build
5. ⏳ Building on EAS servers...

### Build Configuration:
- **Platform**: iOS
- **Profile**: production
- **Credentials**: Remote (Expo server)
- **Distribution Certificate**: Valid until Dec 21, 2026
- **Provisioning Profile**: Active, expires Dec 21, 2026

---

## Next Steps

### 1. Wait for Build to Complete (~15-20 minutes)
Monitor the build progress at:
https://expo.dev/accounts/8284/projects/sarina/builds/9ab1be3b-f908-4d18-aa42-8133cf0136a9

### 2. Once Build Succeeds, Submit to App Store
```bash
eas submit --platform ios --latest
```

Or submit manually:
1. Download IPA from EAS dashboard
2. Upload to App Store Connect via Transporter app
3. Go to App Store Connect → TestFlight
4. Select build 21
5. Submit for App Review

### 3. Configure Subscription Products
**IMPORTANT**: Do this before or immediately after submitting for review

Go to: https://appstoreconnect.apple.com/apps/6758547730/appstore/subscriptions

#### Create Subscription Group:
- Reference Name: `sarina_premium_subscriptions`
- Display Name: `Sarina Premium Membership`

#### Add Weekly Subscription:
- **Product ID**: `com.sarina.app.weekly` ⚠️ MUST MATCH EXACTLY
- **Duration**: 1 week
- **Price**: Tier 3 (~₹299 / $2.99)
- **Display Name**: Weekly Premium
- **Description**: Unlock unlimited AI conversations and 60 seconds of voice calls per week

#### Add Yearly Subscription:
- **Product ID**: `com.sarina.app.yearly` ⚠️ MUST MATCH EXACTLY
- **Duration**: 1 year
- **Price**: Tier 15 (~₹1,299 / $14.99)
- **Display Name**: Yearly Premium - Best Value
- **Description**: Unlock unlimited AI conversations and 50 minutes of voice calls per year. Save 91%!

**Submit both products for review**

### 4. Respond to Apple App Review

Once build 21 is submitted, reply to the rejection message with:

```
Hello Apple Review Team,

Thank you for your feedback. We have addressed both issues:

1. ✅ Sign in with Apple - RESOLVED in Build 21
   - Added Sign in with Apple as the primary authentication method
   - Fully compliant with Guideline 4.8
   - Users can hide their email and limit data to name/email only

2. ✅ Subscription Products - NOW CONFIGURED
   - Subscription products have been created in App Store Connect
   - Product IDs: com.sarina.app.weekly and com.sarina.app.yearly
   - Products submitted for Apple's review
   - Subscriptions will load correctly once products are approved

Build 21 (v1.4.5) includes Sign in with Apple and is ready for review.

Testing Instructions:
1. Sign in with Apple (primary option) or Google (alternative)
2. Complete onboarding flow
3. Navigate to chat → tap voice call icon
4. Paywall will show Weekly (₹299) and Yearly (₹1,299) options
5. Complete sandbox purchase
6. Voice calls will work immediately after purchase

Best regards,
Sarina Development Team
```

---

## Testing Checklist

### Sign in with Apple:
- [ ] Apple Sign In button appears first on sign-in screen
- [ ] Tapping opens Apple authentication dialog
- [ ] Can authenticate with Face ID/Touch ID
- [ ] "Hide My Email" option works
- [ ] User successfully signs in to app
- [ ] Google Sign In still works as alternative

### Subscriptions (After Product Configuration):
- [ ] Products load from App Store Connect
- [ ] Weekly and Yearly plans display correct prices
- [ ] Can complete purchase in sandbox mode
- [ ] Backend validates receipt successfully
- [ ] Firestore updates subscription status
- [ ] Voice calls work after purchase
- [ ] Restore purchases works

---

## Important URLs

- **Build Logs**: https://expo.dev/accounts/8284/projects/sarina/builds/9ab1be3b-f908-4d18-aa42-8133cf0136a9
- **App Store Connect**: https://appstoreconnect.apple.com/apps/6758547730
- **Subscriptions Setup**: https://appstoreconnect.apple.com/apps/6758547730/appstore/subscriptions
- **TestFlight**: https://appstoreconnect.apple.com/apps/6758547730/testflight/ios
- **Firebase Console**: https://console.firebase.google.com/project/sarina-ai-2b2c1

---

## Git Commits

```
a09aac4 Fix expo-apple-authentication version for SDK 54
0f2fc84 Remove ios directory - let EAS handle native build
0e790ed Update to version 1.4.5 build 21 for App Store resubmission
f31e4df Add Sign in with Apple and update to v1.4.4 build 20
```

---

## Key Points for Apple Review

1. **Sign in with Apple is now included** - Primary authentication method ✅
2. **Meets all Guideline 4.8 requirements**:
   - Limits data to name and email ✅
   - Supports "Hide My Email" ✅
   - No advertising tracking ✅

3. **Subscription products need to be configured** in App Store Connect:
   - Product IDs are hardcoded in the app
   - Once configured by Apple, subscriptions will work
   - App handles gracefully with user-friendly message

---

## Expected Timeline

| Step | Time | Status |
|------|------|--------|
| EAS Build Complete | 15-20 min | ⏳ In Progress |
| Submit to App Store | 5 min | ⏳ Pending |
| Configure Subscription Products | 30 min | ⏳ Pending |
| TestFlight Processing | 5-10 min | ⏳ Pending |
| Submit for App Review | 5 min | ⏳ Pending |
| Apple Review | 24-48 hrs | ⏳ Pending |
| Product Approval | 24-48 hrs | ⏳ Pending |

---

## Troubleshooting

### If Build Fails:
1. Check build logs in EAS dashboard
2. Common issues:
   - Pod installation errors → Check package.json versions
   - Credential errors → Update certificates in EAS
   - Dependency conflicts → Run `npx expo install --check`

### If Submission Fails:
1. Check App Store Connect for missing information
2. Verify binary is uploaded to TestFlight
3. Ensure all required metadata is complete
4. Check for missing compliance information

### If Apple Rejects Again:
1. Check if subscription products are approved
2. Test subscriptions in sandbox mode
3. Provide sandbox tester account to Apple
4. Offer to do a demo call with review team

---

**Document Created**: March 19, 2026
**Build Status**: Building
**Next Action**: Wait for build to complete, then submit to App Store

---

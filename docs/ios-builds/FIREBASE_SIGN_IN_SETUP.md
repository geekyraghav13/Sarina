# Firebase Sign-In Providers Setup

## Critical Issues to Fix

### Issue 1: Apple Sign In - Provider Not Configured
**Error:** "Firebase: The identity provider configuration is not found. (auth/operation-not-allowed)"

**Cause:** Apple Sign In provider is not enabled in Firebase Console

### Issue 2: Google Sign In - App Crashes
**Cause:** Likely Firebase Google provider configuration issue or missing credentials

---

## Step-by-Step Fix

### 1. Enable Apple Sign In Provider in Firebase Console

#### A. Go to Firebase Console
https://console.firebase.google.com/project/sarina-ai-2b2c1/authentication/providers

#### B. Enable Apple Provider
1. Click on **"Apple"** in the Sign-in providers list
2. Click **"Enable"** toggle at the top right
3. You'll need to configure:

**Services ID (OAuth Code Flow):**
- Use your Bundle ID: `com.sarina.app`
- This is already registered in Apple Developer Portal

**Apple Team ID:**
- Get from: https://developer.apple.com/account/#!/membership
- It's a 10-character alphanumeric string (e.g., "XXXXXXXXXX")

**Private Key (Optional but recommended for server-side):**
- Go to: https://developer.apple.com/account/resources/authkeys/list
- Click **"+"** to create a new key
- Name: "Sarina Firebase Apple Sign In Key"
- Check: **"Sign in with Apple"**
- Click **"Continue"** → **"Register"**
- **Download the .p8 file** (you can only download once!)
- Copy the **Key ID** (10-character string)
- Upload the .p8 file content to Firebase Console

4. Click **"Save"**

#### C. Configure OAuth Redirect URI (if prompted)
Firebase will provide an OAuth redirect URI like:
```
https://sarina-ai-2b2c1.firebaseapp.com/__/auth/handler
```

You need to add this to Apple Developer Portal:
1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Select your App ID: **com.sarina.app**
3. Click on **"Sign in with Apple"** capability
4. Click **"Configure"**
5. Under **"Return URLs"**, add the Firebase callback URL
6. Click **"Save"**

---

### 2. Verify Google Sign In Provider in Firebase Console

#### A. Go to Firebase Console
https://console.firebase.google.com/project/sarina-ai-2b2c1/authentication/providers

#### B. Check Google Provider
1. Click on **"Google"** in the Sign-in providers list
2. Verify it's **Enabled** (toggle should be ON)
3. Check the configuration:
   - **Project support email**: Should be set (e.g., geekyraghav13@gmail.com)
   - **Web SDK configuration**: Should show Web Client ID

4. If not enabled:
   - Click **"Enable"** toggle
   - Set project support email
   - Click **"Save"**

#### C. Verify Client IDs
The following Client IDs should be registered in Firebase:

**Web Client ID (used in the app):**
```
1051121433445-8sehc92iuvth1aq4ej5fb8452pcf61mt.apps.googleusercontent.com
```

**iOS Client ID:**
```
1051121433445-rqjvp9kqjdkqvoctr14ac57eilstg0v3.apps.googleusercontent.com
```

These are already configured in `app/services/authService.ts` lines 22-25.

---

### 3. Alternative Quick Fix (If You Can't Get Apple Key Immediately)

If you need to release quickly and can't configure Apple Sign In properly right away, you can:

#### Option A: Disable Apple Sign In Temporarily
1. Remove Apple Sign In button from the app
2. Submit with just Google Sign In
3. Apple might still reject (Guideline 4.8 requires Apple Sign In)

#### Option B: Use Simplified Apple Configuration
1. In Firebase Console, enable Apple provider
2. Use just the Services ID: `com.sarina.app`
3. Add your Apple Team ID
4. Skip the Private Key for now (it's optional for client-side only auth)
5. Make sure the Firebase callback URL is added to Apple Developer Portal

---

## Testing After Configuration

### Test Apple Sign In:
1. Make sure Apple provider is enabled in Firebase Console
2. Make sure callback URL is added to Apple Developer Portal
3. Run the app on a physical iOS device (won't work on simulator)
4. Tap "Sign in with Apple"
5. Should show Apple's native sign-in sheet

### Test Google Sign In:
1. Make sure Google provider is enabled in Firebase Console
2. Run the app on any device
3. Tap "Continue with Google"
4. Should show Google sign-in sheet

---

## Quick Checklist

- [ ] Firebase Console → Authentication → Sign-in method
- [ ] Enable **Apple** provider
  - [ ] Services ID: `com.sarina.app`
  - [ ] Apple Team ID: (get from membership page)
  - [ ] Private Key: (optional - create in Keys section)
  - [ ] Save configuration
- [ ] Add Firebase callback URL to Apple Developer Portal
  - [ ] Go to App ID → Sign in with Apple → Configure
  - [ ] Add return URL: `https://sarina-ai-2b2c1.firebaseapp.com/__/auth/handler`
- [ ] Verify **Google** provider is enabled
  - [ ] Check toggle is ON
  - [ ] Support email is set
  - [ ] Web Client ID is configured
- [ ] Test on physical iOS device
  - [ ] Apple Sign In works
  - [ ] Google Sign In works

---

## URLs You Need

**Firebase Console - Authentication:**
https://console.firebase.google.com/project/sarina-ai-2b2c1/authentication/providers

**Apple Developer - Membership (Team ID):**
https://developer.apple.com/account/#!/membership

**Apple Developer - App IDs:**
https://developer.apple.com/account/resources/identifiers/list

**Apple Developer - Keys:**
https://developer.apple.com/account/resources/authkeys/list

---

## Expected Firebase Callback URL

When you enable Apple Sign In in Firebase, you'll get this callback URL:
```
https://sarina-ai-2b2c1.firebaseapp.com/__/auth/handler
```

This MUST be added to Apple Developer Portal → App ID → Sign in with Apple → Configure → Return URLs

---

## After Configuration

Once both providers are properly configured:
1. Test the app locally first
2. If both sign-in methods work, create a new build
3. Build 24 with working authentication
4. Submit to App Store Connect

---

## Current Status

**Apple Sign In:**
- ❌ Provider not configured in Firebase Console
- ✅ Capability enabled in Apple Developer Portal
- ✅ Code implementation complete
- ✅ Provisioning profile includes capability

**Google Sign In:**
- ⚠️ Needs verification in Firebase Console
- ✅ Code implementation complete
- ❌ App crashes (likely due to Firebase config)

**Next Action:** YOU need to enable Apple Sign In provider in Firebase Console with the steps above.

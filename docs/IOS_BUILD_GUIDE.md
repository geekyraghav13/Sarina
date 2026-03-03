# iOS Build and Submission Guide

## Overview

This guide provides the correct process for building and submitting your iOS app to the App Store using EAS (Expo Application Services).

## Current iOS Configuration

- **App Name:** Sarina AI Companion
- **Bundle ID:** com.sarina.app
- **Version:** 1.3.9
- **Build Number:** 13
- **App Store ID:** 6758547730
- **Apple ID:** geekyraghav13@gmail.com

## Prerequisites

1. **EAS CLI installed:**
   ```bash
   npm install -g eas-cli
   ```

2. **Logged into EAS:**
   ```bash
   eas whoami
   # If not logged in:
   eas login
   ```

3. **App Store Connect Credentials:**
   - Apple ID: geekyraghav13@gmail.com
   - App-Specific Password: (stored in EAS)
   - App Store Connect API Key: (configured once)

## Build Process

### 1. Prepare for Build

Before building, ensure:
- All code changes are committed
- Version number is updated in `app.json` (if needed)
- Build number is incremented in `app.json`

### 2. Start iOS Build

```bash
cd "/home/raghav/Vibe COded Apps/sarina"

# Build for production (App Store)
npx eas build --platform ios --profile production
```

**Build time:** 20-30 minutes

### 3. Monitor Build Progress

```bash
# Check recent builds
npx eas build:list --platform ios --limit 5

# View specific build details
npx eas build:view <BUILD_ID>
```

You can also monitor builds at: https://expo.dev/accounts/8284/projects/sarina/builds

### 4. Download Build (Optional)

```bash
# Download the latest successful build
npx eas build:download --platform ios --latest

# Or download specific build
npx eas build:download --id <BUILD_ID> --output ~/Downloads/Sarina.ipa
```

## Submission Process

### Option 1: EAS Submit (Recommended)

**First-time setup (one-time only):**
```bash
# Run in interactive mode to set up App Store Connect API Key
npx eas submit --platform ios --latest
```

Follow the prompts to:
1. Select "Generate a new API Key"
2. Provide your Apple ID password when prompted
3. EAS will automatically create and configure the API key

**Subsequent submissions:**
```bash
# Submit latest build
npx eas submit --platform ios --latest

# Or submit specific build
npx eas submit --platform ios --id <BUILD_ID>
```

### Option 2: Transporter App (Alternative)

If you have an iPhone/iPad or Mac:

1. Download the IPA file (see above)
2. Install Transporter app from App Store
3. Sign in with your Apple ID
4. Drag and drop the IPA file
5. Click "Deliver"

## After Submission

### 1. Processing (10-15 minutes)
- Build appears in App Store Connect
- Status: "Processing"
- Wait for email confirmation

### 2. TestFlight
- Navigate to: https://appstoreconnect.apple.com/apps/6758547730/testflight/ios
- Build becomes available for testing
- Add internal testers (instant access)
- Add external testers (requires Beta App Review)

### 3. App Store Submission
1. Go to App Store Connect
2. Navigate to: My Apps → Sarina → App Store tab
3. Create new version or select existing
4. Select the build
5. Fill in "What's New" text
6. Submit for Review
7. Review takes 1-3 days

## Important Notes

### DO NOT Use Auto-Submit Scripts

The following scripts have been **removed** because they don't work correctly:
- ❌ `auto_submit_ios.sh`
- ❌ `auto_submit_ios_FINAL.sh`
- ❌ `auto_submit_ios_build11.sh`
- ❌ `retry_submit.sh`

**Why they failed:**
- EAS Submit requires interactive setup for API Keys first
- Automated submissions need the one-time setup completed
- These scripts contained hardcoded credentials (security risk)

### Correct Approach

✅ **Use `npx eas submit` after one-time API key setup**
- More reliable
- No hardcoded credentials
- Properly integrated with App Store Connect
- Handles errors gracefully

## Build Configuration Files

### app.json
Contains iOS configuration including:
- Bundle identifier
- Build number
- Version
- Permissions (microphone, speech recognition)
- Background modes (audio)
- App Transport Security settings

### eas.json
Contains build and submit profiles:
- Production profile for App Store builds
- Credentials management settings
- Submission configuration (Apple ID, App Store ID)

### ios/Sarina/Info.plist
Native iOS configuration (auto-generated from app.json):
- Bundle version and build number
- URL schemes (for Google Sign-In)
- Permissions
- App Transport Security

## Troubleshooting

### Build Fails
1. Check build logs: `npx eas build:view <BUILD_ID>`
2. Common issues:
   - TypeScript compilation errors
   - Native dependency conflicts
   - Code signing issues

### Submission Fails
1. Ensure App Store Connect API Key is set up
2. Verify build is completed successfully
3. Check Apple ID credentials are correct

### "Not under version control" Errors
- Some documentation files are not tracked by git
- This is normal for temporary/historical build documentation

## Quick Reference Commands

```bash
# Check EAS login status
npx eas whoami

# List recent builds
npx eas build:list --platform ios --limit 5

# Build for production
npx eas build --platform ios --profile production

# Submit latest build
npx eas submit --platform ios --latest

# View build details
npx eas build:view <BUILD_ID>

# Download build
npx eas build:download --platform ios --latest
```

## Resources

- **App Store Connect:** https://appstoreconnect.apple.com
- **EAS Builds:** https://expo.dev/accounts/8284/projects/sarina/builds
- **TestFlight:** https://appstoreconnect.apple.com/apps/6758547730/testflight/ios
- **EAS Documentation:** https://docs.expo.dev/build/introduction/
- **Expo Discord:** https://chat.expo.dev

## Version History

- **Build 13 (v1.3.9):** Current version
- Previous builds documented in `docs/build-history/ios/`

---

**Last Updated:** March 3, 2026

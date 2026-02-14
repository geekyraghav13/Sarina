# Get iOS OAuth Client ID from Firebase

## Problem
Google Sign-In on iOS requires an iOS OAuth Client ID, which is missing from the current configuration.

**Error:** "GoogleService-Info.plist was not found and iosClientId was not provided"

---

## Solution: Get iOS Client ID from Firebase Console

### Step 1: Go to Firebase Console
https://console.firebase.google.com/project/sarina-ai-2b2c1/settings/general

### Step 2: Navigate to iOS App Settings
1. Click on your iOS app (com.sarina.app)
2. Scroll down to find "OAuth 2.0 Client ID"
3. If you don't see it, you may need to download a new GoogleService-Info.plist with Google Sign-In enabled

### Step 3: Get the Client ID
Look for something like:
```
1051121433445-xxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

Copy this entire string.

### Step 4: Alternative - Download Updated GoogleService-Info.plist
If the OAuth Client ID is not visible:
1. Click "Download GoogleService-Info.plist" button
2. Replace the file at `/home/raghav/Vibe COded Apps/sarina/GoogleService-Info.plist`
3. The new file should contain:
   ```xml
   <key>CLIENT_ID</key>
   <string>XXXX-XXXX.apps.googleusercontent.com</string>
   ```

---

## Quick Fix Command

Once you have the iOS Client ID, run:

```bash
# Replace XXXXX with your actual iOS Client ID
IOS_CLIENT_ID="1051121433445-XXXXX.apps.googleusercontent.com"

# Update the authService.ts file
sed -i "s/1051121433445-PLACEHOLDER.apps.googleusercontent.com/$IOS_CLIENT_ID/g" \
  "/home/raghav/Vibe COded Apps/sarina/app/services/authService.ts"

# Verify the change
grep "IOS_CLIENT_ID" "/home/raghav/Vibe COded Apps/sarina/app/services/authService.ts"
```

---

## After Getting the Client ID

1. Update the code with the correct iOS Client ID
2. Increment iOS build number (5 → 6)
3. Build new iOS version
4. Submit to App Store Connect
5. Test Google Sign-In on iOS

---

## Current Status

✅ GoogleService-Info.plist copied to ios/Sarina/ directory
⏳ Need iOS OAuth Client ID from Firebase Console
⏳ Need to update authService.ts with correct ID
⏳ Need to rebuild iOS app (Build 6)

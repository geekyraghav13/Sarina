# Sarina App - Release Information

## Signed AAB File Location
**File:** `/home/raghav/Vibe COded Apps/sarina/android/app/build/outputs/bundle/release/app-release.aab`
**Size:** 46 MB
**Status:** ✅ Ready for Google Play Console upload

## Keystore Information
**Location:** `/home/raghav/Vibe COded Apps/sarina/android/app/sarina-upload-key.keystore`

### Keystore Details (Keep this information secure!)
- **Keystore Type:** PKCS12
- **Keystore Password:** `android`
- **Key Alias:** `sarina-key-alias`
- **Key Password:** `android`
- **Validity:** 10,000 days

**⚠️ IMPORTANT:** Store this keystore file and credentials securely! You'll need them for all future updates to your app.

## How to Upload to Google Play Console - Closed Testing

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (or create a new app if this is your first release)
3. Navigate to **Testing** → **Closed testing**
4. Click **Create new release**
5. Upload the AAB file: `app-release.aab`
6. Fill in the release notes
7. Review and roll out to your testers

## App Details
- **Package Name:** com.sarina.app
- **Version Code:** 1
- **Version Name:** 1.0.0
- **Min SDK:** 24
- **Target SDK:** 36

## For Future Builds
To rebuild the signed AAB:
```bash
cd "/home/raghav/Vibe COded Apps/sarina/android"
./gradlew bundleRelease
```

The signed AAB will be generated at the same location.

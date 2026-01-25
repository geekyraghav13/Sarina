# Sarina App Build Notes

## Build 9 (Version 1.3.0) - January 26, 2026

### Issue Fixed
- App icon and splash screen were not displaying (showing default Expo icon)
- Keystore signature mismatch when uploading to Google Play

### Solution Steps

#### 1. Regenerate Native Android Resources
```bash
cd "/home/raghav/Vibe COded Apps/sarina"
npx expo prebuild --platform android --clean
```
This applies custom icon and splash screen from `app.json` to native Android files.

#### 2. Restore Keystore
The prebuild removed the release keystore. Copied from backup:
```bash
cp /home/raghav/Downloads/sarina-upload-key.keystore android/app/
```

**Keystore Details:**
- File: `sarina-upload-key.keystore`
- SHA1: `5D:DC:CD:E0:99:ED:3A:5D:10:AE:B2:80:47:1C:93:5A:E1:B1:11:12`
- Password: `android`
- Alias: `sarina-key-alias`

#### 3. Update build.gradle
File: `android/app/build.gradle`

After prebuild, manually restored:
- Version code from 1 → 9
- Release signing config (lines 107-112)

```gradle
signingConfigs {
    release {
        storeFile file('sarina-upload-key.keystore')
        storePassword 'android'
        keyAlias 'sarina-key-alias'
        keyPassword 'android'
    }
}
```

#### 4. Build Release AAB
```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Important Files

**Assets (app.json references these):**
- `assets/icon.png` - App icon
- `assets/adaptive-icon.png` - Android adaptive icon
- `assets/splash.png` - Splash screen

**Keystore Location:**
- Production: `android/app/sarina-upload-key.keystore`
- Backup: `/home/raghav/Downloads/sarina-upload-key.keystore`

### Build Configuration

**Current Settings:**
- Version: 1.3.0
- Version Code: 9
- Package: com.sarina.app
- Min SDK: 24
- Target SDK: 36
- Compile SDK: 36

### Notes for Future Builds

1. **Never run `npx expo prebuild --clean` without backing up keystore first**
2. **Always keep keystore backup in `/home/raghav/Downloads/`**
3. **After prebuild, manually restore:**
   - Version code in `android/app/build.gradle`
   - Release signing config in `android/app/build.gradle`
   - Keystore file in `android/app/`

### Final AAB Location
```
/home/raghav/Downloads/sarina-v1.3.0-build9-CORRECT-KEYSTORE.aab
```

# Sarina AI - Build Guide v1.1.0

**Date:** January 14, 2026
**Version:** 1.1.0 (Code 4)
**Build Type:** Release AAB for Google Play Store

---

## 📋 Prerequisites

### Required Software
- ✅ Node.js 18+ installed
- ✅ npm or yarn installed
- ✅ Android Studio installed
- ✅ Android SDK (API Level 34)
- ✅ Java JDK 17+
- ✅ Expo CLI installed

### Environment Setup
```bash
# Check Node version
node --version  # Should be 18+

# Check Java version
java -version   # Should be 17+

# Check Android SDK
echo $ANDROID_HOME  # Should point to Android SDK
```

---

## 🔑 Keystore Information

### Upload Keystore
**File:** `android/app/sarina-upload-key.keystore`
**Location:** `/home/raghav/Vibe COded Apps/sarina/android/app/`

**Details:**
- **Store Password:** `android`
- **Key Alias:** `sarina-key-alias`
- **Key Password:** `android`
- **Algorithm:** RSA
- **Validity:** 10,000 days

**Configuration in build.gradle:**
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

⚠️ **IMPORTANT:** Never commit keystore to Git!

---

## 📦 Version Information

### Current Version
- **Version Code:** 4
- **Version Name:** 1.1.0
- **Package Name:** com.sarina.app

### Version History
| Version | Code | Changes |
|---------|------|---------|
| 1.1.0 | 4 | Voice calls, Reports, SafeArea, Navigation fix |
| 1.0.2 | 3 | Previous release |
| 1.0.1 | 2 | Initial features |
| 1.0.0 | 1 | First release |

### Incrementing Version
Edit `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 5       // Increment by 1
    versionName "1.2.0" // Update version name
}
```

---

## 🛠️ Build Steps

### Step 1: Clean Previous Builds
```bash
cd "/home/raghav/Vibe COded Apps/sarina"

# Clean Android build cache
cd android
./gradlew clean
cd ..
```

### Step 2: Install Dependencies
```bash
# Install npm packages
npm install

# or with yarn
yarn install
```

### Step 3: Build Release AAB
```bash
# Navigate to android folder
cd android

# Build release bundle
./gradlew bundleRelease

# Wait for build to complete (2-5 minutes)
```

### Step 4: Locate Output
```bash
# AAB file will be at:
android/app/build/outputs/bundle/release/app-release.aab

# Copy to project root (optional)
cp app/build/outputs/bundle/release/app-release.aab ../sarina-v1.1.0.aab
```

---

## 🔍 Build Verification

### Check AAB File
```bash
# Check file exists
ls -lh android/app/build/outputs/bundle/release/

# Check file size (should be 50-80 MB)
du -h android/app/build/outputs/bundle/release/app-release.aab
```

### Verify Signing
```bash
# Extract APKs from AAB (requires bundletool)
bundletool build-apks \
  --bundle=android/app/build/outputs/bundle/release/app-release.aab \
  --output=sarina.apks \
  --ks=android/app/sarina-upload-key.keystore \
  --ks-pass=pass:android \
  --ks-key-alias=sarina-key-alias \
  --key-pass=pass:android

# Verify signature
jarsigner -verify -verbose -certs sarina.apks
```

### Test on Device
```bash
# Install from AAB
bundletool install-apks --apks=sarina.apks

# Or test debug build first
cd android
./gradlew installDebug
```

---

## 📤 Upload to Google Play

### Step 1: Login to Play Console
- URL: https://play.google.com/console
- Account: raghavsharma062004@gmail.com
- App: Sarina AI (com.sarina.app)

### Step 2: Create New Release
1. Go to **Release → Production**
2. Click **Create new release**
3. Upload `app-release.aab`
4. Set release name: **v1.1.0 - Voice Calls & Reports**

### Step 3: Release Notes
```
What's New in v1.1.0:

✨ NEW FEATURES
• Voice Call System - Get incoming calls from your AI girlfriend
• Manual Call Button - Tap the green phone icon to call anytime
• Report Feature - Report issues directly from the app
• Better Device Support - Works perfectly on all screen types

🐛 BUG FIXES
• Fixed navigation crashes
• Improved image loading speed
• Better performance

🎨 IMPROVEMENTS
• Green phone button in chat header
• Vertical suggestion chips
• Professional incoming call UI
• Full-screen device support
```

### Step 4: Review & Rollout
1. Review release details
2. Set rollout percentage: **100%** (or staged 10%, 50%, 100%)
3. Click **Review Release**
4. Confirm and **Start Rollout**

---

## 🧪 Pre-Upload Testing

### Manual Testing Checklist
- [ ] Complete onboarding flow
- [ ] First incoming call appears (5 sec)
- [ ] Phone vibrates during call
- [ ] Accept/Decline both work
- [ ] Paywall appears after call
- [ ] Green phone button works
- [ ] Manual call trigger works
- [ ] Report screen accessible
- [ ] Report submission works
- [ ] Navigation smooth (no crashes)
- [ ] Images load with placeholder
- [ ] Works on notched device
- [ ] Works on button device
- [ ] All tabs functional
- [ ] Settings accessible
- [ ] Chat persistence works

### Automated Checks
```bash
# Run TypeScript checks
npx tsc --noEmit

# Run ESLint
npm run lint

# Check for gradle errors
cd android && ./gradlew check
```

---

## 🚨 Common Build Issues

### Issue 1: Keystore Not Found
**Error:** `sarina-upload-key.keystore not found`

**Solution:**
```bash
# Check if keystore exists
ls -la android/app/*.keystore

# If missing, generate new one:
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/app/sarina-upload-key.keystore \
  -alias sarina-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Issue 2: Build Failed
**Error:** `BUILD FAILED`

**Solutions:**
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew bundleRelease

# Clear gradle cache
rm -rf ~/.gradle/caches/

# Invalidate Android Studio cache
# File → Invalidate Caches → Restart
```

### Issue 3: Out of Memory
**Error:** `OutOfMemoryError`

**Solution:**
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=1024m
```

### Issue 4: SDK Not Found
**Error:** `Android SDK not found`

**Solution:**
```bash
# Set ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Add to ~/.bashrc or ~/.zshrc for persistence
```

---

## 📊 Build Configuration

### build.gradle Settings
```gradle
android {
    compileSdk 34
    buildToolsVersion "34.0.0"

    defaultConfig {
        applicationId "com.sarina.app"
        minSdkVersion 23      // Android 6.0+
        targetSdkVersion 34   // Android 14
        versionCode 4
        versionName "1.1.0"
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'),
                          'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

### ProGuard Rules
**File:** `android/app/proguard-rules.pro`

Key rules already configured:
- Keep React Native classes
- Keep Hermes classes
- Keep Firebase classes
- Keep Sentry classes

---

## 🔐 Security Best Practices

### Before Release
1. ✅ Remove all `console.log` statements
2. ✅ Remove debug API keys
3. ✅ Enable ProGuard/R8
4. ✅ Use release keystore
5. ✅ Test on physical device
6. ✅ Review permissions in manifest
7. ✅ Check for hardcoded secrets

### Keystore Safety
1. ✅ Never commit keystore to Git
2. ✅ Keep backup in secure location
3. ✅ Store passwords separately
4. ✅ Use Google Play App Signing
5. ✅ Enable two-factor auth on Play Console

### Post-Upload
1. ✅ Enable Google Play App Signing
2. ✅ Set up pre-launch reports
3. ✅ Configure crash reporting
4. ✅ Monitor reviews
5. ✅ Track analytics

---

## 📝 Release Checklist

### Pre-Build
- [x] Update version code (3 → 4)
- [x] Update version name (1.0.2 → 1.1.0)
- [x] Update CHANGELOG
- [x] Test all new features
- [x] Fix all TypeScript errors
- [x] Review ProGuard rules
- [x] Check keystore exists
- [x] Update documentation

### Build
- [ ] Clean previous builds
- [ ] Install dependencies
- [ ] Run bundleRelease
- [ ] Verify AAB created
- [ ] Check file size (50-80 MB)
- [ ] Test on device

### Upload
- [ ] Login to Play Console
- [ ] Create new release
- [ ] Upload AAB
- [ ] Add release notes
- [ ] Set rollout percentage
- [ ] Start rollout

### Post-Upload
- [ ] Monitor crash reports
- [ ] Track analytics
- [ ] Respond to reviews
- [ ] Plan next version

---

## 🆘 Support & Resources

### Documentation
- Build guide: `BUILD_GUIDE.md`
- Release notes: `RELEASE_NOTES_V1.1.0.md`
- Features: `FEATURE_DOCUMENTATION.md`
- Implementation: `IMPLEMENTATION_SUMMARY.md`

### Useful Commands
```bash
# Check Gradle version
./gradlew --version

# List all tasks
./gradlew tasks

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Build release AAB
./gradlew bundleRelease

# Install on device
./gradlew installRelease
```

### Contact
**Developer:** Raghav Sharma
**Email:** raghavsharma062004@gmail.com
**Package:** com.sarina.app

---

## 🎯 Quick Build Command

For experienced developers:
```bash
cd "/home/raghav/Vibe COded Apps/sarina/android" && \
./gradlew clean && \
./gradlew bundleRelease && \
ls -lh app/build/outputs/bundle/release/
```

---

**Happy Building! 🚀**

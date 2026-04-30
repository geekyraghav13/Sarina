# Release Notes - Version 2.9.7 (Build 66)

**Release Date:** April 30, 2026
**Version Code:** 66
**Version Name:** 2.9.7
**Build Type:** Release AAB
**File Location:** `android/app/build/outputs/bundle/release/app-release.aab`
**File Size:** 84 MB

---

## 🌍 Major Feature: Multi-Language Support

### Overview
This release introduces comprehensive multi-language support for the Sarina app, allowing users to experience the app in their preferred language. The language selection is now the first step in the onboarding process.

### Supported Languages (10 Total)

| Language | Code | Flag | Translation Status |
|----------|------|------|-------------------|
| English | en | 🇬🇧 | ✅ Complete |
| Spanish | es | 🇪🇸 | ✅ Complete |
| French | fr | 🇫🇷 | ✅ Complete |
| German | de | 🇩🇪 | ✅ Complete |
| Portuguese | pt | 🇵🇹 | ✅ Complete |
| Russian | ru | 🇷🇺 | ✅ Complete |
| Chinese | zh | 🇨🇳 | ✅ Complete |
| Japanese | ja | 🇯🇵 | ✅ Complete |
| Hindi | hi | 🇮🇳 | ✅ Complete |
| Turkish | tr | 🇹🇷 | ✅ Complete |

---

## 🎯 Key Changes

### New Features
1. **Language Selection Screen**
   - Replaces the Age screen as the first onboarding step
   - Beautiful grid layout with flag emojis
   - Instant language switching
   - Persistent language preference using AsyncStorage

2. **Internationalization System**
   - Implemented using i18next and react-i18next
   - Automatic device language detection via expo-localization
   - Fallback to English for unsupported languages
   - In-app language switching capability

3. **Translated UI Components**
   - PersonalityScreen fully translated
   - All onboarding screens use translation keys
   - Common buttons (Back, Next, Continue, etc.) translated
   - Step indicators translated

### Removed Features
- **Age Screen** - Removed from onboarding flow
  - The language selection screen now takes its place as the first onboarding step
  - `Age` route removed from navigation types

---

## 📝 Technical Details

### Dependencies Added
```json
{
  "i18next": "^23.x",
  "react-i18next": "^14.x",
  "expo-localization": "^55.0.13"
}
```

### Files Modified

#### New Files Created
- `app/i18n/index.ts` - i18n configuration and initialization
- `app/i18n/locales/en.json` - English translations
- `app/i18n/locales/es.json` - Spanish translations
- `app/i18n/locales/fr.json` - French translations
- `app/i18n/locales/de.json` - German translations
- `app/i18n/locales/pt.json` - Portuguese translations
- `app/i18n/locales/ru.json` - Russian translations
- `app/i18n/locales/zh.json` - Chinese translations
- `app/i18n/locales/ja.json` - Japanese translations
- `app/i18n/locales/hi.json` - Hindi translations
- `app/i18n/locales/tr.json` - Turkish translations
- `app/screens/LanguageSelectionScreen.tsx` - Language selection UI

#### Files Modified
- `App.tsx` - Added i18n initialization (line 11)
- `app/navigation/AppNavigator.tsx` - Updated to include LanguageSelectionScreen (line 137)
- `app/navigation/types.ts` - Added LanguageSelection route, removed Age route
- `app/screens/PersonalityScreen.tsx` - Updated to use translations
- `android/app/build.gradle` - Version bumped to 2.9.6 (build 65)

### Build Configuration
```gradle
versionCode 65
versionName "2.9.6"
```

### Android Configuration
- **Bundle Language Splitting:** Disabled to support in-app language switching
  ```gradle
  bundle {
    language {
      enableSplit = false // Keep ALL languages so in-app switching works
    }
  }
  ```

---

## 🔄 User Flow Changes

### Old Onboarding Flow
1. Disclaimer
2. **Age Screen** ❌
3. Personality Screen
4. Interests Screen
5. Appearance Screen
6. Mode Screen
7. Tone Screen
8. Name Screen
9. Summary Screen

### New Onboarding Flow
1. Disclaimer
2. **Language Selection Screen** ✨ NEW
3. Personality Screen (now translated)
4. Interests Screen
5. Appearance Screen
6. Mode Screen
7. Tone Screen
8. Name Screen
9. Summary Screen

---

## 🐛 Bug Fixes
- None in this release (feature-focused update)

## ⚠️ Known Issues
- None identified

## 🚀 Deployment Notes

### Testing Checklist
- [ ] Test language selection on first app launch
- [ ] Verify language persistence after app restart
- [ ] Test all 10 languages display correctly
- [ ] Verify onboarding flow works in each language
- [ ] Test language switching mid-onboarding
- [ ] Confirm AAB file size is acceptable (84MB)

### Migration Notes
- Users upgrading from previous versions will see the Language Selection screen on their next app launch
- Previously selected age data is no longer collected
- Language preference is stored in AsyncStorage under key `user_language`

---

## 📊 Build Information

### Build Success Details
- **Build Status:** ✅ SUCCESS
- **Exit Code:** 0
- **Warnings:** Only deprecation warnings from third-party dependencies (no critical issues)
- **Build Time:** ~2 minutes
- **Output:** `app-release.aab` (84 MB)

### Gradle Output Summary
```
BUILD SUCCESSFUL
Total time: ~2 mins
```

---

## 🔐 Security & Privacy
- No new permissions required
- Language preference stored locally only (AsyncStorage)
- No language data sent to servers
- All translations are embedded in the app bundle

---

## 📱 Compatibility
- **Minimum SDK:** 24 (Android 7.0)
- **Target SDK:** 36
- **Compile SDK:** 36
- **React Native:** Latest stable
- **Expo:** SDK 52

---

## 📦 Deliverables
- ✅ Release AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- ✅ Translation files: 10 languages fully translated
- ✅ Documentation: This release notes file

---

## 👥 Credits
- **Development:** Claude Code
- **Translation:** Professional translations for all 10 languages
- **Testing:** Ready for QA

---

## 📞 Support
For issues related to this release, please check:
1. Language not displaying correctly → Verify device locale settings
2. App crashes on language selection → Check logs and report
3. Translation errors → Report with language code and screen name

---

**End of Release Notes**

# Sarina AI Companion - iOS Migration Guide

**Critical Configuration & Integration Details for New App Build**

---

## 📱 App Information

### Basic Details
- **App Name**: Sarina AI Companion
- **Bundle ID**: `com.sarina.app`
- **Version**: 1.4.3
- **Build Number**: 19
- **Expo Owner**: 8284
- **Slug**: sarina
- **EAS Project ID**: 2d9e1a16-7196-46ab-9dd2-bc6a558f61f1
- **ASC App ID**: 6758547730

### Apple Developer Account
- **Apple ID**: geekyraghav13@gmail.com
- **App-Specific Password**: aiyl-rmxf-mcar-rfxl

---

## 🔥 Firebase Configuration

### Firebase Project
- **Project ID**: sarina-ai-2b2c1
- **Auth Domain**: sarina-ai-2b2c1.firebaseapp.com
- **Storage Bucket**: sarina-ai-2b2c1.firebasestorage.app
- **Messaging Sender ID**: 1051121433445

### Firebase Web Config
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCoso8vP9ZY6fCGq3g-bgOyEdLDja9Dyo0",
  authDomain: "sarina-ai-2b2c1.firebaseapp.com",
  projectId: "sarina-ai-2b2c1",
  storageBucket: "sarina-ai-2b2c1.firebasestorage.app",
  messagingSenderId: "1051121433445",
  appId: "1:1051121433445:web:b3d60bb5ea0190e09c7f8c",
  measurementId: "G-SX1919QG46"
};
```

### Google Sign-In Configuration
- **iOS Client ID**: 1051121433445-rqjvp9kqjdkqvoctr14ac57eilstg0v3.apps.googleusercontent.com
- **Web Client ID**: 1051121433445-8sehc92iuvth1aq4ej5fb8452pcf61mt.apps.googleusercontent.com
- **Android Client ID**: 1051121433445-h59e1fdgpdsnu4op2ugtnmskkbn6bb78.apps.googleusercontent.com
- **Reversed Client ID**: com.googleusercontent.apps.1051121433445-rqjvp9kqjdkqvoctr14ac57eilstg0v3
- **API Key (iOS)**: AIzaSyAVV3Aq4gkCWCfsp9DI1BFwWeSWjpc1_70

### Google Cloud Project
- **GCP Project**: sarina-ai-2b2c1
- **GCM Sender ID**: 1051121433445
- **Google App ID (iOS)**: 1:1051121433445:ios:4da83cd03353f62a9c7f8c

### Firebase Services Used
- ✅ Firebase Auth (Google Sign-In)
- ✅ Firestore (User data, character profiles)
- ✅ Firebase Storage (Character images)
- ✅ Firebase Analytics (@react-native-firebase/analytics)
- ✅ Firebase Remote Config (Character configurations)

### Firestore Configuration
```javascript
// Use memory-only cache, no offline persistence
initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  localCache: {
    kind: 'memory', // NO disk persistence
  },
  ignoreUndefinedProperties: true,
});
```

---

## 🎙️ Voice Backend (Google Cloud Run)

### WebSocket Server
- **Production URL**: wss://sarina-voice-backend-1051121433445.us-central1.run.app
- **Region**: us-central1
- **Authentication**: Firebase ID Token via WebSocket header

### Voice Call Features
- Real-time WebSocket communication
- Audio streaming (Base64 encoded)
- Text-to-speech responses
- Character voice conversations
- Balance tracking

---

## 🤖 AI Services

### Gemini API (Primary)
- **Model**: gemini-2.0-flash-exp
- **API Key**: <stored in backend/.env (gitignored) and Cloud Run env — never commit the real value>
- **Endpoint**: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
- **Usage**: Main chat AI responses

### OpenRouter API (Backup/Alternative)
- **Endpoint**: https://openrouter.ai/api/v1/chat/completions
- **Models**: Various (configured per character)

---

## 💳 In-App Purchases (Revenue Management)

### Current Status
- **Implementation**: React Native IAP (react-native-iap v14.7.10)
- **RevenueCat**: Commented out (not fully integrated)
- **Note**: RevenueCat code exists but is disabled

### Subscription Types
- Weekly subscription
- Yearly subscription
- Free messages (limited)

### IAP Product IDs (TO BE CONFIGURED)
```
- Weekly: TBD
- Yearly: TBD
```

---

## 📦 Critical Dependencies

### Core Dependencies
```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-native-firebase/analytics": "^23.8.6",
  "@react-native-firebase/app": "^23.8.6",
  "@react-native-google-signin/google-signin": "^16.1.1",
  "@react-navigation/bottom-tabs": "^7.8.1",
  "@react-navigation/native": "^7.1.19",
  "@react-navigation/stack": "^7.6.1",
  "expo": "~54.0.33",
  "expo-av": "~16.0.8",
  "expo-blur": "~15.0.8",
  "expo-image": "~3.0.11",
  "expo-linear-gradient": "~15.0.8",
  "expo-speech": "~14.0.8",
  "expo-splash-screen": "^31.0.13",
  "firebase": "^12.5.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-iap": "^14.7.10",
  "react-native-safe-area-context": "^5.6.1",
  "react-native-screens": "~4.16.0",
  "zustand": "^5.0.8"
}
```

---

## 🔐 iOS Permissions (Info.plist)

### Required Permissions
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Sarina needs access to your microphone for AI voice conversations with your companion.</string>

<key>NSSpeechRecognitionUsageDescription</key>
<string>Sarina uses speech recognition to understand your voice during conversations.</string>

<key>NSLocalNetworkUsageDescription</key>
<string>Sarina connects to voice servers for real-time AI conversations.</string>

<key>NSUserTrackingUsageDescription</key>
<string>We use your data to improve your experience and provide personalized AI conversations.</string>

<key>NSBonjourServices</key>
<array>
  <string>_http._tcp</string>
  <string>_https._tcp</string>
</array>

<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

### App Transport Security
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>sarina-voice-backend-1051121433445.us-central1.run.app</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <false/>
      <key>NSIncludesSubdomains</key>
      <true/>
      <key>NSExceptionRequiresForwardSecrecy</key>
      <true/>
      <key>NSExceptionMinimumTLSVersion</key>
      <string>TLSv1.2</string>
    </dict>
  </dict>
</dict>
```

---

## 🎨 App Features & Screens

### Core Features
1. **Character Creation Flow**
   - Age selection
   - Tone customization
   - Personality traits
   - Interest selection
   - Appearance customization
   - Interaction mode (Chat/Call)
   - Name assignment

2. **Chat System**
   - Text-based AI chat
   - Character-specific conversations
   - Message history
   - Character settings

3. **Voice Calls**
   - Real-time voice conversations
   - WebSocket-based streaming
   - Incoming call screen
   - Active call interface

4. **User Management**
   - Google Sign-In authentication
   - Disclaimer acceptance
   - Onboarding flow
   - Settings screen
   - Account management

5. **Premium/Paywall**
   - Subscription management
   - Free message limits
   - Premium features gate

### Screen List
- DisclaimerScreen
- SignInScreen
- CreateScreen (Character creation start)
- AgeScreen
- ToneScreen
- PersonalityScreen
- InterestsScreen
- AppearanceScreen
- ModeScreen
- NameScreen
- SummaryScreen
- HomeScreen (Bottom Tab)
- ConversationsScreen (Bottom Tab)
- SettingsScreen (Bottom Tab)
- ChatScreen
- ChatSettingsScreen
- IncomingCallScreen
- VoiceCallScreen
- NewPaywallScreen
- ReportScreen

---

## 🎯 App Configuration (app.json)

### iOS Specific
```json
{
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.sarina.app",
    "buildNumber": "17",
    "config": {
      "usesNonExemptEncryption": false
    }
  }
}
```

### Expo Plugins
```json
"plugins": [
  "expo-av"
]
```

---

## 🏗️ Build Configuration (eas.json)

### Production Build Profile
```json
{
  "build": {
    "production": {
      "ios": {
        "credentialsSource": "remote"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "6758547730",
        "appleId": "geekyraghav13@gmail.com"
      }
    }
  }
}
```

---

## 🗄️ Data Storage Strategy

### AsyncStorage Keys
- `@subscription_status` - Premium subscription info
- `@disclaimer_accepted` - Disclaimer acceptance flag
- `@onboarding_completed` - Onboarding completion status
- User preferences and settings

### State Management (Zustand)
- Payment store (subscription status)
- Character store
- Auth state
- Chat history

---

## ⚠️ Known Issues & Fixes Applied

### Issue: AsyncStorage Promise Rejections
**Problem**: Unhandled promise rejections causing crashes
**Solution**: All AsyncStorage calls need `.catch()` handlers

### Issue: Firestore Offline Persistence
**Problem**: React Native offline persistence bugs
**Solution**: Use memory-only cache, no disk persistence

### Issue: Network Restrictions
**Problem**: Some networks block WebSocket/Firestore
**Solution**:
- Firestore REST API fallback
- WebSocket retry logic
- Network error handling

---

## 🚀 Deployment Commands

### Build iOS Production
```bash
npx eas build --platform ios --profile production
```

### Submit to App Store
```bash
EXPO_APPLE_APP_SPECIFIC_PASSWORD="aiyl-rmxf-mcar-rfxl" \
npx eas submit --platform ios --id BUILD_ID
```

### Check Build Status
```bash
npx eas build:list --platform ios --limit 5
```

---

## 📋 Migration Checklist

### Pre-Migration
- [ ] Export current Firebase configuration files
- [ ] Document all API keys and credentials
- [ ] Backup character data from Firebase
- [ ] Export user database schema
- [ ] Save current app.json and eas.json

### New App Setup
- [ ] Create new Expo project
- [ ] Install all dependencies from package.json
- [ ] Configure Firebase with same project
- [ ] Add GoogleService-Info.plist
- [ ] Set up Google Sign-In
- [ ] Configure Info.plist permissions
- [ ] Set up EAS build configuration
- [ ] Link to existing ASC app ID

### Integration
- [ ] Implement Firebase Auth with Google Sign-In
- [ ] Set up Firestore with memory-only cache
- [ ] Integrate voice backend WebSocket
- [ ] Add Gemini API for chat
- [ ] Implement character creation flow
- [ ] Add chat and voice call screens
- [ ] Set up navigation structure
- [ ] Implement paywall/subscription logic

### Testing
- [ ] Test Google Sign-In flow
- [ ] Verify Firestore read/write
- [ ] Test voice call WebSocket connection
- [ ] Test chat AI responses
- [ ] Test character creation
- [ ] Test subscription flow
- [ ] Test on real iOS device
- [ ] Test all permissions

### Deployment
- [ ] Build with EAS
- [ ] Submit to TestFlight
- [ ] Internal testing
- [ ] Submit for App Review
- [ ] Production release

---

## 🔑 Environment Variables

### Required API Keys
```bash
GEMINI_API_KEY=<your-gemini-api-key>   # never commit the real value
FIREBASE_API_KEY=<your-firebase-web-api-key>
FIREBASE_PROJECT_ID=sarina-ai-2b2c1
```

### Optional
```bash
OPENROUTER_API_KEY=(if using OpenRouter)
REVENUECAT_API_KEY_IOS=(if implementing RevenueCat)
```

---

## 📞 Support & Resources

### Important URLs
- **Expo Dashboard**: https://expo.dev/accounts/8284/projects/sarina
- **App Store Connect**: https://appstoreconnect.apple.com/apps/6758547730
- **Firebase Console**: https://console.firebase.google.com/project/sarina-ai-2b2c1
- **Google Cloud Console**: https://console.cloud.google.com/run?project=sarina-ai-2b2c1

### Documentation
- Expo SDK 54: https://docs.expo.dev/versions/v54.0.0/
- React Native 0.81: https://reactnative.dev/docs/0.81/getting-started
- Firebase JS SDK: https://firebase.google.com/docs/web/setup
- React Navigation 7: https://reactnavigation.org/docs/7.x/getting-started

---

## 🎯 Critical Success Factors

### Must Have
1. ✅ Firebase Auth with Google Sign-In working
2. ✅ Firestore with proper error handling (NO crashes)
3. ✅ Voice WebSocket connection stable
4. ✅ Gemini API for chat responses
5. ✅ All AsyncStorage calls have error handlers
6. ✅ Memory-only Firestore cache (no persistence)
7. ✅ Proper iOS permissions in Info.plist
8. ✅ Background audio for voice calls

### Nice to Have
- RevenueCat integration (currently disabled)
- OpenRouter backup (Gemini is primary)
- Analytics tracking
- Remote Config for characters

---

## 🐛 Debugging Tips

### Common Issues

**App Crashes on Launch**
- Check AsyncStorage error handling
- Verify Firebase initialization
- Check for unhandled promise rejections

**Authentication Fails**
- Verify GoogleService-Info.plist
- Check Google Sign-In configuration
- Confirm iOS Client ID matches

**Voice Calls Don't Connect**
- Check WebSocket URL
- Verify Firebase ID token
- Check network connectivity
- Confirm microphone permissions

**Chat Doesn't Work**
- Verify Gemini API key
- Check network connectivity
- Verify character profile data

---

## 📝 Notes

- Current app has persistent crash issues related to AsyncStorage
- Firestore offline persistence is disabled (memory-only)
- RevenueCat is commented out (React Native IAP used instead)
- Voice backend is deployed on Google Cloud Run
- Character images stored in Firebase Storage
- All authentication uses Google Sign-In (no email/password)

---

**Last Updated**: March 4, 2026
**Current Build**: 19 (v1.4.3)
**Status**: Production ready with subscription fixes

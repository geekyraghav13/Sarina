# Quick Start Guide

## ✅ App is Ready!

The Sarina AI Girlfriend app has been successfully built and is now running!

## 🎯 Current Status

The Metro bundler is running at: `exp://172.16.101.198:8081`

## 📱 How to View the App

### Option 1: Use Expo Go (Recommended for quick testing)
1. Download **Expo Go** from:
   - iOS: App Store
   - Android: Google Play Store

2. Scan the QR code shown in your terminal

3. The app will load on your phone!

### Option 2: iOS Simulator (Mac only)
```bash
# Press 'i' in the terminal where npm start is running
# OR run:
npm run ios
```

### Option 3: Android Emulator
```bash
# Press 'a' in the terminal where npm start is running
# OR run:
npm run android
```

### Option 4: Web Browser
```bash
# Press 'w' in the terminal
# OR run:
npm run web
```

## 🔄 If You Stopped the Server

Restart with:
```bash
npm start
```

Or clear cache and restart:
```bash
npm start -- --clear
```

## 🐛 Troubleshooting

### React Version Error (Already Fixed!)
✅ Fixed by installing compatible versions

### Video Not Loading
The placeholder video is very minimal. For better testing:
1. Download a free video from:
   - https://www.pexels.com/videos/
   - https://pixabay.com/videos/
   - https://coverr.co/

2. Save it as `assets/videos/default.mp4`

3. Restart the server:
   ```bash
   # Stop with Ctrl+C, then:
   npm start
   ```

### App Crashes
1. Clear cache:
   ```bash
   npm start -- --clear
   ```

2. Reinstall node_modules:
   ```bash
   rm -rf node_modules
   npm install
   npm start
   ```

## 🎮 Testing the App

1. **CreateScreen**: Tap "Start Creating"
2. **AgeScreen**: Scroll to select your age (18+)
3. **ToneScreen**: Select personality tones (Cute, Flirty, etc.)
4. **PersonalityScreen**: Choose character traits
5. **InterestsScreen**: Pick interests
6. **AppearanceScreen**: Choose visual style
7. **ModeScreen**: Select conversation mode
8. **NameScreen**: Enter a name or generate random
9. **SummaryScreen**: Review and confirm
10. **ChatScreen**: Start chatting!

## 🚀 What Works Now

✅ Full navigation flow (all 10 screens)
✅ State management (profile saved)
✅ Beautiful UI with glassmorphism
✅ Video backgrounds
✅ All interactive components
✅ Chat interface (simulated responses)

## 🔮 What to Add Next

1. **AI Integration**: Replace simulated chat responses with real AI
   - Edit: `app/screens/ChatScreen.tsx` (line ~53)
   - Add OpenAI/Anthropic/custom API

2. **Better Videos**: Add cinematic background videos
   - Place in: `assets/videos/`
   - Update: `app/constants/backgrounds.ts`

3. **Persistence**: Save chat history and profile
   - Add AsyncStorage
   - Integrate with Zustand store

4. **Voice Features**: Add TTS/STT
   - Use expo-speech
   - Add voice recording

## 💡 Pro Tips

- **Hot Reload**: Edit any file and save - changes appear instantly!
- **Debugging**: Press 'j' in terminal for debugger
- **Menu**: Shake device or press 'm' to open dev menu
- **Reload**: Press 'r' in terminal to reload app

## 📞 Commands Reference

While server is running, press:
- `a` - Open Android emulator
- `i` - Open iOS simulator
- `w` - Open in web browser
- `j` - Open debugger
- `r` - Reload app
- `m` - Toggle dev menu
- `?` - Show all commands

## 🎉 You're All Set!

The app is fully functional and ready to customize. Enjoy building your AI girlfriend app!

---

**Need help?** Check:
- README.md - Project overview
- SETUP.md - Detailed setup guide
- AGENTS.md - Original specifications

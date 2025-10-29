# Sarina - Your AI Girlfriend

An immersive AI girlfriend mobile app built with Expo and React Native.

## Features

- **Cinematic Onboarding Flow**: 8-step character creation with dynamic video backgrounds
- **Customizable AI Personality**: Choose tone, personality traits, interests, and appearance
- **Multiple Conversation Modes**: Safe, Romantic, and NSFW options
- **Beautiful UI**: Glassmorphism effects, smooth animations, and immersive video backgrounds
- **Real-time Chat**: Text and voice input support

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for screen transitions
- **Zustand** for state management
- **expo-av** for video backgrounds
- **expo-blur** for glassmorphism effects
- **react-native-reanimated** for smooth animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app on your phone)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Add background videos:
   - Place at least one video file named `default.mp4` in `assets/videos/`
   - You can download free stock videos from Pexels, Pixabay, or Coverr
   - Recommended specs: 1080x1920 (9:16), MP4 format, under 10MB

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
/sarina
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── VideoBackground.tsx
│   │   ├── GlassContainer.tsx
│   │   ├── ChipSelector.tsx
│   │   ├── ModeCard.tsx
│   │   └── AgeWheel.tsx
│   ├── screens/             # App screens
│   │   ├── CreateScreen.tsx
│   │   ├── AgeScreen.tsx
│   │   ├── ToneScreen.tsx
│   │   ├── PersonalityScreen.tsx
│   │   ├── InterestsScreen.tsx
│   │   ├── AppearanceScreen.tsx
│   │   ├── ModeScreen.tsx
│   │   ├── NameScreen.tsx
│   │   ├── SummaryScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── store/              # State management
│   │   └── userProfile.ts
│   └── constants/          # App constants
│       └── backgrounds.ts
├── assets/                 # Static assets
│   └── videos/            # Background videos
├── App.tsx                # App entry point
└── package.json

```

## Onboarding Flow

1. **Create Screen**: Welcome screen with "Start Creating" and "Surprise Me" options
2. **Age Screen**: Age selection with scroll wheel (18+)
3. **Tone Screen**: Multi-select personality tones (Cute, Flirty, Friendly, etc.)
4. **Personality Screen**: Character traits (Kind, Adventurous, Intelligent, etc.)
5. **Interests Screen**: Select hobbies and interests
6. **Appearance Screen**: Choose visual style (Realistic, Anime, Fantasy, Minimal)
7. **Mode Screen**: Conversation mode (Safe, Romantic, NSFW)
8. **Name Screen**: Give your AI a name or generate a random one
9. **Summary Screen**: Review all selections
10. **Chat Screen**: Start chatting with your personalized AI

## Customization

### Adding New Tones/Personalities/Interests

Edit the respective screen files:
- `app/screens/ToneScreen.tsx` - TONE_OPTIONS array
- `app/screens/PersonalityScreen.tsx` - PERSONALITY_OPTIONS array
- `app/screens/InterestsScreen.tsx` - INTEREST_OPTIONS array

### Adding New Background Videos

1. Add video files to `assets/videos/`
2. Update `app/constants/backgrounds.ts` to map tones/modes to videos

### Styling

All styles use a consistent design system:
- Primary color: `#FF3263` (pink/red)
- Background: Dynamic video with dark overlay
- UI: Glassmorphism with blur effects
- Font: System default (Inter/SF Pro)

## Future Enhancements

- AI chat integration (OpenAI, Anthropic, or custom model)
- Voice synthesis (TTS) and recognition (STT)
- Image generation for character avatars
- Chat history persistence
- User authentication
- Cloud sync across devices
- Advanced personality customization
- Multiple AI characters

## License

MIT License - feel free to use this project for learning or as a starting point for your own app.

## Notes

This is a UI/UX template and starter project. The actual AI chat functionality needs to be integrated with your preferred AI service (OpenAI, Anthropic Claude, etc.).

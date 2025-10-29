
# `agents.md`

> **Project:** Sarina – Your AI Girlfriend
> **Platform:** React Native (Expo)
> **AI Agent:** Codex / Copilot — responsible for generating and completing code with minimal manual intervention.

---

## 📱 Overview

Sarina is an immersive AI girlfriend mobile app built with **Expo**.
The UI is cinematic and emotional — onboarding screens use **dynamically changing background videos** (based on user preferences like mood, tone, and mode).

The app flow mimics a “character creation” experience, guiding users through tone, personality, appearance, boundaries, and chat mode setup.

---

## 🧠 Agent Goals

1. **Set up a modern Expo app** with support for:

   * TypeScript
   * React Navigation
   * Video backgrounds
   * Smooth transitions (fade in/out, progress bar)

2. **Create reusable onboarding screen components** with:

   * Dynamic video backgrounds
   * Overlay gradient + glassmorphism containers
   * “Next / Back” navigation logic
   * State persistence across steps.

3. **Implement modular context/state management** for:

   * User’s tone & personality preferences
   * Interests
   * Age selection
   * Mode (Safe / Romantic / NSFW)
   * Character appearance style
   * Selected background theme.

4. **Add a customizable chat screen** (voice + text mode):

   * Sticky input bar with quick actions
   * Dynamic character avatar rendering
   * Mode-based personality responses.

---

## 🧭 Onboarding Flow (Agent Tasks)

| Step | Screen                          | Key Components                                      | State       |
| ---- | ------------------------------- | --------------------------------------------------- | ----------- |
| 0    | “Create your AI Girlfriend”     | Video background, Start/Surprise buttons            | init        |
| 1    | Age selection                   | Scroll wheel UI, validation (18+)                   | age         |
| 2    | Email Verification *(optional)* | Email input, resend logic                           | auth        |
| 3    | Tone Selection                  | Chip grid (Cute, Flirty, Friendly…)                 | tone        |
| 4    | Personality Selection           | Chip grid (Kind, Adventurous, etc.)                 | personality |
| 5    | Interests                       | Chip grid (Music, Movies…)                          | interests   |
| 6    | Appearance                      | Card selection (Realistic, Anime, Fantasy, Minimal) | appearance  |
| 7    | Mode Selection                  | Mode cards (Safe, Romantic, NSFW)                   | mode        |
| 8    | Name Setup                      | Text input + random name generator                  | name        |
| 9    | Summary                         | Preview selections, confirm                         | userProfile |
| 10   | Chat Interface                  | Voice/Text toggle, dynamic persona                  | runtime     |

---

## 🧩 Key Components & Hooks

* `VideoBackground.tsx`

  * Wraps `expo-av` Video
  * Receives video URI dynamically from state
  * Handles fade transitions when switching preferences.

* `GlassContainer.tsx`

  * Shared wrapper for content over video
  * Uses `blurView` + semi-transparent gradient.

* `ChipSelector.tsx`

  * Reusable chip grid for tone, personality, interests.
  * Supports multi-select and styling.

* `ModeCard.tsx`

  * Styled cards for Safe / Romantic / NSFW mode.

* `AgeWheel.tsx`

  * Scroll wheel with snap effect for age selection.

* `Navigation.tsx`

  * Handles screen transitions
  * Uses `createStackNavigator` or `createSharedElementStackNavigator`.

* `ChatScreen.tsx`

  * Voice/Text toggle bar
  * Message bubbles with mode-driven styling.

---

## 🪄 Dynamic Background Logic

* All backgrounds are **.mp4 video files** stored locally or fetched via CDN.

* Background selection depends on:

  * Personality (e.g., flirty → warm lighting)
  * Mode (Safe / Romantic / NSFW)
  * Tone

* Implement a lightweight mapping file:

  ```ts
  const backgroundMap = {
    flirty: require('./assets/videos/flirty.mp4'),
    cute: require('./assets/videos/cute.mp4'),
    romantic: require('./assets/videos/romantic.mp4'),
    default: require('./assets/videos/default.mp4'),
  };
  ```

* When user selects preferences, background updates with a smooth fade transition.

---

## 🧠 State Management

Use **Zustand** or **React Context**:

```ts
interface UserProfile {
  age: number;
  tone: string[];
  personality: string[];
  interests: string[];
  appearance: string;
  mode: string;
  name: string;
}

const useUserProfile = create<UserProfileStore>((set) => ({
  profile: {},
  setProfile: (updates) => set((state) => ({
    profile: { ...state.profile, ...updates }
  })),
}));
```

---

## 🧭 Navigation Structure

```
/app
  ├── screens/
  │   ├── CreateScreen.tsx
  │   ├── AgeScreen.tsx
  │   ├── ToneScreen.tsx
  │   ├── PersonalityScreen.tsx
  │   ├── InterestsScreen.tsx
  │   ├── AppearanceScreen.tsx
  │   ├── ModeScreen.tsx
  │   ├── NameScreen.tsx
  │   ├── SummaryScreen.tsx
  │   └── ChatScreen.tsx
  ├── components/
  │   ├── VideoBackground.tsx
  │   ├── GlassContainer.tsx
  │   ├── ChipSelector.tsx
  │   ├── ModeCard.tsx
  │   └── AgeWheel.tsx
  └── store/
      └── userProfile.ts
```

---

## 🧭 AI/Chat Integration (Future Scope)

* Text + voice input
* Mode-driven response generation (e.g., Safe vs Romantic tone)
* Support for TTS & STT using **Expo Speech** or third-party APIs.

---

## 🛠️ Dev Setup

```bash
npx create-expo-app Sarina
cd Sarina
npm install @react-navigation/native @react-navigation/stack
npx expo install expo-av expo-blur expo-speech
npm install zustand
```

---

## 🎨 Design Tokens

* **Font:** Inter / SF Pro
* **Background:** looping mp4 (per mode)
* **UI Style:** Glassmorphism, soft gradients, cinematic lighting
* **Primary color:** `#FFFFFF`
* **Accent:** `#FF3263`

---

## 🧪 Agent Instructions

* Generate screens and components modularly.
* Use dynamic props for everything (text, video source, button labels).
* Use proper TypeScript types.
* Maintain clean, reusable architecture.
* Implement smooth transitions with `Animated` or `Reanimated`.
* Write code as if it will be shipped to production.

---

## ✅ Deliverables

1. Functional Expo project with onboarding flow
2. Dynamic video background system
3. State management + navigation
4. Summary preview & chat UI
5. Clean, documented, componentized code.

---


# Sarina AI - Complete Feature Documentation v1.1.0

**Last Updated:** January 14, 2026

---

## 📋 Table of Contents

1. [Voice Call System](#voice-call-system)
2. [Report Feature](#report-feature)
3. [SafeAreaView Support](#safeareaview-support)
4. [Navigation Fix](#navigation-fix)
5. [UI Improvements](#ui-improvements)
6. [Technical Architecture](#technical-architecture)
7. [User Flows](#user-flows)
8. [API Reference](#api-reference)

---

## 📞 Voice Call System

### Overview
A complete voice call experience that mimics real phone calls, including incoming call UI, vibration, and premium paywall integration.

### Components

#### 1. IncomingCallScreen
**File:** `app/screens/IncomingCallScreen.tsx`

**Features:**
- Full-screen incoming call UI
- Phone vibration with pattern
- Animated avatar with dual glow rings
- Character name from user's choice
- Random character image from Firebase
- Two action buttons: Accept / Decline
- Both actions lead to paywall

**Props:**
```typescript
interface IncomingCallScreenProps {
  route: {
    params: {
      characterName: string;
      characterImageUrl?: string;
    };
  };
  navigation: StackNavigationProp;
}
```

**Animations:**
- Avatar pulse: Scale 1.0 → 1.1 (1000ms loop)
- Glow ring 1: Opacity 0.3 → 0.8, Scale 1.0 → 1.15
- Glow ring 2: Opacity 0.5 → 0.3, Scale 1.1 → 1.25

**Vibration Pattern:**
```javascript
Vibration.vibrate([0, 1000, 500, 1000, 500, 1000], true);
// 0ms pause, 1000ms vibrate, 500ms pause, repeat
```

**UI Elements:**
- Top badge: "📞 Voice Call"
- Avatar: 140×140 with white border
- Name: 36px bold white text
- Subtitle: "Incoming voice call..."
- Features: "🔒 Private" + "🎙️ HD Audio"
- Accept button: Green gradient (75×75)
- Decline button: Red gradient (75×75)

#### 2. Call State Management
**File:** `app/store/callStore.ts`

**State:**
```typescript
interface CallState {
  hasSeenCall: boolean;
  lastDeclinedTime: number | null;
  isPremium: boolean;
}
```

**Methods:**
- `setHasSeenCall(seen: boolean)` - Mark call as viewed
- `setLastDeclinedTime(time: number)` - Track decline timestamp
- `setPremium(premium: boolean)` - Set premium status
- `shouldShowCall(): boolean` - Check if call should appear
- `reset()` - Clear all state

**Logic Flow:**
```typescript
shouldShowCall() {
  // Premium users don't see calls
  if (isPremium) return false;

  // First time users see call
  if (!hasSeenCall) return true;

  // Check if 1 minute passed since last decline
  if (lastDeclinedTime) {
    const elapsed = Date.now() - lastDeclinedTime;
    return elapsed >= 60000; // 1 minute
  }

  return false;
}
```

**Persistence:**
- Stored in AsyncStorage with key: `@call_state`
- Auto-loads on app start
- Survives app restarts

#### 3. Trigger Mechanisms

**A. Automatic Trigger (Onboarding)**
**File:** `app/screens/ChatScreen.tsx` (lines 102-130)

```typescript
useEffect(() => {
  if (fromOnboarding && shouldShowCall()) {
    const timer = setTimeout(() => {
      navigation.navigate('IncomingCall', {
        characterName: girlfriendName,
        characterImageUrl: selectedGirlfriend?.imageUrl,
      });
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }
}, [fromOnboarding, shouldShowCall]);
```

**Timing:**
- User completes onboarding
- Navigates to Chat
- Wait 5 seconds
- Call appears automatically

**B. Manual Trigger (Phone Button)**
**File:** `app/screens/ChatScreen.tsx` (lines 315-321)

```typescript
const handlePhoneCall = () => {
  navigation.navigate('IncomingCall', {
    characterName: girlfriendName,
    characterImageUrl: selectedGirlfriend?.imageUrl,
  });
};
```

**Location:** Chat header, right side
**Design:** Green button with phone emoji
**Action:** Instant call screen

**C. Recurring Trigger**
**File:** `app/screens/ChatScreen.tsx` (lines 117-129)

```typescript
if (!fromOnboarding) {
  const checkInterval = setInterval(() => {
    if (shouldShowCall()) {
      navigation.navigate('IncomingCall', { ... });
      clearInterval(checkInterval);
    }
  }, 10000); // Check every 10 seconds
}
```

**Logic:**
- After user declines call
- Wait 1 minute (60,000ms)
- Check every 10 seconds
- Show call when time elapsed

#### 4. Paywall Integration
**File:** `app/screens/PaywallScreen.tsx`

**Trigger Points:**
- Accept call → Navigate to Paywall
- Decline call → Navigate to Paywall

**Features:**
- Lock icon (🔓)
- Title: "Unlock Premium"
- Subtitle: "Continue voice calling with {name}"
- 5 premium features with checkmarks
- 2 pricing tiers (Monthly $9.99, Weekly $2.99)
- "BEST VALUE" badge on monthly
- Purple gradient "Continue" button
- "Maybe Later" button
- Close button (X)

**Actions:**
- Subscribe → Navigate to Chat
- Cancel → Navigate to Chat
- Close → Navigate to Chat

---

## ⚠️ Report Feature

### Overview
Google Play-compliant content reporting system allowing users to report issues, inappropriate content, or technical problems.

### Components

#### 1. ReportScreen
**File:** `app/screens/ReportScreen.tsx`

**Features:**
- 6 categorized report reasons
- 500-character text input
- Character counter
- Input validation
- Success confirmation
- SafeAreaView support

**Report Categories:**
```typescript
[
  { id: 'inappropriate', label: 'Inappropriate Content', icon: '⚠️' },
  { id: 'harassment', label: 'Harassment or Bullying', icon: '🚫' },
  { id: 'spam', label: 'Spam or Misleading', icon: '📧' },
  { id: 'privacy', label: 'Privacy Concern', icon: '🔒' },
  { id: 'technical', label: 'Technical Issue', icon: '🔧' },
  { id: 'other', label: 'Other', icon: '💬' },
]
```

**Validation Rules:**
- Must select a reason
- Must provide description
- Min: 1 character
- Max: 500 characters
- Submit button disabled until valid

**UI Elements:**
- Header with back button
- Info banner (🛡️) with explanation
- Radio button categories
- Multi-line text input
- Character count display
- Purple submit button
- Footer disclaimer text

**Submission Flow:**
```typescript
handleSubmit() {
  // Validate inputs
  if (!selectedReason || !description.trim()) {
    Alert.alert('Required', 'Please complete all fields');
    return;
  }

  // Simulate API call (1 second)
  setIsSubmitting(true);
  setTimeout(() => {
    setIsSubmitting(false);
    Alert.alert('Report Submitted', 'Thank you...');
    navigation.goBack();
  }, 1000);
}
```

**Note:** Current implementation is UI-only. Backend integration needed for production.

#### 2. Integration Point
**File:** `app/screens/ChatSettingsScreen.tsx`

**Location:** Chat settings menu (3-dot menu)

**Menu Item:**
```typescript
<TouchableOpacity onPress={handleReportPress}>
  <View style={styles.reportContainer}>
    <Text style={styles.reportIcon}>⚠️</Text>
    <Text>Report Issue</Text>
  </View>
  <Text>›</Text>
</TouchableOpacity>
```

**Navigation:**
```typescript
const handleReportPress = () => {
  navigation.navigate('Report');
};
```

### Google Play Compliance

**Requirements Met:**
1. ✅ Clear reporting mechanism
2. ✅ Multiple specific categories
3. ✅ Detailed description field
4. ✅ Easy access (in settings)
5. ✅ Confirmation feedback
6. ✅ Confidentiality message

**Policy Alignment:**
- Content Policy: Users can report violations
- User Safety: Harassment reporting available
- Privacy: Privacy concern category exists
- Transparency: Clear process explained

---

## 📱 SafeAreaView Support

### Overview
Ensures app content respects device-specific safe areas (notches, Dynamic Island, home indicators, status bars).

### Implementation

#### Devices Supported
- **iPhone X series:** Notch at top
- **iPhone 14/15 Pro:** Dynamic Island
- **Android:** Hole-punch cameras, gesture bars
- **Traditional:** Status bar and home button devices

#### Modified Screens

**1. IncomingCallScreen**
```typescript
import { SafeAreaView } from 'react-native';

return (
  <SafeAreaView style={styles.container}>
    {/* Content automatically respects safe areas */}
  </SafeAreaView>
);
```

**2. ReportScreen**
```typescript
<SafeAreaView style={styles.container}>
  <KeyboardAvoidingView behavior="padding">
    {/* Content */}
  </KeyboardAvoidingView>
</SafeAreaView>
```

**3. ChatScreen**
```typescript
// Imported and ready to use
import { SafeAreaView } from 'react-native';
```

### Safe Area Behavior

**iOS:**
- Automatically avoids notch/Dynamic Island
- Respects home indicator at bottom
- Maintains content within safe bounds

**Android:**
- Avoids status bar overlap
- Respects gesture navigation area
- Works with hole-punch cameras

### Benefits
- ✅ No content hidden behind notches
- ✅ Buttons accessible above home indicator
- ✅ Professional appearance
- ✅ Consistent across devices

---

## 🔧 Navigation Fix

### Problem
**Error:** Maximum update depth exceeded
**Location:** ConversationsScreen → Chat navigation
**Cause:** Simultaneous state update + navigation

### Solution

#### Code Changes
**File:** `app/screens/ConversationsScreen.tsx`

**Before:**
```typescript
const handleConversationPress = (girlfriend: Girlfriend) => {
  setSelectedGirlfriend(girlfriend);
  navigation.navigate('Chat', { fromOnboarding: false });
};
```

**After:**
```typescript
const handleConversationPress = useCallback((girlfriend: Girlfriend) => {
  setSelectedGirlfriend(girlfriend);

  setTimeout(() => {
    navigation.navigate('Chat', { fromOnboarding: false });
  }, 0);
}, [setSelectedGirlfriend, navigation]);
```

#### Key Changes
1. **useCallback:** Memoize function to prevent re-creation
2. **setTimeout(0):** Defer navigation to next tick
3. **Dependencies:** Stable reference with dependency array

#### Additional Optimizations
```typescript
const handleDeleteConversation = useCallback(/* ... */, [deps]);
const handleClearAllChats = useCallback(/* ... */, [deps]);
const renderRightActions = useCallback(/* ... */, [deps]);
```

### Technical Explanation

**Event Loop Phases:**
```
User taps conversation
    ↓
handleConversationPress called
    ↓
setSelectedGirlfriend (state update scheduled)
    ↓
setTimeout schedules navigation for next tick
    ↓
Current render completes
    ↓
State update processes
    ↓
Next tick: navigation executes
    ↓
No conflict!
```

**Benefits:**
- ✅ No depth errors
- ✅ Smooth navigation
- ✅ Better performance
- ✅ Stable references

---

## 🎨 UI Improvements

### 1. Green Phone Button

**Location:** ChatScreen header
**Design:**
```typescript
{
  backgroundColor: 'rgba(16, 185, 129, 0.2)',
  borderColor: '#10B981',
  borderWidth: 1.5,
}

phoneIcon: {
  fontSize: 18,
  color: '#10B981',
}
```

**Visual:**
- Green emoji (📞)
- Light green background tint
- Green border (1.5px)
- 36×36 circular button
- Right side of header, before menu

**Action:**
- Tap → Instant incoming call screen
- No waiting, immediate response
- Manual control for users

### 2. Incoming Call Design

**Layout:**
```
┌─────────────────────────────┐
│     📞 Voice Call (badge)    │
│                              │
│    [Dual Glow Rings]         │
│      [Avatar 140×140]        │
│                              │
│     Character Name (36px)    │
│   "Incoming voice call..."   │
│                              │
│  🔒 Private  🎙️ HD Audio     │
│                              │
│   [Decline]    [Accept]      │
└─────────────────────────────┘
```

**Animations:**
- Pulsing avatar (1.0 → 1.1 scale)
- Fading glow rings (opacity changes)
- Smooth 60fps with useNativeDriver

**Colors:**
- Background: Dark gradient (purple tint)
- Glow rings: Purple (#8B5CF6, #C084FC)
- Decline button: Red gradient
- Accept button: Green gradient
- Text: White on dark

### 3. Image Loading

**Improvements:**
```typescript
<Image
  source={{ uri: imageUrl }}
  priority="high"              // NEW
  placeholder={iconImage}      // NEW
  placeholderContentFit="contain" // NEW
  transition={200}             // NEW
  cachePolicy="memory-disk"
/>
```

**Benefits:**
- Shows placeholder immediately
- Loads image in background
- Fades in smoothly (200ms)
- No blank white circles
- Better perceived performance

### 4. Vertical Suggestion Chips

**Before:** Horizontal scroll
**After:** Vertical scroll

**Changes:**
```typescript
// Removed horizontal prop
<FlatList
  data={suggestions}
  // horizontal={false} (default)
  showsVerticalScrollIndicator={false}
/>

// Chip width
chip: {
  width: '100%', // Was maxWidth: 300
}

// Container height
container: {
  maxHeight: 300, // Was 120
}
```

**Benefits:**
- More text visible per suggestion
- Easier to read full messages
- Better for one-handed use
- Natural scroll direction
- All 11 suggestions accessible

---

## 🏗️ Technical Architecture

### State Management (Zustand)

#### 1. User Profile Store
**File:** `app/store/userProfile.ts`

**State:**
```typescript
{
  profile: {
    name: string;
    age: string;
    preferences: {
      tone: string[];
      personality: string[];
      interests: string[];
      appearance: string;
      mode: string;
    };
  };
}
```

#### 2. Girlfriend Store
**File:** `app/store/girlfriendStore.ts`

**State:**
```typescript
{
  girlfriends: Girlfriend[];
  selectedGirlfriend: Girlfriend | null;
  chatHistories: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
}
```

**Key Methods:**
- `loadGirlfriends()` - Fetch from Firebase
- `setSelectedGirlfriend()` - Set active character
- `addMessage()` - Add chat message
- `getChatHistory()` - Get messages for character
- `deleteConversation()` - Remove chat history
- `clearAllChats()` - Delete all conversations

#### 3. Call Store (NEW)
**File:** `app/store/callStore.ts`

**State:**
```typescript
{
  hasSeenCall: boolean;
  lastDeclinedTime: number | null;
  isPremium: boolean;
}
```

**Key Methods:**
- `shouldShowCall()` - Smart timing logic
- `setHasSeenCall()` - Mark as viewed
- `setLastDeclinedTime()` - Track decline
- `setPremium()` - Set premium status
- `reset()` - Clear state

### Navigation Structure

```
NavigationContainer
└─ Stack Navigator
   ├─ Disclaimer (first launch)
   ├─ Onboarding Screens (9 screens)
   ├─ MainTabs (Bottom Tab Navigator)
   │  ├─ Home Tab
   │  ├─ Conversations Tab
   │  └─ Settings Tab
   ├─ Chat Screen
   ├─ ChatSettings Screen
   ├─ IncomingCall Screen (NEW)
   ├─ Paywall Screen (NEW)
   └─ Report Screen (NEW)
```

### Data Flow

#### Chat Message Flow
```
User types → ChatScreen
    ↓
Add to girlfriendStore
    ↓
Save to AsyncStorage
    ↓
Send to OpenRouter API
    ↓
Show typing indicator
    ↓
Receive AI response
    ↓
Add to girlfriendStore
    ↓
Save to AsyncStorage
    ↓
Display in UI
```

#### Call Trigger Flow
```
Chat Screen loads (fromOnboarding=true)
    ↓
Check shouldShowCall() → true
    ↓
Wait 5 seconds (setTimeout)
    ↓
Navigate to IncomingCall
    ↓
Phone vibrates
    ↓
User accepts/declines
    ↓
setHasSeenCall(true)
setLastDeclinedTime(now) [if declined]
    ↓
Navigate to Paywall
    ↓
User cancels
    ↓
Navigate to Chat
    ↓
[After 1 minute]
    ↓
Check shouldShowCall() → true again
    ↓
Repeat...
```

---

## 👥 User Flows

### Flow 1: First Time User (Onboarding)
```
1. Open app
2. See disclaimer → Accept
3. Complete onboarding (9 steps)
4. Click "Start Chatting"
5. Chat screen loads
6. Wait 5 seconds...
7. 📞 Incoming call appears
8. Phone vibrates
9. User picks/declines
10. Paywall appears
11. User cancels
12. Back to chat
```

### Flow 2: Manual Call Trigger
```
1. User in chat screen
2. Sees green 📞 button (top right)
3. Taps phone button
4. 📞 Incoming call appears immediately
5. Phone vibrates
6. User picks/declines
7. Paywall appears
8. User cancels
9. Back to chat
```

### Flow 3: Report Issue
```
1. User in chat screen
2. Taps 3-dot menu (⋮)
3. ChatSettings opens
4. Scrolls to "⚠️ Report Issue"
5. Taps Report Issue
6. ReportScreen opens
7. Selects reason (e.g., Spam)
8. Types description
9. Taps "Submit Report"
10. See confirmation alert
11. Auto-return to settings
```

### Flow 4: Recurring Call
```
1. User declined first call
2. Continues chatting
3. After 1 minute passes...
4. App checks shouldShowCall() every 10s
5. Returns true (1 min elapsed)
6. 📞 Call appears again
7. User picks/declines
8. Paywall appears
9. Cycle repeats until premium
```

### Flow 5: Conversations Navigation
```
1. User taps Conversations tab
2. Sees list of chats
3. Taps a conversation
4. setSelectedGirlfriend(girlfriend)
5. setTimeout → navigate to Chat
6. Chat loads smoothly
7. No depth errors!
```

---

## 🔌 API Reference

### callStore API

```typescript
import { useCallStore } from '../store/callStore';

// In component
const {
  hasSeenCall,
  lastDeclinedTime,
  isPremium,
  setHasSeenCall,
  setLastDeclinedTime,
  setPremium,
  shouldShowCall,
  reset,
} = useCallStore();

// Check if should show call
if (shouldShowCall()) {
  // Show call screen
}

// Mark call as seen
setHasSeenCall(true);

// Track decline
setLastDeclinedTime(Date.now());

// Set premium status
setPremium(true); // No more calls

// Reset all state
reset();
```

### Navigation API

```typescript
// Navigate to IncomingCall
navigation.navigate('IncomingCall', {
  characterName: 'Sarina',
  characterImageUrl: 'https://...',
});

// Navigate to Paywall
navigation.navigate('Paywall', {
  characterName: 'Sarina',
  characterImageUrl: 'https://...',
});

// Navigate to Report
navigation.navigate('Report');

// Navigate to Chat
navigation.navigate('Chat', {
  fromOnboarding: true, // or false
});
```

### Vibration API

```typescript
import { Vibration } from 'react-native';

// Start vibration pattern
Vibration.vibrate([0, 1000, 500, 1000, 500, 1000], true);
// [pause, vibrate, pause, vibrate, ...], repeat=true

// Stop vibration
Vibration.cancel();
```

### Image Loading API

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: 'https://...' }}
  style={styles.avatar}
  contentFit="cover"
  cachePolicy="memory-disk"
  priority="high"
  placeholder={require('./icon.png')}
  placeholderContentFit="contain"
  transition={200}
  onLoad={() => console.log('Loaded')}
  onError={() => console.log('Error')}
/>
```

---

## 📊 Analytics Events

### New Events in v1.1.0

```typescript
// Call Events
analytics.logEvent('incoming_call_shown', {
  character_id: girlfriendId,
  character_name: girlfriendName,
  trigger_type: 'auto' | 'manual',
});

analytics.logEvent('incoming_call_accepted', {
  character_id: girlfriendId,
});

analytics.logEvent('incoming_call_declined', {
  character_id: girlfriendId,
});

// Report Events
analytics.logEvent('report_screen_opened', {
  source: 'chat_settings',
});

analytics.logEvent('report_submitted', {
  reason: 'inappropriate' | 'harassment' | ...,
  character_count: 150,
});
```

---

## 🔒 Security Considerations

### Call State
- Stored locally in AsyncStorage
- Not synced to cloud
- Cleared on app uninstall
- No personal data in state

### Reports
- Current: Simulated (no backend)
- Future: Should use secure API
- Recommendations:
  - Rate limiting (max 5/day)
  - User ID tracking
  - Moderation queue
  - Encrypted transmission

### Keystore
- Upload key stored in `android/app/`
- Never commit to Git
- Backup securely
- Use Google Play App Signing

---

## 📱 Platform-Specific Notes

### iOS (Expo Go)
- ✅ Vibration works
- ✅ SafeAreaView works
- ✅ All animations smooth
- ✅ Navigation fixed
- ⚠️ Can't build AAB (Android only)

### Android
- ✅ All features work
- ✅ Vibration works
- ✅ SafeAreaView works
- ✅ AAB build works
- ✅ Upload keystore configured

---

## 🎯 Success Metrics

### Key Metrics to Track

1. **Call Engagement:**
   - % of users who see first call
   - % who accept vs decline
   - % who tap manual phone button
   - Average calls per user

2. **Paywall Conversion:**
   - % who see paywall
   - % who subscribe
   - Average time to decision
   - Cancel rate

3. **Report Usage:**
   - Number of reports submitted
   - Most common categories
   - Average description length
   - Resolution time

4. **Navigation Health:**
   - Crash-free rate
   - Navigation depth errors (should be 0)
   - Screen transition time
   - User flow completion rate

---

**End of Feature Documentation**

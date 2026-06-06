/**
 * OnboardingNavigator — the new redesigned flow (Figma).
 * Built screen-by-screen; new screens are registered here as they land.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { updateAppOpen } from '../services/userEngagementService';
import { OnboardingStackParamList } from './onboardingTypes';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { DisclaimerScreen } from '../screens/onboarding/DisclaimerScreen';
import { LanguageScreen } from '../screens/onboarding/LanguageScreen';
import { CharacterSelectScreen } from '../screens/onboarding/CharacterSelectScreen';
import { InterestsScreen } from '../screens/onboarding/InterestsScreen';
import { TopicsScreen } from '../screens/onboarding/TopicsScreen';
import { NameScreen } from '../screens/onboarding/NameScreen';
import { AuthScreen } from '../screens/onboarding/AuthScreen';
import { ChatScreen } from '../screens/onboarding/ChatScreen';
import { IncomingCallScreen } from '../screens/onboarding/IncomingCallScreen';
import { VoiceCallScreen } from '../screens/onboarding/VoiceCallScreen';
import { HomeScreen } from '../screens/onboarding/HomeScreen';
import { DiscoverScreen } from '../screens/onboarding/DiscoverScreen';
import { SettingsScreen } from '../screens/onboarding/SettingsScreen';
import { SplashScreen } from '../screens/onboarding/SplashScreen';

const Stack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  // Launch gate: a returning user (persisted Firebase session — guest or Google)
  // skips onboarding and lands on Home; otherwise we start at Welcome. The first
  // onAuthStateChanged emission reflects the rehydrated session.
  const [initialRoute, setInitialRoute] =
    React.useState<keyof OnboardingStackParamList | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    (async () => {
      // Wait until Firebase has finished restoring the persisted session from
      // AsyncStorage. Using authStateReady() (rather than unsubscribing on the
      // first onAuthStateChanged emission) avoids the race where the listener
      // fires a premature `null` before rehydration completes — which would
      // bounce a returning user back to Welcome instead of landing on Discover.
      try {
        await auth.authStateReady();
      } catch {
        // Older SDK / unexpected failure — fall back to current state below.
      }
      const route: keyof OnboardingStackParamList = auth.currentUser
        ? 'Discover'
        : 'Welcome';
      // Keep the splash up for a minimum moment so it doesn't flash.
      const wait = Math.max(0, 1400 - (Date.now() - start));
      setTimeout(() => {
        if (!cancelled) setInitialRoute(route);
      }, wait);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-engagement: once signed in (now or later), register the push token and
  // refresh app-open / TTL. notificationService is native → lazy-required.
  const engagedUid = React.useRef<string | null>(null);
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || engagedUid.current === user.uid) return;
      engagedUid.current = user.uid;
      // Tie analytics + crashlytics to this user (guarded / Expo-Go-safe).
      try {
        require('../services/firebaseAnalytics').setUserId(user.uid);
        require('../services/crashlytics').setCrashlyticsUserId(user.uid);
      } catch {}
      let token: string | null = null;
      try {
        token = await require('../services/notificationService').registerForPushNotifications();
      } catch (e) {
        // Expo Go / no native module — skip push registration.
      }
      updateAppOpen(token);
    });
    return unsub;
  }, []);

  if (!initialRoute) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          cardStyle: { backgroundColor: '#131315' },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="CharacterSelect" component={CharacterSelectScreen} />
        <Stack.Screen name="Interests" component={InterestsScreen} />
        <Stack.Screen name="Topics" component={TopicsScreen} />
        <Stack.Screen name="Name" component={NameScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Discover" component={DiscoverScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen
          name="IncomingCall"
          component={IncomingCallScreen}
          options={{ cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS }}
        />
        <Stack.Screen
          name="VoiceCall"
          component={VoiceCallScreen}
          options={{ cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

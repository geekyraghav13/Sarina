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
    const start = Date.now();
    const unsub = onAuthStateChanged(auth, (user) => {
      const route: keyof OnboardingStackParamList = user ? 'Discover' : 'Welcome';
      // Keep the splash up for a minimum moment so it doesn't flash.
      const wait = Math.max(0, 1400 - (Date.now() - start));
      setTimeout(() => setInitialRoute(route), wait);
      unsub();
    });
    return unsub;
  }, []);

  // Re-engagement: once signed in (now or later), register the push token and
  // refresh app-open / TTL. notificationService is native → lazy-required.
  const engagedUid = React.useRef<string | null>(null);
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || engagedUid.current === user.uid) return;
      engagedUid.current = user.uid;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

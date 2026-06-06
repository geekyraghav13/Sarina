import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { OnboardingNavigator } from './app/navigation/OnboardingNavigator';
import './app/i18n'; // Initialize i18n

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Load custom fonts used by the app
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  // Observability (analytics + crashlytics). Native modules are lazy-required +
  // internally guarded, so this is a no-op in Expo Go but fully initializes in a
  // real build.
  useEffect(() => {
    (async () => {
      try {
        const { initializeAnalytics, logAppOpen } = require('./app/services/firebaseAnalytics');
        await initializeAnalytics();
        logAppOpen();
      } catch {}
      try {
        await require('./app/services/crashlytics').initializeCrashlytics();
      } catch {}
    })();
  }, []);

  // Hide splash screen once fonts are ready.
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <OnboardingNavigator />
    </GestureHandlerRootView>
  );
}

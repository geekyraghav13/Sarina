import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from './app/navigation/AppNavigator';
import { initializeAnalytics, logAppOpen } from './app/services/firebaseAnalytics';
import { usePaymentStore } from './app/store/paymentStore';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Initialize app resources
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize Firebase Analytics
        await initializeAnalytics();

        // Log app open event
        logAppOpen();

        // Load subscription status from local storage
        await usePaymentStore.getState().loadSubscriptionStatus();

        // Show splash screen for 3 seconds minimum for better UX
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Hide splash screen when app is ready
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

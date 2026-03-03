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
        // Initialize Firebase Analytics (don't block if it fails)
        try {
          await initializeAnalytics();
          logAppOpen();
        } catch (analyticsError) {
          console.warn('Analytics initialization failed (non-critical):', analyticsError);
        }

        // Load subscription status from local storage
        try {
          await usePaymentStore.getState().loadSubscriptionStatus();
        } catch (storageError) {
          console.warn('Subscription status load failed (non-critical):', storageError);
        }

        // Show splash screen for 2 seconds minimum for better UX
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.error('Critical error during app initialization:', e);
        // Still set app as ready to prevent infinite loading
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

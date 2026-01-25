import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './app/navigation/AppNavigator';
import { initSentry } from './app/config/sentry';
import { initializeAnalytics, logAppOpen } from './app/services/firebaseAnalytics';
import { initializeRevenueCat } from './app/services/revenueCatService';
import { usePaymentStore } from './app/store/paymentStore';

export default function App() {
  // Initialize Sentry, Firebase Analytics, and RevenueCat on app launch
  useEffect(() => {
    initSentry();

    // Initialize Firebase Analytics
    initializeAnalytics().then(() => {
      // Log app open event (first_open is automatic, this tracks all opens)
      logAppOpen();
    });

    // Initialize RevenueCat
    initializeRevenueCat().catch((error) => {
      console.error('Failed to initialize RevenueCat:', error);
    });

    // Load subscription status from local storage
    usePaymentStore.getState().loadSubscriptionStatus();

    // Sync with RevenueCat to get latest subscription status
    usePaymentStore.getState().syncWithRevenueCat();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

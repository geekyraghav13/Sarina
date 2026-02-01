import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './app/navigation/AppNavigator';
import { initializeAnalytics, logAppOpen } from './app/services/firebaseAnalytics';
import { usePaymentStore } from './app/store/paymentStore';

export default function App() {
  // Initialize Firebase Analytics on app launch
  useEffect(() => {
    // Initialize Firebase Analytics
    initializeAnalytics().then(() => {
      // Log app open event (first_open is automatic, this tracks all opens)
      logAppOpen();
    });

    // Load subscription status from local storage
    usePaymentStore.getState().loadSubscriptionStatus();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

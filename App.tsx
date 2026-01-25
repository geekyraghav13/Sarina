import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './app/navigation/AppNavigator';
import { initSentry } from './app/config/sentry';
import { initializeAnalytics, logAppOpen } from './app/services/firebaseAnalytics';

export default function App() {
  // Initialize Sentry and Firebase Analytics on app launch
  useEffect(() => {
    initSentry();

    // Initialize Firebase Analytics
    initializeAnalytics().then(() => {
      // Log app open event (first_open is automatic, this tracks all opens)
      logAppOpen();
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

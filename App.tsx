import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from './app/navigation/AppNavigator';
import { initializeAnalytics, logAppOpen } from './app/services/firebaseAnalytics';
import { usePaymentStore } from './app/store/paymentStore';
import * as RevenueCatService from './app/services/revenueCatService';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Initialize app resources
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize Firebase Analytics (critical)
        await initializeAnalytics();

        // Log app open event
        logAppOpen();

        // Load subscription status from local storage
        await usePaymentStore.getState().loadSubscriptionStatus();

        // Initialize RevenueCat SDK with timeout protection
        console.log('🔄 Initializing RevenueCat...');
        try {
          // Give RevenueCat 5 seconds max to initialize
          await Promise.race([
            RevenueCatService.initializeRevenueCat(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('RevenueCat initialization timeout')), 5000)
            )
          ]);

          console.log('✅ RevenueCat initialized successfully');

          // Check premium status from RevenueCat
          const isPremium = await RevenueCatService.checkPremiumStatus();
          if (isPremium) {
            const subInfo = await RevenueCatService.getSubscriptionInfo();
            await usePaymentStore.getState().setIsPremium(true);
            usePaymentStore.getState().setSubscriptionType(subInfo.tier as any);
            console.log('✅ Premium status loaded:', subInfo.tier);
          } else {
            console.log('ℹ️ User is not premium');
          }
        } catch (error: any) {
          console.error('❌ RevenueCat initialization failed:', error?.message || error);
          console.warn('⚠️ App will continue - user will be treated as non-premium');
          // User will be treated as non-premium and can still purchase
        }

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

import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from './app/navigation/AppNavigator';
import { initializeAnalytics, logAppOpen } from './app/services/firebaseAnalytics';
import { usePaymentStore } from './app/store/paymentStore';
import * as RevenueCatService from './app/services/revenueCatService';
import Purchases from 'react-native-purchases';

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

          // Set up customer info listener to auto-sync purchases to Firestore
          // IMPORTANT: This listener fires on ANY customer info change (purchase, restore, app reopen)
          // We should NOT treat every update as a new purchase to avoid duplicate credit allocation
          Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
            console.log('🔔 RevenueCat customer info updated!');
            console.log('Entitlements:', JSON.stringify(customerInfo.entitlements.active));
            console.log('Active Subscriptions:', JSON.stringify(customerInfo.activeSubscriptions));

            // Check if user has active subscription
            const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;
            const hasActiveSubscriptions = customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0;

            console.log('Has entitlements:', hasActiveEntitlements, 'Has subscriptions:', hasActiveSubscriptions);

            if (hasActiveEntitlements || hasActiveSubscriptions) {
              console.log('🔄 Active subscription detected, syncing to Firestore...');
              // Sync to Firestore with isNewPurchase = FALSE
              // This prevents duplicate credit allocation on app reopen/restore
              // Credits are only allocated in NewPaywallScreen.tsx after actual purchase
              await RevenueCatService.syncCustomerInfoToFirestore(customerInfo, false);

              // Update local state
              const subInfo = await RevenueCatService.getSubscriptionInfo();
              usePaymentStore.getState().setIsPremium(true);
              usePaymentStore.getState().setSubscriptionType(subInfo.tier as any);
              console.log('✅ Subscription synced:', subInfo.tier);
            } else {
              console.log('⚠️ No active subscription found in listener');
            }
          });

          // Check premium status from RevenueCat
          const isPremium = await RevenueCatService.checkPremiumStatus();
          if (isPremium) {
            console.log('✅ User has premium subscription');

            // Call restorePurchases to ensure credits are properly allocated
            // This handles the case where user reinstalled the app and has 0 credits
            // restorePurchases() has smart logic to allocate credits only if balance is 0
            console.log('🔄 Restoring purchases to ensure credits are allocated...');
            const restoreResult = await RevenueCatService.restorePurchases();

            if (restoreResult.success && restoreResult.isPremium) {
              // Update local state
              const subInfo = await RevenueCatService.getSubscriptionInfo();
              await usePaymentStore.getState().setIsPremium(true);
              usePaymentStore.getState().setSubscriptionType(subInfo.tier as any);
              console.log('✅ Premium status and credits restored:', subInfo.tier);
            } else {
              console.warn('⚠️ Restore failed, but user is premium. Using basic premium status.');
              await usePaymentStore.getState().setIsPremium(true);
            }
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

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { usePaymentStore } from '../store/paymentStore';
import { useGirlfriendStore } from '../store/girlfriendStore';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import * as RevenueCatService from '../services/revenueCatService';
import { canStartCall } from '../services/creditService';
import { logPaywallShown, logSubscriptionPurchased } from '../services/analyticsService';
import { getCurrentUser } from '../services/authService';

type NewPaywallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Paywall'>;
type NewPaywallScreenRouteProp = RouteProp<RootStackParamList, 'Paywall'>;

interface NewPaywallScreenProps {
  navigation: NewPaywallScreenNavigationProp;
  route: NewPaywallScreenRouteProp;
}

export const NewPaywallScreen: React.FC<NewPaywallScreenProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const { setIsPremium, setSubscriptionType } = usePaymentStore();
  const { girlfriends } = useGirlfriendStore();

  // Get navigation params (from IncomingCallScreen)
  const { returnScreen, callAction, characterName, characterImageUrl } = route.params || {};

  useEffect(() => {
    checkPremiumAndCredits();
  }, []);

  const checkPremiumAndCredits = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking premium status and credits...');

      // SCENARIO 7: Network/Auth Failure Protection
      // Add timeout to prevent infinite loading
      const TIMEOUT_MS = 10000; // 10 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Premium check timeout')), TIMEOUT_MS)
      );

      // Check premium status with timeout protection
      const isPremium = await Promise.race([
        RevenueCatService.checkPremiumStatus(),
        timeoutPromise
      ]) as boolean;

      console.log('🔐 Premium status:', isPremium);

      // Check if user has enough credits to make a call
      // SCENARIO 7 FIX: Add timeout to Firestore credit check
      const creditCheckPromise = canStartCall();
      const creditCheckTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Credit check timeout')), TIMEOUT_MS)
      );

      const creditCheck = await Promise.race([
        creditCheckPromise,
        creditCheckTimeout
      ]) as { allowed: boolean; balance: number; message: string };

      console.log('💰 Credit check result:', {
        allowed: creditCheck.allowed,
        balance: creditCheck.balance,
        message: creditCheck.message
      });

      // Get subscription info for expired subscription detection
      const subInfo = await RevenueCatService.getSubscriptionInfo();
      console.log('📋 Subscription info:', subInfo);

      // SCENARIO 1: Premium user WITH credits trying to make a call
      if (isPremium && creditCheck.allowed && callAction === 'pick' && characterName) {
        console.log('✅ Premium user with credits - navigating directly to VoiceCall');
        const girlfriend = girlfriends.find(gf => gf.name === characterName);

        if (girlfriend) {
          navigation.replace('VoiceCall', {
            characterName: girlfriend.name,
            characterImageUrl: girlfriend.imageUrl || characterImageUrl,
            characterId: girlfriend.id,
            characterProfile: {
              name: girlfriend.name,
              personality: girlfriend.personality,
              tone: girlfriend.tone,
              interests: girlfriend.interests,
              appearance: girlfriend.appearance,
            },
          });
          return;
        }
      }

      // SCENARIO 2: Premium user WITHOUT credits (0 credits)
      if (isPremium && !creditCheck.allowed) {
        console.log('⚠️ Premium user out of credits - showing custom credits paywall');
        setLoading(false);
        navigation.replace('CustomCreditsPaywall', {
          returnScreen,
          callAction,
          characterName,
          characterImageUrl,
        });
        return;
      }

      // SCENARIO 5: Expired Subscription (was premium, now lapsed)
      // Check if user had a subscription before but it expired
      if (!isPremium && subInfo.tier !== 'free' && subInfo.expirationDate) {
        console.log('⏰ Subscription expired - showing renewal message');
        setLoading(false);

        Alert.alert(
          'Subscription Expired',
          'Your premium subscription has ended. Renew now to continue enjoying unlimited calls and premium features!',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: handleCancel,
            },
            {
              text: 'Renew Subscription',
              onPress: () => presentRevenueCatPaywall(),
            },
          ]
        );
        return;
      }

      // SCENARIO 3: Non-premium user - show subscription paywall
      console.log('📱 Non-premium user - showing subscription paywall');
      setLoading(false);
      presentRevenueCatPaywall();

    } catch (error: any) {
      console.error('❌ Error checking premium/credits:', error);
      setLoading(false);

      // SCENARIO 7: Network/Auth Failure Handling
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        Alert.alert(
          'Connection Error',
          'Unable to verify your subscription status. Please check your internet connection and try again.',
          [
            {
              text: 'Try Again',
              onPress: () => checkPremiumAndCredits(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: handleCancel,
            },
          ]
        );
      } else {
        // Fallback: Fail closed (safe default - show paywall)
        // This prevents free access if something goes wrong
        console.warn('⚠️ Defaulting to paywall due to error (fail-closed)');
        presentRevenueCatPaywall();
      }
    }
  };

  const presentRevenueCatPaywall = async () => {
    try {
      console.log('🎨 Presenting RevenueCat Native Paywall');

      // Log paywall shown to analytics
      const user = getCurrentUser();
      if (user) {
        logPaywallShown(
          callAction ? 'call_credits_required' : 'manual_navigation',
          characterName,
          undefined // balance not available in this context
        );
      }

      // Present the RevenueCat native paywall
      // This will show the paywall you configured in RevenueCat dashboard
      const result = await RevenueCatUI.presentPaywall({
        requiredEntitlementIdentifier: 'premium', // Your entitlement identifier
      });

      console.log('📊 Paywall result:', result);
      handlePaywallResult(result);
    } catch (error) {
      console.error('❌ Error presenting paywall:', error);

      Alert.alert(
        'Error',
        'Unable to load subscription options. Please try again.',
        [{ text: 'OK', onPress: handleCancel }]
      );
    }
  };

  const handlePaywallResult = async (result: PAYWALL_RESULT) => {
    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        console.log('✅ Purchase successful!');

        // Wait for RevenueCat to process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Sync customer info to Firestore to allocate credits
        const customerInfo = await RevenueCatService.getCustomerInfo();
        if (customerInfo) {
          console.log('🔄 Syncing customer info to Firestore...');
          await RevenueCatService.syncCustomerInfoToFirestore(customerInfo, true);
        }

        // Update local state
        const subInfo = await RevenueCatService.getSubscriptionInfo();
        setIsPremium(subInfo.isPremium);
        setSubscriptionType(subInfo.tier as any);

        // Log subscription purchase to analytics
        const user = getCurrentUser();
        if (user && customerInfo) {
          const activeEntitlement = customerInfo.entitlements.active['premium'];
          const productIdentifier = activeEntitlement?.productIdentifier || 'unknown';
          logSubscriptionPurchased(
            user.uid,
            subInfo.tier || 'premium',
            0, // price not available from RevenueCat
            'USD'
          );
        }

        // EXACT FLOW AS REQUIRED:
        // Show alert: "You have been subscribed"
        // When OK pressed → Navigate to Home Screen
        Alert.alert(
          'Subscription Confirmed',
          'You have been subscribed',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('✅ Navigating to Home Screen (MainTabs)');
                // Navigate to Home Screen (MainTabs)
                // navigation.reset() clears the entire back stack, preventing Android back button
                // from returning to the paywall. User can only exit the app from MainTabs.
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              },
            },
          ]
        );
        break;

      case PAYWALL_RESULT.RESTORED:
        // SCENARIO 6: Restore Purchases
        console.log('🔄 Purchases restored successfully!');

        // Wait for RevenueCat to process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Sync restored subscription to Firestore
        const restoredCustomerInfo = await RevenueCatService.getCustomerInfo();
        if (restoredCustomerInfo) {
          console.log('🔄 Syncing restored subscription to Firestore...');
          // Use false for isNewPurchase since this is a restore
          await RevenueCatService.syncCustomerInfoToFirestore(restoredCustomerInfo, false);
        }

        // Update local state
        const restoredSubInfo = await RevenueCatService.getSubscriptionInfo();
        setIsPremium(restoredSubInfo.isPremium);
        setSubscriptionType(restoredSubInfo.tier as any);

        Alert.alert(
          'Purchases Restored',
          'Your subscription has been successfully restored!',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('✅ Navigating to Home Screen (MainTabs)');
                // navigation.reset() clears the entire back stack, preventing Android back button
                // from returning to the paywall. User can only exit the app from MainTabs.
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              },
            },
          ]
        );
        break;

      case PAYWALL_RESULT.CANCELLED:
        console.log('⚠️ User cancelled paywall');
        // EXACT FLOW AS REQUIRED:
        // User stays in Chat Screen
        handleCancel();
        break;

      case PAYWALL_RESULT.ERROR:
        console.error('❌ Paywall error');
        Alert.alert(
          'Error',
          'Something went wrong. Please try again.',
          [{ text: 'OK', onPress: handleCancel }]
        );
        break;

      case PAYWALL_RESULT.NOT_PRESENTED:
        console.warn('⚠️ Paywall not presented');
        handleCancel();
        break;
    }
  };

  const handleCancel = () => {
    console.log('🔙 User cancelled - returning to Chat Screen');
    // EXACT FLOW AS REQUIRED:
    // User stays in Chat Screen, nothing happens
    // NOTE: Character context is preserved via girlfriendStore.selectedGirlfriend
    // No need to pass character params - Zustand store maintains state across navigation
    navigation.navigate('Chat', { fromOnboarding: false });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3263" />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  // RevenueCat UI handles everything, so we just show a loading state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF3263" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

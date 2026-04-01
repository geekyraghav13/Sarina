import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { usePaymentStore } from '../store/paymentStore';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import * as RevenueCatService from '../services/revenueCatService';
import { useGirlfriendStore } from '../store/girlfriendStore';
import { canStartCall } from '../services/creditService';

type NewPaywallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Paywall'>;
type NewPaywallScreenRouteProp = RouteProp<RootStackParamList, 'Paywall'>;

interface NewPaywallScreenProps {
  navigation: NewPaywallScreenNavigationProp;
  route: NewPaywallScreenRouteProp;
}

export const NewPaywallScreen: React.FC<NewPaywallScreenProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const { setIsPremium, setSubscriptionType } = usePaymentStore();
  const { girlfriends } = useGirlfriendStore();

  // Get navigation params
  const { returnScreen, callAction, characterName, characterImageUrl } = route.params || {};

  useEffect(() => {
    checkPremiumAndShowPaywall();
  }, []);

  const checkPremiumAndShowPaywall = async () => {
    try {
      setLoading(true);

      // Check if user has enough credits to make a call
      const creditCheck = await canStartCall();
      console.log('💰 Credit check result:', {
        allowed: creditCheck.allowed,
        balance: creditCheck.balance,
        message: creditCheck.message
      });

      // If user has enough credits AND trying to make a call, navigate directly to VoiceCall
      if (creditCheck.allowed && callAction === 'pick' && characterName) {
        console.log('✅ User has enough credits, navigating to call');
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

      // User doesn't have enough credits, show paywall to purchase more
      console.log('⚠️ Not enough credits, showing paywall. Current balance:', creditCheck.balance, 'seconds');

      // Check if user has an active subscription
      const isPremium = await RevenueCatService.checkPremiumStatus();

      setLoading(false);

      // Show different paywall based on subscription status
      if (isPremium) {
        // User has subscription but ran out of credits - show custom credits screen
        console.log('✅ Premium status: true - Navigating to custom credits paywall');
        navigation.replace('CustomCreditsPaywall', {
          returnScreen,
          callAction,
          characterName,
          characterImageUrl,
        });
      } else {
        // User has no subscription - show main subscription paywall
        console.log('✅ Premium status: false - Showing main subscription paywall');
        presentRevenueCatPaywall('Main');
      }
    } catch (error) {
      console.error('❌ Error checking credits:', error);
      setLoading(false);
      presentRevenueCatPaywall('Main');
    }
  };

  const presentRevenueCatPaywall = async (offeringType: 'Main' | 'Credits' = 'Main') => {
    try {
      console.log('🎨 Presenting RevenueCat Paywall with offering:', offeringType);
      setPaywallVisible(true);

      // Present the paywall using RevenueCat's native UI
      // For Main offering: use "premium" entitlement (subscriptions)
      // For Credits offering: use specific offering identifier for consumables
      let paywallOptions;

      if (offeringType === 'Credits') {
        // Show credits paywall (consumable purchases)
        paywallOptions = {
          offering: 'Credits', // This must match your RevenueCat Dashboard offering identifier
        };
      } else {
        // Show main subscription paywall
        paywallOptions = {
          requiredEntitlementIdentifier: 'premium',
        };
      }

      const result = await RevenueCatUI.presentPaywall(paywallOptions);

      console.log('📊 Paywall result:', result);

      handlePaywallResult(result, offeringType);
    } catch (error) {
      console.error('❌ Error presenting paywall:', error);
      setPaywallVisible(false);

      Alert.alert(
        'Error',
        'Unable to load purchase options. Please try again.',
        [{ text: 'OK', onPress: handleClose }]
      );
    }
  };

  const handlePaywallResult = async (result: PAYWALL_RESULT, offeringType: 'Main' | 'Credits' = 'Main') => {
    setPaywallVisible(false);

    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        console.log('✅ Purchase/Restore successful!');

        // Wait a moment for RevenueCat to process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Sync customer info to Firestore to allocate credits
        const customerInfo = await RevenueCatService.getCustomerInfo();
        if (customerInfo) {
          console.log('🔄 Syncing customer info to Firestore...');

          if (offeringType === 'Credits') {
            // Consumable purchase - add credits directly
            await RevenueCatService.syncConsumablePurchaseToFirestore(customerInfo);
          } else {
            // Subscription purchase - sync as before
            await RevenueCatService.syncCustomerInfoToFirestore(customerInfo, true);
          }
        }

        // Update local state
        const subInfo = await RevenueCatService.getSubscriptionInfo();
        setIsPremium(subInfo.isPremium);
        setSubscriptionType(subInfo.tier as any);

        // If user was trying to make a call, navigate to call screen
        if (callAction === 'pick' && characterName) {
          const girlfriend = girlfriends.find(gf => gf.name === characterName);

          if (girlfriend) {
            Alert.alert(
              'Success! 🎉',
              'Subscription activated! Starting your call...',
              [
                {
                  text: 'Start Call',
                  onPress: () => {
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
                  },
                },
              ]
            );
          }
        } else {
          // Just show success and close
          Alert.alert(
            'Success! 🎉',
            'Your subscription is now active!',
            [{ text: 'OK', onPress: handleClose }]
          );
        }
        break;

      case PAYWALL_RESULT.CANCELLED:
        console.log('⚠️ User cancelled paywall');
        handleClose();
        break;

      case PAYWALL_RESULT.ERROR:
        console.error('❌ Paywall error');
        Alert.alert(
          'Error',
          'Something went wrong. Please try again.',
          [{ text: 'OK', onPress: handleClose }]
        );
        break;

      case PAYWALL_RESULT.NOT_PRESENTED:
        console.warn('⚠️ Paywall not presented');
        handleClose();
        break;
    }
  };

  const handleClose = () => {
    const screen = returnScreen || 'Chat';
    navigation.navigate(screen as any, { fromOnboarding: false });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  // This component just manages the logic
  // The actual paywall UI is shown by RevenueCatUI.presentPaywall()
  return (
    <View style={styles.container}>
      {paywallVisible && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF69B4" />
          <Text style={styles.loadingText}>Loading paywall...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
  },
});

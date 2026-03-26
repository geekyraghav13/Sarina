import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { usePaymentStore } from '../store/paymentStore';
import {
  logAdImpression,
  logPurchase,
  logSubscriptionRestored,
} from '../services/firebaseAnalytics';
import * as RevenueCatService from '../services/revenueCatService';
import Purchases, { PurchasesOffering } from 'react-native-purchases';
import { useGirlfriendStore } from '../store/girlfriendStore';

type NewPaywallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Paywall'>;
type NewPaywallScreenRouteProp = RouteProp<RootStackParamList, 'Paywall'>;

interface NewPaywallScreenProps {
  navigation: NewPaywallScreenNavigationProp;
  route: NewPaywallScreenRouteProp;
}

export const NewPaywallScreen: React.FC<NewPaywallScreenProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);

  const { setIsPremium, setSubscriptionType } = usePaymentStore();
  const { girlfriends } = useGirlfriendStore();

  // Get navigation params
  const { returnScreen, callAction, characterName, characterImageUrl } = route.params || {};

  useEffect(() => {
    logAdImpression({
      ad_platform: 'paywall',
      ad_format: 'subscription_offer',
      ad_source: 'sarina_premium',
      value: 1299,
      currency: 'INR',
      ad_unit_name: 'premium_subscription_offer',
    });

    initializePaywall();
  }, []);

  const initializePaywall = async () => {
    try {
      setLoading(true);

      // Check if user is already premium
      const isPremium = await RevenueCatService.checkPremiumStatus();

      if (isPremium && callAction === 'pick' && characterName) {
        // User is premium and wants to start a call - navigate directly
        console.log('✅ User is premium, navigating to call');
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

      // Get offerings from RevenueCat
      const offerings = await RevenueCatService.getOfferings();

      if (!offerings || !offerings.current) {
        console.error('❌ No offerings found');
        Alert.alert(
          'Paywall Not Available',
          'Unable to load subscription options. Please try again later.',
          [{ text: 'OK', onPress: handleClose }]
        );
        return;
      }

      setOffering(offerings.current);
      console.log('✅ Paywall loaded with offering:', offerings.current.identifier);
    } catch (error) {
      console.error('❌ Error loading paywall:', error);
      Alert.alert(
        'Error',
        'Failed to load subscription options. Please try again.',
        [{ text: 'OK', onPress: handleClose }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    const screen = returnScreen || 'Chat';
    navigation.navigate(screen as any, { fromOnboarding: false });
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);
    try {
      const result = await RevenueCatService.restorePurchases();

      await logSubscriptionRestored(result.isPremium || false);

      if (result.success && result.isPremium) {
        // Get subscription info
        const subInfo = await RevenueCatService.getSubscriptionInfo();

        await setIsPremium(true);
        setSubscriptionType(subInfo.tier as any);

        Alert.alert('Success', 'Your subscription has been restored!', [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            }),
          },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions found to restore.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  // If loading, show loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
        <Text style={styles.loadingText}>Loading subscriptions...</Text>
      </View>
    );
  }

  // If no offering, show error state
  if (!offering) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load subscriptions</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializePaywall}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeErrorButton} onPress={handleClose}>
          <Text style={styles.closeErrorText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show RevenueCat's Paywall using their presentPaywallIfNeeded
  return (
    <View style={styles.container}>
      {/* Custom header with close button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* RevenueCat Paywall Component */}
      <View style={styles.paywallContainer}>
        <Purchases.PaywallView
          offering={offering}
          displayCloseButton={false}
          onPurchaseCompleted={async ({ customerInfo }) => {
            console.log('✅ Purchase completed!');

            // Get subscription info
            const subInfo = await RevenueCatService.getSubscriptionInfo();

            // Update local state
            await setIsPremium(true);
            setSubscriptionType(subInfo.tier as any);

            // Log purchase
            await logPurchase({
              transaction_id: customerInfo.originalAppUserId,
              value: subInfo.tier === 'yearly' ? 1299 : 299,
              currency: 'INR',
              items: [{
                item_id: subInfo.tier,
                item_name: `Sarina ${subInfo.tier === 'weekly' ? 'Weekly' : 'Yearly'} Plan`,
                item_category: 'subscription',
                quantity: 1,
                price: subInfo.tier === 'yearly' ? 1299 : 299,
              }]
            });

            // If user clicked "Pick" to start a call, navigate to VoiceCall
            if (callAction === 'pick' && characterName) {
              // Find the girlfriend by name
              const girlfriend = girlfriends.find(gf => gf.name === characterName);

              if (girlfriend) {
                Alert.alert(
                  'Success! 🎉',
                  `${subInfo.tier === 'weekly' ? 'Weekly' : 'Yearly'} plan activated! Starting your call...`,
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
                return;
              }
            }

            // Default: Navigate to MainTabs
            Alert.alert(
              'Success! 🎉',
              `${subInfo.tier === 'weekly' ? 'Weekly' : 'Yearly'} plan activated!`,
              [
                {
                  text: 'Got it!',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainTabs' }],
                    });
                  },
                },
              ]
            );
          }}
          onPurchaseCancelled={() => {
            console.log('⚠️ Purchase cancelled');
          }}
          onRestoreCompleted={async ({ customerInfo }) => {
            console.log('✅ Restore completed!');

            const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;

            if (isPremium) {
              const subInfo = await RevenueCatService.getSubscriptionInfo();
              await setIsPremium(true);
              setSubscriptionType(subInfo.tier as any);

              Alert.alert('Success', 'Your subscription has been restored!', [
                {
                  text: 'OK',
                  onPress: () => navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                  }),
                },
              ]);
            }
          }}
          onRestoreFailed={(error) => {
            console.error('❌ Restore failed:', error);
            Alert.alert('Error', 'Failed to restore purchases. Please try again.');
          }}
        />
      </View>

      {/* Restore Purchases Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
          disabled={restoring}
        >
          {restoring ? (
            <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.5)" />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 100,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeIcon: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
  },
  paywallContainer: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
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
    color: 'rgba(255, 255, 255, 0.6)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeErrorButton: {
    paddingVertical: 12,
  },
  closeErrorText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

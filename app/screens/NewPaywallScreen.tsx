import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
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
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useGirlfriendStore } from '../store/girlfriendStore';
import { Audio } from 'expo-av';
import { canStartCall, getCreditBalance } from '../services/creditService';

type NewPaywallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Paywall'>;
type NewPaywallScreenRouteProp = RouteProp<RootStackParamList, 'Paywall'>;

interface NewPaywallScreenProps {
  navigation: NewPaywallScreenNavigationProp;
  route: NewPaywallScreenRouteProp;
}

export const NewPaywallScreen: React.FC<NewPaywallScreenProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [userIsPremium, setUserIsPremium] = useState(false);
  const [userCreditBalance, setUserCreditBalance] = useState(0);

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
      setUserIsPremium(isPremium);

      // Check if user has enough credits to start a call
      const creditCheck = await canStartCall();
      setUserCreditBalance(creditCheck.balance);

      if (isPremium && creditCheck.allowed && callAction === 'pick' && characterName) {
        // User is premium AND has credits - navigate directly to call
        console.log('✅ User is premium with credits, navigating to call');
        console.log(`💰 Credit balance: ${creditCheck.balance} seconds`);
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

      // If user is premium but out of credits, show paywall with "buy more credits" message
      if (isPremium && !creditCheck.allowed) {
        console.log('⚠️ User is premium but out of credits');
        console.log(`💰 Credit balance: ${creditCheck.balance} seconds`);
        // Continue to show paywall with appropriate message
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

      // Auto-select weekly package by default
      const packages = offerings.current.availablePackages;
      const weeklyPackage = packages.find(pkg =>
        pkg.identifier.toLowerCase().includes('weekly') ||
        pkg.packageType === 'WEEKLY'
      );
      setSelectedPackage(weeklyPackage || packages[0] || null);

      console.log('✅ Paywall loaded with offering:', offerings.current.identifier);
      console.log('📦 Available packages:', packages.map(p => p.identifier));
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

  /**
   * Poll credit balance until credits are allocated by backend
   * Backend needs time to process RevenueCat webhook and allocate credits
   */
  const waitForCreditsAllocation = async (maxWaitSeconds: number = 30): Promise<boolean> => {
    const startTime = Date.now();
    const pollInterval = 2000; // Poll every 2 seconds

    console.log('⏳ Waiting for backend to allocate credits...');

    while ((Date.now() - startTime) / 1000 < maxWaitSeconds) {
      const balance = await getCreditBalance();
      console.log(`💰 Current balance: ${balance} seconds`);

      if (balance > 0) {
        console.log('✅ Credits allocated! Balance:', balance);
        return true;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    console.warn('⚠️ Timeout waiting for credit allocation');
    return false;
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription plan.');
      return;
    }

    setPurchasing(true);
    try {
      console.log('🛒 Purchasing package:', selectedPackage.identifier);

      // Purchase the package using RevenueCat's SDK
      const purchaseResult = await Purchases.purchasePackage(selectedPackage);
      console.log('✅ Purchase completed!', purchaseResult);

      // Get subscription info
      const subInfo = await RevenueCatService.getSubscriptionInfo();

      // Update local state
      await setIsPremium(true);
      setSubscriptionType(subInfo.tier as any);

      // Log purchase
      await logPurchase({
        transaction_id: purchaseResult.customerInfo.originalAppUserId,
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

      // Wait for backend to allocate credits (RevenueCat webhook processing)
      console.log('⏳ Waiting for backend credit allocation...');
      const creditsAllocated = await waitForCreditsAllocation(30);

      if (!creditsAllocated) {
        Alert.alert(
          'Subscription Activated',
          'Your subscription is active but credits are still being processed. Please wait a moment and try again.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              },
            },
          ]
        );
        return;
      }

      // If user clicked "Pick" to start a call, navigate to VoiceCall
      if (callAction === 'pick' && characterName) {
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
    } catch (error: any) {
      console.error('❌ Purchase error:', error);

      // Check if user cancelled
      if (error.userCancelled) {
        console.log('⚠️ Purchase cancelled by user');
        return;
      }

      Alert.alert(
        'Purchase Failed',
        error.message || 'Unable to complete purchase. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPurchasing(false);
    }
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

  // Custom Paywall UI using RevenueCat data and purchase methods
  return (
    <View style={styles.container}>
      {/* Custom header with close button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.paywallContainer}
        contentContainerStyle={styles.paywallContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>
            {userIsPremium && userCreditBalance === 0
              ? 'Buy More Credits'
              : 'Unlock Premium'}
          </Text>
          <Text style={styles.subtitle}>
            {userIsPremium && userCreditBalance === 0
              ? `You've used all your minutes. Get more to continue calling your AI companion!`
              : 'Get voice call minutes with your AI companion'}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📞</Text>
            <Text style={styles.featureText}>AI Voice Calls</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Realistic Conversations</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✨</Text>
            <Text style={styles.featureText}>HD Audio Quality</Text>
          </View>
        </View>

        {/* Subscription Packages */}
        <View style={styles.packagesSection}>
          {offering?.availablePackages.map((pkg) => {
            const isSelected = selectedPackage?.identifier === pkg.identifier;
            const isWeekly = pkg.identifier.toLowerCase().includes('weekly') || pkg.packageType === 'WEEKLY';
            const isYearly = pkg.identifier.toLowerCase().includes('yearly') || pkg.packageType === 'ANNUAL';

            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                onPress={() => setSelectedPackage(pkg)}
                activeOpacity={0.7}
              >
                {isYearly && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>BEST VALUE</Text>
                  </View>
                )}
                <View style={styles.packageHeader}>
                  <Text style={styles.packageTitle}>
                    {isWeekly ? 'Weekly' : isYearly ? 'Yearly' : 'Premium'}
                  </Text>
                  <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                  </View>
                </View>
                <Text style={styles.packagePrice}>
                  {pkg.product.priceString}
                  <Text style={styles.packagePeriod}>
                    {isWeekly ? '/week' : isYearly ? '/year' : ''}
                  </Text>
                </Text>
                <Text style={styles.packageMinutes}>
                  {isWeekly ? '5 minutes' : isYearly ? '50 minutes' : 'Premium access'}
                </Text>
                {isYearly && (
                  <Text style={styles.packageSavings}>Best value - 10x more minutes!</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, purchasing && styles.subscribeButtonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing || !selectedPackage}
          activeOpacity={0.8}
        >
          {purchasing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.subscribeButtonText}>
              Continue with {selectedPackage?.identifier.toLowerCase().includes('weekly') ? 'Weekly' : 'Yearly'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          Auto-renewable subscription. Cancel anytime in App Store settings.
        </Text>
      </ScrollView>

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
  paywallContent: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  packagesSection: {
    marginBottom: 24,
  },
  packageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: '#EC4899',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#EC4899',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#EC4899',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EC4899',
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  packagePeriod: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  packageMinutes: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  packageSavings: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  subscribeButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
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

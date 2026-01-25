import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  PRODUCT_IDS,
} from '../services/revenueCatService';
import { usePaymentStore } from '../store/paymentStore';
import {
  logAdImpression,
  logBeginCheckout,
  logPurchaseFailed,
  logSubscriptionRestored,
  logPlanSelected,
} from '../services/firebaseAnalytics';
import { PurchasesPackage } from 'react-native-purchases';

type NewPaywallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Paywall'>;
type NewPaywallScreenRouteProp = RouteProp<RootStackParamList, 'Paywall'>;

interface NewPaywallScreenProps {
  navigation: NewPaywallScreenNavigationProp;
  route: NewPaywallScreenRouteProp;
}

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { id: '1', text: '15+ AI Girls', icon: '👸' },
  { id: '2', text: 'Voice Calling', icon: '📞' },
  { id: '3', text: 'Full Chat History', icon: '🧠' },
  { id: '4', text: 'No Ads (Pure Experience)', icon: '🚫' },
];

const BACKGROUND_IMAGE =
  'https://firebasestorage.googleapis.com/v0/b/sarina-ai-2b2c1.firebasestorage.app/o/characters%2Fakira.jpg?alt=media&token=c46eda7f-d55f-4637-842e-f8538c26b54e';

export const NewPaywallScreen: React.FC<NewPaywallScreenProps> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<{
    weekly: PurchasesPackage | null;
    yearly: PurchasesPackage | null;
  }>({ weekly: null, yearly: null });

  const { setIsPremium, setSubscriptionType } = usePaymentStore();

  // Log ad impression when paywall is shown
  useEffect(() => {
    logAdImpression({
      ad_platform: 'paywall',
      ad_format: 'subscription_offer',
      ad_source: 'sarina_premium',
      value: 1299,
      currency: 'INR',
      ad_unit_name: 'premium_subscription_offer',
    });

    // Load offerings from RevenueCat
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await getOfferings();
      if (offerings && offerings.availablePackages.length > 0) {
        const weeklyPackage = offerings.availablePackages.find((pkg) =>
          pkg.product.identifier.includes('weekly')
        );
        const yearlyPackage = offerings.availablePackages.find((pkg) =>
          pkg.product.identifier.includes('yearly')
        );

        setPackages({
          weekly: weeklyPackage || null,
          yearly: yearlyPackage || null,
        });
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
    }
  };

  const handleClose = () => {
    // Navigate to Chat screen when user closes paywall
    navigation.navigate('Chat', { fromOnboarding: false });
  };

  const handleContinue = async () => {
    const selectedPackage = selectedPlan === 'weekly' ? packages.weekly : packages.yearly;

    if (!selectedPackage) {
      Alert.alert('Error', 'Selected plan is not available. Please try again.');
      return;
    }

    const planValue = selectedPlan === 'weekly' ? 299 : 1299;

    // Log begin checkout
    await logBeginCheckout(selectedPlan, planValue, 'INR');

    setLoading(true);

    try {
      const result = await purchasePackage(selectedPackage);

      if (result.success) {
        setIsPremium(true);
        setSubscriptionType(selectedPlan);
        Alert.alert('Success', 'Premium access activated!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Chat', { fromOnboarding: false }),
          },
        ]);
      } else {
        if (result.error !== 'Purchase cancelled') {
          // Log purchase failed
          await logPurchaseFailed(selectedPlan, result.error || 'Unknown error');
          Alert.alert('Purchase Failed', result.error || 'Something went wrong. Please try again.');
        }
      }
    } catch (error: any) {
      await logPurchaseFailed(selectedPlan, error.message || 'Unknown error');
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    try {
      const result = await restorePurchases();

      // Log restoration attempt
      await logSubscriptionRestored(result.isPremium);

      if (result.success && result.isPremium) {
        setIsPremium(true);
        Alert.alert('Success', 'Your purchases have been restored!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Chat', { fromOnboarding: false }),
          },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions found to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan: 'weekly' | 'yearly') => {
    setSelectedPlan(plan);
    const value = plan === 'weekly' ? 299 : 1299;
    await logPlanSelected(plan, value);
  };

  return (
    <View style={styles.container}>
      {/* Background Image with fast caching */}
      <Image
        source={{ uri: BACKGROUND_IMAGE }}
        style={styles.backgroundImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
        placeholder={{ blurhash: 'L48g~o?bM{of~q%MWBj[9FD%ofj[' }}
        transition={200}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.98)']}
        locations={[0, 0.25, 0.6, 0.85]}
        style={styles.gradientOverlay}
      >
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
          <BlurView intensity={80} tint="dark" style={styles.closeBlur}>
            <Text style={styles.closeIcon}>✕</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Main Content - No Scroll, Compact Layout */}
        <View style={styles.contentContainer}>
              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  Unlock All <Text style={styles.titleAccent}>Limits 😍</Text>
                </Text>
              </View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {FEATURES.map((feature) => (
                  <View key={feature.id} style={styles.featureRow}>
                    <BlurView intensity={40} tint="light" style={styles.featureIconContainer}>
                      <Text style={styles.featureIcon}>{feature.icon}</Text>
                    </BlurView>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>

              {/* Trust Badge */}
              <BlurView intensity={20} tint="light" style={styles.trustBadge}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.trustText}>NO STRINGS ATTACHED • SECURE CHECKOUT</Text>
              </BlurView>

              {/* Plan Cards */}
              <View style={styles.plansContainer}>
                {/* Weekly Plan */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === 'weekly' && styles.planCardSelected,
                  ]}
                  onPress={() => handlePlanSelect('weekly')}
                  activeOpacity={0.8}
                >
                  <View style={styles.planLeft}>
                    <Text style={styles.planTitle}>Weekly Plan</Text>
                    <Text style={styles.planSubtitle}>per week</Text>
                  </View>
                  <View style={styles.planRight}>
                    <Text style={styles.planPrice}>₹299</Text>
                    <Text style={styles.planWeekly}>₹299</Text>
                  </View>
                </TouchableOpacity>

                {/* Yearly Plan */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === 'yearly' && styles.planCardSelected,
                  ]}
                  onPress={() => handlePlanSelect('yearly')}
                  activeOpacity={0.8}
                >
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>SAVE 91%</Text>
                  </View>
                  <View style={styles.planLeft}>
                    <Text style={styles.planTitle}>Yearly Plan</Text>
                    <Text style={styles.planSubtitle}>billed annually</Text>
                  </View>
                  <View style={styles.planRight}>
                    <Text style={styles.planPrice}>₹1299</Text>
                    <Text style={styles.planWeekly}>₹24.98/week</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.9}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#EC4899', '#DB2777']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.continueButtonText}>Continue</Text>
                      <Text style={styles.continueArrow}>→</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Restore Purchases */}
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestorePurchases}
                disabled={loading}
              >
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </TouchableOpacity>

              {/* Footer Links */}
              <View style={styles.footerLinks}>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>TERMS</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>PRIVACY</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>HELP</Text>
                </TouchableOpacity>
              </View>
          </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  closeBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
  },
  closeIcon: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleAccent: {
    color: '#EC4899',
    textShadowColor: 'rgba(236, 72, 153, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 10,
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  checkIcon: {
    fontSize: 14,
    color: '#10B981',
  },
  trustText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
  },
  plansContainer: {
    width: '100%',
    marginBottom: 12,
    gap: 10,
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  planCardSelected: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderColor: '#EC4899',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
  },
  saveBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  planLeft: {
    gap: 4,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  planSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  planRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  planWeekly: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#DB2777',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 45,
    elevation: 12,
  },
  continueGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  continueArrow: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  restoreButton: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  restoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLink: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.2)',
    letterSpacing: 1.5,
  },
});

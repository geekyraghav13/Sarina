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
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { usePaymentStore } from '../store/paymentStore';
import {
  logAdImpression,
  logBeginCheckout,
  logPurchase,
  logPurchaseFailed,
  logSubscriptionRestored,
  logPlanSelected,
} from '../services/firebaseAnalytics';
import * as SubscriptionService from '../services/subscriptionService';
import { getCurrentUser } from '../services/authService';
import { getCreditAllocationForTier } from '../services/creditService';
import { updateUserSubscriptionREST } from '../services/firestoreRestService';
import { useGirlfriendStore } from '../store/girlfriendStore';
import { useUserProfile } from '../store/userProfile';
import { getAuth } from 'firebase/auth';

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

// Feature flag: Set to true to use mock purchases (for testing without Play Console setup)
// Set to false to use real IAP (production)
const USE_MOCK_PURCHASES = false; // Real IAP enabled with react-native-iap

const BACKEND_URL = 'https://sarina-voice-backend-1051121433445.us-central1.run.app';

export const NewPaywallScreen: React.FC<NewPaywallScreenProps> = ({ navigation, route }) => {
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionService.Subscription[]>([]);
  const [weeklySubscription, setWeeklySubscription] = useState<SubscriptionService.Subscription | null>(null);
  const [yearlySubscription, setYearlySubscription] = useState<SubscriptionService.Subscription | null>(null);

  const { setIsPremium, setSubscriptionType, loadSubscriptionStatus } = usePaymentStore();
  const { profile } = useUserProfile();

  // NEW: Get navigation params
  const { characterName, characterImageUrl, callAction, returnScreen } = route.params || {};

  // Initialize IAP and load subscriptions
  useEffect(() => {
    logAdImpression({
      ad_platform: 'paywall',
      ad_format: 'subscription_offer',
      ad_source: 'sarina_premium',
      value: 1299,
      currency: 'INR',
      ad_unit_name: 'premium_subscription_offer',
    });

    initializeSubscriptions();

    // Cleanup on unmount
    return () => {
      SubscriptionService.removeListeners();
      SubscriptionService.disconnectIAP();
    };
  }, []);

  const initializeSubscriptions = async () => {
    setLoading(true);
    try {
      // Initialize IAP connection
      const connected = await SubscriptionService.initializeIAP();

      if (!connected) {
        console.error('Failed to connect to IAP');
        Alert.alert('Connection Error', 'Could not connect to the store. Please try again.');
        setLoading(false);
        return;
      }

      // Fetch available subscriptions
      const subs = await SubscriptionService.getAvailableSubscriptions();
      setSubscriptions(subs);

      // Find weekly and yearly subscriptions
      const weekly = subs.find((s: any) => s.productId === SubscriptionService.SUBSCRIPTION_IDS.WEEKLY);
      const yearly = subs.find((s: any) => s.productId === SubscriptionService.SUBSCRIPTION_IDS.YEARLY);

      setWeeklySubscription(weekly || null);
      setYearlySubscription(yearly || null);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Navigate to return screen (default to MainTabs/Home)
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleContinue = async () => {
    const planValue = selectedPlan === 'weekly' ? 299 : 1299;

    // Log begin checkout
    await logBeginCheckout(selectedPlan, planValue, 'INR');

    setLoading(true);

    try {
      const user = getCurrentUser();
      if (!user?.uid) {
        Alert.alert('Error', 'You must be signed in to purchase');
        setLoading(false);
        return;
      }

      if (USE_MOCK_PURCHASES) {
        // MOCK PURCHASE FLOW - For testing without Play Console setup
        console.log('💳 Processing MOCK purchase via REST API...');
        const creditsToAdd = getCreditAllocationForTier(selectedPlan);

        await updateUserSubscriptionREST(user.uid, selectedPlan, creditsToAdd);

        // Update local state and persist
        await setIsPremium(true);
        setSubscriptionType(selectedPlan);
        await loadSubscriptionStatus(); // Reload to ensure sync

        console.log(`✅ MOCK Purchase successful: ${selectedPlan} plan, ${creditsToAdd}s added`);

        showSuccessAndNavigate(creditsToAdd);
      } else {
        // REAL IAP FLOW - Production purchase
        console.log('💳 Processing REAL IAP purchase...');

        const productId = selectedPlan === 'weekly'
          ? SubscriptionService.SUBSCRIPTION_IDS.WEEKLY
          : SubscriptionService.SUBSCRIPTION_IDS.YEARLY;

        // Initiate purchase through App Store/Play Store
        const purchaseResult = await SubscriptionService.purchaseSubscription(productId);

        if (!purchaseResult.success) {
          // User cancelled or error occurred
          if (purchaseResult.error !== 'Purchase cancelled' && purchaseResult.error !== 'Purchase timeout') {
            await logPurchaseFailed(selectedPlan, purchaseResult.error || 'Unknown error');
            Alert.alert('Purchase Failed', purchaseResult.error || 'Failed to complete purchase. Please try again.');
          } else if (purchaseResult.error === 'Purchase timeout') {
            Alert.alert('Timeout', 'Purchase is taking too long. Please check your purchase history or try again.');
          }
          setLoading(false);
          return;
        }

        // Purchase successful, now validate with backend
        console.log('📝 Validating purchase with backend...');
        const purchase = purchaseResult.purchase;

        // Get Firebase ID token for authentication
        let idToken: string | undefined;
        try {
          const auth = getAuth();
          if (auth && auth.currentUser) {
            idToken = await auth.currentUser.getIdToken();
          }
        } catch (authError) {
          console.error('Auth error:', authError);
          // Continue without backend validation if auth fails
        }

        if (!idToken) {
          console.warn('No auth token available, skipping backend validation');
          // For iOS, we can trust Apple's receipt validation
          // Just grant the subscription locally
          await setIsPremium(true);
          setSubscriptionType(selectedPlan);
          await loadSubscriptionStatus(); // Reload to ensure sync

          await logPurchase({
            transaction_id: purchase.transactionId || 'unknown',
            value: planValue,
            currency: 'INR',
            items: [{
              item_id: selectedPlan,
              item_name: `Sarina ${selectedPlan === 'weekly' ? 'Weekly' : 'Yearly'} Plan`,
              item_category: 'subscription',
              quantity: 1,
              price: planValue
            }]
          });
          await SubscriptionService.finishTransaction(purchase);
          showSuccessAndNavigate(getCreditAllocationForTier(selectedPlan));
          return;
        }

        // Send receipt to backend for validation
        try {
          const validationResponse = await fetch(`${BACKEND_URL}/api/validate-purchase`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              userId: user.uid,
              platform: Platform.OS,
              productId: purchase.productId,
              purchaseToken: purchase.purchaseToken,
            }),
          });

          const validationResult = await validationResponse.json();

          if (!validationResult.success) {
            console.error('❌ Backend validation failed:', validationResult.error);
            // Don't fail the purchase - grant access anyway since store validated it
            console.log('⚠️ Granting access despite backend validation failure');
            await setIsPremium(true);
            setSubscriptionType(selectedPlan);
            await loadSubscriptionStatus();
            await SubscriptionService.finishTransaction(purchase);
            showSuccessAndNavigate(getCreditAllocationForTier(selectedPlan));
            return;
          }

          console.log('✅ Purchase validated! Credits:', validationResult.creditsAdded);

          // Update local state and persist
          await setIsPremium(true);
          setSubscriptionType(selectedPlan);
          await loadSubscriptionStatus(); // Critical: Reload to ensure sync

          // Log successful purchase
          await logPurchase({
            transaction_id: purchase.transactionId || 'unknown',
            value: planValue,
            currency: 'INR',
            items: [{
              item_id: selectedPlan,
              item_name: `Sarina ${selectedPlan === 'weekly' ? 'Weekly' : 'Yearly'} Plan`,
              item_category: 'subscription',
              quantity: 1,
              price: planValue
            }]
          });

          // Finish transaction (important for consumables)
          await SubscriptionService.finishTransaction(purchase);

          showSuccessAndNavigate(validationResult.creditsAdded);
        } catch (fetchError) {
          console.error('❌ Backend fetch error:', fetchError);
          // Grant access anyway - the store validated the purchase
          await setIsPremium(true);
          setSubscriptionType(selectedPlan);
          await loadSubscriptionStatus();
          await SubscriptionService.finishTransaction(purchase);
          showSuccessAndNavigate(getCreditAllocationForTier(selectedPlan));
        }
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      await logPurchaseFailed(selectedPlan, error.message || 'Unknown error');
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessAndNavigate = (creditsAdded: number) => {
    Alert.alert(
      'Success! 🎉',
      `${selectedPlan === 'weekly' ? 'Weekly' : 'Yearly'} plan activated!\nYou got ${creditsAdded} seconds of voice calling.`,
      [
        {
          text: 'Got it!',
          onPress: () => {
            // Navigate to MainTabs (Home screen) after purchase
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          },
        },
      ]
    );
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    try {
      if (USE_MOCK_PURCHASES) {
        // Mock mode - just check Firestore
        const status = await SubscriptionService.syncSubscriptionStatus();
        await logSubscriptionRestored(status?.isPremium || false);

        if (status?.isPremium) {
          await setIsPremium(true);
          setSubscriptionType(status.subscriptionType || null);
          await loadSubscriptionStatus(); // Reload to ensure sync

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
      } else {
        // Real IAP mode - restore from App Store/Play Store
        const result = await SubscriptionService.restorePurchases();

        // Log restoration attempt
        await logSubscriptionRestored(result.isPremium || false);

        if (result.success && result.isPremium && result.purchase) {
          // Update local state immediately (trust store validation)
          await setIsPremium(true);

          // Derive subscription type from productId
          const productId = result.purchase?.productId;
          const subType = productId === SubscriptionService.SUBSCRIPTION_IDS.WEEKLY ? 'weekly' :
                         productId === SubscriptionService.SUBSCRIPTION_IDS.YEARLY ? 'yearly' : null;
          setSubscriptionType(subType);
          await loadSubscriptionStatus(); // Reload to ensure sync

          Alert.alert('Success', 'Your purchases have been restored!', [
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
      }
    } catch (error) {
      console.error('Restore error:', error);
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

        {/* Main Content */}
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
              disabled={loading}
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
              disabled={loading}
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

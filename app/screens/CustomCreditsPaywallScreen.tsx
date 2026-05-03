import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { usePaymentStore } from '../store/paymentStore';
import * as RevenueCatService from '../services/revenueCatService';
import { useGirlfriendStore } from '../store/girlfriendStore';
import { LinearGradient } from 'expo-linear-gradient';
import { logScreenView, logAdImpression, logPurchase } from '../services/firebaseAnalytics';
import { getCurrentUser } from '../services/authService';

type CustomCreditsPaywallNavigationProp = StackNavigationProp<RootStackParamList, 'CustomCreditsPaywall'>;
type CustomCreditsPaywallRouteProp = RouteProp<RootStackParamList, 'CustomCreditsPaywall'>;

interface CustomCreditsPaywallProps {
  navigation: CustomCreditsPaywallNavigationProp;
  route: CustomCreditsPaywallRouteProp;
}

export const CustomCreditsPaywallScreen: React.FC<CustomCreditsPaywallProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState<any>(null);

  const { setIsPremium, setSubscriptionType } = usePaymentStore();
  const { girlfriends } = useGirlfriendStore();

  // Get navigation params
  const { returnScreen, callAction, characterName, characterImageUrl } = route.params || {};

  useEffect(() => {
    loadProductInfo();

    // Track screen view
    logScreenView('CustomCreditsPaywall');

    // Log ad_impression when credits paywall is shown
    logAdImpression({
      ad_platform: 'credits_paywall',
      ad_format: 'credits_offer',
      ad_source: 'sarina_credits',
      value: 0.99, // 10 minutes for $0.99
      currency: 'USD',
      ad_unit_name: 'credits_10_minutes',
    });
  }, []);

  const loadProductInfo = async () => {
    try {
      console.log('📦 Loading credits product info...');
      setLoading(true);

      // Get offerings to find the credits product
      const offerings = await RevenueCatService.getOfferings();

      if (offerings?.all?.Credits) {
        const creditsOffering = offerings.all.Credits;
        const packages = creditsOffering.availablePackages;

        if (packages && packages.length > 0) {
          const creditsPackage = packages[0]; // Get first package (10 minutes)
          setProductInfo({
            identifier: creditsPackage.product.identifier,
            price: creditsPackage.product.priceString,
            title: creditsPackage.product.title,
            description: creditsPackage.product.description,
          });
          console.log('✅ Credits product loaded:', creditsPackage.product.identifier);
        } else {
          console.warn('⚠️ No packages found in Credits offering');
        }
      } else {
        console.warn('⚠️ Credits offering not found');
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading product info:', error);
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      console.log('💳 Starting credits purchase...');
      setLoading(true);

      // Purchase the credits product directly
      const result = await RevenueCatService.purchaseCreditsProduct();

      if (result.success) {
        console.log('✅ Credits purchase successful!');

        // Log purchase event to Firebase Analytics
        const user = getCurrentUser();
        if (user) {
          await logPurchase({
            transaction_id: `credits_${Date.now()}_${user.uid}`,
            value: 0.99,
            currency: 'USD',
            items: [{
              item_id: 'credits_10_minutes',
              item_name: '10 Minutes Credits',
              item_category: 'credits',
              quantity: 1,
              price: 0.99,
            }],
          });
        }

        // Wait for sync to complete
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Stop loading indicator before showing alerts
        setLoading(false);

        // If user was trying to make a call, navigate to call screen
        if (callAction === 'pick' && characterName) {
          const girlfriend = girlfriends.find(gf => gf.name === characterName);

          if (girlfriend) {
            // Use setTimeout to ensure alert shows properly after loading state changes
            setTimeout(() => {
              Alert.alert(
                'Credits Added! 🎉',
                'You now have 10 more minutes. Starting your call...',
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
                ],
                {
                  cancelable: false,
                }
              );
            }, 300);
            return;
          }
        }

        // Just show success and close
        // Use setTimeout to ensure alert shows properly after loading state changes
        setTimeout(() => {
          Alert.alert(
            'Credits Added! 🎉',
            'You now have 10 more minutes of talk time!',
            [{ text: 'OK', onPress: handleClose }],
            {
              cancelable: false,
            }
          );
        }, 300);
      } else {
        // Purchase failed or cancelled
        setLoading(false);
        if (result.error !== 'Purchase cancelled') {
          setTimeout(() => {
            Alert.alert(
              'Purchase Failed',
              result.error || 'Something went wrong. Please try again.',
              [{ text: 'OK' }]
            );
          }, 300);
        }
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      setLoading(false);

      Alert.alert(
        'Error',
        'Unable to complete purchase. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    // Use goBack() to properly dismiss modal
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback to navigating to Chat if can't go back
      const screen = returnScreen || 'Chat';
      navigation.navigate(screen as any, { fromOnboarding: false });
    }
  };

  if (loading && !productInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⏱️</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Out of Credits?</Text>
        <Text style={styles.subtitle}>Get more time with your AI companion</Text>

        {/* Credit Package */}
        <View style={styles.packageContainer}>
          <LinearGradient
            colors={['#FF69B4', '#FF1493']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.packageGradient}
          >
            <View style={styles.packageContent}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageTitle}>10 Minutes</Text>
                <Text style={styles.packageBadge}>BEST VALUE</Text>
              </View>

              <Text style={styles.packageDescription}>
                600 seconds of voice calling
              </Text>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>{productInfo?.price || '$0.99'}</Text>
                <Text style={styles.perMinute}>($0.10/min)</Text>
              </View>

              <View style={styles.features}>
                <Text style={styles.feature}>✓ Instant credit top-up</Text>
                <Text style={styles.feature}>✓ No subscription required</Text>
                <Text style={styles.feature}>✓ Never expires</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Purchase Button */}
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={handlePurchase}
          disabled={loading}
        >
          <LinearGradient
            colors={['#FF69B4', '#FF1493']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.purchaseGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.purchaseButtonText}>Buy Credits</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Fine Print */}
        <Text style={styles.finePrint}>
          Credits will be added to your account immediately after purchase
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Poppins-Regular',
  },
  packageContainer: {
    marginBottom: 32,
  },
  packageGradient: {
    borderRadius: 20,
    padding: 2,
  },
  packageContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 18,
    padding: 24,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  packageBadge: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  packageDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF69B4',
    fontFamily: 'Poppins-Bold',
  },
  perMinute: {
    fontSize: 16,
    color: '#CCCCCC',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  features: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
  },
  purchaseButton: {
    marginBottom: 16,
  },
  purchaseGradient: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  finePrint: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
});

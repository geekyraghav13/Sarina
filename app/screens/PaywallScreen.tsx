import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';

type PaywallScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Paywall'
>;

type PaywallScreenRouteProp = RouteProp<RootStackParamList, 'Paywall'>;

interface PaywallScreenProps {
  navigation: PaywallScreenNavigationProp;
  route: PaywallScreenRouteProp;
}

const { width, height } = Dimensions.get('window');

export const PaywallScreen: React.FC<PaywallScreenProps> = ({
  navigation,
  route,
}) => {
  const { characterName } = route.params;

  const handleClose = () => {
    // Go back to Chat Screen
    navigation.navigate('Chat', { fromOnboarding: true });
  };

  const handleSubscribe = () => {
    // For now, just go to chat (real subscription logic will be added later)
    navigation.navigate('Chat', { fromOnboarding: true });
  };

  return (
    <View style={styles.container}>
      {/* Semi-transparent overlay */}
      <View style={styles.overlay} />

      {/* Paywall Card */}
      <View style={styles.card}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.lockIcon}>🔓</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Unlock Premium</Text>
          <Text style={styles.subtitle}>
            Continue video calling with {characterName}
          </Text>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>Unlimited video calls</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>Voice calls anytime</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>Priority AI responses</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>Exclusive content & photos</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>Ad-free experience</Text>
            </View>
          </View>

          {/* Pricing Options */}
          <View style={styles.pricingContainer}>
            {/* Monthly Plan (Best Value) */}
            <TouchableOpacity
              style={[styles.pricingCard, styles.bestValueCard]}
              activeOpacity={0.9}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <Text style={styles.pricingTitle}>Monthly</Text>
              <Text style={styles.pricingAmount}>$9.99</Text>
              <Text style={styles.pricingPeriod}>per month</Text>
            </TouchableOpacity>

            {/* Weekly Plan */}
            <TouchableOpacity style={styles.pricingCard} activeOpacity={0.9}>
              <Text style={styles.pricingTitle}>Weekly</Text>
              <Text style={styles.pricingAmount}>$2.99</Text>
              <Text style={styles.pricingPeriod}>per week</Text>
            </TouchableOpacity>
          </View>

          {/* Subscribe Button */}
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subscribeGradient}
            >
              <Text style={styles.subscribeButtonText}>
                Continue with Premium
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel / Maybe Later */}
          <TouchableOpacity
            style={styles.maybeLaterButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.maybeLaterText}>Maybe Later</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerText}>
            Cancel anytime. Terms apply.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 20,
    color: '#10B981',
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  pricingContainer: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  pricingCard: {
    width: '100%',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  bestValueCard: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 4,
  },
  pricingPeriod: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  subscribeButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  maybeLaterButton: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  maybeLaterText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
  },
});

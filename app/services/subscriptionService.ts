import AsyncStorage from '@react-native-async-storage/async-storage';
import { logPurchase } from './firebaseAnalytics';
import { Platform } from 'react-native';
import { getCurrentUser } from './authService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import * as RNIap from 'react-native-iap';

// Product IDs - Android uses your Google Play Console IDs
export const SUBSCRIPTION_IDS = Platform.select({
  ios: {
    WEEKLY: 'com.sarina.app.weekly',
    YEARLY: 'com.sarina.app.yearly',
  },
  android: {
    WEEKLY: 'sarina_weekly_299',
    YEARLY: 'sarina_yearly_1299',
  },
  default: {
    WEEKLY: 'sarina_weekly_299',
    YEARLY: 'sarina_yearly_1299',
  },
})!;

// Voice Credit Product IDs
export const VOICE_CREDIT_IDS = {
  PACK_5MIN: 'voice5min',
  PACK_15MIN: 'voice15min',
  PACK_30MIN: 'voice30min',
};

export interface Subscription {
  productId: string;
  price: string;
  localizedPrice: string;
  title: string;
  description: string;
  priceAmountMicros?: number;
  priceCurrencyCode?: string;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  isPremium?: boolean;
  purchase?: any;
}

let purchaseUpdateSubscription: any = null;
let purchaseErrorSubscription: any = null;

// Initialize IAP connection
export const initializeIAP = async (): Promise<boolean> => {
  try {
    console.log('🔌 Connecting to IAP...');
    await RNIap.initConnection();
    console.log('✅ IAP connection established');
    return true;
  } catch (error) {
    console.error('❌ IAP initialization failed:', error);
    return false;
  }
};

// Disconnect IAP
export const disconnectIAP = async () => {
  try {
    await RNIap.endConnection();
    console.log('✅ IAP disconnected');
  } catch (error) {
    console.error('❌ IAP disconnect failed:', error);
  }
};

// Get available subscriptions from store
export const getAvailableSubscriptions = async (): Promise<Subscription[]> => {
  try {
    console.log('📦 Fetching products from store...');
    const productIds = [SUBSCRIPTION_IDS.WEEKLY, SUBSCRIPTION_IDS.YEARLY];

    const subscriptions = await RNIap.getSubscriptions({ skus: productIds });

    console.log(`✅ Fetched ${subscriptions.length} products from store`);

    return subscriptions.map((product) => ({
      productId: product.productId,
      price: product.price,
      localizedPrice: product.localizedPrice,
      title: product.title || 'Subscription',
      description: product.description || '',
      priceAmountMicros: parseFloat(product.price) * 1000000,
      priceCurrencyCode: product.currency,
    }));
  } catch (error) {
    console.error('❌ Error fetching subscriptions:', error);
    return [];
  }
};

// Purchase a subscription
export const purchaseSubscription = async (productId: string): Promise<PurchaseResult> => {
  try {
    console.log(`💳 Initiating purchase for: ${productId}`);

    const purchase = await RNIap.requestSubscription({ sku: productId });

    console.log('Purchase result:', purchase);

    if (purchase) {
      console.log('✅ Purchase successful!', {
        productId: purchase.productId,
        transactionId: purchase.transactionId,
      });

      return {
        success: true,
        isPremium: true,
        purchase: purchase,
      };
    } else {
      return { success: false, error: 'No purchase data received' };
    }
  } catch (error: any) {
    console.error('❌ Purchase error:', error);

    if (error.code === 'E_USER_CANCELLED') {
      console.log('⚠️ User cancelled the purchase');
      return { success: false, error: 'Purchase cancelled' };
    }

    return { success: false, error: error.message || 'Purchase failed' };
  }
};

// Check if user has an active subscription
export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    if (!user?.uid) {
      console.log('No user authenticated, returning non-premium status');
      return false;
    }

    // Check Firestore for subscription status
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log('User document not found, returning non-premium status');
      return false;
    }

    const userData = userDoc.data();
    const subscriptionTier = userData?.subscription_tier || 'free';

    // User is premium if subscription_tier is not 'free'
    const isPremium = subscriptionTier !== 'free';

    console.log(`✅ Premium status checked: ${isPremium} (tier: ${subscriptionTier})`);
    return isPremium;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false; // Default to non-premium on error
  }
};

// Sync subscription status with paymentStore
export const syncSubscriptionStatus = async () => {
  try {
    const user = getCurrentUser();
    if (!user?.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const tier = userData?.subscription_tier || 'free';
      const isPremium = tier !== 'free';

      // Update paymentStore (you'll need to import this)
      // This will be used in the paywall screen
      return {
        isPremium,
        subscriptionType: tier === 'free' ? null : tier,
      };
    }

    return { isPremium: false, subscriptionType: null };
  } catch (error) {
    console.error('Error syncing subscription status:', error);
    return { isPremium: false, subscriptionType: null };
  }
};

// Restore purchases
export const restorePurchases = async (): Promise<PurchaseResult> => {
  try {
    console.log('🔄 Restoring purchases...');

    const purchases = await RNIap.getAvailablePurchases();

    if (!purchases || purchases.length === 0) {
      console.log('⚠️ No purchases found to restore');
      return { success: false, error: 'No purchases found', isPremium: false };
    }

    console.log(`✅ Found ${purchases.length} previous purchases`);

    // Find the most recent subscription purchase
    const subscriptionPurchase = purchases.find(
      (purchase) =>
        purchase.productId === SUBSCRIPTION_IDS.WEEKLY ||
        purchase.productId === SUBSCRIPTION_IDS.YEARLY
    );

    if (subscriptionPurchase) {
      console.log('✅ Found subscription to restore:', subscriptionPurchase.productId);
      return {
        success: true,
        isPremium: true,
        purchase: subscriptionPurchase,
      };
    }

    return { success: false, error: 'No subscription found', isPremium: false };
  } catch (error: any) {
    console.error('❌ Error restoring purchases:', error);
    return { success: false, error: error.message || 'Failed to restore purchases' };
  }
};

// Setup purchase listeners
export const setupPurchaseListener = () => {
  try {
    console.log('👂 Setting up purchase listeners...');

    // Purchase update listener
    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener((purchase) => {
      console.log('📦 Purchase received:', purchase.productId);
      // Handle the purchase (validate receipt, update Firestore, etc.)
    });

    // Purchase error listener
    purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
      console.error('❌ Purchase error:', error);
    });

    console.log('✅ Purchase listeners set up');
  } catch (error) {
    console.error('❌ Failed to setup purchase listeners:', error);
  }
};

// Get voice credit products
export const getVoiceProducts = async (): Promise<Subscription[]> => {
  try {
    console.log('📦 Fetching voice credit products...');
    const productIds = Object.values(VOICE_CREDIT_IDS);

    const products = await RNIap.getProducts({ skus: productIds });

    console.log(`✅ Fetched ${products.length} voice credit products`);

    return products.map((product) => ({
      productId: product.productId,
      price: product.price,
      localizedPrice: product.localizedPrice,
      title: product.title || 'Voice Credits',
      description: product.description || '',
      priceAmountMicros: parseFloat(product.price) * 1000000,
      priceCurrencyCode: product.currency,
    }));
  } catch (error) {
    console.error('❌ Error fetching voice products:', error);
    return [];
  }
};

// Purchase voice credits
export const purchaseVoiceCredits = async (productId: string): Promise<PurchaseResult> => {
  try {
    console.log(`💳 Initiating voice credit purchase for: ${productId}`);

    const purchase = await RNIap.requestPurchase({ skus: [productId] });

    if (purchase) {
      console.log('✅ Voice credit purchase successful!', {
        productId: purchase.productId,
        transactionId: purchase.transactionId,
      });

      return {
        success: true,
        purchase: purchase,
      };
    } else {
      return { success: false, error: 'No purchase data received' };
    }
  } catch (error: any) {
    console.error('❌ Voice credit purchase error:', error);

    if (error.code === 'E_USER_CANCELLED') {
      console.log('⚠️ User cancelled voice credit purchase');
      return { success: false, error: 'Purchase cancelled' };
    }

    return { success: false, error: error.message || 'Purchase failed' };
  }
};

// Finish transaction (for consumable products)
export const finishTransaction = async (purchase: any): Promise<boolean> => {
  try {
    await RNIap.finishTransaction({ purchase, isConsumable: false });
    console.log('✅ Transaction finished:', purchase.productId);
    return true;
  } catch (error) {
    console.error('❌ Failed to finish transaction:', error);
    return false;
  }
};

// Cleanup listeners
export const removeListeners = () => {
  if (purchaseUpdateSubscription) {
    purchaseUpdateSubscription.remove();
    purchaseUpdateSubscription = null;
  }
  if (purchaseErrorSubscription) {
    purchaseErrorSubscription.remove();
    purchaseErrorSubscription = null;
  }
  console.log('✅ Purchase listeners removed');
};

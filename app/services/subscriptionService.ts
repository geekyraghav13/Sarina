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

    // v14 API: Use fetchProducts with type 'subs' for subscriptions
    const subscriptions = await RNIap.fetchProducts({
      skus: productIds,
      type: 'subs'
    });

    if (!subscriptions || subscriptions.length === 0) {
      console.warn('⚠️ No subscriptions returned from store');
      return [];
    }

    console.log(`✅ Fetched ${subscriptions.length} products from store`);

    return subscriptions.map((product: any) => ({
      productId: product.productId || product.sku,
      price: product.price?.toString() || '0',
      localizedPrice: product.localizedPrice || product.price || '0',
      title: product.title || 'Subscription',
      description: product.description || '',
      priceAmountMicros: parseFloat(product.price?.toString() || '0') * 1000000,
      priceCurrencyCode: product.currency || 'USD',
    }));
  } catch (error: any) {
    console.error('❌ Error fetching subscriptions:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      platform: Platform.OS,
    });
    return [];
  }
};

// Purchase a subscription
export const purchaseSubscription = async (productId: string): Promise<PurchaseResult> => {
  try {
    console.log(`💳 Initiating purchase for: ${productId} on ${Platform.OS}`);

    // v14 API: Use requestPurchase for subscriptions (event-based)
    // We wrap it in a promise that listens for the purchase result
    return new Promise((resolve, reject) => {
      // Set up one-time listeners for this purchase
      const purchaseListener = RNIap.purchaseUpdatedListener((purchase) => {
        console.log('📦 Purchase received:', purchase);

        // Check if this is the purchase we're waiting for
        if (purchase.productId === productId) {
          purchaseListener.remove();
          errorListener.remove();

          resolve({
            success: true,
            isPremium: true,
            purchase: purchase,
          });
        }
      });

      const errorListener = RNIap.purchaseErrorListener((error: any) => {
        console.error('❌ Purchase error from listener:', error);
        purchaseListener.remove();
        errorListener.remove();

        if (error.code === 'E_USER_CANCELLED' || error.code === 2) {
          resolve({ success: false, error: 'Purchase cancelled' });
        } else {
          resolve({
            success: false,
            error: error.message || 'Purchase failed'
          });
        }
      });

      // Initiate the purchase
      RNIap.requestPurchase({
        request: {
          apple: { sku: productId },
          google: { skus: [productId] }
        },
        type: 'subs'
      }).catch((error) => {
        console.error('❌ requestPurchase error:', error);
        purchaseListener.remove();
        errorListener.remove();

        if (error.code === 'E_USER_CANCELLED' || error.message?.includes('cancelled')) {
          resolve({ success: false, error: 'Purchase cancelled' });
        } else {
          resolve({
            success: false,
            error: error.message || error.toString() || 'Purchase failed'
          });
        }
      });

      // Timeout after 2 minutes
      setTimeout(() => {
        purchaseListener.remove();
        errorListener.remove();
        resolve({ success: false, error: 'Purchase timeout' });
      }, 120000);
    });
  } catch (error: any) {
    console.error('❌ Purchase setup error:', error);
    return {
      success: false,
      error: error.message || error.toString() || 'Purchase failed'
    };
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

    // v14 API: Use fetchProducts with type 'in-app' for consumables
    const products = await RNIap.fetchProducts({
      skus: productIds,
      type: 'in-app'
    });

    if (!products || products.length === 0) {
      console.warn('⚠️ No products returned from store');
      return [];
    }

    console.log(`✅ Fetched ${products.length} voice credit products`);

    return products.map((product: any) => ({
      productId: product.productId || product.sku,
      price: product.price?.toString() || '0',
      localizedPrice: product.localizedPrice || product.price || '0',
      title: product.title || 'Voice Credits',
      description: product.description || '',
      priceAmountMicros: parseFloat(product.price?.toString() || '0') * 1000000,
      priceCurrencyCode: product.currency || 'USD',
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

    // v14 API: Use requestPurchase for in-app products
    await RNIap.requestPurchase({
      request: {
        apple: { sku: productId },
        google: { skus: [productId] }
      },
      type: 'in-app'
    });

    console.log('✅ Voice credit purchase request initiated');

    return {
      success: true,
      purchase: null, // Will come through listener
    };
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

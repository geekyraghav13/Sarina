import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logPurchase } from './firebaseAnalytics';

// Product IDs (MUST match App Store Connect and Google Play Console)
export const SUBSCRIPTION_IDS = {
  WEEKLY: 'com.sarina.app.weekly',
  YEARLY: 'com.sarina.app.yearly',
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
}

// Initialize In-App Purchases
export const initializeIAP = async (): Promise<boolean> => {
  try {
    await InAppPurchases.connectAsync();
    console.log('✅ IAP Connected');
    return true;
  } catch (error: any) {
    console.error('❌ IAP Connection Error:', error);
    return false;
  }
};

// Disconnect when app closes
export const disconnectIAP = async () => {
  try {
    await InAppPurchases.disconnectAsync();
    console.log('✅ IAP Disconnected');
  } catch (error) {
    console.error('❌ IAP Disconnect Error:', error);
  }
};

// Get available subscriptions
export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { results, errorCode } = await InAppPurchases.getProductsAsync([
      SUBSCRIPTION_IDS.WEEKLY,
      SUBSCRIPTION_IDS.YEARLY,
    ]);

    if (errorCode || !results) {
      console.error('Error fetching products:', errorCode);
      return [];
    }

    return results.map(product => ({
      productId: product.productId,
      price: product.price || '0',
      localizedPrice: product.price || '₹0',
      title: product.title || 'Premium Subscription',
      description: product.description || 'Unlock all features',
      priceAmountMicros: product.priceAmountMicros,
      priceCurrencyCode: product.priceCurrencyCode || 'INR',
    }));
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

// Purchase subscription
export const purchaseSubscription = async (productId: string): Promise<PurchaseResult> => {
  try {
    // Initiate purchase (the result will be handled by the purchase listener)
    await InAppPurchases.purchaseItemAsync(productId);

    // Store subscription info
    await AsyncStorage.setItem('subscription_active', 'true');
    await AsyncStorage.setItem('subscription_type', productId);
    await AsyncStorage.setItem('subscription_purchase_date', new Date().toISOString());

    // Log purchase to Firebase Analytics
    const planType = productId === SUBSCRIPTION_IDS.WEEKLY ? 'Weekly Premium' : 'Yearly Premium';
    const value = productId === SUBSCRIPTION_IDS.WEEKLY ? 299 : 1299;

    await logPurchase({
      transaction_id: `${productId}_${Date.now()}`,
      value,
      currency: 'INR',
      items: [{
        item_id: productId,
        item_name: planType,
        item_category: 'subscription',
        quantity: 1,
        price: value,
      }],
    });

    return { success: true, isPremium: true };
  } catch (error: any) {
    console.error('Purchase error:', error);

    // Check if user cancelled
    if (error.code === 'E_USER_CANCELLED' || error.message?.includes('cancelled')) {
      return { success: false, error: 'Purchase cancelled' };
    }

    return { success: false, error: error.message || 'Unknown error' };
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    // First check local storage for quick access
    const isActive = await AsyncStorage.getItem('subscription_active');

    if (isActive === 'true') {
      // Verify with purchase history
      const history = await InAppPurchases.getPurchaseHistoryAsync();

      // Check if user has any active subscription
      for (const purchase of history.results || []) {
        if (
          (purchase.productId === SUBSCRIPTION_IDS.WEEKLY ||
           purchase.productId === SUBSCRIPTION_IDS.YEARLY) &&
          purchase.acknowledged
        ) {
          // Subscription is valid
          await AsyncStorage.setItem('subscription_active', 'true');
          await AsyncStorage.setItem('subscription_type', purchase.productId);
          return true;
        }
      }
    }

    // No active subscription found
    await AsyncStorage.setItem('subscription_active', 'false');
    return false;
  } catch (error) {
    console.error('Error checking subscription:', error);

    // Fallback to local storage
    const isActive = await AsyncStorage.getItem('subscription_active');
    return isActive === 'true';
  }
};

// Restore purchases
export const restorePurchases = async (): Promise<PurchaseResult> => {
  try {
    const history = await InAppPurchases.getPurchaseHistoryAsync();

    if (history.results && history.results.length > 0) {
      // Check for valid subscriptions
      for (const purchase of history.results) {
        if (
          (purchase.productId === SUBSCRIPTION_IDS.WEEKLY ||
           purchase.productId === SUBSCRIPTION_IDS.YEARLY) &&
          purchase.acknowledged
        ) {
          // Restore subscription
          await AsyncStorage.setItem('subscription_active', 'true');
          await AsyncStorage.setItem('subscription_type', purchase.productId);
          return { success: true, isPremium: true };
        }
      }
    }

    return { success: false, isPremium: false, error: 'No purchases found' };
  } catch (error: any) {
    console.error('Restore error:', error);
    return { success: false, isPremium: false, error: error.message || 'Unknown error' };
  }
};

// Listen to purchase updates
export const setupPurchaseListener = (
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
    console.log('Purchase listener triggered:', { responseCode, errorCode });

    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      for (const purchase of results || []) {
        if (!purchase.acknowledged) {
          // Finish transaction
          InAppPurchases.finishTransactionAsync(purchase, true)
            .then(() => {
              console.log('✅ Transaction finished');
              onSuccess();
            })
            .catch((error) => {
              console.error('❌ Error finishing transaction:', error);
              onError(error);
            });
        }
      }
    } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
      console.log('User canceled purchase');
    } else {
      console.error('Purchase failed:', { responseCode, errorCode });
      onError({ responseCode, errorCode });
    }
  });
};

// Get subscription info
export const getSubscriptionInfo = async (): Promise<{
  isActive: boolean;
  type: string | null;
  purchaseDate: string | null;
}> => {
  try {
    const isActive = await AsyncStorage.getItem('subscription_active');
    const type = await AsyncStorage.getItem('subscription_type');
    const purchaseDate = await AsyncStorage.getItem('subscription_purchase_date');

    return {
      isActive: isActive === 'true',
      type,
      purchaseDate,
    };
  } catch (error) {
    console.error('Error getting subscription info:', error);
    return {
      isActive: false,
      type: null,
      purchaseDate: null,
    };
  }
};

/**
 * RevenueCat Service for In-App Purchases
 * Handles subscription purchases, restoration, and entitlement checks
 */

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { captureError } from '../config/sentry';
import { logPurchase } from './firebaseAnalytics';

// RevenueCat API Keys (Replace with your actual keys)
const REVENUECAT_API_KEY_ANDROID = 'goog_HHRAoZnUxUyEabKOeGJrKEUDFxR';
const REVENUECAT_API_KEY_IOS = 'YOUR_IOS_API_KEY_HERE';

// Entitlement identifier (configure in RevenueCat dashboard)
export const PREMIUM_ENTITLEMENT = 'premium';

// Product IDs (must match Google Play Console product IDs)
export const PRODUCT_IDS = {
  WEEKLY: 'sarina_weekly_299',
  YEARLY: 'sarina_yearly_1299',
};

/**
 * Initialize RevenueCat SDK
 * Call this once when app starts
 */
export const initializeRevenueCat = async (): Promise<void> => {
  try {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

    // Configure SDK
    Purchases.setLogLevel(LOG_LEVEL.INFO);
    await Purchases.configure({ apiKey });

    console.log('✅ RevenueCat initialized');
  } catch (error) {
    console.error('❌ Failed to initialize RevenueCat:', error);
    captureError(error as Error, { service: 'revenuecat', action: 'initialize' });
    throw error;
  }
};

/**
 * Set user ID for RevenueCat
 */
export const setRevenueCatUserId = async (userId: string): Promise<void> => {
  try {
    await Purchases.logIn(userId);
    console.log(`✅ RevenueCat user ID set: ${userId}`);
  } catch (error) {
    console.error('❌ Failed to set RevenueCat user ID:', error);
    captureError(error as Error, { service: 'revenuecat', action: 'setUserId' });
  }
};

/**
 * Get available offerings (packages)
 * Returns weekly and yearly subscription packages
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current !== null) {
      console.log('✅ Available offerings:', offerings.current);
      return offerings.current;
    } else {
      console.warn('⚠️ No offerings available');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to get offerings:', error);
    captureError(error as Error, { service: 'revenuecat', action: 'getOfferings' });
    return null;
  }
};

/**
 * Purchase a subscription package
 * @param packageToPurchase - The RevenueCat package to purchase
 * @returns CustomerInfo with updated entitlements
 */
export const purchasePackage = async (
  packageToPurchase: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

    // Check if user now has premium entitlement
    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;

    if (isPremium) {
      console.log('✅ Purchase successful, premium access granted');

      // Log purchase to Firebase Analytics
      const productId = packageToPurchase.product.identifier;
      const price = packageToPurchase.product.price;
      const currency = packageToPurchase.product.currencyCode;

      await logPurchase({
        transaction_id: customerInfo.originalPurchaseDate || `txn_${Date.now()}`,
        value: price,
        currency: currency,
        items: [
          {
            item_id: productId,
            item_name: packageToPurchase.product.title,
            item_category: 'subscription',
            quantity: 1,
            price: price,
          },
        ],
      });

      return { success: true, customerInfo };
    } else {
      return { success: false, error: 'Purchase completed but premium access not granted' };
    }
  } catch (error: any) {
    console.error('❌ Purchase failed:', error);

    // Handle user cancelled purchase
    if (error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' };
    }

    captureError(error as Error, { service: 'revenuecat', action: 'purchasePackage' });
    return { success: false, error: error.message || 'Purchase failed' };
  }
};

/**
 * Restore previous purchases
 * Call this when user taps "Restore Purchases"
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;

    if (isPremium) {
      console.log('✅ Purchases restored, premium access granted');
    } else {
      console.log('ℹ️ No active purchases found');
    }

    return { success: true, isPremium };
  } catch (error: any) {
    console.error('❌ Failed to restore purchases:', error);
    captureError(error as Error, { service: 'revenuecat', action: 'restorePurchases' });
    return { success: false, isPremium: false, error: error.message };
  }
};

/**
 * Check if user has premium access
 * @returns true if user has active premium entitlement
 */
export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;

    console.log(`ℹ️ Premium status: ${isPremium ? 'Active' : 'Inactive'}`);
    return isPremium;
  } catch (error) {
    console.error('❌ Failed to check premium status:', error);
    captureError(error as Error, { service: 'revenuecat', action: 'checkPremiumStatus' });
    return false;
  }
};

/**
 * Get customer info
 * Returns full customer info including entitlements and subscription status
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('❌ Failed to get customer info:', error);
    captureError(error as Error, { service: 'revenuecat', action: 'getCustomerInfo' });
    return null;
  }
};

/**
 * Listen to customer info updates
 * Use this to react to subscription changes in real-time
 */
export const addCustomerInfoUpdateListener = (
  callback: (customerInfo: CustomerInfo) => void
): void => {
  Purchases.addCustomerInfoUpdateListener(callback);
};

/**
 * Remove customer info update listener
 */
export const removeCustomerInfoUpdateListener = (
  callback: (customerInfo: CustomerInfo) => void
): void => {
  Purchases.removeCustomerInfoUpdateListener(callback);
};

export default {
  initializeRevenueCat,
  setRevenueCatUserId,
  getOfferings,
  purchasePackage,
  restorePurchases,
  checkPremiumStatus,
  getCustomerInfo,
  addCustomerInfoUpdateListener,
  removeCustomerInfoUpdateListener,
  PREMIUM_ENTITLEMENT,
  PRODUCT_IDS,
};

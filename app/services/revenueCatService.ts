import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { getCurrentUser } from './authService';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logPurchase } from './firebaseAnalytics';

// RevenueCat API Keys
const REVENUECAT_API_KEYS = {
  ios: 'appl_cGMSHwaYbbRwdhOiEgBPbOPykYP',
  android: 'appl_cGMSHwaYbbRwdhOiEgBPbOPykYP', // Replace with Android key if different
};

export interface RevenueCatPackageInfo {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  isPremium?: boolean;
  customerInfo?: CustomerInfo;
}

// Initialize RevenueCat
export const initializeRevenueCat = async (): Promise<boolean> => {
  try {
    console.log('🔌 Initializing RevenueCat...');

    const apiKey = Platform.select({
      ios: REVENUECAT_API_KEYS.ios,
      android: REVENUECAT_API_KEYS.android,
    });

    if (!apiKey) {
      console.error('❌ No API key found for platform:', Platform.OS);
      return false;
    }

    // Configure RevenueCat
    Purchases.configure({ apiKey });

    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Set user ID if authenticated
    const user = getCurrentUser();
    if (user?.uid) {
      await Purchases.logIn(user.uid);
      console.log('✅ RevenueCat user logged in:', user.uid);
    }

    console.log('✅ RevenueCat initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ RevenueCat initialization failed:', error);
    return false;
  }
};

// Get current offerings (includes paywall configuration)
export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
  try {
    console.log('📦 Fetching RevenueCat offerings...');
    const offerings = await Purchases.getOfferings();

    if (offerings.current !== null) {
      console.log('✅ Current offering:', offerings.current.identifier);
      console.log('📦 Available packages:', offerings.current.availablePackages.length);

      offerings.current.availablePackages.forEach((pkg) => {
        console.log(`  - ${pkg.identifier}: ${pkg.product.priceString}`);
      });

      return offerings;
    } else {
      console.warn('⚠️ No current offering found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching offerings:', error);
    return null;
  }
};

// Purchase a package
export const purchasePackage = async (
  packageToPurchase: PurchasesPackage
): Promise<PurchaseResult> => {
  try {
    console.log('💳 Initiating purchase for:', packageToPurchase.identifier);

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

    console.log('✅ Purchase successful!');
    console.log('Premium status:', customerInfo.entitlements.active);

    // Check if user has premium entitlement
    const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;

    // Update Firestore with subscription info (mark as new purchase to add credits)
    await syncCustomerInfoToFirestore(customerInfo, true);

    // Log analytics
    const productId = packageToPurchase.product.identifier;
    const price = packageToPurchase.product.price;
    const currency = packageToPurchase.product.currencyCode;

    logPurchase({
      transactionId: customerInfo.originalAppUserId,
      productId,
      value: price,
      currency,
    });

    return {
      success: true,
      isPremium,
      customerInfo,
    };
  } catch (error: any) {
    console.error('❌ Purchase error:', error);

    // Handle user cancellation
    if (error.userCancelled) {
      console.log('⚠️ User cancelled purchase');
      return { success: false, error: 'Purchase cancelled' };
    }

    return {
      success: false,
      error: error.message || 'Purchase failed',
    };
  }
};

// Restore purchases
export const restorePurchases = async (): Promise<PurchaseResult> => {
  try {
    console.log('🔄 Restoring purchases...');

    const customerInfo = await Purchases.restorePurchases();

    const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;

    if (isPremium) {
      console.log('✅ Purchases restored successfully');
      // Don't add credits on restore, just sync subscription status
      await syncCustomerInfoToFirestore(customerInfo, false);

      return {
        success: true,
        isPremium,
        customerInfo,
      };
    } else {
      console.log('⚠️ No active subscriptions found');
      return {
        success: false,
        error: 'No active subscriptions found',
        isPremium: false,
      };
    }
  } catch (error: any) {
    console.error('❌ Restore purchases error:', error);
    return {
      success: false,
      error: error.message || 'Failed to restore purchases',
    };
  }
};

// Get customer info (premium status, expiration, etc.)
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('❌ Error getting customer info:', error);
    return null;
  }
};

// Check if user is premium
export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await getCustomerInfo();

    if (!customerInfo) {
      return false;
    }

    const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;
    console.log('✅ Premium status:', isPremium);

    return isPremium;
  } catch (error) {
    console.error('❌ Error checking premium status:', error);
    return false;
  }
};

// Sync RevenueCat customer info to Firestore
const syncCustomerInfoToFirestore = async (customerInfo: CustomerInfo, isNewPurchase: boolean = false): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user?.uid) {
      console.warn('⚠️ No user authenticated, skipping Firestore sync');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    // Check if user has any active entitlements
    const hasActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;

    let subscriptionTier = 'free';
    let expirationDate = null;
    let productId = null;
    let originalTransactionId = null;

    if (hasActiveEntitlement) {
      // Get the first active entitlement
      const activeEntitlement = Object.values(customerInfo.entitlements.active)[0];
      productId = activeEntitlement.productIdentifier;
      originalTransactionId = customerInfo.originalAppUserId;

      // Determine subscription tier based on product ID
      if (productId.includes('weekly')) {
        subscriptionTier = 'weekly';
      } else if (productId.includes('yearly') || productId.includes('annual')) {
        subscriptionTier = 'yearly';
      }

      expirationDate = activeEntitlement.expirationDate;
    }

    // Get current user data
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : {};
    const currentTier = userData?.subscription_tier || 'free';
    const lastTransactionId = userData?.last_transaction_id;

    // Update Firestore
    const updateData: any = {
      subscription_tier: subscriptionTier,
      subscription_updated_at: serverTimestamp(),
    };

    if (expirationDate) {
      updateData.subscription_expiration_date = new Date(expirationDate);
    }

    if (productId) {
      updateData.subscription_product_id = productId;
    }

    // Only add credits if:
    // 1. It's a new purchase (isNewPurchase = true)
    // 2. OR the tier changed from free to paid
    // 3. OR it's a different transaction (prevent duplicates)
    const shouldAddCredits = isNewPurchase ||
                            (currentTier === 'free' && subscriptionTier !== 'free') ||
                            (originalTransactionId && originalTransactionId !== lastTransactionId);

    if (shouldAddCredits && subscriptionTier !== 'free') {
      const currentBalance = userData?.voice_balance_seconds || 0;
      let creditsToAdd = 0;

      if (subscriptionTier === 'weekly') {
        creditsToAdd = 60; // 60 seconds for weekly
      } else if (subscriptionTier === 'yearly') {
        creditsToAdd = 3000; // 3000 seconds for yearly
      }

      if (creditsToAdd > 0) {
        updateData.voice_balance_seconds = currentBalance + creditsToAdd;
        updateData.last_transaction_id = originalTransactionId;

        console.log(`💰 Adding ${creditsToAdd}s credits for ${subscriptionTier} subscription`);

        // Log the credit transaction in Firestore
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, 'credit_transactions'), {
          userId: user.uid,
          type: 'subscription',
          amount_seconds: creditsToAdd,
          product_id: productId,
          timestamp: serverTimestamp(),
          metadata: {
            source: 'revenuecat',
            subscriptionTier,
            originalTransactionId,
          },
        });
      }
    } else {
      console.log('ℹ️ Skipping credit addition (already processed or restore)');
    }

    await updateDoc(userDocRef, updateData);

    console.log('✅ Firestore synced with subscription:', subscriptionTier);
  } catch (error) {
    console.error('❌ Error syncing to Firestore:', error);
  }
};

// Log in user to RevenueCat (call after authentication)
export const loginRevenueCatUser = async (userId: string): Promise<void> => {
  try {
    await Purchases.logIn(userId);
    console.log('✅ RevenueCat user logged in:', userId);
  } catch (error) {
    console.error('❌ Error logging in RevenueCat user:', error);
  }
};

// Log out user from RevenueCat
export const logoutRevenueCatUser = async (): Promise<void> => {
  try {
    await Purchases.logOut();
    console.log('✅ RevenueCat user logged out');
  } catch (error) {
    console.error('❌ Error logging out RevenueCat user:', error);
  }
};

// Get subscription info for display
export const getSubscriptionInfo = async (): Promise<{
  tier: string;
  expirationDate: string | null;
  isPremium: boolean;
}> => {
  try {
    const customerInfo = await getCustomerInfo();

    if (!customerInfo) {
      return { tier: 'free', expirationDate: null, isPremium: false };
    }

    const hasActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;

    if (!hasActiveEntitlement) {
      return { tier: 'free', expirationDate: null, isPremium: false };
    }

    const activeEntitlement = Object.values(customerInfo.entitlements.active)[0];
    const productId = activeEntitlement.productIdentifier;

    let tier = 'free';
    if (productId.includes('weekly')) {
      tier = 'weekly';
    } else if (productId.includes('yearly') || productId.includes('annual')) {
      tier = 'yearly';
    }

    const expirationDate = activeEntitlement.expirationDate || null;

    return {
      tier,
      expirationDate,
      isPremium: true,
    };
  } catch (error) {
    console.error('❌ Error getting subscription info:', error);
    return { tier: 'free', expirationDate: null, isPremium: false };
  }
};

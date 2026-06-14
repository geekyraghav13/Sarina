import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { getCurrentUser } from './authService';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { logPurchase, logPurchaseFailed } from './firebaseAnalytics';
import { ensureAllowanceForPeriod, addTopupCredits } from './voiceCreditsService';
import ENV from '../config/env';

// RevenueCat API Keys
const REVENUECAT_API_KEYS = {
  ios: 'appl_cGMSHwaYbbRwdhOiEgBPbOPykYP',
  android: 'goog_qBISvlOBwMSdZDaSmkawISvXGII', // Android key for com.x8284.katrina
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
      transaction_id: customerInfo.originalAppUserId,
      value: price,
      currency,
      items: [{ item_id: productId, item_name: productId, item_category: 'subscription', quantity: 1, price }],
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

    logPurchaseFailed(packageToPurchase.product?.identifier || 'unknown', error?.message || 'unknown');
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

      // Check if user has 0 credits - if so, treat as new purchase to allocate credits
      const user = getCurrentUser();
      let shouldAllocateCredits = false;

      if (user?.uid) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const currentBalance = userDoc.exists() ? (userDoc.data()?.voice_balance_seconds || 0) : 0;

        if (currentBalance === 0) {
          console.log('⚠️ User has premium but 0 credits - allocating credits');
          shouldAllocateCredits = true;
        }
      }

      await syncCustomerInfoToFirestore(customerInfo, shouldAllocateCredits);

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

    // Check both entitlements AND active subscriptions as fallback
    const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;
    const hasActiveSubscriptions = customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0;

    const isPremium = hasActiveEntitlements || hasActiveSubscriptions;
    console.log('✅ Premium status:', isPremium, '(entitlements:', hasActiveEntitlements, ', subscriptions:', hasActiveSubscriptions, ')');

    return isPremium;
  } catch (error) {
    console.error('❌ Error checking premium status:', error);
    return false;
  }
};

// Sync RevenueCat customer info to Firestore
export const syncCustomerInfoToFirestore = async (customerInfo: CustomerInfo, isNewPurchase: boolean = false): Promise<void> => {
  try {
    console.log('🔄 [CREDIT SYNC] Starting syncCustomerInfoToFirestore...');
    console.log('🔄 [CREDIT SYNC] isNewPurchase:', isNewPurchase);

    const user = getCurrentUser();
    if (!user?.uid) {
      console.warn('⚠️ [CREDIT SYNC] No user authenticated, skipping Firestore sync');
      return;
    }

    console.log('🔄 [CREDIT SYNC] User ID:', user.uid);
    const userDocRef = doc(firestore, 'users', user.uid);

    // Check if user has any active entitlements OR active subscriptions
    const hasActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
    const hasActiveSubscriptions = customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0;

    console.log('🔄 [CREDIT SYNC] hasActiveEntitlement:', hasActiveEntitlement);
    console.log('🔄 [CREDIT SYNC] hasActiveSubscriptions:', hasActiveSubscriptions);

    let subscriptionTier = 'free';
    let expirationDate = null;
    let productId = null;
    let originalTransactionId = null;

    if (hasActiveEntitlement) {
      // Get the first active entitlement
      const activeEntitlement = Object.values(customerInfo.entitlements.active)[0];
      productId = activeEntitlement.productIdentifier;
      originalTransactionId = customerInfo.originalAppUserId;

      console.log('🔄 [CREDIT SYNC] Product ID from entitlement:', productId);
      console.log('🔄 [CREDIT SYNC] Transaction ID:', originalTransactionId);

      // Determine subscription tier based on product ID
      if (productId.includes('weekly')) {
        subscriptionTier = 'weekly';
      } else if (productId.includes('yearly') || productId.includes('annual')) {
        subscriptionTier = 'yearly';
      }

      console.log('🔄 [CREDIT SYNC] Detected tier:', subscriptionTier);

      expirationDate = activeEntitlement.expirationDate;
    } else if (hasActiveSubscriptions) {
      // Fallback: Use active subscriptions if no entitlements
      const firstActiveSubscription = customerInfo.activeSubscriptions[0];
      productId = firstActiveSubscription;
      originalTransactionId = customerInfo.originalAppUserId;

      console.log('⚠️ [CREDIT SYNC] Using active subscription as fallback (no entitlements):', productId);

      // Determine subscription tier based on product ID
      if (productId.includes('weekly')) {
        subscriptionTier = 'weekly';
      } else if (productId.includes('yearly') || productId.includes('annual')) {
        subscriptionTier = 'yearly';
      }

      console.log('🔄 [CREDIT SYNC] Detected tier from subscription:', subscriptionTier);

      // Try to get expiration from subscriptions
      if (customerInfo.allPurchaseDates && customerInfo.allPurchaseDates[productId]) {
        // For active subscriptions, we can't get exact expiration easily
        // Set expiration to 1 year from now for yearly, 1 week for weekly
        const purchaseDate = new Date(customerInfo.allPurchaseDates[productId] as string);
        if (subscriptionTier === 'yearly') {
          expirationDate = new Date(purchaseDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        } else if (subscriptionTier === 'weekly') {
          expirationDate = new Date(purchaseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }
      }
    }

    // Get current user data
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : {};
    const currentTier = userData?.subscription_tier || 'free';
    const currentBalance = userData?.voice_balance_seconds || 0;
    const processedTransactions = userData?.processed_transactions || [];

    console.log('🔄 [CREDIT SYNC] Current Firestore data:');
    console.log('   - Current tier:', currentTier);
    console.log('   - Current balance:', currentBalance, 'seconds');
    console.log('   - Processed transactions:', processedTransactions.length, 'total');

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
    // 2. AND transaction ID has NOT been processed before (check array)
    // This prevents duplicate allocations on app reopen/reinstall
    const isTransactionProcessed = originalTransactionId && processedTransactions.includes(originalTransactionId);
    const shouldAddCredits = isNewPurchase && originalTransactionId && !isTransactionProcessed;

    console.log('🔄 [CREDIT SYNC] Transaction check:');
    console.log('   - Transaction ID:', originalTransactionId);
    console.log('   - Already processed?', isTransactionProcessed);
    console.log('   - Should add credits?', shouldAddCredits);
    console.log('   - isNewPurchase:', isNewPurchase);

    if (shouldAddCredits && subscriptionTier !== 'free') {
      let creditsToAdd = 0;

      if (subscriptionTier === 'weekly') {
        creditsToAdd = 60; // 60 seconds (1 minute) for weekly
      } else if (subscriptionTier === 'yearly') {
        creditsToAdd = 1800; // 1800 seconds (30 minutes) for yearly
      }

      console.log(`💰 [CREDIT SYNC] Credits to add: ${creditsToAdd}s for ${subscriptionTier} subscription`);
      console.log(`💰 [CREDIT SYNC] Current balance: ${currentBalance}s`);
      console.log(`💰 [CREDIT SYNC] New balance will be: ${currentBalance + creditsToAdd}s`);

      if (creditsToAdd > 0) {
        updateData.voice_balance_seconds = currentBalance + creditsToAdd;

        // Add transaction ID to processed array (bulletproof duplicate prevention)
        const updatedProcessedTransactions = [...processedTransactions, originalTransactionId];
        updateData.processed_transactions = updatedProcessedTransactions;

        console.log(`✅ [CREDIT SYNC] Adding ${creditsToAdd}s credits for ${subscriptionTier} subscription`);
        console.log(`✅ [CREDIT SYNC] Marking transaction as processed:`, originalTransactionId);

        // Log the credit transaction in Firestore
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(firestore, 'credit_transactions'), {
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

        console.log('✅ [CREDIT SYNC] Credit transaction logged to Firestore');
      }
    } else {
      console.log('ℹ️ [CREDIT SYNC] Skipping credit addition (already processed or restore)');
    }

    console.log('🔄 [CREDIT SYNC] Updating Firestore with data:', updateData);
    await updateDoc(userDocRef, updateData);

    console.log('✅ [CREDIT SYNC] Firestore synced with subscription:', subscriptionTier);
    console.log('✅ [CREDIT SYNC] Final balance in Firestore:', updateData.voice_balance_seconds || currentBalance, 'seconds');
  } catch (error) {
    console.error('❌ [CREDIT SYNC] Error syncing to Firestore:', error);
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
  } catch (error: any) {
    console.error('❌ Error logging out RevenueCat user:', error?.message || error);
    // Re-throw the error so caller can handle it appropriately
    throw error;
  }
};

// Sync consumable purchase to Firestore (for credit packs)
export const syncConsumablePurchaseToFirestore = async (customerInfo: CustomerInfo): Promise<void> => {
  try {
    console.log('🛒 [CONSUMABLE SYNC] Starting syncConsumablePurchaseToFirestore...');

    const user = getCurrentUser();
    if (!user?.uid) {
      console.warn('⚠️ [CONSUMABLE SYNC] No user authenticated, skipping Firestore sync');
      return;
    }

    console.log('🛒 [CONSUMABLE SYNC] User ID:', user.uid);
    const userDocRef = doc(firestore, 'users', user.uid);

    // Get all non-subscription purchases (consumables)
    const allPurchaseIds = customerInfo.nonSubscriptionTransactions || [];

    console.log('🛒 [CONSUMABLE SYNC] Total consumable transactions:', allPurchaseIds.length);
    console.log('🛒 [CONSUMABLE SYNC] Active entitlements:', Object.keys(customerInfo.entitlements.active));
    console.log('🛒 [CONSUMABLE SYNC] Active subscriptions:', customerInfo.activeSubscriptions);

    if (allPurchaseIds.length === 0) {
      console.warn('⚠️ [CONSUMABLE SYNC] No consumable purchases found - product might be configured as subscription!');
      console.log('ℹ️ [CONSUMABLE SYNC] Check RevenueCat dashboard - product should be type "Consumable", not "Subscription"');
      return;
    }

    // Get the most recent purchase
    const latestPurchase = allPurchaseIds[allPurchaseIds.length - 1];
    const productId = latestPurchase.productIdentifier;
    const transactionId = latestPurchase.transactionIdentifier;

    console.log('🛒 [CONSUMABLE SYNC] Latest purchase:');
    console.log('   - Product ID:', productId);
    console.log('   - Transaction ID:', transactionId);

    // Get current user data to check if this transaction was already processed
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : {};
    const currentBalance = userData?.voice_balance_seconds || 0;
    const processedTransactions = userData?.processed_transactions || [];

    console.log('🛒 [CONSUMABLE SYNC] Current Firestore data:');
    console.log('   - Current balance:', currentBalance, 'seconds');
    console.log('   - Processed transactions:', processedTransactions.length, 'total');

    // Prevent duplicate processing using transaction array
    if (processedTransactions.includes(transactionId)) {
      console.log('ℹ️ [CONSUMABLE SYNC] Transaction already processed, skipping:', transactionId);
      return;
    }

    // Determine credits based on product ID
    let creditsToAdd = 0;
    if (productId.includes('5min') || productId.includes('5_min') || productId.includes('credits')) {
      creditsToAdd = 300; // 5 minutes = 300 seconds
      console.log('✅ [CONSUMABLE SYNC] Matched credits product pattern in product ID:', productId);
    } else {
      console.warn('⚠️ [CONSUMABLE SYNC] Unknown product ID pattern:', productId);
    }

    console.log('🛒 [CONSUMABLE SYNC] Credits to add:', creditsToAdd, 'seconds');

    if (creditsToAdd > 0) {
      console.log(`💰 [CONSUMABLE SYNC] Current balance: ${currentBalance}s`);
      console.log(`💰 [CONSUMABLE SYNC] New balance will be: ${currentBalance + creditsToAdd}s`);

      // Add transaction ID to processed array (bulletproof duplicate prevention)
      const updatedProcessedTransactions = [...processedTransactions, transactionId];

      await updateDoc(userDocRef, {
        voice_balance_seconds: currentBalance + creditsToAdd,
        processed_transactions: updatedProcessedTransactions,
        last_consumable_purchase_date: serverTimestamp(),
      });

      console.log(`✅ [CONSUMABLE SYNC] Added ${creditsToAdd}s credits for consumable purchase`);
      console.log(`✅ [CONSUMABLE SYNC] Marking transaction as processed:`, transactionId);

      // Log the credit transaction
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(firestore, 'credit_transactions'), {
        userId: user.uid,
        type: 'consumable',
        amount_seconds: creditsToAdd,
        product_id: productId,
        transaction_id: transactionId,
        timestamp: serverTimestamp(),
        metadata: {
          source: 'revenuecat',
        },
      });

      console.log('✅ [CONSUMABLE SYNC] Credit transaction logged to Firestore');
      console.log('✅ [CONSUMABLE SYNC] Firestore synced with consumable purchase');
      console.log('✅ [CONSUMABLE SYNC] Final balance in Firestore:', currentBalance + creditsToAdd, 'seconds');
    } else {
      console.warn('⚠️ [CONSUMABLE SYNC] Unknown consumable product:', productId);
    }
  } catch (error) {
    console.error('❌ [CONSUMABLE SYNC] Error syncing consumable purchase to Firestore:', error);
  }
};

// Purchase credits product directly (bypass RevenueCat Paywall UI)
export const purchaseCreditsProduct = async (): Promise<PurchaseResult> => {
  try {
    console.log('💳 Initiating credits purchase...');

    // Get offerings to find the credits product
    const offerings = await getOfferings();

    if (!offerings?.all?.Credits) {
      console.error('❌ Credits offering not found');
      return {
        success: false,
        error: 'Credits offering not available',
      };
    }

    const creditsOffering = offerings.all.Credits;
    const packages = creditsOffering.availablePackages;

    if (!packages || packages.length === 0) {
      console.error('❌ No credits packages found');
      return {
        success: false,
        error: 'No credits packages available',
      };
    }

    // Get the first package (10 minutes)
    const creditsPackage = packages[0];
    console.log('💳 Purchasing credits package:', creditsPackage.product.identifier);

    // Purchase using RevenueCat SDK directly
    const { customerInfo } = await Purchases.purchasePackage(creditsPackage);

    console.log('✅ Credits purchase successful!');

    // Sync consumable purchase to Firestore
    await syncConsumablePurchaseToFirestore(customerInfo);

    return {
      success: true,
      customerInfo,
    };
  } catch (error: any) {
    console.error('❌ Credits purchase error:', error);

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

/**
 * Voice-calling allowance sync (new flow).
 *
 * Reads the active plan + current period expiration from RevenueCat and asks
 * voiceCreditsService to (re)allocate the per-plan minute bucket if a new billing
 * period has started. Safe to call on app open and after a purchase — it only
 * resets the balance when the period actually changes, so a depleted user waits
 * for renewal. No-op for non-premium users.
 *
 * Allowance: weekly = 60s, yearly = 3000s (set in voiceCreditsService.PLAN_SECONDS).
 */
export const syncVoiceAllowance = async (): Promise<void> => {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return;

    const activeEntitlements = Object.values(customerInfo.entitlements.active);
    let tier = 'free';
    let periodEnd: string | null = null;

    const tierFromProductId = (pid: string): string => {
      if (pid.includes('weekly')) return 'weekly';
      if (pid.includes('yearly') || pid.includes('annual')) return 'yearly';
      return 'free';
    };

    if (activeEntitlements.length > 0) {
      const ent = activeEntitlements[0];
      tier = tierFromProductId(ent.productIdentifier || '');
      periodEnd = ent.expirationDate || null;
    } else if (customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0) {
      tier = tierFromProductId(customerInfo.activeSubscriptions[0]);
    }

    if (tier === 'free') return;
    await ensureAllowanceForPeriod(tier, periodEnd);
  } catch (error) {
    console.warn('⚠️ syncVoiceAllowance failed:', error);
  }
};

/**
 * Grant the voice-credit top-up after a successful consumable purchase (new flow).
 *
 * Reads the latest non-subscription (consumable) transaction from RevenueCat and
 * grants ENV.VOICE_TOPUP_SECONDS into the separate top-up bucket via
 * voiceCreditsService.addTopupCredits (which dedups by transaction id, so this is
 * safe to call after every top-up purchase). Returns true if credits were granted.
 *
 * NOTE: this writes the new `voice_topup_seconds` field — NOT the legacy
 * `voice_balance_seconds` path of syncConsumablePurchaseToFirestore.
 */
export const syncTopupPurchase = async (): Promise<boolean> => {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;

    const txns = customerInfo.nonSubscriptionTransactions || [];
    if (txns.length === 0) {
      console.warn('⚠️ syncTopupPurchase: no consumable transactions found');
      return false;
    }

    const latest = txns[txns.length - 1];
    const txnId = latest.transactionIdentifier;
    if (!txnId) return false;

    return await addTopupCredits(ENV.VOICE_TOPUP_SECONDS, txnId);
  } catch (error) {
    console.warn('⚠️ syncTopupPurchase failed:', error);
    return false;
  }
};

/**
 * Set RevenueCat customer attributes for user segmentation and analytics
 * Attributes help organize, filter, and segment users in RevenueCat dashboard
 */
export const setUserAttributes = async (attributes: {
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  [key: string]: string | undefined;
}): Promise<void> => {
  try {
    console.log('📊 Setting RevenueCat customer attributes...');

    // Set reserved attributes using helper methods
    if (attributes.email) {
      await Purchases.setEmail(attributes.email);
      console.log('✅ Email attribute set:', attributes.email);
    }

    if (attributes.displayName) {
      await Purchases.setDisplayName(attributes.displayName);
      console.log('✅ Display name attribute set:', attributes.displayName);
    }

    if (attributes.phoneNumber) {
      await Purchases.setPhoneNumber(attributes.phoneNumber);
      console.log('✅ Phone number attribute set');
    }

    // Set custom attributes (filter out reserved ones)
    const customAttributes: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(attributes)) {
      if (!['email', 'displayName', 'phoneNumber'].includes(key) && value !== undefined) {
        customAttributes[key] = value;
      }
    }

    if (Object.keys(customAttributes).length > 0) {
      await Purchases.setAttributes(customAttributes);
      console.log('✅ Custom attributes set:', Object.keys(customAttributes));
    }

    console.log('✅ All RevenueCat attributes set successfully');
  } catch (error) {
    console.error('❌ Error setting RevenueCat attributes:', error);
    // Don't throw - attribute setting is non-critical
  }
};

/**
 * Sync user profile data to RevenueCat attributes
 * Call this after onboarding completion or profile updates
 */
export const syncUserProfileToAttributes = async (profile: {
  email?: string | null;
  displayName?: string | null;
  age?: number;
  personality?: string[];
  interests?: string[];
  appearance?: string;
  mode?: string;
  tone?: string[];
}): Promise<void> => {
  try {
    console.log('🔄 Syncing user profile to RevenueCat attributes...');

    const attributes: { [key: string]: string } = {};

    // Reserved attributes
    if (profile.email) attributes.email = profile.email;
    if (profile.displayName) attributes.displayName = profile.displayName;

    // Custom attributes (must be strings, max 500 chars)
    if (profile.age) attributes.age = profile.age.toString();
    if (profile.personality && profile.personality.length > 0) {
      attributes.personality = profile.personality.join(',').substring(0, 500);
    }
    if (profile.interests && profile.interests.length > 0) {
      attributes.interests = profile.interests.join(',').substring(0, 500);
    }
    if (profile.appearance) attributes.appearance = profile.appearance;
    if (profile.mode) attributes.mode = profile.mode;
    if (profile.tone && profile.tone.length > 0) {
      attributes.tone = profile.tone.join(',').substring(0, 500);
    }

    await setUserAttributes(attributes);

    // Sync immediately for targeting purposes
    // @ts-ignore - syncAttributesAndOfferingsIfNeeded might not be in types yet
    if (Purchases.syncAttributesAndOfferingsIfNeeded) {
      // @ts-ignore
      await Purchases.syncAttributesAndOfferingsIfNeeded();
      console.log('✅ Attributes synced to RevenueCat servers');
    }

    console.log('✅ User profile synced to RevenueCat attributes');
  } catch (error) {
    console.error('❌ Error syncing profile to RevenueCat:', error);
    // Don't throw - attribute syncing is non-critical
  }
};

/**
 * IAP Receipt Validator
 * Validates Google Play and Apple App Store purchase receipts
 */

const { google } = require('googleapis');
const admin = require('firebase-admin');

const db = admin.firestore();

// Google Play Developer API configuration
let androidPublisher = null;
let authClient = null;

/**
 * Initialize Google Play API client (lazy initialization)
 */
async function initializeGooglePlayAPI() {
  try {
    // Skip if already initialized
    if (androidPublisher && authClient) {
      return true;
    }

    console.log('🔄 Initializing Google Play API...');

    // Use Application Default Credentials (from Cloud Run service account)
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    authClient = await auth.getClient();
    androidPublisher = google.androidpublisher({ version: 'v3', auth: authClient });

    console.log('✅ Google Play API initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Google Play API:', error);
    return false;
  }
}

/**
 * Validate Android (Google Play) purchase receipt
 * @param {string} packageName - App package name (e.g., com.sarina.app)
 * @param {string} productId - Product/subscription ID
 * @param {string} purchaseToken - Purchase token from Google Play
 * @returns {Promise<{valid: boolean, data?: any, error?: string}>}
 */
async function validateAndroidPurchase(packageName, productId, purchaseToken) {
  try {
    if (!androidPublisher) {
      await initializeGooglePlayAPI();
    }

    console.log(`🔍 Validating Android purchase:`, { packageName, productId });

    // Check if it's a subscription or one-time purchase
    const isSubscription = productId.includes('weekly') || productId.includes('yearly');

    let response;

    if (isSubscription) {
      // Validate subscription
      response = await androidPublisher.purchases.subscriptions.get({
        packageName,
        subscriptionId: productId,
        token: purchaseToken,
      });
    } else {
      // Validate one-time purchase (for voice credit packs)
      response = await androidPublisher.purchases.products.get({
        packageName,
        productId,
        token: purchaseToken,
      });
    }

    const purchaseData = response.data;

    // Check if purchase is valid
    if (isSubscription) {
      const paymentState = purchaseData.paymentState;
      const expiryTime = parseInt(purchaseData.expiryTimeMillis);
      const isActive = Date.now() < expiryTime;

      // paymentState: 0 = pending, 1 = received
      const isValid = paymentState === 1 && isActive;

      console.log(`✅ Subscription validation result:`, {
        valid: isValid,
        paymentState,
        isActive,
        expiryTime: new Date(expiryTime).toISOString(),
      });

      return {
        valid: isValid,
        data: {
          orderId: purchaseData.orderId,
          expiryTime,
          paymentState,
          startTime: parseInt(purchaseData.startTimeMillis),
          autoRenewing: purchaseData.autoRenewing,
        },
      };
    } else {
      // One-time purchase validation
      const purchaseState = purchaseData.purchaseState;
      const consumptionState = purchaseData.consumptionState;

      // purchaseState: 0 = purchased, 1 = cancelled
      // consumptionState: 0 = yet to be consumed, 1 = consumed
      const isValid = purchaseState === 0;

      console.log(`✅ Product validation result:`, {
        valid: isValid,
        purchaseState,
        consumptionState,
      });

      return {
        valid: isValid,
        data: {
          orderId: purchaseData.orderId,
          purchaseTime: parseInt(purchaseData.purchaseTimeMillis),
          purchaseState,
          consumptionState,
        },
      };
    }
  } catch (error) {
    console.error('❌ Android purchase validation failed:', error.message);
    return {
      valid: false,
      error: error.message || 'Validation failed',
    };
  }
}

/**
 * Validate iOS (App Store) purchase receipt
 * @param {string} receiptData - Base64 encoded receipt
 * @param {boolean} isProduction - Whether to use production or sandbox
 * @returns {Promise<{valid: boolean, data?: any, error?: string}>}
 */
async function validateIOSPurchase(receiptData, isProduction = true) {
  try {
    const endpoint = isProduction
      ? 'https://buy.itunes.apple.com/verifyReceipt'
      : 'https://sandbox.itunes.apple.com/verifyReceipt';

    // Note: You need to set this in environment variables
    const password = process.env.IOS_SHARED_SECRET;

    if (!password) {
      console.error('❌ IOS_SHARED_SECRET not configured');
      return { valid: false, error: 'iOS validation not configured' };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'receipt-data': receiptData,
        password: password,
      }),
    });

    const result = await response.json();

    // Status codes: 0 = valid, 21007 = sandbox receipt (retry with sandbox)
    if (result.status === 21007 && isProduction) {
      // Receipt is from sandbox, retry with sandbox endpoint
      return validateIOSPurchase(receiptData, false);
    }

    const isValid = result.status === 0;

    if (isValid) {
      console.log('✅ iOS receipt validation successful');
      return {
        valid: true,
        data: {
          receipt: result.receipt,
          latestReceiptInfo: result.latest_receipt_info,
        },
      };
    } else {
      console.error('❌ iOS receipt validation failed:', result.status);
      return {
        valid: false,
        error: `Validation failed with status: ${result.status}`,
      };
    }
  } catch (error) {
    console.error('❌ iOS purchase validation failed:', error.message);
    return {
      valid: false,
      error: error.message || 'Validation failed',
    };
  }
}

/**
 * Check if purchase has already been processed (duplicate prevention)
 * @param {string} orderId - Google Play order ID or iOS transaction ID
 * @returns {Promise<boolean>} - true if already processed
 */
async function isPurchaseAlreadyProcessed(orderId) {
  try {
    const snapshot = await db
      .collection('credit_transactions')
      .where('metadata.orderId', '==', orderId)
      .limit(1)
      .get();

    return !snapshot.empty;
  } catch (error) {
    console.error('❌ Error checking duplicate purchase:', error);
    return false; // Assume not processed if check fails
  }
}

/**
 * Process validated purchase and update user credits
 * @param {string} userId - Firebase user ID
 * @param {string} productId - Product/subscription ID
 * @param {string} orderId - Order/transaction ID
 * @param {string} platform - 'android' or 'ios'
 * @returns {Promise<{success: boolean, creditsAdded?: number, error?: string}>}
 */
async function processValidatedPurchase(userId, productId, orderId, platform) {
  try {
    // Check for duplicate
    const isDuplicate = await isPurchaseAlreadyProcessed(orderId);
    if (isDuplicate) {
      console.warn('⚠️ Purchase already processed:', orderId);
      return { success: false, error: 'Purchase already processed' };
    }

    // Determine credits to add based on product
    let creditsToAdd = 0;
    let subscriptionTier = 'free';

    if (productId.includes('weekly')) {
      creditsToAdd = 60; // 1 minute
      subscriptionTier = 'weekly';
    } else if (productId.includes('yearly')) {
      creditsToAdd = 3000; // 50 minutes
      subscriptionTier = 'yearly';
    } else if (productId === 'voice5min') {
      creditsToAdd = 300; // 5 minutes
    } else if (productId === 'voice15min') {
      creditsToAdd = 900; // 15 minutes
    } else if (productId === 'voice30min') {
      creditsToAdd = 1800; // 30 minutes
    } else {
      console.error('❌ Unknown product:', productId);
      return { success: false, error: 'Unknown product' };
    }

    // Update user document
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      voice_balance_seconds: admin.firestore.FieldValue.increment(creditsToAdd),
      subscription_tier: subscriptionTier !== 'free' ? subscriptionTier : admin.firestore.FieldValue.delete(),
      subscription_start_date: subscriptionTier !== 'free' ? admin.firestore.FieldValue.serverTimestamp() : admin.firestore.FieldValue.delete(),
      last_reset_date: subscriptionTier !== 'free' ? admin.firestore.FieldValue.serverTimestamp() : admin.firestore.FieldValue.delete(),
      total_minutes_purchased: admin.firestore.FieldValue.increment(creditsToAdd / 60),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log transaction
    await db.collection('credit_transactions').add({
      userId,
      type: subscriptionTier !== 'free' ? 'subscription' : 'purchase',
      amount_seconds: creditsToAdd,
      product_id: productId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        orderId,
        platform,
        source: 'iap_validation',
      },
    });

    console.log(`✅ Purchase processed: ${creditsToAdd}s added to user ${userId}`);

    return {
      success: true,
      creditsAdded: creditsToAdd,
      subscriptionTier: subscriptionTier !== 'free' ? subscriptionTier : undefined,
    };
  } catch (error) {
    console.error('❌ Error processing purchase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Main validation endpoint
 * @param {Object} purchaseData - Purchase data from client
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
async function validatePurchase(purchaseData) {
  const { userId, platform, productId, purchaseToken, receiptData } = purchaseData;

  console.log('🔐 Validating purchase:', { userId, platform, productId });

  // Validate based on platform
  let validationResult;

  if (platform === 'android') {
    const packageName = 'com.sarina.app';
    validationResult = await validateAndroidPurchase(packageName, productId, purchaseToken);
  } else if (platform === 'ios') {
    validationResult = await validateIOSPurchase(receiptData);
  } else {
    return { success: false, error: 'Invalid platform' };
  }

  if (!validationResult.valid) {
    console.error('❌ Receipt validation failed:', validationResult.error);
    return { success: false, error: validationResult.error || 'Invalid receipt' };
  }

  // Process the validated purchase
  const orderId = validationResult.data.orderId;
  const processResult = await processValidatedPurchase(userId, productId, orderId, platform);

  if (!processResult.success) {
    return { success: false, error: processResult.error };
  }

  return {
    success: true,
    message: 'Purchase validated and processed',
    creditsAdded: processResult.creditsAdded,
    subscriptionTier: processResult.subscriptionTier,
  };
}

// Don't initialize on module load - will initialize lazily on first use
// This prevents Cloud Run startup timeout issues

module.exports = {
  validatePurchase,
  validateAndroidPurchase,
  validateIOSPurchase,
  isPurchaseAlreadyProcessed,
  processValidatedPurchase,
};

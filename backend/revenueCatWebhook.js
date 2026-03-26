/**
 * RevenueCat Webhook Handler
 * Handles subscription events from RevenueCat
 *
 * Documentation: https://www.revenuecat.com/docs/webhooks
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Process RevenueCat webhook event
 * @param {Object} event - Webhook event from RevenueCat
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
async function processRevenueCatWebhook(event) {
  try {
    const { type, app_user_id, product_id, entitlements, purchased_at_ms } = event;

    console.log('📨 RevenueCat webhook received:', {
      type,
      userId: app_user_id,
      productId: product_id,
    });

    // Get user ID (RevenueCat uses Firebase UID as app_user_id)
    const userId = app_user_id;

    if (!userId) {
      console.error('❌ No user ID in webhook event');
      return { success: false, error: 'Missing user ID' };
    }

    // Handle different event types
    switch (type) {
      case 'INITIAL_PURCHASE':
        return await handleInitialPurchase(userId, product_id, entitlements, purchased_at_ms);

      case 'RENEWAL':
        return await handleRenewal(userId, product_id, entitlements);

      case 'CANCELLATION':
        return await handleCancellation(userId, product_id);

      case 'EXPIRATION':
        return await handleExpiration(userId, product_id);

      case 'PRODUCT_CHANGE':
        return await handleProductChange(userId, product_id, entitlements);

      default:
        console.log(`ℹ️ Unhandled event type: ${type}`);
        return { success: true, message: 'Event type not processed' };
    }
  } catch (error) {
    console.error('❌ Error processing RevenueCat webhook:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle initial purchase event
 */
async function handleInitialPurchase(userId, productId, entitlements, purchasedAtMs) {
  try {
    console.log('💳 Processing initial purchase:', { userId, productId });

    // Determine subscription tier and credits
    let subscriptionTier = 'free';
    let creditsToAdd = 0;

    if (productId.includes('weekly')) {
      subscriptionTier = 'weekly';
      creditsToAdd = 60; // 60 seconds
    } else if (productId.includes('yearly') || productId.includes('annual')) {
      subscriptionTier = 'yearly';
      creditsToAdd = 3000; // 3000 seconds (50 minutes)
    }

    // Get entitlement expiration date
    const activeEntitlements = entitlements || {};
    const premiumEntitlement = activeEntitlements['premium'];
    const expirationDate = premiumEntitlement?.expires_date
      ? new Date(premiumEntitlement.expires_date)
      : null;

    // Update user document
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.warn(`⚠️ User document not found for ${userId}, creating...`);
      await userRef.set({
        voice_balance_seconds: creditsToAdd,
        subscription_tier: subscriptionTier,
        subscription_product_id: productId,
        subscription_updated_at: admin.firestore.FieldValue.serverTimestamp(),
        subscription_expiration_date: expirationDate,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Update existing user
      const updateData = {
        voice_balance_seconds: admin.firestore.FieldValue.increment(creditsToAdd),
        subscription_tier: subscriptionTier,
        subscription_product_id: productId,
        subscription_updated_at: admin.firestore.FieldValue.serverTimestamp(),
        subscription_start_date: admin.firestore.FieldValue.serverTimestamp(),
        total_minutes_purchased: admin.firestore.FieldValue.increment(creditsToAdd / 60),
      };

      if (expirationDate) {
        updateData.subscription_expiration_date = expirationDate;
      }

      await userRef.update(updateData);
    }

    // Log credit transaction
    await db.collection('credit_transactions').add({
      userId,
      type: 'subscription',
      amount_seconds: creditsToAdd,
      product_id: productId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        source: 'revenuecat_webhook',
        event_type: 'INITIAL_PURCHASE',
        subscriptionTier,
        purchased_at: new Date(purchasedAtMs),
      },
    });

    console.log(`✅ Initial purchase processed: ${creditsToAdd}s added to ${userId}`);

    return {
      success: true,
      message: 'Initial purchase processed',
      creditsAdded: creditsToAdd,
    };
  } catch (error) {
    console.error('❌ Error handling initial purchase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle renewal event
 */
async function handleRenewal(userId, productId, entitlements) {
  try {
    console.log('🔄 Processing renewal:', { userId, productId });

    // Determine credits to add on renewal
    let creditsToAdd = 0;
    let subscriptionTier = 'free';

    if (productId.includes('weekly')) {
      subscriptionTier = 'weekly';
      creditsToAdd = 60; // 60 seconds
    } else if (productId.includes('yearly') || productId.includes('annual')) {
      subscriptionTier = 'yearly';
      creditsToAdd = 3000; // 3000 seconds
    }

    // Get expiration date
    const activeEntitlements = entitlements || {};
    const premiumEntitlement = activeEntitlements['premium'];
    const expirationDate = premiumEntitlement?.expires_date
      ? new Date(premiumEntitlement.expires_date)
      : null;

    // Update user document
    const userRef = db.collection('users').doc(userId);
    const updateData = {
      voice_balance_seconds: admin.firestore.FieldValue.increment(creditsToAdd),
      subscription_tier: subscriptionTier,
      subscription_updated_at: admin.firestore.FieldValue.serverTimestamp(),
      last_reset_date: admin.firestore.FieldValue.serverTimestamp(),
      total_minutes_purchased: admin.firestore.FieldValue.increment(creditsToAdd / 60),
    };

    if (expirationDate) {
      updateData.subscription_expiration_date = expirationDate;
    }

    await userRef.update(updateData);

    // Log credit transaction
    await db.collection('credit_transactions').add({
      userId,
      type: 'renewal',
      amount_seconds: creditsToAdd,
      product_id: productId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        source: 'revenuecat_webhook',
        event_type: 'RENEWAL',
        subscriptionTier,
      },
    });

    console.log(`✅ Renewal processed: ${creditsToAdd}s added to ${userId}`);

    return {
      success: true,
      message: 'Renewal processed',
      creditsAdded: creditsToAdd,
    };
  } catch (error) {
    console.error('❌ Error handling renewal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle cancellation event
 */
async function handleCancellation(userId, productId) {
  try {
    console.log('❌ Processing cancellation:', { userId, productId });

    // Don't remove credits immediately - let them use until expiration
    // Just update the status
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      subscription_cancellation_date: admin.firestore.FieldValue.serverTimestamp(),
      subscription_auto_renew: false,
      subscription_updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Cancellation recorded for ${userId}`);

    return { success: true, message: 'Cancellation recorded' };
  } catch (error) {
    console.error('❌ Error handling cancellation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle expiration event
 */
async function handleExpiration(userId, productId) {
  try {
    console.log('⏰ Processing expiration:', { userId, productId });

    // Downgrade to free tier
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      subscription_tier: 'free',
      subscription_product_id: admin.firestore.FieldValue.delete(),
      subscription_expiration_date: admin.firestore.FieldValue.delete(),
      subscription_updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Expiration processed: ${userId} downgraded to free`);

    return { success: true, message: 'Expiration processed' };
  } catch (error) {
    console.error('❌ Error handling expiration:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle product change event (upgrade/downgrade)
 */
async function handleProductChange(userId, productId, entitlements) {
  try {
    console.log('🔄 Processing product change:', { userId, productId });

    // Determine new tier
    let subscriptionTier = 'free';

    if (productId.includes('weekly')) {
      subscriptionTier = 'weekly';
    } else if (productId.includes('yearly') || productId.includes('annual')) {
      subscriptionTier = 'yearly';
    }

    // Get expiration date
    const activeEntitlements = entitlements || {};
    const premiumEntitlement = activeEntitlements['premium'];
    const expirationDate = premiumEntitlement?.expires_date
      ? new Date(premiumEntitlement.expires_date)
      : null;

    // Update user document
    const userRef = db.collection('users').doc(userId);
    const updateData = {
      subscription_tier: subscriptionTier,
      subscription_product_id: productId,
      subscription_updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (expirationDate) {
      updateData.subscription_expiration_date = expirationDate;
    }

    await userRef.update(updateData);

    console.log(`✅ Product change processed: ${userId} → ${subscriptionTier}`);

    return { success: true, message: 'Product change processed' };
  } catch (error) {
    console.error('❌ Error handling product change:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify webhook authenticity (optional but recommended)
 * RevenueCat doesn't sign webhooks by default, but you can add authorization header
 */
function verifyWebhookSignature(req, secret) {
  const authHeader = req.headers['authorization'];

  if (!secret) {
    console.warn('⚠️ No webhook secret configured, skipping verification');
    return true;
  }

  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    console.error('❌ Invalid webhook signature');
    return false;
  }

  return true;
}

module.exports = {
  processRevenueCatWebhook,
  verifyWebhookSignature,
};

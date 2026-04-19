/**
 * Cloud Functions for Sarina Voice Credit Management
 *
 * Functions:
 * 1. dailyCreditReset - Reset credits for weekly/yearly subscribers (runs daily at midnight)
 * 2. mockTopUp - Mock function to add 300 seconds ($1.99 top-up) for testing
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onCall } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// ==================== DAILY CREDIT RESET ====================

/**
 * Daily Credit Reset Function
 * Runs every day at midnight (00:00 UTC)
 * Checks both weekly and yearly subscriptions
 *
 * Weekly: Resets to 60 seconds (1 min) if last_reset_date > 7 days ago
 * Yearly: Resets to 3000 seconds (50 min) if last_reset_date > 365 days ago
 */
exports.dailyCreditReset = onSchedule(
  {
    schedule: '0 0 * * *', // Every day at midnight UTC
    timeZone: 'UTC',
    memory: '256MiB',
    maxInstances: 1,
  },
  async (event) => {
    console.log('🔄 Starting daily credit reset check...');

    try {
      const now = Timestamp.now();
      const nowDate = now.toDate();

      // Calculate cutoff dates
      const sevenDaysAgo = new Date(nowDate);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

      const oneYearAgo = new Date(nowDate);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oneYearAgoTimestamp = Timestamp.fromDate(oneYearAgo);

      // Query all users with subscriptions
      const usersRef = db.collection('users');
      const weeklyQuery = usersRef
        .where('subscription_tier', '==', 'weekly')
        .where('last_reset_date', '<=', sevenDaysAgoTimestamp);

      const yearlyQuery = usersRef
        .where('subscription_tier', '==', 'yearly')
        .where('last_reset_date', '<=', oneYearAgoTimestamp);

      const [weeklySnapshot, yearlySnapshot] = await Promise.all([
        weeklyQuery.get(),
        yearlyQuery.get(),
      ]);

      const batch = db.batch();
      let weeklyCount = 0;
      let yearlyCount = 0;

      // Process weekly subscriptions
      weeklySnapshot.forEach((doc) => {
        const userRef = usersRef.doc(doc.id);
        const userData = doc.data();

        batch.update(userRef, {
          voice_balance_seconds: 60,
          last_reset_date: now,
          updated_at: FieldValue.serverTimestamp(),
        });

        // Log transaction
        const transactionRef = db.collection('credit_transactions').doc();
        batch.set(transactionRef, {
          userId: doc.id,
          type: 'reset',
          amount_seconds: 60,
          balance_before: userData.voice_balance_seconds || 0,
          balance_after: 60,
          product_id: null,
          call_session_id: null,
          timestamp: FieldValue.serverTimestamp(),
          metadata: {
            subscription_tier: 'weekly',
            reset_reason: 'scheduled_weekly',
          },
        });

        weeklyCount++;
      });

      // Process yearly subscriptions
      yearlySnapshot.forEach((doc) => {
        const userRef = usersRef.doc(doc.id);
        const userData = doc.data();

        batch.update(userRef, {
          voice_balance_seconds: 3000,
          last_reset_date: now,
          updated_at: FieldValue.serverTimestamp(),
        });

        // Log transaction
        const transactionRef = db.collection('credit_transactions').doc();
        batch.set(transactionRef, {
          userId: doc.id,
          type: 'reset',
          amount_seconds: 3000,
          balance_before: userData.voice_balance_seconds || 0,
          balance_after: 3000,
          product_id: null,
          call_session_id: null,
          timestamp: FieldValue.serverTimestamp(),
          metadata: {
            subscription_tier: 'yearly',
            reset_reason: 'scheduled_yearly',
          },
        });

        yearlyCount++;
      });

      // Commit batch
      if (weeklyCount > 0 || yearlyCount > 0) {
        await batch.commit();
      }

      console.log(`✅ Credits reset: ${weeklyCount} weekly, ${yearlyCount} yearly`);

      return {
        success: true,
        weeklyCount,
        yearlyCount,
        timestamp: now.toDate().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error in daily credit reset:', error);
      throw error;
    }
  }
);

// ==================== MOCK TOP-UP FUNCTION ====================

/**
 * Mock function to add 300 seconds ($1.99 top-up) to user balance
 * For testing purposes only
 *
 * Usage:
 * await mockTopUp({ userId: 'user_id_here' })
 */
exports.mockTopUp = onCall(
  {
    memory: '256MiB',
  },
  async (request) => {
    console.log('💰 Processing mock $1.99 top-up...');

    try {
      // Get userId from request or auth
      const userId = request.data.userId || (request.auth && request.auth.uid);

      if (!userId) {
        throw new Error('User ID required');
      }

      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentBalance = userDoc.data().voice_balance_seconds || 0;
      const addedSeconds = 300; // $1.99 = 5 minutes

      // Add credits
      await userRef.update({
        voice_balance_seconds: FieldValue.increment(addedSeconds),
        total_minutes_purchased: FieldValue.increment(addedSeconds / 60),
        updated_at: FieldValue.serverTimestamp(),
      });

      // Log transaction
      await db.collection('credit_transactions').add({
        userId,
        type: 'purchase',
        amount_seconds: addedSeconds,
        balance_before: currentBalance,
        balance_after: currentBalance + addedSeconds,
        product_id: 'mock_topup_199',
        call_session_id: null,
        timestamp: FieldValue.serverTimestamp(),
        metadata: {
          product_name: '$1.99 Top-Up (Mock)',
          price: 1.99,
          platform: 'mock',
        },
      });

      console.log(`✅ Added ${addedSeconds}s to user ${userId}. New balance: ${currentBalance + addedSeconds}s`);

      return {
        success: true,
        creditsAdded: addedSeconds,
        newBalance: currentBalance + addedSeconds,
        message: `Successfully added 5 minutes (300 seconds) to your balance!`,
      };
    } catch (error) {
      console.error('❌ Error in mock top-up:', error);
      throw error;
    }
  }
);

// ==================== CREDIT PURCHASE HANDLER (FOR REAL IAP) ====================

/**
 * Handle credit purchase from IAP
 * Called by React Native app after successful purchase
 */
exports.handleCreditPurchase = onCall(
  {
    memory: '256MiB',
  },
  async (request) => {
    console.log('💳 Processing credit purchase...');

    try {
      // Verify user is authenticated
      if (!request.auth) {
        throw new Error('Unauthenticated');
      }

      const userId = request.auth.uid;
      const { productId, purchaseToken, transactionId } = request.data;

      if (!productId || !purchaseToken) {
        throw new Error('Missing required fields');
      }

      // Define product credits
      const PRODUCTS = {
        'voice5min': { seconds: 300, name: '5 Minutes', price: 1.99 },
        'voice15min': { seconds: 900, name: '15 Minutes', price: 4.99 },
        'voice30min': { seconds: 1800, name: '30 Minutes', price: 8.99 },
      };

      const product = PRODUCTS[productId];

      if (!product) {
        throw new Error(`Unknown product: ${productId}`);
      }

      // Check if transaction already processed (prevent double-credit)
      const existingTransaction = await db
        .collection('credit_transactions')
        .where('userId', '==', userId)
        .where('metadata.transactionId', '==', transactionId)
        .limit(1)
        .get();

      if (!existingTransaction.empty) {
        console.warn(`⚠️ Transaction ${transactionId} already processed`);
        return {
          success: false,
          error: 'Transaction already processed',
          duplicate: true,
        };
      }

      // Get current balance
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentBalance = userDoc.data().voice_balance_seconds || 0;

      // Add credits
      await userRef.update({
        voice_balance_seconds: FieldValue.increment(product.seconds),
        total_minutes_purchased: FieldValue.increment(product.seconds / 60),
        updated_at: FieldValue.serverTimestamp(),
      });

      // Log transaction
      await db.collection('credit_transactions').add({
        userId,
        type: 'purchase',
        amount_seconds: product.seconds,
        balance_before: currentBalance,
        balance_after: currentBalance + product.seconds,
        product_id: productId,
        call_session_id: null,
        timestamp: FieldValue.serverTimestamp(),
        metadata: {
          product_name: product.name,
          price: product.price,
          transactionId,
          purchaseToken,
          platform: request.data.platform || 'unknown',
        },
      });

      console.log(`✅ Added ${product.seconds}s to user ${userId}. New balance: ${currentBalance + product.seconds}s`);

      return {
        success: true,
        creditsAdded: product.seconds,
        newBalance: currentBalance + product.seconds,
        productName: product.name,
      };
    } catch (error) {
      console.error('❌ Error processing credit purchase:', error);
      throw error;
    }
  }
);

// ==================== CRASHED CALL RECONCILIATION ====================

/**
 * Reconcile Crashed Calls Function
 * Runs every 5 minutes to find stale active_call records and deduct missing credits
 *
 * CRITICAL FEATURES:
 * 1. Firestore transaction for atomic read + deduct (prevents double-charge)
 * 2. Cap deduction at credits_at_call_start (prevents over-deduction)
 * 3. Zero-balance policy (no negative balances, flag for review)
 * 4. Comprehensive logging for monitoring
 */
exports.reconcileCrashedCalls = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'UTC',
    memory: '256MiB',
    maxInstances: 1,
  },
  async (event) => {
    console.log('🔍 Starting crashed call reconciliation...');

    const now = Date.now();
    const STALE_CALL_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    const MAX_CALL_DURATION_SECONDS = 60 * 60; // 1 hour (safety cap)
    const staleThreshold = now - STALE_CALL_THRESHOLD_MS;

    try {
      // Query for users with stale active_call records
      const staleCallsSnapshot = await db.collection('users')
        .where('active_call.start_timestamp', '<', staleThreshold)
        .get();

      if (staleCallsSnapshot.empty) {
        console.log('✅ No stale calls found');
        return { success: 0, failed: 0, skipped: 0 };
      }

      console.log(`📞 Found ${staleCallsSnapshot.size} stale call(s) to reconcile`);

      const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        totalSecondsReconciled: 0,
        errors: [],
      };

      // Process each stale call with transaction
      for (const userDoc of staleCallsSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const activeCall = userData.active_call;

        try {
          // Validate active_call data
          if (!activeCall || !activeCall.start_timestamp || !activeCall.call_id) {
            console.warn(`⚠️ Invalid active_call data for user ${userId}, clearing record`);
            await db.collection('users').doc(userId).update({ active_call: null });
            results.skipped++;
            continue;
          }

          const {
            call_id: callId,
            start_timestamp: callStartTime,
            credits_at_call_start: creditsAtStart,
          } = activeCall;

          // Calculate call duration
          const callDurationSeconds = Math.floor((now - callStartTime) / 1000);

          // Safety cap: Ignore calls longer than MAX_CALL_DURATION_SECONDS
          if (callDurationSeconds > MAX_CALL_DURATION_SECONDS) {
            console.warn(`⚠️ Call duration exceeds safety cap (${callDurationSeconds}s), skipping user ${userId}`);
            await db.collection('users').doc(userId).update({ active_call: null });
            results.skipped++;
            continue;
          }

          // Use Firestore transaction for atomic read + deduct
          await db.runTransaction(async (transaction) => {
            const userRef = db.collection('users').doc(userId);
            const userSnapshot = await transaction.get(userRef);

            if (!userSnapshot.exists) {
              throw new Error(`User document not found: ${userId}`);
            }

            const currentData = userSnapshot.data();
            const currentBalance = currentData.voice_balance_seconds || 0;
            const currentActiveCall = currentData.active_call;

            // Double-check active_call still exists
            if (!currentActiveCall || currentActiveCall.call_id !== callId) {
              console.log(`⚠️ Active call already cleared for user ${userId}, skipping`);
              results.skipped++;
              return;
            }

            // Calculate credits to deduct (capped at credits_at_call_start)
            let creditsToDeduct = callDurationSeconds;
            if (creditsAtStart !== undefined && creditsAtStart !== null) {
              creditsToDeduct = Math.min(creditsToDeduct, creditsAtStart);
              console.log(`💰 Capping deduction at credits_at_call_start: ${creditsToDeduct}s`);
            }

            // ZERO-BALANCE POLICY: Cap at current balance, never go negative
            if (currentBalance <= 0) {
              console.warn(`⚠️ User ${userId} has zero balance, flagging account`);
              transaction.update(userRef, {
                active_call: null,
                flagged_for_review: true,
                flagged_reason: `Crashed call with zero balance: ${callDurationSeconds}s unpaid`,
                flagged_at: FieldValue.serverTimestamp(),
              });
              results.skipped++;
              return;
            }

            // Calculate final deduction (cannot exceed current balance)
            const finalDeduction = Math.min(creditsToDeduct, currentBalance);
            const newBalance = currentBalance - finalDeduction;

            console.log(`💳 Deducting ${finalDeduction}s from user ${userId} (${currentBalance}s → ${newBalance}s)`);

            // Atomic update: deduct credits + clear active_call
            transaction.update(userRef, {
              voice_balance_seconds: newBalance,
              active_call: null,
              last_reconciliation: {
                call_id: callId,
                seconds_deducted: finalDeduction,
                reconciled_at: FieldValue.serverTimestamp(),
              },
            });

            results.success++;
            results.totalSecondsReconciled += finalDeduction;

            console.log(`✅ Successfully reconciled ${finalDeduction}s for user ${userId}`);
          });
        } catch (error) {
          console.error(`❌ Error reconciling call for user ${userId}:`, error);
          results.failed++;
          results.errors.push({
            userId,
            error: error.message,
            callId: activeCall?.call_id,
          });
        }
      }

      // Log summary
      console.log('📊 Reconciliation Summary:', {
        success: results.success,
        failed: results.failed,
        skipped: results.skipped,
        totalSecondsReconciled: results.totalSecondsReconciled,
      });

      return results;
    } catch (error) {
      console.error('❌ Fatal error in reconciliation job:', error);
      throw error;
    }
  }
);

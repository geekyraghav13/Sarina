/**
 * Credit Manager
 * Handles credit checking, deduction, and automatic call termination
 */

const admin = require('firebase-admin');

const HEARTBEAT_INTERVAL = parseInt(process.env.HEARTBEAT_INTERVAL_SECONDS || '10') * 1000;
const MINIMUM_BALANCE = parseInt(process.env.MINIMUM_CALL_BALANCE_SECONDS || '10');
const DEDUCTION_AMOUNT = 10; // Deduct 10 seconds every heartbeat

class CreditManager {
  constructor() {
    this.activeSessions = new Map(); // sessionId -> { userId, intervalId, totalDeducted }
  }

  /**
   * Check if user has sufficient credits to start a call
   * PRODUCTION CODE - Task 2.2: Enabled for Milestone 2
   */
  async canStartCall(userId) {
    try {
      const userRef = admin.firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.warn(`User ${userId} not found in Firestore`);
        return { allowed: false, balance: 0, reason: 'user_not_found' };
      }

      const userData = userDoc.data();
      const balance = userData.voice_balance_seconds || 0;

      if (balance < MINIMUM_BALANCE) {
        console.warn(`User ${userId} has insufficient credits: ${balance}s`);
        return {
          allowed: false,
          balance,
          reason: 'insufficient_credits',
          required: MINIMUM_BALANCE,
        };
      }

      console.log(`✅ User ${userId} can start call. Balance: ${balance}s`);
      return { allowed: true, balance };
    } catch (error) {
      console.error('Error checking user credits:', error);
      return { allowed: false, balance: 0, reason: 'error', error: error.message };
    }
  }

  /**
   * Start credit deduction heartbeat for a call session
   */
  async startHeartbeat(sessionId, userId, callSessionDocId, onOutOfCredits, onBalanceUpdate) {
    console.log(`🔄 Starting heartbeat for session ${sessionId} (user: ${userId})`);

    // Create heartbeat interval
    const intervalId = setInterval(async () => {
      await this.deductCredits(sessionId, userId, callSessionDocId, onOutOfCredits, onBalanceUpdate);
    }, HEARTBEAT_INTERVAL);

    // Store session info
    this.activeSessions.set(sessionId, {
      userId,
      callSessionDocId,
      intervalId,
      totalDeducted: 0,
      startTime: Date.now(),
    });

    console.log(`✅ Heartbeat started for session ${sessionId}`);
  }

  /**
   * Deduct credits and check if call should continue
   * PRODUCTION CODE - Task 2.2: Enabled for Milestone 2
   */
  async deductCredits(sessionId, userId, callSessionDocId, onOutOfCredits, onBalanceUpdate) {
    try {
      const userRef = admin.firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.error(`User ${userId} not found during heartbeat`);
        this.stopHeartbeat(sessionId, 'user_not_found');
        onOutOfCredits('user_not_found');
        return;
      }

      const userData = userDoc.data();
      const currentBalance = userData.voice_balance_seconds || 0;

      // Check if user has any credits left
      if (currentBalance <= 0) {
        console.warn(`❌ User ${userId} ran out of credits!`);
        this.stopHeartbeat(sessionId, 'out_of_credits');
        onOutOfCredits('out_of_credits');
        return;
      }

      // Determine how much to deduct (10 seconds or remaining balance)
      const deductionAmount = Math.min(DEDUCTION_AMOUNT, currentBalance);

      // Deduct credits using Firestore increment (atomic operation)
      await userRef.update({
        voice_balance_seconds: admin.firestore.FieldValue.increment(-deductionAmount),
        total_seconds_used: admin.firestore.FieldValue.increment(deductionAmount),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update session tracking
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.totalDeducted += deductionAmount;
      }

      // Log transaction
      await this.logTransaction(userId, callSessionDocId, deductionAmount, currentBalance);

      const newBalance = currentBalance - deductionAmount;
      console.log(
        `💰 Deducted ${deductionAmount}s from user ${userId}. New balance: ${newBalance}s`
      );

      // Send balance update to client
      if (onBalanceUpdate) {
        onBalanceUpdate(newBalance);
      }

      // Check if this was the last deduction
      if (newBalance <= 0) {
        console.warn(`🛑 User ${userId} balance is now 0. Ending call.`);
        this.stopHeartbeat(sessionId, 'out_of_credits');
        onOutOfCredits('out_of_credits');
      }
    } catch (error) {
      console.error('Error deducting credits:', error);
      // Don't stop the call on temporary errors, retry on next heartbeat
    }
  }

  /**
   * Stop heartbeat for a session
   */
  stopHeartbeat(sessionId, reason = 'user_hangup') {
    const session = this.activeSessions.get(sessionId);

    if (session) {
      clearInterval(session.intervalId);
      const duration = Math.floor((Date.now() - session.startTime) / 1000);

      console.log(
        `🛑 Stopped heartbeat for session ${sessionId}. ` +
          `Duration: ${duration}s, Deducted: ${session.totalDeducted}s, Reason: ${reason}`
      );

      // End call session in Firestore
      this.endCallSession(session.callSessionDocId, duration, session.totalDeducted, reason);

      this.activeSessions.delete(sessionId);
    }
  }

  /**
   * Log credit transaction to Firestore
   * PRODUCTION CODE - Task 2.2: Enabled for Milestone 2
   */
  async logTransaction(userId, callSessionDocId, amountSeconds, balanceBefore) {
    try {
      await admin
        .firestore()
        .collection('credit_transactions')
        .add({
          userId,
          type: 'deduction',
          amount_seconds: -amountSeconds,
          balance_before: balanceBefore,
          balance_after: balanceBefore - amountSeconds,
          product_id: null,
          call_session_id: callSessionDocId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            deduction_reason: 'heartbeat',
            heartbeat_interval: HEARTBEAT_INTERVAL / 1000,
          },
        });
    } catch (error) {
      console.error('Error logging transaction:', error);
    }
  }

  /**
   * End call session in Firestore
   * PRODUCTION CODE - Task 2.2: Enabled for Milestone 2
   */
  async endCallSession(callSessionDocId, durationSeconds, secondsDeducted, disconnectReason) {
    try {
      await admin
        .firestore()
        .collection('call_sessions')
        .doc(callSessionDocId)
        .update({
          end_time: admin.firestore.FieldValue.serverTimestamp(),
          duration_seconds: durationSeconds,
          seconds_deducted: secondsDeducted,
          status: 'completed',
          disconnect_reason: disconnectReason,
        });

      console.log(`✅ Call session ${callSessionDocId} ended successfully`);
    } catch (error) {
      console.error('Error ending call session:', error);
    }
  }

  /**
   * Create a new call session in Firestore
   * PRODUCTION CODE - Task 2.2: Enabled for Milestone 2
   */
  async createCallSession(userId, characterId, characterName) {
    try {
      const docRef = await admin
        .firestore()
        .collection('call_sessions')
        .add({
          userId,
          characterId,
          characterName,
          start_time: admin.firestore.FieldValue.serverTimestamp(),
          end_time: null,
          duration_seconds: 0,
          seconds_deducted: 0,
          status: 'active',
          disconnect_reason: null,
        });

      // Increment user's total call count
      await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .update({
          total_calls: admin.firestore.FieldValue.increment(1),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`✅ Call session created: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Error creating call session:', error);
      throw error;
    }
  }

  /**
   * Get current balance for a user
   * PRODUCTION CODE - Task 2.2: Enabled for Milestone 2
   */
  async getBalance(userId) {
    try {
      const userDoc = await admin.firestore().collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return 0;
      }

      return userDoc.data().voice_balance_seconds || 0;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Cleanup: Stop all active heartbeats (for graceful shutdown)
   */
  cleanup() {
    console.log(`🧹 Cleaning up ${this.activeSessions.size} active sessions...`);

    this.activeSessions.forEach((session, sessionId) => {
      this.stopHeartbeat(sessionId, 'server_shutdown');
    });

    this.activeSessions.clear();
    console.log('✅ Cleanup complete');
  }
}

module.exports = new CreditManager();

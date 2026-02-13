/**
 * Credit Service
 * Handles Firestore credit operations (read-only from client side)
 */

import { doc, getDoc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { getCurrentUser } from './authService';

export interface UserCredits {
  voice_balance_seconds: number;
  subscription_tier: string;
  total_minutes_purchased: number;
  total_seconds_used: number;
  total_calls: number;
  last_reset_date: any;
}

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'deduction' | 'reset';
  amount_seconds: number;
  balance_before: number;
  balance_after: number;
  product_id: string | null;
  timestamp: any;
  metadata?: any;
}

/**
 * Get user's current credit balance
 */
export const getCreditBalance = async (): Promise<number> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.warn('User document not found');
      return 0;
    }

    const data = userDoc.data();
    return data.voice_balance_seconds || 0;
  } catch (error) {
    console.error('❌ Failed to get credit balance:', error);
    return 0;
  }
};

/**
 * Get user's full credit data
 */
export const getUserCreditData = async (): Promise<UserCredits | null> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.warn('User document not found');
      return null;
    }

    return userDoc.data() as UserCredits;
  } catch (error) {
    console.error('❌ Failed to get user credit data:', error);
    return null;
  }
};

/**
 * Subscribe to real-time credit balance updates
 * Returns unsubscribe function
 */
export const subscribeToBalance = (
  onBalanceUpdate: (balance: number) => void
): (() => void) => {
  const user = getCurrentUser();
  if (!user) {
    console.error('User not authenticated');
    return () => {};
  }

  const userRef = doc(firestore, 'users', user.uid);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const balance = data.voice_balance_seconds || 0;
        onBalanceUpdate(balance);
      }
    },
    (error) => {
      console.error('❌ Error listening to balance updates:', error);
    }
  );
};

/**
 * Get recent credit transactions
 */
export const getRecentTransactions = async (limitCount: number = 10): Promise<CreditTransaction[]> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const transactionsRef = collection(firestore, 'credit_transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDoc(q as any);
    const transactions: CreditTransaction[] = [];

    snapshot.forEach((doc: any) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      } as CreditTransaction);
    });

    return transactions;
  } catch (error) {
    console.error('❌ Failed to get transactions:', error);
    return [];
  }
};

/**
 * Format seconds to human-readable time
 */
export const formatSecondsToTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Calculate cost per minute
 */
export const calculateCostPerMinute = (totalSeconds: number, price: number): number => {
  const minutes = totalSeconds / 60;
  return price / minutes;
};

/**
 * Get credit allocation for subscription tier
 * NEW: Task 2.1 - Connect subscription tiers to voice credits
 */
export const getCreditAllocationForTier = (tier: string): number => {
  switch (tier) {
    case 'weekly':
      return 60; // 1 minute
    case 'yearly':
      return 3000; // 50 minutes
    case 'free':
    default:
      return 0; // No free credits
  }
};

/**
 * Check if user has enough balance to start a call
 * NEW: Task 2.1 - Pre-call balance check
 */
export const canStartCall = async (): Promise<{ allowed: boolean; balance: number; message?: string }> => {
  try {
    const balance = await getCreditBalance();
    const MINIMUM_CALL_BALANCE = 10; // 10 seconds minimum

    if (balance < MINIMUM_CALL_BALANCE) {
      return {
        allowed: false,
        balance,
        message: `You need at least ${MINIMUM_CALL_BALANCE} seconds to start a call. Current balance: ${balance}s`,
      };
    }

    return { allowed: true, balance };
  } catch (error) {
    console.error('Error checking call eligibility:', error);
    return {
      allowed: false,
      balance: 0,
      message: 'Unable to verify your balance. Please try again.',
    };
  }
};

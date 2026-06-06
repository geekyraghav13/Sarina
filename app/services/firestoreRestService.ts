/**
 * Firestore REST API Service
 *
 * Provides HTTP-based Firestore access for restricted networks (college WiFi, corporate firewalls)
 * Falls back to standard HTTPS when WebSocket/long-polling is blocked
 *
 * Used as fallback when Firestore SDK shows "client is offline" errors
 */

import { getIdToken } from './authService';

const PROJECT_ID = 'sarina-ai-2b2c1';
const FIRESTORE_API_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Convert JavaScript object to Firestore REST API format
 *
 * Firestore REST API requires specific field type wrappers:
 * - stringValue for strings
 * - integerValue for numbers
 * - timestampValue for timestamps
 */
function toFirestoreFields(obj: any): any {
  const fields: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (key === 'updated_at' || key === 'created_at' || key === 'last_reset_date') {
      // Use server timestamp for timestamp fields
      fields[key] = { timestampValue: new Date().toISOString() };
    } else if (Array.isArray(value)) {
      // Handle arrays (e.g., processed_transactions)
      fields[key] = {
        arrayValue: {
          values: value.map((item) => {
            if (typeof item === 'string') {
              return { stringValue: item };
            } else if (typeof item === 'number') {
              return { integerValue: item.toString() };
            } else if (typeof item === 'boolean') {
              return { booleanValue: item };
            } else if (typeof item === 'object' && item !== null) {
              return { mapValue: { fields: toFirestoreFields(item) } };
            }
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      fields[key] = { integerValue: value.toString() };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: toFirestoreFields(value) } };
    }
  }

  return fields;
}

/**
 * Convert Firestore REST API format to JavaScript object
 */
function fromFirestoreFields(fields: any): any {
  const obj: any = {};

  for (const [key, value] of Object.entries(fields)) {
    const fieldValue: any = value;

    if (fieldValue.stringValue !== undefined) {
      obj[key] = fieldValue.stringValue;
    } else if (fieldValue.integerValue !== undefined) {
      obj[key] = parseInt(fieldValue.integerValue);
    } else if (fieldValue.booleanValue !== undefined) {
      obj[key] = fieldValue.booleanValue;
    } else if (fieldValue.timestampValue !== undefined) {
      obj[key] = new Date(fieldValue.timestampValue);
    } else if (fieldValue.arrayValue !== undefined) {
      // Handle arrays (e.g., processed_transactions)
      obj[key] = (fieldValue.arrayValue.values || []).map((item: any) => {
        if (item.stringValue !== undefined) {
          return item.stringValue;
        } else if (item.integerValue !== undefined) {
          return parseInt(item.integerValue);
        } else if (item.booleanValue !== undefined) {
          return item.booleanValue;
        } else if (item.mapValue !== undefined) {
          return fromFirestoreFields(item.mapValue.fields);
        }
        return item;
      });
    } else if (fieldValue.mapValue !== undefined) {
      obj[key] = fromFirestoreFields(fieldValue.mapValue.fields);
    }
  }

  return obj;
}

/**
 * Get document using Firestore REST API
 */
export async function getDocumentREST(collection: string, docId: string): Promise<any> {
  try {
    const token = await getIdToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log(`🌐 Fetching document via REST: ${collection}/${docId}`);

    const response = await fetch(
      `${FIRESTORE_API_BASE}/${collection}/${docId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 404) {
      console.log(`📄 Document not found: ${collection}/${docId}`);
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`REST API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Document fetched via REST: ${collection}/${docId}`);

    return data.fields ? fromFirestoreFields(data.fields) : null;
  } catch (error: any) {
    console.error(`❌ Failed to get document via REST:`, error);
    throw error;
  }
}

/**
 * Set/update document using Firestore REST API
 *
 * @param collection - Collection name (e.g., 'users')
 * @param docId - Document ID (e.g., user UID)
 * @param data - Data to set
 * @param merge - If true, merges with existing data. If false, overwrites
 */
export async function setDocumentREST(
  collection: string,
  docId: string,
  data: any,
  merge: boolean = true
): Promise<void> {
  try {
    const token = await getIdToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log(`🌐 Setting document via REST: ${collection}/${docId}`, { merge });

    const fields = toFirestoreFields(data);

    // Build update mask for merge behavior
    let url = `${FIRESTORE_API_BASE}/${collection}/${docId}`;

    if (merge) {
      // Add updateMask query params for each field
      const fieldPaths = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
      url += `?${fieldPaths}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`REST API error: ${response.status} - ${errorText}`);
    }

    console.log(`✅ Document set via REST: ${collection}/${docId}`);
  } catch (error: any) {
    console.error(`❌ Failed to set document via REST:`, error);
    throw error;
  }
}

/**
 * Update user subscription and credits
 * Specialized function for purchase flow
 */
export async function updateUserSubscriptionREST(
  uid: string,
  subscription_tier: string,
  voice_balance_seconds: number
): Promise<void> {
  try {
    console.log(`💳 Updating user subscription via REST:`, {
      uid,
      subscription_tier,
      voice_balance_seconds,
    });

    await setDocumentREST('users', uid, {
      subscription_tier,
      voice_balance_seconds,
      updated_at: new Date().toISOString(), // Will be converted to timestamp
    }, true); // Merge with existing data

    console.log(`✅ User subscription updated successfully via REST`);
  } catch (error: any) {
    console.error(`❌ Failed to update user subscription via REST:`, error);
    throw error;
  }
}

/**
 * Create user document (for initial sign-in)
 */
export async function createUserDocumentREST(userData: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): Promise<void> {
  try {
    console.log(`👤 Creating user document via REST:`, userData.uid);

    await setDocumentREST('users', userData.uid, {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      voice_balance_seconds: 0,
      subscription_tier: 'free',
      last_reset_date: new Date().toISOString(),
      total_minutes_purchased: 0,
      total_seconds_used: 0,
      total_calls: 0,
      processed_transactions: [], // CRITICAL: Initialize empty array for duplicate prevention
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, false); // Don't merge, create new document

    console.log(`✅ User document created via REST:`, userData.uid);
  } catch (error: any) {
    console.error(`❌ Failed to create user document via REST:`, error);
    throw error;
  }
}

/**
 * Atomically decrement voice balance using Firestore increment transform
 * CRITICAL: Prevents double-spend in concurrent session scenarios
 *
 * Uses Firestore Write API with transforms for atomic operations:
 * https://firebase.google.com/docs/firestore/reference/rest/v1/Write#FieldTransform
 *
 * @param uid - User ID
 * @param seconds - Number of seconds to decrement (positive number)
 * @returns Updated balance, or null if operation failed
 */
export async function decrementVoiceBalanceAtomic(
  uid: string,
  seconds: number = 1
): Promise<number | null> {
  try {
    const token = await getIdToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log(`💰 Atomically decrementing balance: ${uid}, -${seconds}s`);

    // Use Firestore's commit API with increment transform for atomic operations
    // This prevents race conditions from concurrent sessions
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        writes: [
          {
            transform: {
              document: `projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`,
              fieldTransforms: [
                {
                  fieldPath: 'voice_balance_seconds',
                  increment: {
                    integerValue: (-seconds).toString(),
                  },
                },
              ],
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Atomic decrement failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract the new balance from the write result
    const transformResults = data.writeResults?.[0]?.transformResults;
    const newBalance = transformResults?.[0]?.integerValue
      ? parseInt(transformResults[0].integerValue)
      : null;

    console.log(`✅ Balance decremented atomically. New balance: ${newBalance}s`);
    return newBalance;
  } catch (error: any) {
    console.error(`❌ Failed to atomically decrement balance:`, error);
    return null;
  }
}

/**
 * Record call start timestamp in Firestore for crash recovery
 * CRITICAL: Allows server-side reconciliation if app crashes mid-call
 *
 * Includes retry logic (3 attempts) to ensure record is created even with network blips
 *
 * @param uid - User ID
 * @param callId - Unique call identifier
 * @param characterName - Character being called
 * @param currentBalance - User's balance at call start (for reconciliation cap)
 */
export async function recordCallStart(
  uid: string,
  callId: string,
  characterName: string,
  currentBalance: number
): Promise<boolean> {
  const MAX_RETRIES = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log(`📞 Recording call start (attempt ${attempt}/${MAX_RETRIES}): ${uid}, callId: ${callId}`);

      await setDocumentREST('users', uid, {
        active_call: {
          call_id: callId,
          character_name: characterName,
          start_timestamp: Date.now(),
          credits_at_call_start: currentBalance, // CAP: Prevent over-deduction on reconciliation
          last_heartbeat: Date.now(),
        },
      }, true);

      console.log(`✅ Call start recorded successfully on attempt ${attempt}`);
      return true; // Success
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Failed to record call start (attempt ${attempt}/${MAX_RETRIES}):`, error);

      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 500ms, 1000ms, 2000ms
        const delayMs = 500 * Math.pow(2, attempt - 1);
        console.log(`⏳ Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  // All retries failed - log to analytics for monitoring
  console.error(`❌ CRITICAL: Failed to record call start after ${MAX_RETRIES} attempts:`, lastError);

  // Log to Firebase Analytics for monitoring
  const { logEvent } = await import('./firebaseAnalytics');
  logEvent('call_start_record_failed', {
    uid,
    call_id: callId,
    error: lastError?.message || 'Unknown error',
    retries: MAX_RETRIES,
  });

  return false; // Failure
}

/**
 * Clear active call record (on normal call end)
 *
 * @param uid - User ID
 */
export async function clearActiveCall(uid: string): Promise<void> {
  try {
    const token = await getIdToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log(`📴 Clearing active call: ${uid}`);

    await setDocumentREST('users', uid, {
      active_call: null,
    }, true);

    console.log(`✅ Active call cleared`);
  } catch (error: any) {
    console.error(`❌ Failed to clear active call:`, error);
  }
}

/**
 * Check if Firestore REST API is accessible
 * Useful for network diagnostics
 */
export async function testFirestoreRESTConnection(): Promise<boolean> {
  try {
    const token = await getIdToken();
    if (!token) {
      return false;
    }

    // Try to list collections (lightweight operation)
    const response = await fetch(
      `${FIRESTORE_API_BASE}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('❌ Firestore REST API connection test failed:', error);
    return false;
  }
}

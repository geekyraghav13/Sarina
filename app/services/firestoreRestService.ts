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

# Firestore Database Schema for Voice Call Feature

This document describes the Firestore database structure for the AI voice calling feature with real-time credit management.

## Collections Overview

```
firestore/
├── users/                    # User credit balances and subscription info
│   └── {userId}/
├── call_sessions/            # Call history and active sessions
│   └── {sessionId}/
└── credit_transactions/      # Transaction log for all credit changes
    └── {transactionId}/
```

---

## Collection: `users`

**Purpose:** Store user voice credit balances, subscription tiers, and usage statistics.

**Document ID:** Firebase Auth UID (e.g., `abc123xyz`)

### Schema

```typescript
{
  userId: string;                    // Firebase Auth UID (same as document ID)
  email: string | null;              // User email from Google Sign-In
  displayName: string | null;        // User display name
  photoURL: string | null;           // User profile photo
  voice_balance_seconds: number;     // Current available voice call seconds
  subscription_tier: string;         // 'free' | 'weekly' | 'yearly'
  last_reset_date: Timestamp | null; // When credits were last reset (for subscriptions)
  total_minutes_purchased: number;   // Total minutes purchased (from IAP top-ups)
  subscription_start_date: Timestamp | null; // When current subscription started
  total_calls: number;               // Total number of calls made (lifetime)
  total_seconds_used: number;        // Total seconds used across all calls (lifetime)
  created_at: Timestamp;             // Account creation timestamp
  updated_at: Timestamp;             // Last update timestamp
}
```

### Example Document

```json
{
  "userId": "abc123xyz",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://example.com/photo.jpg",
  "voice_balance_seconds": 245,
  "subscription_tier": "weekly",
  "last_reset_date": "2026-02-03T12:00:00Z",
  "total_minutes_purchased": 15.0,
  "subscription_start_date": "2026-01-27T10:30:00Z",
  "total_calls": 12,
  "total_seconds_used": 815,
  "created_at": "2026-01-15T08:00:00Z",
  "updated_at": "2026-02-04T14:22:00Z"
}
```

### Initial Credit Allocation

| Subscription Tier | Initial Credits | Reset Frequency |
|-------------------|----------------|-----------------|
| `free`            | 0 seconds      | Never           |
| `weekly`          | 60 seconds (1 min) | Daily check (if > 7 days) |
| `yearly`          | 3000 seconds (50 min) | Daily check (if > 365 days) |

### Security Rules

- ✅ Users can **read** their own document
- ✅ Users can **create** their own document (on first auth)
- ❌ Users **cannot update** `voice_balance_seconds`, `subscription_tier`, or usage stats (backend only)
- ❌ Users **cannot delete** their document

---

## Collection: `call_sessions`

**Purpose:** Track all voice call sessions (active and historical).

**Document ID:** Auto-generated Firestore ID

### Schema

```typescript
{
  sessionId: string;          // Document ID (auto-generated)
  userId: string;             // User who made the call (Firebase Auth UID)
  characterId: string;        // AI character ID
  characterName: string;      // AI character name (for display)
  start_time: Timestamp;      // Call start time
  end_time: Timestamp | null; // Call end time (null if still active)
  duration_seconds: number;   // Actual call duration (calculated on end)
  seconds_deducted: number;   // Total seconds deducted from user's balance
  status: string;             // 'active' | 'completed' | 'interrupted'
  disconnect_reason: string | null; // 'user_hangup' | 'out_of_credits' | 'network_error' | null
}
```

### Example Document

```json
{
  "sessionId": "xyz789abc",
  "userId": "abc123xyz",
  "characterId": "char_001",
  "characterName": "Serena",
  "start_time": "2026-02-04T14:15:00Z",
  "end_time": "2026-02-04T14:18:32Z",
  "duration_seconds": 212,
  "seconds_deducted": 215,
  "status": "completed",
  "disconnect_reason": "user_hangup"
}
```

### Call Status Values

| Status | Description |
|--------|-------------|
| `active` | Call is currently in progress |
| `completed` | Call ended normally |
| `interrupted` | Call ended unexpectedly (network error, crash, etc.) |

### Disconnect Reasons

| Reason | Description |
|--------|-------------|
| `user_hangup` | User ended the call voluntarily |
| `out_of_credits` | Call auto-terminated due to 0 balance |
| `network_error` | Connection lost due to network issues |
| `server_error` | Backend error caused disconnect |

### Security Rules

- ✅ Users can **read** their own call sessions
- ❌ Users **cannot create/update/delete** call sessions (backend only)

---

## Collection: `credit_transactions`

**Purpose:** Immutable log of all credit additions and deductions for audit and transparency.

**Document ID:** Auto-generated Firestore ID

### Schema

```typescript
{
  transactionId: string;          // Document ID (auto-generated)
  userId: string;                 // User associated with this transaction
  type: string;                   // 'purchase' | 'subscription' | 'reset' | 'deduction' | 'refund'
  amount_seconds: number;         // Seconds added (positive) or removed (negative)
  balance_before: number;         // User's balance before transaction
  balance_after: number;          // User's balance after transaction
  product_id: string | null;      // IAP product ID (if applicable)
  call_session_id: string | null; // Call session ID (for deductions)
  timestamp: Timestamp;           // When transaction occurred
  metadata: Record<string, any>;  // Additional context (JSON object)
}
```

### Example Documents

**Purchase Transaction:**
```json
{
  "transactionId": "txn_001",
  "userId": "abc123xyz",
  "type": "purchase",
  "amount_seconds": 300,
  "balance_before": 45,
  "balance_after": 345,
  "product_id": "voice5min",
  "call_session_id": null,
  "timestamp": "2026-02-04T14:00:00Z",
  "metadata": {
    "purchase_receipt": "abc...xyz",
    "platform": "ios"
  }
}
```

**Deduction Transaction:**
```json
{
  "transactionId": "txn_002",
  "userId": "abc123xyz",
  "type": "deduction",
  "amount_seconds": -15,
  "balance_before": 345,
  "balance_after": 330,
  "product_id": null,
  "call_session_id": "xyz789abc",
  "timestamp": "2026-02-04T14:15:15Z",
  "metadata": {
    "heartbeat_count": 3,
    "deduction_reason": "call_active"
  }
}
```

**Reset Transaction:**
```json
{
  "transactionId": "txn_003",
  "userId": "abc123xyz",
  "type": "reset",
  "amount_seconds": 60,
  "balance_before": 0,
  "balance_after": 60,
  "product_id": null,
  "call_session_id": null,
  "timestamp": "2026-02-10T00:00:00Z",
  "metadata": {
    "subscription_tier": "weekly",
    "reset_reason": "scheduled",
    "reset_day": "Monday"
  }
}
```

### Transaction Types

| Type | Description | Amount Sign |
|------|-------------|-------------|
| `purchase` | User bought credit pack via IAP | Positive |
| `subscription` | Credits added from new subscription | Positive |
| `reset` | Weekly/yearly credit reset | Positive |
| `deduction` | Credits used during call | Negative |
| `refund` | Credits refunded (e.g., cancelled purchase) | Positive |

### Security Rules

- ✅ Users can **read** their own transactions
- ❌ Users **cannot create/update/delete** transactions (backend only)

---

## Indexes

For optimal query performance, create these composite indexes:

### Index 1: Call Sessions by User
```
Collection: call_sessions
Fields: userId (Ascending), start_time (Descending)
```

### Index 2: Transactions by User
```
Collection: credit_transactions
Fields: userId (Ascending), timestamp (Descending)
```

### Creating Indexes

You can create these indexes via:
1. **Firebase Console** → Firestore Database → Indexes
2. **firestore.indexes.json** (automatic on first query)
3. **Firebase CLI**: `firebase deploy --only firestore:indexes`

---

## Credit Deduction Logic

### Heartbeat System (Backend)

```
Every 5 seconds during active call:
1. Check user's current balance
2. If balance >= 5 seconds:
   - Deduct 5 seconds from voice_balance_seconds
   - Create transaction record
   - Continue call
3. If balance < 5 seconds:
   - Deduct remaining balance (e.g., 2 seconds)
   - Create final transaction
   - Close WebSocket connection
   - End call session with reason: 'out_of_credits'
```

### Example Timeline

```
00:00 - Call starts, balance: 60s
00:05 - Heartbeat 1, deduct 5s, balance: 55s
00:10 - Heartbeat 2, deduct 5s, balance: 50s
00:15 - Heartbeat 3, deduct 5s, balance: 45s
...
00:55 - Heartbeat 11, deduct 5s, balance: 5s
01:00 - Heartbeat 12, balance < 5s
      → Deduct remaining 5s, balance: 0s
      → CALL AUTO-TERMINATED
      → Show "Out of Minutes" popup
```

---

## Subscription Reset Logic

### Weekly Reset (Every Monday, 00:00 UTC)

Cloud Function runs:
```typescript
// Find all users with subscription_tier = 'weekly'
// For each user:
//   - Set voice_balance_seconds = 60
//   - Update last_reset_date = now()
//   - Create 'reset' transaction
```

### Yearly Reset (Daily Check)

Cloud Function runs:
```typescript
// Find all users with subscription_tier = 'yearly'
// For each user:
//   - Check if 365 days passed since subscription_start_date
//   - If yes:
//     - Set voice_balance_seconds = 3000
//     - Update last_reset_date = now()
//     - Update subscription_start_date = now()
//     - Create 'reset' transaction
```

---

## Data Flow Diagram

```
┌─────────────┐
│   Client    │
│  (React     │
│   Native)   │
└──────┬──────┘
       │
       │ 1. Auth Token
       ▼
┌─────────────────┐
│  Cloud Run      │
│  WebSocket      │
│  Server         │
└─────┬─────┬─────┘
      │     │
      │     │ 2. Check Balance
      │     ▼
      │  ┌───────────┐
      │  │ Firestore │
      │  │  users/   │
      │  │  {uid}    │
      │  └─────┬─────┘
      │        │
      │        │ 3. Balance OK?
      │        ▼
      │  ┌───────────┐
      │  │  Gemini   │
      │  │   2.0     │
      │  │  Flash    │
      │  └─────┬─────┘
      │        │
      │        │ 4. Audio Stream
      ▼        ▼
┌─────────────────┐
│ Every 5 Seconds │
│  (Heartbeat)    │
│  Deduct 5s from │
│  Firestore      │
└─────────────────┘
      │
      │ 5. Balance = 0?
      ▼
┌─────────────────┐
│ Close WebSocket │
│ End Call        │
│ Show Purchase   │
│ Popup           │
└─────────────────┘
```

---

## Best Practices

### 1. **Always Use Transactions for Critical Updates**
```typescript
// Bad (race condition)
const balance = await getBalance(userId);
await setBalance(userId, balance - 5);

// Good (atomic)
await updateDoc(userRef, {
  voice_balance_seconds: increment(-5)
});
```

### 2. **Log Every Credit Change**
Every addition or deduction must create a `credit_transactions` record for audit trail.

### 3. **Validate on Server**
Never trust client-side balance checks. Always verify on backend before allowing call.

### 4. **Handle Race Conditions**
If user starts multiple calls simultaneously, backend should:
- Lock the user document
- Check balance once
- Reject concurrent calls if insufficient credits

### 5. **Graceful Degradation**
If Firestore write fails during call:
- Continue call temporarily (max 30 seconds)
- Retry write operation
- If still fails, end call gracefully

---

## Deployment Checklist

- [ ] Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- [ ] Create composite indexes
- [ ] Test with Firestore Emulator locally
- [ ] Verify rules in Firebase Console (Rules Playground)
- [ ] Monitor quota usage (especially document reads/writes)
- [ ] Set up Firebase Budget Alerts (Safety & Security)

---

## Cost Estimates

### Firestore Pricing (as of 2026)

| Operation | Cost | Estimated Monthly Usage | Estimated Cost |
|-----------|------|-------------------------|----------------|
| Document Reads | $0.06 / 100K | 500K reads (5K calls × 100 checks) | $0.30 |
| Document Writes | $0.18 / 100K | 100K writes (5K calls × 20 deductions) | $0.18 |
| Document Deletes | $0.02 / 100K | 0 (no deletes) | $0.00 |
| Storage | $0.18 / GB | 0.5 GB (transactions log) | $0.09 |
| **Total** | | | **~$0.57/month** |

**Note:** Costs scale linearly with user base. With 50K calls/month, expect ~$5-10/month for Firestore.

---

## Support & Troubleshooting

### Common Issues

**1. User balance not updating:**
- Check Firestore security rules
- Verify backend service account permissions
- Check for Firestore quota limits

**2. Negative balance:**
- Should never happen with proper validation
- If occurs, run Cloud Function to reset all negative balances to 0

**3. Duplicate transactions:**
- Implement idempotency keys
- Use Firestore transaction API for atomic operations

### Monitoring

Track these metrics in Firebase Console:
- Average call duration
- Credit purchase conversion rate (out-of-minutes → purchase)
- User churn after running out of credits
- Top-up product popularity

---

## Schema Version: 1.0.0
**Last Updated:** 2026-02-04
**Maintained By:** Development Team

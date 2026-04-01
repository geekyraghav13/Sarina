# Consumable Credits Setup Guide

## Overview
This feature allows users who have already purchased a subscription (weekly/yearly) to buy additional credits when they run out, creating a continuous monetization loop.

## How It Works

### User Flow
1. **User has subscription** → Gets initial credits (60s weekly / 3000s yearly)
2. **Uses credits for calls** → Credits deplete over time
3. **Credits run out** (< 10s) → "Credits" paywall appears (not subscription paywall)
4. **Buys 10 minutes for $0.99** → Gets 600 more seconds
5. **Repeat** → User can keep buying more time as needed

### Paywall Logic
- **No subscription**: Shows "Main" offering (weekly/yearly subscriptions)
- **Has subscription but credits depleted**: Shows "Credits" offering (10min for $0.99)

## RevenueCat Dashboard Setup

### Step 1: Create Product in Google Play Console

1. Go to **Google Play Console** → **Monetization** → **Products** → **In-app products**
2. Click **Create product**
3. Configure:
   - **Product ID**: `voice_credits_10min`
   - **Name**: "10 Minutes Voice Credits"
   - **Description**: "Get 10 more minutes of voice calling with your AI companion"
   - **Price**: $0.99 USD
   - **Product type**: **Consumable** (IMPORTANT!)
4. **Activate** the product

### Step 2: Create Product in RevenueCat

1. Go to **RevenueCat Dashboard** → **Products**
2. Click **+ New**
3. Configure:
   - **Store**: Google Play Store (Android)
   - **Product Identifier**: `voice_credits_10min` (must match Google Play)
   - **Product Type**: **Consumable**
   - **Display Name**: "10 Minutes"
   - Click **Save**

### Step 3: Create "Credits" Offering

1. Go to **RevenueCat Dashboard** → **Offerings**
2. Click **+ New Offering**
3. Configure:
   - **Identifier**: `Credits` (IMPORTANT - must match code)
   - **Description**: "Buy More Voice Credits"
   - **Metadata**:
     - `title`: "Out of Credits?"
     - `subtitle`: "Get more time with your AI companion"
   - Click **Save**

4. **Add Product to Offering**:
   - Click on the "Credits" offering
   - Click **+ Add Package**
   - Configure:
     - **Identifier**: `ten_minutes`
     - **Package Type**: **Custom**
     - **Product**: Select `voice_credits_10min`
   - Click **Save**

### Step 4: Configure Paywall UI (Optional)

1. Go to **RevenueCat Dashboard** → **Paywalls**
2. Click **+ New Paywall**
3. Select **Offering**: `Credits`
4. Customize:
   - **Header**: "Need More Time?"
   - **Body**: "Keep talking to your AI companion"
   - **CTA Button**: "Buy 10 Minutes - $0.99"
   - **Color Scheme**: Match your app theme
5. **Publish** the paywall

## Code Implementation

### Files Modified

#### 1. `app/screens/NewPaywallScreen.tsx`

**Added logic to show different paywalls**:
```typescript
// Check if user has an active subscription
const isPremium = await RevenueCatService.checkPremiumStatus();

// Show different paywall based on subscription status
if (isPremium) {
  // User has subscription but ran out of credits - show credits paywall
  presentRevenueCatPaywall('Credits');
} else {
  // User has no subscription - show main subscription paywall
  presentRevenueCatPaywall('Main');
}
```

**Updated paywall presentation**:
```typescript
const presentRevenueCatPaywall = async (offeringType: 'Main' | 'Credits' = 'Main') => {
  let paywallOptions;

  if (offeringType === 'Credits') {
    paywallOptions = {
      offering: 'Credits', // Must match RevenueCat offering identifier
    };
  } else {
    paywallOptions = {
      requiredEntitlementIdentifier: 'premium',
    };
  }

  const result = await RevenueCatUI.presentPaywall(paywallOptions);
  // ...
}
```

#### 2. `app/services/revenueCatService.ts`

**Added consumable purchase handler**:
```typescript
export const syncConsumablePurchaseToFirestore = async (customerInfo: CustomerInfo): Promise<void> => {
  // Get non-subscription purchases (consumables)
  const allPurchaseIds = customerInfo.nonSubscriptionTransactions || [];
  const latestPurchase = allPurchaseIds[allPurchaseIds.length - 1];

  // Determine credits (10min = 600 seconds)
  if (productId.includes('10min') || productId.includes('10_min')) {
    creditsToAdd = 600;
  }

  // Add credits to Firestore
  await updateDoc(userDocRef, {
    voice_balance_seconds: currentBalance + creditsToAdd,
    last_consumable_transaction_id: transactionId,
  });

  // Log transaction
  await addDoc(collection(firestore, 'credit_transactions'), {
    userId: user.uid,
    type: 'consumable',
    amount_seconds: creditsToAdd,
    product_id: productId,
    transaction_id: transactionId,
  });
}
```

## Product ID Naming Convention

The code automatically detects credits based on product ID:

- Product IDs containing `10min` or `10_min` → 600 seconds
- You can add more tiers by updating the code:

```typescript
// In revenueCatService.ts syncConsumablePurchaseToFirestore()
if (productId.includes('10min') || productId.includes('10_min')) {
  creditsToAdd = 600; // 10 minutes
} else if (productId.includes('30min') || productId.includes('30_min')) {
  creditsToAdd = 1800; // 30 minutes
} else if (productId.includes('60min') || productId.includes('60_min')) {
  creditsToAdd = 3600; // 60 minutes
}
```

## Testing Checklist

### Before Publishing:

- [ ] Google Play product `voice_credits_10min` created and activated
- [ ] RevenueCat product `voice_credits_10min` created as **Consumable**
- [ ] RevenueCat offering `Credits` created with `voice_credits_10min`
- [ ] Paywall UI configured for "Credits" offering (optional but recommended)

### Test Flow:

1. [ ] User with **no subscription** sees Main paywall (weekly/yearly)
2. [ ] User purchases subscription → gets credits
3. [ ] User makes calls → credits deplete
4. [ ] When credits < 10s → **Credits paywall** appears (not Main paywall)
5. [ ] User purchases 10min → gets 600s added to balance
6. [ ] User can make calls immediately
7. [ ] Credits deplete → paywall appears again → loop continues

## Expected Logs

### When Credits Run Out (Premium User):
```
💰 Credit check result: { allowed: false, balance: 8, message: '...' }
⚠️ Not enough credits, showing paywall. Current balance: 8 seconds
✅ Premium status: true
🎨 Presenting RevenueCat Paywall with offering: Credits
```

### After Consumable Purchase:
```
✅ Purchase/Restore successful!
🔄 Syncing customer info to Firestore...
🛒 Processing consumable purchase: voice_credits_10min Transaction: GPA.1234...
💰 Added 600s credits for consumable purchase
✅ Firestore synced with consumable purchase
```

## Firestore Schema Updates

### `users/{userId}` document:
```typescript
{
  voice_balance_seconds: 600,  // Updated after purchase
  subscription_tier: "yearly",  // Unchanged (still premium)
  last_consumable_transaction_id: "GPA.1234...",  // Prevents duplicates
  last_consumable_purchase_date: Timestamp,
}
```

### `credit_transactions/{transactionId}` document:
```typescript
{
  userId: "yizpUhU5BaaA3BsSBpMMLIgEO5b2",
  type: "consumable",  // vs "subscription"
  amount_seconds: 600,
  product_id: "voice_credits_10min",
  transaction_id: "GPA.1234...",
  timestamp: Timestamp,
  metadata: {
    source: "revenuecat",
  },
}
```

## Troubleshooting

### Paywall shows "Main" instead of "Credits" for premium users
- Check: `await RevenueCatService.checkPremiumStatus()` returns `true`
- Check: User's `subscription_tier` in Firestore is not `"free"`

### Credits not added after purchase
- Check: Product ID includes `10min` or `10_min`
- Check: Transaction ID is different from `last_consumable_transaction_id`
- Check: Firestore rules allow creating `credit_transactions`

### "Offering not found" error
- Check: Offering identifier in RevenueCat Dashboard is exactly `Credits` (case-sensitive)
- Check: Offering has at least one package with a product

## Monetization Strategy

### Recommended Pricing:
- **Weekly subscription**: $2.99 (60 seconds) → $0.05/second
- **Yearly subscription**: $12.99 (3000 seconds) → $0.004/second (best value)
- **10 min credit pack**: $0.99 (600 seconds) → $0.0016/second

This creates a **value ladder**:
1. Free users → encouraged to subscribe
2. Subscribers → run out of monthly credits
3. Heavy users → buy credit packs to continue
4. Very heavy users → upgrade from weekly to yearly

## Next Steps

After you complete the RevenueCat Dashboard setup, test the flow end-to-end and I can help debug any issues!

# 💳 Subscription Setup Guide - Sarina App

**Last Updated:** February 1, 2026

---

## 📊 Pricing Plan

| Plan | Price (INR) | Price (USD equivalent) | Duration |
|------|-------------|------------------------|----------|
| Weekly | ₹299 | ~$3.59 | 7 days |
| Yearly | ₹1,299 | ~$15.59 | 365 days |

---

## Part 1: iOS Subscription Setup (App Store Connect)

### Step 1: Enable In-App Purchases

1. **Go to App Store Connect:**
   - URL: https://appstoreconnect.apple.com/apps/6758547730
   - Login with: geekyraghav13@gmail.com

2. **Navigate to In-App Purchases:**
   - Click on your app "Sarina"
   - Go to "Monetization" → "Subscriptions"
   - Click "+" to create a new subscription group

### Step 2: Create Subscription Group

1. **Create Subscription Group:**
   - Name: "Sarina Premium"
   - Reference Name: "sarina_premium_group"

2. **Click "Create"**

### Step 3: Add Subscription Products

#### Weekly Subscription

1. **Click "+ Create Subscription"**
2. **Fill in details:**
   - **Reference Name:** Sarina Premium Weekly
   - **Product ID:** `com.sarina.app.weekly` (IMPORTANT: Save this!)
   - **Subscription Duration:** 7 Days (1 Week)

3. **Subscription Prices:**
   - Click "Add Pricing"
   - **Country/Region:** India
   - **Price:** ₹299 INR
   - Add other regions (App Store will auto-convert):
     - United States: $3.99 (Apple's closest tier)
     - Europe: €3.99
     - UK: £3.99
   - Click "Next"

4. **Localizations:**
   - **Language:** English (U.S.)
   - **Subscription Display Name:** Premium Weekly
   - **Description:** Unlock unlimited AI conversations, all girlfriend characters, and voice messages for one week.
   - Click "Save"

#### Yearly Subscription

1. **Click "+ Create Subscription"** (in the same group)
2. **Fill in details:**
   - **Reference Name:** Sarina Premium Yearly
   - **Product ID:** `com.sarina.app.yearly` (IMPORTANT: Save this!)
   - **Subscription Duration:** 1 Year (365 Days)

3. **Subscription Prices:**
   - Click "Add Pricing"
   - **Country/Region:** India
   - **Price:** ₹1,299 INR
   - Add other regions:
     - United States: $14.99 or $15.99
     - Europe: €14.99
     - UK: £14.99
   - Click "Next"

4. **Localizations:**
   - **Language:** English (U.S.)
   - **Subscription Display Name:** Premium Yearly
   - **Description:** Unlock unlimited AI conversations, all girlfriend characters, and voice messages for one full year. Best value!
   - Click "Save"

### Step 4: Set Up Free Trial (Optional)

For each subscription:
1. Edit the subscription
2. Go to "Subscription Prices"
3. Under "Introductory Offers", click "Set Up Offer"
4. Choose:
   - **Offer Type:** Free Trial
   - **Duration:** 3 days (recommended) or 7 days
5. Save

### Step 5: Submit for Review

1. **Return to Subscription Group**
2. **Click "Submit for Review"**
3. **Upload Screenshot** (showing subscription benefits in your app)
4. **Review Notes:** Explain how users benefit from subscription
5. **Submit**

---

## Part 2: Install In-App Purchase Library

### Option 1: expo-in-app-purchases (Recommended for Expo)

```bash
cd "/home/raghav/Vibe COded Apps/sarina"
npx expo install expo-in-app-purchases
```

### Option 2: react-native-iap (Alternative)

```bash
npm install react-native-iap --save
```

For this guide, we'll use **expo-in-app-purchases** since you're using Expo.

---

## Part 3: Code Implementation

### Create Subscription Service

Create file: `app/services/subscriptionService.ts`

```typescript
import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Product IDs (MUST match App Store Connect)
export const SUBSCRIPTION_IDS = {
  WEEKLY: 'com.sarina.app.weekly',
  YEARLY: 'com.sarina.app.yearly',
};

export interface Subscription {
  productId: string;
  price: string;
  localizedPrice: string;
  title: string;
  description: string;
}

// Initialize In-App Purchases
export const initializeIAP = async (): Promise<boolean> => {
  try {
    await InAppPurchases.connectAsync();
    console.log('✅ IAP Connected');
    return true;
  } catch (error) {
    console.error('❌ IAP Connection Error:', error);
    return false;
  }
};

// Disconnect when app closes
export const disconnectIAP = async () => {
  await InAppPurchases.disconnectAsync();
};

// Get available subscriptions
export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { results } = await InAppPurchases.getProductsAsync([
      SUBSCRIPTION_IDS.WEEKLY,
      SUBSCRIPTION_IDS.YEARLY,
    ]);

    return results.map(product => ({
      productId: product.productId,
      price: product.price,
      localizedPrice: product.priceString || product.price,
      title: product.title,
      description: product.description,
    }));
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

// Purchase subscription
export const purchaseSubscription = async (productId: string): Promise<boolean> => {
  try {
    await InAppPurchases.purchaseItemAsync(productId);
    return true;
  } catch (error) {
    console.error('Purchase error:', error);
    return false;
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const history = await InAppPurchases.getPurchaseHistoryAsync();

    // Check if user has any active subscription
    for (const purchase of history.results) {
      if (
        (purchase.productId === SUBSCRIPTION_IDS.WEEKLY ||
         purchase.productId === SUBSCRIPTION_IDS.YEARLY) &&
        purchase.acknowledged
      ) {
        // Store subscription info
        await AsyncStorage.setItem('subscription_active', 'true');
        await AsyncStorage.setItem('subscription_type', purchase.productId);
        return true;
      }
    }

    await AsyncStorage.setItem('subscription_active', 'false');
    return false;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};

// Restore purchases
export const restorePurchases = async (): Promise<boolean> => {
  try {
    const history = await InAppPurchases.getPurchaseHistoryAsync();

    if (history.results.length > 0) {
      await checkSubscriptionStatus();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Restore error:', error);
    return false;
  }
};

// Listen to purchase updates
export const setupPurchaseListener = (
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      for (const purchase of results || []) {
        if (!purchase.acknowledged) {
          // Finish transaction
          InAppPurchases.finishTransactionAsync(purchase, true);
          onSuccess();
        }
      }
    } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
      console.log('User canceled purchase');
    } else {
      onError({ responseCode, errorCode });
    }
  });
};
```

### Update Paywall Screen

Update `app/screens/NewPaywallScreen.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as SubscriptionService from '../services/subscriptionService';

export const NewPaywallScreen = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionService.Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();

    // Setup purchase listener
    SubscriptionService.setupPurchaseListener(
      () => {
        Alert.alert('Success', 'Subscription activated!');
        navigation.goBack();
      },
      (error) => {
        Alert.alert('Error', 'Purchase failed. Please try again.');
      }
    );

    return () => {
      SubscriptionService.disconnectIAP();
    };
  }, []);

  const loadSubscriptions = async () => {
    await SubscriptionService.initializeIAP();
    const subs = await SubscriptionService.getSubscriptions();
    setSubscriptions(subs);
    setLoading(false);
  };

  const handlePurchase = async (productId: string) => {
    setPurchasing(true);
    setSelectedPlan(productId);

    const success = await SubscriptionService.purchaseSubscription(productId);

    if (!success) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
    }

    setPurchasing(false);
  };

  const handleRestore = async () => {
    setLoading(true);
    const restored = await SubscriptionService.restorePurchases();

    if (restored) {
      Alert.alert('Success', 'Purchases restored!');
      navigation.goBack();
    } else {
      Alert.alert('No Purchases', 'No previous purchases found.');
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Choose Your Plan
      </Text>

      {subscriptions.map((sub) => (
        <TouchableOpacity
          key={sub.productId}
          onPress={() => handlePurchase(sub.productId)}
          disabled={purchasing}
          style={{
            padding: 20,
            backgroundColor: '#6c47ff',
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            {sub.title}
          </Text>
          <Text style={{ color: 'white', marginTop: 8 }}>
            {sub.description}
          </Text>
          <Text style={{ color: 'white', marginTop: 12, fontSize: 24, fontWeight: 'bold' }}>
            {sub.localizedPrice}
          </Text>

          {purchasing && selectedPlan === sub.productId && (
            <ActivityIndicator color="white" style={{ marginTop: 8 }} />
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={handleRestore}
        style={{ padding: 16, alignItems: 'center', marginTop: 20 }}
      >
        <Text style={{ color: '#6c47ff', fontSize: 16 }}>
          Restore Purchases
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Update App.tsx to Initialize IAP

```typescript
import * as SubscriptionService from './app/services/subscriptionService';

// In your App component's useEffect:
useEffect(() => {
  // Initialize subscription service
  SubscriptionService.initializeIAP();

  // Check subscription status on app start
  SubscriptionService.checkSubscriptionStatus();
}, []);
```

---

## Part 4: Testing Subscriptions

### Create Sandbox Test Account

1. **Go to App Store Connect**
2. **Navigate to:** Users and Access → Sandbox Testers
3. **Click "+" to add tester**
4. **Fill in:**
   - Email: test@yourdomain.com (use a real email you control)
   - Password: (strong password)
   - Country: India
5. **Save**

### Test on Real Device

1. **Sign out of App Store:**
   - Settings → App Store → Sign Out

2. **Install TestFlight build**

3. **Make test purchase:**
   - App will prompt for Apple ID
   - Use sandbox test account
   - Purchase will be FREE (sandbox mode)

4. **Verify subscription works:**
   - Check that features unlock
   - Test "Restore Purchases"

---

## Part 5: Android Setup (Google Play Console)

### Step 1: Create Subscription Products

1. **Go to Google Play Console:**
   - https://play.google.com/console

2. **Navigate to:**
   - Your App → Monetize → Subscriptions

3. **Create Weekly Subscription:**
   - **Product ID:** `com.sarina.app.weekly` (MUST match iOS!)
   - **Name:** Premium Weekly
   - **Description:** Unlock all features for one week
   - **Price:** ₹299 INR
   - **Billing Period:** Weekly

4. **Create Yearly Subscription:**
   - **Product ID:** `com.sarina.app.yearly` (MUST match iOS!)
   - **Name:** Premium Yearly
   - **Description:** Unlock all features for one year
   - **Price:** ₹1,299 INR
   - **Billing Period:** Yearly

### Step 2: Add Android Permissions

Update `app.json`:

```json
{
  "android": {
    "permissions": [
      "com.android.vending.BILLING"
    ]
  }
}
```

---

## Part 6: Important Notes

### Product IDs MUST Match

```typescript
// iOS: com.sarina.app.weekly
// Android: com.sarina.app.weekly
// ✅ Same product ID works across platforms
```

### Testing Checklist

- [ ] Subscriptions created in App Store Connect
- [ ] Product IDs added to code
- [ ] expo-in-app-purchases installed
- [ ] Sandbox test account created
- [ ] Test purchase on real device
- [ ] Test restore purchases
- [ ] Test subscription expiration
- [ ] Test upgrade/downgrade between plans
- [ ] Android subscriptions created (when ready)

### Common Issues

**Issue:** "Product not found"
- **Solution:** Wait 2-4 hours after creating products in App Store Connect

**Issue:** "Cannot connect to iTunes Store"
- **Solution:** Check internet connection, restart device

**Issue:** "Purchase failed"
- **Solution:** Use sandbox test account, sign out of real App Store account

---

## Part 7: Revenue & Reporting

### App Store Connect Revenue

1. **View Sales:**
   - App Store Connect → Sales and Trends
   - Filter by: In-App Purchases
   - Export reports

2. **Apple's Cut:**
   - Year 1: Apple takes 30%
   - Year 2+: Apple takes 15% (for retained subscribers)

### Example Revenue (Indian Pricing)

| Plan | Your Price | Apple's Cut (30%) | You Receive |
|------|-----------|-------------------|-------------|
| Weekly | ₹299 | ₹90 | ₹209 |
| Yearly | ₹1,299 | ₹390 | ₹909 |

### Tax Information

- Ensure tax forms are filled in App Store Connect
- Go to: Agreements, Tax, and Banking
- Add banking information for payouts

---

## Next Steps

1. ✅ **Create subscriptions in App Store Connect** (do this first!)
2. ✅ **Install expo-in-app-purchases package**
3. ✅ **Implement code above**
4. ✅ **Create sandbox test account**
5. ✅ **Test on TestFlight build**
6. ✅ **Submit app for review with subscriptions**

---

**IMPORTANT:** Subscriptions must be approved by Apple before going live. This can take 1-3 days during app review.

---

For questions or issues, refer to:
- Apple Documentation: https://developer.apple.com/in-app-purchase/
- Expo IAP Docs: https://docs.expo.dev/versions/latest/sdk/in-app-purchases/

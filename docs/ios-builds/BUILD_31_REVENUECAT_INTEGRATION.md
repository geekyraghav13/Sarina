# Build 31 - RevenueCat Integration

**Build Number:** 31
**Version:** 1.4.8
**Date:** March 26, 2026
**Platform:** iOS
**Status:** 🚀 In Progress on EAS

---

## 🎯 Major Changes

### **RevenueCat Paywall Integration**

This build replaces the native `react-native-iap` implementation with **RevenueCat SDK** for subscription management.

---

## 📦 What's New

### **1. RevenueCat SDK Integration**

- **Package Added:** `react-native-purchases`
- **API Key:** `appl_cGMSHwaYbbRwdhOiEgBPbOPykYP`
- **Offering:** "Main" (configured in RevenueCat Dashboard)
- **Packages:**
  - `$rc_weekly` → `com.sarina.app.weekly` (₹299)
  - `$rc_annual` → `com.sarina.app.yearly` (₹1,299)

### **2. New Services**

#### **RevenueCat Service** (`app/services/revenueCatService.ts`)
- `initializeRevenueCat()` - SDK initialization
- `getOfferings()` - Fetch paywall offerings
- `purchasePackage()` - Handle purchases
- `restorePurchases()` - Restore subscriptions
- `checkPremiumStatus()` - Verify subscription status
- `syncCustomerInfoToFirestore()` - Sync to Firestore with duplicate prevention

#### **RevenueCat Webhook Handler** (`backend/revenueCatWebhook.js`)
- Handles server-side webhook events
- Processes: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`
- Updates Firestore automatically
- Prevents duplicate credit grants

### **3. Modified Files**

| File | Changes |
|------|---------|
| `app/screens/NewPaywallScreen.tsx` | Complete rewrite to use RevenueCat's `PaywallView` component |
| `App.tsx` | Added RevenueCat initialization on app launch |
| `app/services/authService.ts` | Integrated RevenueCat login/logout with authentication |
| `backend/server.js` | Added `/api/revenuecat-webhook` endpoint |
| `package.json` | Added `react-native-purchases` dependency |

---

## 🔒 Backend Integration

### **Webhook Endpoint**
```
POST https://sarina-voice-backend-1051121433445.us-central1.run.app/api/revenuecat-webhook
```

### **Credit Allocation**
- **Weekly:** 60 seconds (1 minute)
- **Yearly:** 3,000 seconds (50 minutes)

### **Duplicate Prevention**
- Tracks `last_transaction_id` in Firestore
- Client-side check before adding credits
- Server-side webhook validation
- Transaction logging in `credit_transactions` collection

---

## 📊 Firestore Schema Updates

### **Users Collection**
New/Updated Fields:
```javascript
{
  subscription_tier: 'free' | 'weekly' | 'yearly',
  subscription_product_id: string,
  subscription_expiration_date: Date,
  subscription_updated_at: Timestamp,
  last_transaction_id: string,  // NEW - prevents duplicate credits
  voice_balance_seconds: number
}
```

### **Credit Transactions Collection**
```javascript
{
  userId: string,
  type: 'subscription' | 'renewal' | 'deduction',
  amount_seconds: number,
  product_id: string,
  timestamp: Timestamp,
  metadata: {
    source: 'revenuecat' | 'revenuecat_webhook',
    subscriptionTier: string,
    originalTransactionId: string
  }
}
```

---

## 🔄 Purchase Flow

### **Client-Side Flow**
```
1. User taps "Continue" on paywall
2. RevenueCat.purchasePackage(package)
3. Apple processes payment
4. RevenueCat validates receipt
5. Returns customerInfo
6. syncCustomerInfoToFirestore(customerInfo, isNewPurchase=true)
   - Checks if transaction already processed
   - Adds credits if new
   - Updates subscription_tier
   - Logs to credit_transactions
7. Updates local state (usePaymentStore)
8. Shows success alert
9. Navigates to home
```

### **Server-Side Webhook Flow**
```
1. RevenueCat server detects purchase
2. Sends webhook to /api/revenuecat-webhook
3. Backend validates event
4. Processes based on event type:
   - INITIAL_PURCHASE: Add credits
   - RENEWAL: Add renewal credits
   - CANCELLATION: Mark as cancelled
   - EXPIRATION: Downgrade to free
5. Updates Firestore
6. Logs transaction
```

---

## 🎨 UI Changes

### **Paywall Screen**
- Now uses RevenueCat's `PaywallView` component
- Displays custom paywall design from RevenueCat Dashboard
- Automatic price localization
- Built-in restore purchases UI

### **Purchase Callbacks**
- `onPurchaseCompleted` - Handle successful purchase
- `onPurchaseCancelled` - Handle user cancellation
- `onRestoreCompleted` - Handle restore success
- `onRestoreFailed` - Handle restore errors

---

## 🧪 Testing Requirements

### **Before Testing**
1. **RevenueCat Dashboard Setup:**
   - Create entitlement: "premium"
   - Attach products: `com.sarina.app.weekly`, `com.sarina.app.yearly`
   - Configure webhook URL

2. **Sandbox Test Account:**
   - Create in App Store Connect
   - Sign out of real Apple ID on device
   - Don't sign in until purchase prompt

### **Test Checklist**
- [ ] Fresh install from TestFlight
- [ ] Paywall displays RevenueCat design
- [ ] Purchase weekly subscription (sandbox)
- [ ] Credits added to Firestore (60 seconds)
- [ ] Voice call works after purchase
- [ ] Credits deduct during call (5s every 5s)
- [ ] Call auto-disconnects at 0 balance
- [ ] Restore purchases works
- [ ] No duplicate credits on restore

---

## 🔧 Configuration Files

### **app.json**
```json
{
  "expo": {
    "version": "1.4.8",
    "ios": {
      "buildNumber": "31",
      "bundleIdentifier": "com.sarina.app"
    }
  }
}
```

### **RevenueCat Configuration**
```typescript
// app/services/revenueCatService.ts
const REVENUECAT_API_KEYS = {
  ios: 'appl_cGMSHwaYbbRwdhOiEgBPbOPykYP',
  android: 'appl_cGMSHwaYbbRwdhOiEgBPbOPykYP'
};
```

---

## 📝 Migration Notes

### **From react-native-iap to RevenueCat**

**Removed:**
- Direct StoreKit/Play Billing integration
- Manual receipt validation logic
- Custom purchase state management

**Benefits:**
- Automatic receipt validation
- Server-side webhook events
- Cross-platform subscription management
- Built-in paywall UI
- Automatic price localization
- Trial management support
- Real-time subscription status

**Preserved:**
- Same credit allocation (60s weekly, 3000s yearly)
- Same Firestore structure
- Same backend webhook integration
- Same voice calling flow

---

## 🚨 Known Issues / Considerations

### **Build Number Auto-Increment**
- EAS automatically bumped from 30 to 31
- `app.json` updated automatically

### **Sandbox Testing**
- Renewals happen every 5 minutes (not weekly)
- Max 6 renewals before auto-cancellation
- Purchases are free in sandbox

### **Production Webhook**
- Must configure webhook URL in RevenueCat Dashboard
- Optional: Add `REVENUECAT_WEBHOOK_SECRET` for security

---

## 🔗 Related Documentation

- [RevenueCat iOS SDK](https://www.revenuecat.com/docs/getting-started/installation/ios)
- [Webhook Events](https://www.revenuecat.com/docs/webhooks)
- [App Store Sandbox Testing](https://developer.apple.com/apple-pay/sandbox-testing/)

---

## 📊 Build Status

### **EAS Build**
- **Build ID:** `a533f82b-44b8-46f6-8cb2-c3880d415d33`
- **Build URL:** https://expo.dev/accounts/8284/projects/sarina/builds/a533f82b-44b8-46f6-8cb2-c3880d415d33
- **Status:** Building on EAS servers
- **Estimated Time:** 15-20 minutes

### **Distribution**
- **Method:** App Store Connect
- **Track:** Production
- **Certificate:** Valid until Dec 21, 2026
- **Provisioning Profile:** Active (5DDVWHC3RY)

---

## ✅ Pre-Submission Checklist

Before submitting to App Store Connect:

- [x] Build number incremented (29 → 31)
- [x] RevenueCat SDK integrated
- [x] Paywall screen updated
- [x] Backend webhook endpoint added
- [x] Duplicate credit prevention implemented
- [x] Authentication integrated with RevenueCat
- [x] Transaction logging in place
- [ ] RevenueCat entitlement "premium" created
- [ ] Webhook URL configured in RevenueCat
- [ ] Sandbox testing completed
- [ ] All test checklist items passed

---

## 🎯 Next Steps

1. **Wait for EAS build to complete** (~15-20 mins)
2. **Download IPA** from EAS dashboard
3. **Upload to App Store Connect** via Transporter or `eas submit`
4. **Configure RevenueCat Dashboard:**
   - Create entitlement "premium"
   - Add webhook URL
   - Test webhook delivery
5. **Submit for TestFlight beta testing**
6. **Run through complete test checklist**
7. **Submit for App Store review**

---

**Built by:** Claude Code
**Build Date:** March 26, 2026
**EAS CLI Version:** 17.x
**Expo SDK:** 54.0.33

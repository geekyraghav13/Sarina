# Google Cloud Service Account Setup for RevenueCat

**Purpose**: Create a service account JSON file to connect RevenueCat to Google Play Console
**Time Required**: 10-15 minutes

---

## 📋 What You're Creating

A **Service Account** is like a special "robot user" that RevenueCat can use to:
- Read subscription data from Google Play
- Verify purchases
- Get real-time subscription updates
- Access product information

You'll create this account and download a JSON file with credentials.

---

## 🚀 Step-by-Step Guide

### Step 1: Access Google Cloud Console

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com

2. **Select Your Project**
   - Click the project dropdown at the top
   - Select: **"sarina-ai-2b2c1"** (your Firebase project)
   - If you don't see it, make sure you're logged in with the correct Google account

### Step 2: Enable Google Play Developer API

**IMPORTANT**: This API must be enabled first!

1. **Navigate to APIs & Services**
   - Left sidebar → Click **"APIs & Services"** → **"Library"**
   - Or direct link: https://console.cloud.google.com/apis/library

2. **Search for Google Play API**
   - In the search box, type: `Google Play Android Developer API`
   - Click on **"Google Play Android Developer API"**

3. **Enable the API**
   - Click the **"Enable"** button
   - Wait for it to activate (takes a few seconds)
   - You should see "API enabled" message

### Step 3: Create Service Account

1. **Navigate to Service Accounts**
   - Left sidebar → **"IAM & Admin"** → **"Service Accounts"**
   - Or direct link: https://console.cloud.google.com/iam-admin/serviceaccounts

2. **Create Service Account**
   - Click **"+ CREATE SERVICE ACCOUNT"** button at the top

3. **Fill in Service Account Details**

   **Service account name**: `revenuecat-play-console`

   **Service account ID**: (auto-filled, should be `revenuecat-play-console`)

   **Description**: `Service account for RevenueCat to access Google Play subscriptions`

4. **Click "CREATE AND CONTINUE"**

5. **Grant Access (Optional Step)**
   - You can skip this step by clicking **"CONTINUE"**
   - Or select role: **"Service Account User"** (optional)

6. **Grant Users Access (Optional Step)**
   - Skip this by clicking **"DONE"**

### Step 4: Create and Download JSON Key

Now you need to create a key for this service account.

1. **Find Your Service Account**
   - You should see your new service account: `revenuecat-play-console@sarina-ai-2b2c1.iam.gserviceaccount.com`
   - If not, refresh the page

2. **Open Service Account Details**
   - Click on the service account email

3. **Go to Keys Tab**
   - Click the **"KEYS"** tab at the top

4. **Add Key**
   - Click **"ADD KEY"** dropdown
   - Select **"Create new key"**

5. **Choose Key Type**
   - Select **"JSON"** (should be selected by default)
   - Click **"CREATE"**

6. **Download the JSON File**
   - A file will automatically download to your computer
   - Filename will be something like: `sarina-ai-2b2c1-abc123def456.json`
   - **SAVE THIS FILE SECURELY** - it contains sensitive credentials

**⚠️ IMPORTANT**:
- This JSON file is like a password - keep it safe!
- Don't commit it to Git
- Don't share it publicly

### Step 5: Note the Service Account Email

You'll need this email for the next step.

**Service Account Email**:
```
revenuecat-play-console@sarina-ai-2b2c1.iam.gserviceaccount.com
```

Copy this email - you'll use it in Play Console next.

---

## 🎮 Step 6: Grant Access in Google Play Console

Now you need to give this service account permission to access your Play Console.

1. **Go to Play Console**
   - URL: https://play.google.com/console

2. **Go to Users and Permissions**
   - Left sidebar → **"Users and permissions"**
   - Or: Settings (gear icon) → **"Users and permissions"**

3. **Invite New User**
   - Click **"Invite new users"** button

4. **Enter Service Account Email**
   - Email address: `revenuecat-play-console@sarina-ai-2b2c1.iam.gserviceaccount.com`
   - (The email you copied from Step 5)

5. **Set Permissions**

   You need to grant these permissions:

   **Account permissions**:
   - ☑️ **View app information and download bulk reports (read-only)**
   - ☑️ **View financial data, orders, and cancellation survey responses**
   - ☑️ **Manage orders and subscriptions**

   **App access**:
   - Select **"Katrina"** app (or grant access to all apps)

6. **Send Invitation**
   - Click **"Invite user"** button
   - The service account will be immediately active (no email confirmation needed)

---

## 🔗 Step 7: Connect to RevenueCat

Now you'll upload the JSON file to RevenueCat.

1. **Go to RevenueCat Dashboard**
   - URL: https://app.revenuecat.com

2. **Navigate to Your Project**
   - Select your project (Sarina or whatever it's called)

3. **Go to App Settings**
   - Click on your app (or create Android app if you haven't)
   - Go to app settings

4. **Configure Google Play**
   - Find **"Google Play"** section
   - Or: Go to **"Service credentials"**

5. **Upload Service Account JSON**
   - Look for **"Upload service account JSON"** button
   - Click it and select the JSON file you downloaded in Step 4
   - Upload the file

6. **Verify Connection**
   - RevenueCat will test the connection
   - You should see: ✅ "Connected to Google Play"
   - If there's an error, check:
     - JSON file is correct
     - Service account has permissions in Play Console
     - Google Play API is enabled

---

## ✅ Verification Checklist

Before proceeding, verify:

- [ ] Google Cloud Console project: `sarina-ai-2b2c1` selected
- [ ] Google Play Android Developer API enabled
- [ ] Service account created: `revenuecat-play-console@sarina-ai-2b2c1.iam.gserviceaccount.com`
- [ ] JSON key downloaded and saved securely
- [ ] Service account added to Play Console with correct permissions
- [ ] JSON file uploaded to RevenueCat
- [ ] RevenueCat shows "Connected to Google Play"

---

## 🔍 What's in the JSON File?

The JSON file contains these fields (example):

```json
{
  "type": "service_account",
  "project_id": "sarina-ai-2b2c1",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "revenuecat-play-console@sarina-ai-2b2c1.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Never share or commit this file!**

---

## 🚨 Troubleshooting

### Error: "API not enabled"

**Problem**: Google Play Android Developer API not enabled

**Fix**:
1. Go to: https://console.cloud.google.com/apis/library
2. Search: "Google Play Android Developer API"
3. Click "Enable"

### Error: "Permission denied" in RevenueCat

**Problem**: Service account doesn't have permissions in Play Console

**Fix**:
1. Go to Play Console → Users and permissions
2. Find: `revenuecat-play-console@sarina-ai-2b2c1.iam.gserviceaccount.com`
3. Check permissions:
   - View app information ✅
   - View financial data ✅
   - Manage orders and subscriptions ✅

### Error: "Invalid JSON format"

**Problem**: Wrong file uploaded or file corrupted

**Fix**:
1. Re-download JSON from Google Cloud Console
2. Make sure it's the JSON file (not the service account page HTML)
3. Upload again to RevenueCat

### Can't Find Service Account in Play Console

**Problem**: Service account not added to Play Console

**Fix**:
1. Play Console → Users and permissions
2. Invite new user
3. Use email: `revenuecat-play-console@sarina-ai-2b2c1.iam.gserviceaccount.com`
4. Grant permissions

---

## 📞 Quick Reference

### Key URLs

- **Google Cloud Console**: https://console.cloud.google.com
- **Service Accounts**: https://console.cloud.google.com/iam-admin/serviceaccounts
- **APIs Library**: https://console.cloud.google.com/apis/library
- **Play Console**: https://play.google.com/console
- **RevenueCat**: https://app.revenuecat.com

### Key Information

- **Project ID**: `sarina-ai-2b2c1`
- **Service Account Name**: `revenuecat-play-console`
- **Service Account Email**: `revenuecat-play-console@sarina-ai-2b2c1.iam.gserviceaccount.com`

---

## 🎯 What's Next?

After completing this guide:

1. ✅ JSON file downloaded
2. ✅ Service account has Play Console access
3. ✅ RevenueCat connected to Google Play

**Next steps**:
- Create subscription products in Play Console
- Configure products in RevenueCat
- Create offerings in RevenueCat
- Build and test the app

---

## 🔐 Security Best Practices

### DO:
- ✅ Store JSON file in a secure location
- ✅ Use a password manager for sensitive files
- ✅ Restrict service account to minimum required permissions
- ✅ Regularly review service account access

### DON'T:
- ❌ Commit JSON file to Git
- ❌ Share JSON file publicly
- ❌ Email JSON file unencrypted
- ❌ Store in shared drives without encryption

---

**File Location**: Save your downloaded JSON file to:
```
/home/raghav/Downloads/sarina-revenuecat-service-account.json
```

**Then**: Upload to RevenueCat (don't commit to Git!)

---

**Questions?** Follow the steps carefully and let me know if you get stuck at any point!

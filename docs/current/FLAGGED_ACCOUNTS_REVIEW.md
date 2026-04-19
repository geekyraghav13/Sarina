# Flagged Accounts Review Guide

This guide covers how to review and manage accounts flagged by the crash recovery system.

## Overview

When the reconciliation Cloud Function (`reconcileCrashedCalls`) finds a crashed call for a user with zero balance, it flags the account for manual review instead of leaving negative balance.

**What gets flagged:**
- User had an active call that crashed
- User's balance is 0 seconds at reconciliation time
- System cannot deduct credits (would result in negative balance)

**Flag details stored:**
- `flagged_for_review: true`
- `flagged_reason: "Crashed call with zero balance: XXs unpaid"`
- `flagged_at: timestamp`

---

## Review Methods

You have 3 ways to review flagged accounts:

### 1. Web Dashboard (Easiest)

**Setup:**
1. Deploy the review dashboard Cloud Function:
   ```bash
   cd "/home/raghav/Vibe COded Apps/sarina"
   firebase deploy --only functions:reviewDashboard
   ```

2. Access the dashboard:
   ```
   https://us-central1-sarina-ai-2b2c1.cloudfunctions.net/reviewDashboard
   ```

**Features:**
- View all flagged accounts in one page
- Statistics dashboard (total flagged, zero balance, premium users, unpaid time)
- One-click actions:
  - **Clear** - Remove flag, no credit adjustment
  - **Clear + 5min** - Remove flag and add 300s credits as goodwill

**Best for:** Daily monitoring, quick reviews

---

### 2. CLI Script (Most Flexible)

**Setup:**
1. Make sure you have Firebase Admin SDK credentials:
   ```bash
   # Option A: Set environment variable
   export FIREBASE_SERVICE_ACCOUNT="/path/to/serviceAccountKey.json"

   # Option B: Place serviceAccountKey.json in project root
   ```

2. Run the script:
   ```bash
   cd "/home/raghav/Vibe COded Apps/sarina"
   node scripts/reviewFlaggedAccounts.js
   ```

**Available Commands:**

```bash
# List all flagged accounts
node scripts/reviewFlaggedAccounts.js list

# Show statistics
node scripts/reviewFlaggedAccounts.js stats

# Clear flag for specific user (no credits added)
node scripts/reviewFlaggedAccounts.js clear USER_ID

# Clear flag and add 300 seconds (5 minutes)
node scripts/reviewFlaggedAccounts.js clear USER_ID 300

# Interactive mode (recommended)
node scripts/reviewFlaggedAccounts.js interactive
```

**Interactive Mode:**
```
> list                          # Show all flagged accounts
> stats                         # Show statistics
> clear abc123                  # Clear flag for user abc123
> clear abc123 600              # Clear flag and add 10 minutes
> exit                          # Quit
```

**Best for:** Batch operations, automation, detailed analysis

---

### 3. Firestore Console (Direct Access)

**Access:**
1. Go to [Firestore Console](https://console.firebase.google.com/project/sarina-ai-2b2c1/firestore/data)
2. Navigate to `users` collection
3. Add filter: `flagged_for_review == true`

**Manual Actions:**
1. Click on user document
2. Review fields:
   - `flagged_reason`
   - `flagged_at`
   - `voice_balance_seconds`
   - `last_reconciliation`
3. Edit document:
   - Set `flagged_for_review: false`
   - Set `flagged_reason: null`
   - Set `flagged_at: null`
   - Optionally adjust `voice_balance_seconds`

**Best for:** One-off investigations, debugging

---

## Review Workflow

### Step 1: Daily Check (Morning)

```bash
# Quick stats check
node scripts/reviewFlaggedAccounts.js stats
```

**Expected output:**
```
Total Flagged: 3
Zero Balance: 3
Premium Users: 0
Total Unpaid Seconds: 47s (~0 minutes)

Flag Reasons:
  - Crashed call with zero balance: 15s unpaid: 1
  - Crashed call with zero balance: 22s unpaid: 1
  - Crashed call with zero balance: 10s unpaid: 1
```

### Step 2: Review Each Account

```bash
# Interactive mode
node scripts/reviewFlaggedAccounts.js interactive
```

**For each flagged account, decide:**

#### Option A: Clear Flag (No Adjustment)
- **Use when:** User likely abused system or repeatedly crashes
- **Action:** `clear USER_ID`
- **Result:** Flag removed, balance stays at 0

#### Option B: Clear + Add Credits
- **Use when:** Legitimate user, one-time issue, goodwill gesture
- **Action:** `clear USER_ID 300` (adds 5 minutes)
- **Result:** Flag removed, 5 minutes of credits added

#### Option C: Investigate Further
- **Use when:** Unclear situation, need more data
- **Action:** Check user history in Firestore, Firebase Analytics
- **Defer:** Leave flagged until investigation complete

### Step 3: Weekly Analysis

Run weekly report to identify patterns:

```bash
# Generate weekly stats
node scripts/reviewFlaggedAccounts.js stats > weekly-flagged-report-$(date +%Y%m%d).txt
```

**Look for:**
- Spike in flagged accounts (may indicate app instability)
- Repeat offenders (same users flagged multiple times)
- Premium users flagged (unexpected, investigate)

---

## Common Scenarios

### Scenario 1: Free User, First Offense, Small Amount

**Details:**
- User: free tier
- Unpaid time: <30 seconds
- First time flagged
- No pattern of abuse

**Action:**
```bash
clear USER_ID 300  # Clear flag + add 5 minutes goodwill
```

**Rationale:** Build goodwill, encourage upgrade to premium

---

### Scenario 2: Free User, Repeat Offender

**Details:**
- User: free tier
- Flagged 3+ times in past month
- Pattern of depleting credits then crashing

**Action:**
```bash
clear USER_ID  # Clear flag, no credits
```

**Rationale:** User is abusing free tier, no goodwill

---

### Scenario 3: Premium User Flagged (Unexpected)

**Details:**
- User: premium tier (should have unlimited)
- Somehow got flagged during crash

**Action:**
1. Investigate why premium user had zero balance
2. Check RevenueCat sync logs
3. Check subscription expiry
4. Clear flag and ensure unlimited credits:
   ```bash
   clear USER_ID 999999  # Clear flag + restore unlimited
   ```

**Follow-up:** File bug report, investigate premium sync issue

---

### Scenario 4: Zero Balance, Never Used App

**Details:**
- User: 0 seconds balance
- No call history
- Account created but never used

**Action:**
```bash
clear USER_ID  # Just clear flag, user never engaged
```

**Rationale:** Likely test account or abandoned signup

---

## Automation Opportunities

### Auto-Clear Low Value Flags

For unpaid time <10 seconds, auto-clear with script:

```bash
#!/bin/bash
# auto-clear-small-flags.sh

node scripts/reviewFlaggedAccounts.js list | \
  grep "unpaid" | \
  awk '{print $1, $NF}' | \
  while read userId unpaid; do
    if [ "$unpaid" -lt 10 ]; then
      echo "Auto-clearing $userId (${unpaid}s unpaid)"
      node scripts/reviewFlaggedAccounts.js clear "$userId" 300
    fi
  done
```

### Weekly Digest Email

Set up cron job to email weekly stats:

```bash
# crontab
0 9 * * MON node /path/to/scripts/reviewFlaggedAccounts.js stats | mail -s "Flagged Accounts Weekly Report" admin@example.com
```

---

## Monitoring Integration

### Firebase Analytics Events

Flagged accounts trigger these events:

- `zero_balance_flagged` - Logged when account is flagged
- `crash_recovery_triggered` - Logged when successful reconciliation

**Query in Firebase Console:**
1. Go to [Analytics Events](https://console.firebase.google.com/project/sarina-ai-2b2c1/analytics/events)
2. Filter by event name
3. View user funnels, cohorts

### Cloud Monitoring Alerts

Set up alert for excessive flagging:

```bash
/home/raghav/google-cloud-sdk/bin/gcloud alpha monitoring policies create \
  --display-name="High Flagged Account Rate" \
  --condition-threshold-value=10 \
  --condition-threshold-filter='jsonPayload.event="zero_balance_flagged"'
```

---

## Security Considerations

### Dashboard Access

The web dashboard is public by default. To restrict:

**Option 1: Firebase Hosting + Auth**
1. Deploy dashboard to Firebase Hosting
2. Add Firebase Auth login requirement
3. Restrict to admin users only

**Option 2: Cloud IAM**
1. Add IAM condition to Cloud Function:
   ```javascript
   if (!req.headers.authorization) {
     res.status(401).send('Unauthorized');
     return;
   }
   ```

**Option 3: VPC Connector** (Enterprise)
1. Deploy function to VPC
2. Restrict access to internal network
3. Use Cloud Identity-Aware Proxy

### CLI Script Security

**Never commit `serviceAccountKey.json` to git:**
```bash
# Add to .gitignore
echo "serviceAccountKey.json" >> .gitignore
```

**Use environment variable instead:**
```bash
export FIREBASE_SERVICE_ACCOUNT="/secure/path/serviceAccountKey.json"
```

---

## Troubleshooting

### Issue: Script fails with "Permission denied"

**Solution:**
```bash
chmod +x scripts/reviewFlaggedAccounts.js
```

### Issue: "User document not found"

**Cause:** User ID copied incorrectly or user was deleted

**Solution:** Double-check user ID, verify in Firestore console

### Issue: Dashboard shows 0 accounts but script shows accounts

**Cause:** Dashboard cache or firestore index delay

**Solution:** Wait 5 minutes, hard refresh browser (Ctrl+Shift+R)

### Issue: Cannot access dashboard URL

**Cause:** Function not deployed or wrong region

**Solution:**
```bash
# Redeploy function
firebase deploy --only functions:reviewDashboard

# Check function URL
firebase functions:list | grep reviewDashboard
```

---

## Best Practices

1. **Daily Monitoring**: Check flagged accounts every morning
2. **Goodwill Policy**: Clear small amounts (<30s) with credit bonus
3. **Pattern Detection**: Track repeat offenders, adjust policies
4. **Document Decisions**: Keep log of why flags were cleared
5. **Weekly Review**: Analyze trends, adjust reconciliation logic if needed
6. **Alert Fatigue**: If >20 flags/day, investigate root cause (app crashes?)

---

## Support

For issues with flagged accounts review:
- **Dashboard issues**: Check Cloud Function logs in Firebase Console
- **CLI script issues**: Run with `DEBUG=* node scripts/reviewFlaggedAccounts.js`
- **Policy questions**: Review `DEPLOYMENT_READY.md` Section 7 (Security Guarantees)


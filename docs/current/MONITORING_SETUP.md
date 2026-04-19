# Monitoring Setup Guide

This guide covers setting up Cloud Monitoring alerts and dashboards for the Sarina AI monetization system.

## Overview

The monitoring system tracks:
1. **Cloud Function health** - Reconciliation job execution and errors
2. **Call start failures** - When recordCallStart exhausts all retries
3. **Zero balance accounts** - Users flagged for review during crash recovery
4. **Crash recovery events** - Successful reconciliation of stale calls

---

## Part 1: Set Up Cloud Monitoring Alerts

### Option A: Automated Setup (Recommended)

Run the provided script to create alert policies:

```bash
cd "/home/raghav/Vibe COded Apps/sarina"
./scripts/setup-monitoring-alerts.sh
```

This creates 4 alert policies:
1. **Reconciliation Function Errors** - Alerts when error rate exceeds 5 errors/5min
2. **Call Start Record Failures** - Alerts when >10 failures in 5 minutes
3. **Zero Balance Accounts Flagged** - Alerts when >5 accounts flagged in 5 minutes
4. **Reconciliation Job Not Running** - Alerts if no executions in 10 minutes

### Option B: Manual Setup via Console

1. Go to [Cloud Monitoring](https://console.cloud.google.com/monitoring/alerting?project=sarina-ai-2b2c1)
2. Click **Create Policy**
3. Configure each alert using the filters from `scripts/setup-monitoring-alerts.sh`

---

## Part 2: Configure Notification Channels

Alerts need notification channels to send alerts. Set these up:

### Email Notifications

```bash
/home/raghav/google-cloud-sdk/bin/gcloud alpha monitoring channels create \
  --display-name="Sarina Alerts Email" \
  --type=email \
  --channel-labels=email_address=your-email@example.com \
  --project=sarina-ai-2b2c1
```

### Slack Notifications (Optional)

1. Go to [Slack Apps](https://api.slack.com/apps)
2. Create a new app for Google Cloud Monitoring
3. Add incoming webhook
4. Copy webhook URL
5. Create channel in Cloud Console:

```bash
/home/raghav/google-cloud-sdk/bin/gcloud alpha monitoring channels create \
  --display-name="Sarina Alerts Slack" \
  --type=slack \
  --channel-labels=url=YOUR_WEBHOOK_URL \
  --project=sarina-ai-2b2c1
```

### Link Notification Channels to Alerts

1. Go to [Alerting Policies](https://console.cloud.google.com/monitoring/alerting?project=sarina-ai-2b2c1)
2. Click each policy
3. Edit → Notifications → Add Channel
4. Select your email/Slack channel

---

## Part 3: Import Monitoring Dashboard

### Via Console (Recommended)

1. Go to [Dashboards](https://console.cloud.google.com/monitoring/dashboards?project=sarina-ai-2b2c1)
2. Click **Create Dashboard**
3. Click **JSON** tab
4. Paste contents of `scripts/monitoring-dashboard.json`
5. Save

### Via gcloud CLI

```bash
/home/raghav/google-cloud-sdk/bin/gcloud monitoring dashboards create \
  --config-from-file=scripts/monitoring-dashboard.json \
  --project=sarina-ai-2b2c1
```

---

## Part 4: Verify Setup

### Test Alert #1: Trigger Error Condition

Temporarily break the Cloud Function to test error alerts:

```bash
# Deploy a broken version
firebase deploy --only functions:reconcileCrashedCalls
# Wait for next scheduled run (every 5 minutes)
# Check for alert notification
```

### Test Alert #2: Check Dashboard

1. Open dashboard: [Sarina AI Dashboard](https://console.cloud.google.com/monitoring/dashboards?project=sarina-ai-2b2c1)
2. Verify all 6 charts are displaying data
3. Check for any red error lines

### Test Alert #3: Review Logs

Query structured logs for analytics events:

```bash
/home/raghav/google-cloud-sdk/bin/gcloud logging read \
  'resource.type="cloud_function" AND jsonPayload.event=~"crash_recovery_triggered|zero_balance_flagged"' \
  --limit=50 \
  --project=sarina-ai-2b2c1 \
  --format=json
```

---

## Key Metrics to Monitor

### Daily Checks

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| Reconciliation errors | <1% | Check logs, investigate cause |
| Call start failures | <1% of calls | Check network issues, retry logic |
| Zero balance flags | <5/day | Review flagged accounts |
| Crash recovery rate | <5% of calls | Investigate app crashes |

### Weekly Review

- **Total reconciliations** - Should correlate with app crash rate
- **Firestore write count** - Should be ~90% lower than before batching
- **Function execution time** - Should stay <5s per run
- **Alert noise** - Adjust thresholds if too many false positives

---

## Structured Logging Format

All analytics events use this format for easy querying:

```json
{
  "severity": "INFO|WARNING|ERROR",
  "event": "event_name",
  "user_id": "uid",
  "timestamp": "ISO8601",
  "...additional_fields": "..."
}
```

### Query Examples

**Find all crash recovery events:**
```bash
/home/raghav/google-cloud-sdk/bin/gcloud logging read \
  'jsonPayload.event="crash_recovery_triggered"' \
  --limit=100 --project=sarina-ai-2b2c1
```

**Find all zero-balance flags:**
```bash
/home/raghav/google-cloud-sdk/bin/gcloud logging read \
  'jsonPayload.event="zero_balance_flagged"' \
  --limit=100 --project=sarina-ai-2b2c1
```

**Find call start failures for a specific user:**
```bash
/home/raghav/google-cloud-sdk/bin/gcloud logging read \
  'jsonPayload.event="call_start_record_failed" AND jsonPayload.user_id="USER_ID"' \
  --limit=10 --project=sarina-ai-2b2c1
```

---

## Firebase Analytics Events (Client-Side)

The following events are logged to Firebase Analytics from the mobile app:

### Monetization Events

- `call_start_record_failed` - When recordCallStart fails after 3 retries
- `credit_deduction_batch` - Every 10s during a call
- `credits_exhausted` - When user runs out of credits mid-call
- `crash_recovery_triggered` - Logged by Cloud Function (server-side)
- `zero_balance_flagged` - Logged by Cloud Function (server-side)
- `paywall_shown` - When subscription paywall is displayed
- `subscription_purchased` - When user completes subscription purchase
- `credits_purchased` - When user buys credit bundle
- `voice_call_started` - When Vapi call begins
- `voice_call_ended` - When Vapi call ends (normal or credits exhausted)

### View Analytics in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/sarina-ai-2b2c1/analytics)
2. Navigate to **Analytics** → **Events**
3. Filter by event name (e.g., `credits_exhausted`)
4. View user funnels, conversion rates, etc.

---

## Troubleshooting

### Issue: No data in dashboard

**Solution:**
- Verify Cloud Function is deployed and running
- Check that structured logs are being written
- Wait 5-10 minutes for metrics to populate

### Issue: Too many false positive alerts

**Solution:**
- Adjust alert thresholds in Cloud Console
- Increase duration window (e.g., 5min → 10min)
- Add additional filter conditions

### Issue: Alert notifications not received

**Solution:**
- Verify notification channel is active
- Check spam folder for email notifications
- Test notification channel: Console → Monitoring → Notification Channels → Test

---

## Cost Estimate

### Cloud Monitoring Costs

- **Ingested logs**: ~50 MB/day = $0.25/day
- **Stored logs**: ~1.5 GB/month = $0.08/month
- **Alert evaluations**: 4 policies × 1 check/min = ~$1/month
- **Dashboard views**: Free

**Total**: ~$8-10/month

### Optimization

- Reduce log retention to 7 days (default is 30)
- Use sampling for high-volume events
- Archive old logs to Cloud Storage ($0.02/GB/month)

---

## Next Steps

After monitoring is set up:

1. ✅ Alerts configured and notifications tested
2. ✅ Dashboard created and charts displaying data
3. ✅ Logs queried successfully
4. [ ] Create weekly review process
5. [ ] Set up automated reports (e.g., weekly summary email)
6. [ ] Integrate with Sentry for app crash tracking (optional)

---

## Support

For issues with monitoring setup:
- Cloud Monitoring docs: https://cloud.google.com/monitoring/docs
- Firebase Analytics docs: https://firebase.google.com/docs/analytics
- Logs Explorer: https://console.cloud.google.com/logs/query?project=sarina-ai-2b2c1

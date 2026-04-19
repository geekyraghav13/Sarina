#!/bin/bash

# Setup Cloud Monitoring Alerts for Sarina AI
# This script creates alert policies in Google Cloud Monitoring

PROJECT_ID="sarina-ai-2b2c1"
GCLOUD_BIN="/home/raghav/google-cloud-sdk/bin/gcloud"

echo "🔔 Setting up Cloud Monitoring alerts for project: $PROJECT_ID"

# Alert 1: Cloud Function Errors
echo "📊 Creating alert for Cloud Function errors..."
$GCLOUD_BIN alpha monitoring policies create \
  --notification-channels="" \
  --display-name="Sarina - Reconciliation Function Errors" \
  --condition-display-name="High error rate in reconcileCrashedCalls" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=300s \
  --condition-threshold-aggregation-alignment-period=60s \
  --condition-threshold-aggregation-per-series-aligner=ALIGN_RATE \
  --condition-threshold-aggregation-cross-series-reducer=REDUCE_SUM \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-threshold-filter='resource.type="cloud_function"
    AND resource.labels.function_name="reconcileCrashedCalls"
    AND metric.type="cloudfunctions.googleapis.com/function/execution_count"
    AND metric.labels.status!="ok"' \
  --project=$PROJECT_ID

# Alert 2: Call Start Record Failures
echo "📊 Creating alert for call_start_record_failed events..."
$GCLOUD_BIN alpha monitoring policies create \
  --notification-channels="" \
  --display-name="Sarina - Call Start Record Failures" \
  --condition-display-name="High rate of call_start_record_failed" \
  --condition-threshold-value=10 \
  --condition-threshold-duration=300s \
  --condition-threshold-aggregation-alignment-period=300s \
  --condition-threshold-aggregation-per-series-aligner=ALIGN_SUM \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-threshold-filter='resource.type="cloud_function"
    AND jsonPayload.event="call_start_record_failed"' \
  --project=$PROJECT_ID

# Alert 3: Zero Balance Flagging
echo "📊 Creating alert for zero_balance_flagged events..."
$GCLOUD_BIN alpha monitoring policies create \
  --notification-channels="" \
  --display-name="Sarina - Zero Balance Accounts Flagged" \
  --condition-display-name="Multiple accounts flagged for zero balance" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=300s \
  --condition-threshold-aggregation-alignment-period=300s \
  --condition-threshold-aggregation-per-series-aligner=ALIGN_SUM \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-threshold-filter='resource.type="cloud_function"
    AND jsonPayload.event="zero_balance_flagged"' \
  --project=$PROJECT_ID

# Alert 4: Reconciliation Job Not Running
echo "📊 Creating alert for reconciliation job not running..."
$GCLOUD_BIN alpha monitoring policies create \
  --notification-channels="" \
  --display-name="Sarina - Reconciliation Job Not Running" \
  --condition-display-name="No reconciliation executions in 10 minutes" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=600s \
  --condition-threshold-aggregation-alignment-period=600s \
  --condition-threshold-aggregation-per-series-aligner=ALIGN_SUM \
  --condition-threshold-comparison=COMPARISON_LT \
  --condition-threshold-filter='resource.type="cloud_function"
    AND resource.labels.function_name="reconcileCrashedCalls"
    AND metric.type="cloudfunctions.googleapis.com/function/execution_count"' \
  --project=$PROJECT_ID

echo "✅ Alert policies created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Configure notification channels (email, Slack, etc.) in Cloud Console"
echo "2. Update the alert policies to use notification channels"
echo "3. Test alerts by triggering error conditions"
echo ""
echo "🔗 View alerts: https://console.cloud.google.com/monitoring/alerting?project=$PROJECT_ID"

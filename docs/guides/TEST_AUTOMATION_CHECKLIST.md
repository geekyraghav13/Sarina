# 🤖 Automated Testing Checklist & Scripts

**Purpose:** Quick-reference guide for running automated tests and checks
**Date:** February 14, 2026

---

## 🚀 Quick Test Commands

### 1. Install Fresh Build
```bash
cd "/home/raghav/Vibe COded Apps/sarina"

# Build debug APK
cd android && ./gradlew assembleDebug

# Uninstall old version
adb uninstall com.sarina.app

# Install fresh
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.sarina.app/.MainActivity
```

### 2. Monitor App Logs in Real-Time
```bash
# All app logs
adb logcat -s "ReactNativeJS"

# Error logs only
adb logcat *:E | grep -i "sarina\|error\|crash"

# Voice call specific
adb logcat | grep -i "voicecall\|balance\|credits"
```

### 3. Check Backend Health
```bash
# Backend health endpoint
curl https://sarina-voice-backend-fv2lgy22ja-uc.a.run.app/health

# Expected response:
# {"status":"healthy","timestamp":"...","activeConnections":0}

# Backend logs
gcloud run logs tail sarina-voice-backend \
  --region us-central1 \
  --project sarina-ai-2b2c1 \
  --limit 50
```

### 4. Verify Firestore Data
```bash
# Open Firestore Console
# https://console.firebase.google.com/project/sarina-ai-2b2c1/firestore

# Quick checks:
# - users/{userId}/voice_balance_seconds
# - users/{userId}/subscription_tier
# - credit_transactions (recent entries)
# - call_sessions (active calls)
```

---

## 📋 Pre-Test Setup Checklist

Before running any tests, ensure:

```bash
✅ Device/Emulator Setup
[ ] Device connected: adb devices
[ ] Internet connectivity working
[ ] Google account signed in
[ ] Developer options enabled
[ ] USB debugging enabled

✅ Backend Status
[ ] Backend is healthy: curl {backend}/health
[ ] Cloud Run service running
[ ] No recent deployment errors
[ ] Firestore database accessible

✅ Build Configuration
[ ] Latest code built: check git log
[ ] Correct build variant (debug/release)
[ ] Version code matches: check app.json
[ ] Feature flags set correctly:
    - USE_MOCK_PURCHASES (true for mock, false for real)
    - Backend URL is correct

✅ Firebase Setup
[ ] Firebase Console accessible
[ ] Test user exists in 'users' collection
[ ] Firestore rules deployed
[ ] Analytics enabled (optional)
```

---

## 🧪 Test Execution Scripts

### Script 1: Full User Journey Test

Create file: `test_user_journey.sh`

```bash
#!/bin/bash

echo "========================================"
echo "🧪 Starting User Journey Test"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test start time
START_TIME=$(date +%s)

echo "Step 1: Uninstalling old version..."
adb uninstall com.sarina.app 2>/dev/null
echo -e "${GREEN}✓ Uninstalled${NC}"
echo ""

echo "Step 2: Installing fresh APK..."
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    adb install -r "$APK_PATH"
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ APK not found at $APK_PATH${NC}"
    exit 1
fi
echo ""

echo "Step 3: Launching app..."
adb shell am start -n com.sarina.app/.MainActivity
sleep 2
echo -e "${GREEN}✓ Launched${NC}"
echo ""

echo "Step 4: Monitoring logs (30 seconds)..."
echo -e "${YELLOW}Watch for errors below:${NC}"
timeout 30 adb logcat -s "ReactNativeJS" | grep -i "error\|crash\|exception" &
LOG_PID=$!
echo ""

echo "Step 5: Manual verification required..."
echo ""
echo "Please complete the following manually:"
echo "  [ ] Sign in with Google"
echo "  [ ] Accept disclaimer"
echo "  [ ] Select mode (Girlfriend/Friend)"
echo "  [ ] Complete onboarding (8 screens)"
echo "  [ ] Verify incoming call appears"
echo "  [ ] Tap 'Pick' → Paywall appears"
echo "  [ ] Complete mock purchase"
echo "  [ ] Start voice call"
echo "  [ ] Verify balance countdown"
echo ""

read -p "Press Enter when manual steps complete..."
echo ""

# Kill log monitoring
kill $LOG_PID 2>/dev/null

echo "Step 6: Checking Firestore data..."
echo -e "${YELLOW}Open Firebase Console and verify:${NC}"
echo "  - users/{userId}/subscription_tier should be 'weekly' or 'yearly'"
echo "  - users/{userId}/voice_balance_seconds should be updated"
echo "  - credit_transactions collection has entries"
echo ""

read -p "Firestore data verified? (y/n): " FIRESTORE_OK
echo ""

if [ "$FIRESTORE_OK" = "y" ]; then
    echo -e "${GREEN}✓ Firestore verification passed${NC}"
else
    echo -e "${RED}✗ Firestore verification failed${NC}"
fi
echo ""

# Test end time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "========================================"
echo "🏁 Test Complete"
echo "========================================"
echo "Duration: ${DURATION} seconds"
echo ""
echo "Next steps:"
echo "  1. Review logs for any errors"
echo "  2. Verify all features worked as expected"
echo "  3. Document any issues found"
echo "  4. Run performance benchmarks"
echo ""
```

Make executable: `chmod +x test_user_journey.sh`

Run: `./test_user_journey.sh`

---

### Script 2: Balance Deduction Test

Create file: `test_balance_deduction.sh`

```bash
#!/bin/bash

echo "========================================"
echo "💳 Testing Balance Deduction Accuracy"
echo "========================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Prerequisites:"
echo "  1. Set voice_balance_seconds = 30 in Firestore"
echo "  2. Have app open and ready to make call"
echo ""
read -p "Prerequisites complete? (y/n): " READY

if [ "$READY" != "y" ]; then
    echo "Please complete prerequisites first."
    exit 0
fi

echo ""
echo "Starting 30-second balance test..."
echo "Watch Firestore console in real-time!"
echo ""

START=$(date +%s)

for i in {5..30..5}; do
    sleep 5
    ELAPSED=$(( $(date +%s) - START ))
    EXPECTED_BALANCE=$(( 30 - ELAPSED ))

    echo -e "${YELLOW}[$ELAPSED seconds]${NC} Check Firestore balance"
    echo "  Expected: ${EXPECTED_BALANCE} seconds"
    read -p "  Actual balance in Firestore: " ACTUAL

    if [ "$ACTUAL" -eq "$EXPECTED_BALANCE" ]; then
        echo -e "  ${GREEN}✓ PASS - Balance correct${NC}"
    else
        DIFF=$(( EXPECTED_BALANCE - ACTUAL ))
        echo -e "  ${RED}✗ FAIL - Off by $DIFF seconds${NC}"
    fi
    echo ""
done

echo "========================================"
echo "Test complete!"
echo ""
echo "Verification steps:"
echo "  1. Check credit_transactions collection"
echo "  2. Should have 6 entries (30s ÷ 5s)"
echo "  3. Each entry should be -5 seconds"
echo "  4. Call should have auto-ended at 0 seconds"
echo ""
```

Make executable: `chmod +x test_balance_deduction.sh`

---

### Script 3: Performance Benchmark

Create file: `test_performance.sh`

```bash
#!/bin/bash

echo "========================================"
echo "⚡ Performance Benchmark Test"
echo "========================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to test cold start
test_cold_start() {
    echo "Test 1: Cold Start Time"
    echo "-----------------------"

    # Kill app
    adb shell am force-stop com.sarina.app
    sleep 2

    echo "Starting app..."
    START=$(date +%s%3N)
    adb shell am start -n com.sarina.app/.MainActivity > /dev/null 2>&1

    echo "Watch for home/chat screen to appear..."
    read -p "Press Enter when screen fully loaded: "
    END=$(date +%s%3N)

    DURATION=$(( END - START ))
    SECONDS=$(awk "BEGIN {print $DURATION/1000}")

    echo "Cold start time: ${SECONDS}s"

    if (( $(echo "$SECONDS < 5" | bc -l) )); then
        echo -e "${GREEN}✓ PASS (Target: <5s)${NC}"
    else
        echo -e "${RED}✗ FAIL (Target: <5s)${NC}"
    fi
    echo ""
}

# Function to test warm start
test_warm_start() {
    echo "Test 2: Warm Start Time"
    echo "-----------------------"

    # Background app
    adb shell input keyevent KEYCODE_HOME
    sleep 2

    echo "Reopening app..."
    START=$(date +%s%3N)
    adb shell am start -n com.sarina.app/.MainActivity > /dev/null 2>&1

    echo "Watch for previous screen to appear..."
    read -p "Press Enter when screen fully loaded: "
    END=$(date +%s%3N)

    DURATION=$(( END - START ))
    SECONDS=$(awk "BEGIN {print $DURATION/1000}")

    echo "Warm start time: ${SECONDS}s"

    if (( $(echo "$SECONDS < 2" | bc -l) )); then
        echo -e "${GREEN}✓ PASS (Target: <2s)${NC}"
    else
        echo -e "${RED}✗ FAIL (Target: <2s)${NC}"
    fi
    echo ""
}

# Function to test voice call connection
test_call_connection() {
    echo "Test 3: Voice Call Connection"
    echo "------------------------------"

    echo "Preparation: Navigate to incoming call screen"
    read -p "Ready to tap 'Pick'? Press Enter..."

    echo "Tap 'Pick' NOW and start timer..."
    START=$(date +%s%3N)

    read -p "Press Enter when 'Connected' status appears: "
    END=$(date +%s%3N)

    DURATION=$(( END - START ))
    SECONDS=$(awk "BEGIN {print $DURATION/1000}")

    echo "Connection time: ${SECONDS}s"

    if (( $(echo "$SECONDS < 3" | bc -l) )); then
        echo -e "${GREEN}✓ PASS (Target: <3s)${NC}"
    else
        echo -e "${RED}✗ FAIL (Target: <3s)${NC}"
    fi
    echo ""
}

# Run all tests
echo "Running 3 performance tests..."
echo "Follow the prompts carefully"
echo ""

test_cold_start
test_warm_start
test_call_connection

echo "========================================"
echo "All performance tests complete!"
echo ""
echo "Record these results in MILESTONE4_INTEGRATION_TESTING.md"
echo ""
```

Make executable: `chmod +x test_performance.sh`

---

### Script 4: Backend Health Check

Create file: `check_backend_health.sh`

```bash
#!/bin/bash

echo "========================================"
echo "🏥 Backend Health Check"
echo "========================================"
echo ""

BACKEND_URL="https://sarina-voice-backend-fv2lgy22ja-uc.a.run.app"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Health endpoint
echo "Test 1: Health Endpoint"
echo "-----------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Backend returned HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 2: WebSocket availability
echo "Test 2: WebSocket Endpoint"
echo "----------------------------"
echo "Checking if port 443 (WSS) is open..."
nc -zv -w 3 sarina-voice-backend-fv2lgy22ja-uc.a.run.app 443 2>&1 | grep -q "succeeded"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ WebSocket port is open${NC}"
else
    echo -e "${RED}✗ WebSocket port is not accessible${NC}"
fi
echo ""

# Test 3: Backend logs
echo "Test 3: Recent Backend Logs"
echo "----------------------------"
echo "Fetching last 10 log entries..."
gcloud run logs read sarina-voice-backend \
    --region us-central1 \
    --project sarina-ai-2b2c1 \
    --limit 10 \
    --format "table(timestamp,textPayload)" 2>/dev/null

echo ""
echo "Check for errors above"
echo ""

# Test 4: Response time
echo "Test 4: Response Time"
echo "---------------------"
echo "Measuring health endpoint response time..."
TIME=$(curl -o /dev/null -s -w '%{time_total}\n' "$BACKEND_URL/health")
echo "Response time: ${TIME}s"

if (( $(echo "$TIME < 1" | bc -l) )); then
    echo -e "${GREEN}✓ PASS (Target: <1s)${NC}"
else
    echo -e "${YELLOW}⚠ SLOW (Target: <1s)${NC}"
fi
echo ""

echo "========================================"
echo "Health check complete!"
echo ""
```

Make executable: `chmod +x check_backend_health.sh`

---

## 📊 Test Results Recording

### Manual Test Tracking Sheet

Create a simple spreadsheet or use this markdown format:

```markdown
# Test Execution Log

## Session 1: [Date]

**Tester:** ___________
**Build:** ___________
**Device:** ___________

| Time | Test | Result | Notes |
|------|------|--------|-------|
| 10:00 | Cold Start | ✓ 3.2s | Within target |
| 10:05 | User Journey | ✓ Pass | No issues |
| 10:15 | Balance Test | ✗ Fail | Off by 2s at 30s mark |
| 10:25 | Network Test | ✓ Pass | Graceful handling |

**Issues Found:**
1. Balance deduction off by 2 seconds - needs investigation
2. Minor UI flicker on paywall transition

**Follow-up Actions:**
- [ ] Investigate heartbeat timing
- [ ] Fix UI transition animation
```

---

## 🔧 Debugging Tools

### 1. Enable Chrome DevTools (React Native Debugger)

```bash
# Shake device or run:
adb shell input keyevent 82

# Select "Debug" from menu
# Opens Chrome DevTools at http://localhost:8081/debugger-ui
```

### 2. Monitor Network Traffic

```bash
# Use React Native Network Inspector
# Shake device → "Debug" → "Network"

# Or monitor via adb:
adb shell tcpdump -i any -s 0 -w /sdcard/capture.pcap
```

### 3. Firestore Rules Testing

```bash
# Test Firestore security rules
firebase emulators:start --only firestore

# Run rules test suite
# (Create rules test file first)
```

### 4. Memory Profiling

```bash
# Monitor memory usage
adb shell dumpsys meminfo com.sarina.app

# Heap dump
adb shell am dumpheap com.sarina.app /sdcard/heap.dump
adb pull /sdcard/heap.dump
```

---

## ✅ Daily Testing Checklist

Use this for quick daily smoke tests:

```bash
Quick Smoke Test (5 minutes)
-----------------------------
[ ] App launches without crash
[ ] Can sign in
[ ] Onboarding works
[ ] Paywall appears
[ ] Mock purchase succeeds
[ ] Voice call connects
[ ] Balance decrements
[ ] Call ends at 0 balance
[ ] No console errors
[ ] Backend is healthy

If all ✓ → Build is stable
If any ✗ → Stop and investigate
```

---

## 🚨 Critical Issue Criteria

Mark as CRITICAL and stop testing if:

- ❌ App crashes on launch
- ❌ Cannot sign in
- ❌ Paywall doesn't appear
- ❌ Purchase fails completely
- ❌ Voice calls don't connect at all
- ❌ Balance never decrements
- ❌ Backend is down
- ❌ Data loss in Firestore

---

## 📈 Performance Targets Summary

Quick reference for all benchmarks:

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Cold Start | <3s | <5s | >10s |
| Warm Start | <1.5s | <2s | >5s |
| Call Connection | <2s | <3s | >5s |
| Paywall Load | <1s | <2s | >3s |
| Heartbeat Interval | 5.0s | ±0.2s | ±1s |
| Firestore Write | <200ms | <500ms | >1s |
| Backend Response | <500ms | <1s | >2s |

---

**Document Version:** 1.0
**Last Updated:** February 14, 2026
**Next Update:** After first test run

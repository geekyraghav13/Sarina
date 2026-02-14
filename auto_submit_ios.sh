#!/bin/bash

# Auto-submit iOS build to App Store when ready
# Build ID: aa49d9d8-467d-4a56-a424-e44d49850ff8

BUILD_ID="aa49d9d8-467d-4a56-a424-e44d49850ff8"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🍎 iOS Build Monitor & Auto-Submit"
echo "=========================================="
echo ""
echo "Build ID: $BUILD_ID"
echo "Monitoring build status..."
echo ""

# Function to check build status
check_build_status() {
    cd "/home/raghav/Vibe COded Apps/sarina"
    STATUS=$(npx eas build:list --platform ios --limit 1 --non-interactive 2>&1 | grep -A 5 "Status" | head -1 | awk '{print $NF}')
    echo "$STATUS"
}

# Monitor build (check every 2 minutes for up to 40 minutes)
MAX_ATTEMPTS=20
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo "[$ATTEMPT/$MAX_ATTEMPTS] Checking build status..."

    STATUS=$(check_build_status)

    if [[ "$STATUS" == *"finished"* ]] || [[ "$STATUS" == *"Finished"* ]]; then
        echo -e "${GREEN}✅ Build completed successfully!${NC}"
        echo ""
        echo "Submitting to App Store..."

        cd "/home/raghav/Vibe COded Apps/sarina"
        npx eas submit --platform ios --latest --non-interactive

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Successfully submitted to App Store Connect!${NC}"
            echo ""
            echo "Next steps:"
            echo "1. Check App Store Connect: https://appstoreconnect.apple.com"
            echo "2. Build will appear in TestFlight in ~10-15 minutes"
            echo "3. Add testers or submit for App Review"
        else
            echo -e "${RED}❌ Submission failed. Please submit manually:${NC}"
            echo "npx eas submit --platform ios --latest"
        fi

        exit 0
    elif [[ "$STATUS" == *"errored"* ]] || [[ "$STATUS" == *"Errored"* ]] || [[ "$STATUS" == *"failed"* ]]; then
        echo -e "${RED}❌ Build failed!${NC}"
        echo ""
        echo "Check logs: https://expo.dev/accounts/8284/projects/sarina/builds/$BUILD_ID"
        echo ""
        echo "To retry:"
        echo "npx eas build --platform ios --profile production --non-interactive --no-wait"
        exit 1
    else
        echo "Status: $STATUS - Still building..."
        echo "Waiting 2 minutes before next check..."
        sleep 120
    fi
done

echo -e "${YELLOW}⚠️  Build taking longer than expected (>40 minutes)${NC}"
echo "Check manually: https://expo.dev/accounts/8284/projects/sarina/builds/$BUILD_ID"

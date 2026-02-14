#!/bin/bash

# Auto-submit iOS Build 6 (CORRECTED) to App Store when ready
# Build ID: da93b9b9-d537-498b-8c97-8ccf6a19baba
# This build has the correct build number (6) in the Xcode project

BUILD_ID="da93b9b9-d537-498b-8c97-8ccf6a19baba"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🍎 iOS Build 6 (CORRECTED) Monitor & Auto-Submit"
echo "=========================================="
echo ""
echo "Build ID: $BUILD_ID"
echo "Changes: Build number 6 + Google Sign-In OAuth fix"
echo "Monitoring build status..."
echo ""

# Function to check build status
check_build_status() {
    cd "/home/raghav/Vibe COded Apps/sarina"
    STATUS=$(eas build:list --platform ios --limit 1 --non-interactive 2>&1 | grep -A 5 "Status" | head -1 | awk '{print $NF}')
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
        EXPO_APPLE_APP_SPECIFIC_PASSWORD="aiyl-rmxf-mcar-rfxl" eas submit --platform ios --latest --verbose

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Successfully submitted to App Store Connect!${NC}"
            echo ""
            echo "Next steps:"
            echo "1. Check App Store Connect: https://appstoreconnect.apple.com"
            echo "2. Build will appear in TestFlight in ~10-15 minutes"
            echo "3. Test Google Sign-In on iOS device"
            echo "4. Verify all features work correctly"
            echo "5. Add testers or submit for App Review"
        else
            echo -e "${RED}❌ Submission failed. Please submit manually:${NC}"
            echo "EXPO_APPLE_APP_SPECIFIC_PASSWORD=\"aiyl-rmxf-mcar-rfxl\" eas submit --platform ios --latest"
        fi

        exit 0
    elif [[ "$STATUS" == *"errored"* ]] || [[ "$STATUS" == *"Errored"* ]] || [[ "$STATUS" == *"failed"* ]]; then
        echo -e "${RED}❌ Build failed!${NC}"
        echo ""
        echo "Check logs: https://expo.dev/accounts/8284/projects/sarina/builds/$BUILD_ID"
        exit 1
    else
        echo "Status: $STATUS - Still building..."
        echo "Waiting 2 minutes before next check..."
        sleep 120
    fi
done

echo -e "${YELLOW}⚠️  Build taking longer than expected (>40 minutes)${NC}"
echo "Check manually: https://expo.dev/accounts/8284/projects/sarina/builds/$BUILD_ID"

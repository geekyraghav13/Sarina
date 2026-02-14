#!/bin/bash

# Retry EAS Submit for iOS
# Will attempt submission every 15 minutes until successful

cd "/home/raghav/Vibe COded Apps/sarina"

echo "=========================================="
echo "EAS Submit - Automated Retry Script"
echo "=========================================="
echo ""
echo "This script will try to submit the iOS build to App Store Connect"
echo "It will retry every 15 minutes until successful"
echo ""
echo "Press Ctrl+C to stop"
echo ""

ATTEMPT=0
MAX_ATTEMPTS=8  # Try for 2 hours (8 attempts * 15 min)

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo "[$ATTEMPT/$MAX_ATTEMPTS] Attempting submission at $(date)"
    echo ""

    # Try to submit
    npx eas submit --platform ios --latest --non-interactive

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SUCCESS! Build submitted to App Store Connect!"
        echo ""
        echo "Next steps:"
        echo "1. Check App Store Connect: https://appstoreconnect.apple.com"
        echo "2. Build will appear in TestFlight in ~10-15 minutes"
        echo "3. Add testers or submit for App Review"
        exit 0
    else
        if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
            echo ""
            echo "❌ Submission failed. Waiting 15 minutes before retry..."
            echo "Next attempt in 15 minutes ($(date -d '+15 minutes' '+%I:%M %p'))"
            echo ""
            sleep 900  # Wait 15 minutes
        fi
    fi
done

echo ""
echo "⚠️  All $MAX_ATTEMPTS attempts failed."
echo ""
echo "Please try one of these alternatives:"
echo "1. Use Transporter app on iPhone/iPad"
echo "2. Ask someone with a Mac to upload the IPA"
echo "3. Contact Expo support for help with EAS Submit"
echo ""
echo "IPA Location: /home/raghav/Downloads/Sarina_Build5.ipa"
echo ""

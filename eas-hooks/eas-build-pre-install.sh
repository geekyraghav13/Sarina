#!/usr/bin/env bash

# EAS Build Pre-Install Hook
# This script runs before pod install to configure the Podfile for Firebase compatibility

set -e

echo "🔧 Configuring Podfile for Firebase Swift pods..."

# Create ios directory if it doesn't exist
if [ ! -d "ios" ]; then
  echo "ℹ️ Running expo prebuild to generate ios directory..."
  npx expo prebuild --platform ios --no-install
fi

# Navigate to ios directory
cd ios

# Check if Podfile exists
if [ ! -f "Podfile" ]; then
  echo "❌ Error: Podfile not found in ios directory"
  exit 1
fi

echo "📝 Adding use_modular_headers! to Podfile..."

# Backup original Podfile
cp Podfile Podfile.backup

# Add use_modular_headers! after the platform line
awk '
/^platform :ios/ {
    print
    print ""
    print "# Fix for Firebase Swift pods compatibility"
    print "use_modular_headers!"
    print ""
    next
}
{ print }
' Podfile.backup > Podfile

echo "✅ Podfile configured successfully"
echo "📄 Modified Podfile content:"
head -20 Podfile

cd ..

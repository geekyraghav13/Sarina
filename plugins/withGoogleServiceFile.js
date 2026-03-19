const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to copy GoogleService-Info.plist to iOS project
 * This ensures Firebase Google Sign In works properly on iOS
 */
module.exports = function withGoogleServiceFile(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformProjectRoot = config.modRequest.platformProjectRoot;

      // Source: GoogleService-Info.plist in root directory
      const sourceFile = path.join(projectRoot, 'GoogleService-Info.plist');

      // Destination: iOS project directory
      const destFile = path.join(platformProjectRoot, 'SarinaAICompanion', 'GoogleService-Info.plist');

      if (fs.existsSync(sourceFile)) {
        // Copy the file
        fs.copyFileSync(sourceFile, destFile);
        console.log('✅ Copied GoogleService-Info.plist to iOS project');
      } else {
        console.warn('⚠️ GoogleService-Info.plist not found in root directory');
      }

      return config;
    },
  ]);
};

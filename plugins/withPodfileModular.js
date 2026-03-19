const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to add use_modular_headers! to iOS Podfile
 * This fixes Firebase Swift pods compatibility issues
 */
module.exports = function withPodfileModular(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');

        // Check if use_modular_headers! is already present
        if (!podfileContent.includes('use_modular_headers!')) {
          // Add use_modular_headers! after the platform line
          podfileContent = podfileContent.replace(
            /(platform :ios, ['"].*?['"])/,
            '$1\n\n# Fix for Firebase Swift pods compatibility\nuse_modular_headers!'
          );

          fs.writeFileSync(podfilePath, podfileContent, 'utf8');
          console.log('✅ Added use_modular_headers! to Podfile');
        }
      }

      return config;
    },
  ]);
};

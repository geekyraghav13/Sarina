/**
 * Test Sentry Integration
 *
 * This script sends a test error to Sentry to verify the configuration.
 * Run: node test-sentry.js
 */

const Sentry = require('@sentry/node');

const SENTRY_DSN = 'https://0f03cc818d415d840ca9f58c2ab5b2d2@o4510701895417856.ingest.us.sentry.io/4510701897777152';

console.log('🔧 Testing Sentry Configuration...\n');

Sentry.init({
  dsn: SENTRY_DSN,
  environment: 'test',
  release: 'sarina-ai@1.0.0',
});

console.log('📡 Sending test error to Sentry...');

// Send test error
Sentry.captureException(new Error('Test error from Sarina AI - Configuration Test'));

// Add context
Sentry.captureMessage('Sentry test message from Sarina AI', {
  level: 'info',
  tags: {
    test: 'true',
    app: 'sarina-ai',
  },
  extra: {
    timestamp: new Date().toISOString(),
    message: 'If you see this in Sentry, configuration is working!',
  },
});

console.log('\n✅ Test error sent!');
console.log('\n📊 Check your Sentry dashboard:');
console.log('   https://sentry.io/issues/');
console.log('\n⏱️  It may take 10-30 seconds to appear...\n');

// Wait for Sentry to send
setTimeout(() => {
  console.log('✅ Done! Check Sentry dashboard now.');
  process.exit(0);
}, 2000);

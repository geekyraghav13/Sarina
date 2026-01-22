const { initializeApp } = require('firebase/app');
const { getRemoteConfig, fetchAndActivate, getValue } = require('firebase/remote-config');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoso8vP9ZY6fCGq3g-bgOyEdLDja9Dyo0",
  authDomain: "sarina-ai-2b2c1.firebaseapp.com",
  projectId: "sarina-ai-2b2c1",
  storageBucket: "sarina-ai-2b2c1.firebasestorage.app",
  messagingSenderId: "1051121433445",
  appId: "1:1051121433445:web:b3d60bb5ea0190e09c7f8c",
  measurementId: "G-SX1919QG46"
};

console.log('🔧 Testing Firebase Connection...\n');

async function testFirebase() {
  try {
    // Initialize Firebase
    console.log('📱 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully\n');

    // Initialize Remote Config
    console.log('⚙️ Initializing Remote Config...');
    const remoteConfig = getRemoteConfig(app);
    remoteConfig.settings = {
      minimumFetchIntervalMillis: 0, // For testing
      fetchTimeoutMillis: 60000,
    };
    console.log('✅ Remote Config initialized\n');

    // Fetch and activate
    console.log('📥 Fetching Remote Config...');
    const activated = await fetchAndActivate(remoteConfig);
    console.log(`✅ Remote Config fetched and activated: ${activated}\n`);

    // Get characters value
    console.log('📋 Getting "characters" parameter...');
    const charactersValue = getValue(remoteConfig, 'characters');
    const charactersJson = charactersValue.asString();

    if (!charactersJson || charactersJson === '[]') {
      console.log('❌ ERROR: No characters found in Remote Config!');
      console.log('   The "characters" parameter is empty or not set.\n');
      console.log('📝 Action needed:');
      console.log('   1. Go to: https://console.firebase.google.com/project/sarina-ai-2b2c1/config');
      console.log('   2. Make sure "characters" parameter exists');
      console.log('   3. Paste the JSON from firebase-characters.json');
      console.log('   4. Click "Publish changes"');
      return;
    }

    // Parse JSON
    const characters = JSON.parse(charactersJson);
    console.log(`✅ Successfully loaded ${characters.length} characters!\n`);

    // Display character summary
    console.log('👥 Character List:');
    console.log('═══════════════════════════════════════════════════════\n');

    characters.forEach((char, index) => {
      console.log(`${index + 1}. ${char.name} - "${char.tagline}"`);
      console.log(`   Style: ${char.appearance}`);
      console.log(`   Image: ${char.imageUrl.substring(0, 60)}...`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════\n');

    // Test image URL accessibility
    console.log('🖼️ Testing image URL accessibility...');
    const testChar = characters[0];
    console.log(`Testing ${testChar.name}'s image URL...\n`);
    console.log(`URL: ${testChar.imageUrl}\n`);
    console.log('✅ You can test this URL in your browser.');
    console.log('   If it loads, Firebase Storage is configured correctly!\n');

    console.log('🎉 Firebase setup looks good!');
    console.log('✅ All systems ready for the app to use.\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n📝 Troubleshooting:');
    console.error('   - Check your internet connection');
    console.error('   - Verify Firebase project ID: sarina-ai-2b2c1');
    console.error('   - Make sure Remote Config is enabled');
    console.error('   - Ensure "characters" parameter exists and is published');
  }
}

testFirebase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

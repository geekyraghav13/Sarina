const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'sarina-ai-2b2c1',
});

async function verifyRemoteConfig() {
  try {
    console.log('🔍 Fetching Remote Config template...\n');

    const template = await admin.remoteConfig().getTemplate();

    console.log('✅ Remote Config Template Retrieved');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`📊 Version: ${template.version.versionNumber}`);
    console.log(`📅 Updated: ${template.version.updateTime}`);
    console.log(`👤 Updated by: ${template.version.updateUser.email}\n`);

    // Check if characters parameter exists
    if (template.parameters.characters) {
      console.log('✅ "characters" parameter found!\n');

      const charactersJson = template.parameters.characters.defaultValue.value;
      const characters = JSON.parse(charactersJson);

      console.log(`📱 Total characters: ${characters.length}\n`);

      // Check first few characters
      console.log('🖼️ Sample Characters with Image URLs:\n');
      characters.slice(0, 5).forEach((char, index) => {
        const hasToken = char.imageUrl.includes('token=');
        console.log(`${index + 1}. ${char.name}`);
        console.log(`   Style: ${char.appearance}`);
        console.log(`   Token: ${hasToken ? '✓ Present' : '✗ Missing'}`);
        console.log(`   URL: ${char.imageUrl.substring(0, 80)}...`);
        console.log('');
      });

      // Verify all have tokens
      const allHaveTokens = characters.every(c => c.imageUrl.includes('token='));

      console.log('═══════════════════════════════════════════════════════\n');
      if (allHaveTokens) {
        console.log('🎉 SUCCESS! All characters have authentication tokens!');
        console.log('✅ Your app will now load images much faster!\n');
      } else {
        console.log('⚠️ WARNING: Some characters missing tokens');
        const missing = characters.filter(c => !c.imageUrl.includes('token='));
        console.log(`Missing tokens: ${missing.map(c => c.name).join(', ')}\n`);
      }

    } else {
      console.log('❌ ERROR: "characters" parameter not found in Remote Config!');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

verifyRemoteConfig()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

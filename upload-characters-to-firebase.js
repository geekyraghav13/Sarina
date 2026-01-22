const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Path to service account key (you'll need to download this from Firebase Console)
const serviceAccountPath = path.join(__dirname, 'service-account-key.json');

// Check if service account exists
if (!fs.existsSync(serviceAccountPath)) {
  console.log('❌ ERROR: Service account key not found!');
  console.log('');
  console.log('📝 To get your service account key:');
  console.log('   1. Go to: https://console.firebase.google.com/project/sarina-ai-2b2c1/settings/serviceaccounts/adminsdk');
  console.log('   2. Click "Generate new private key"');
  console.log('   3. Save the file as "service-account-key.json" in this directory');
  console.log('   4. Run this script again');
  console.log('');
  process.exit(1);
}

// Initialize Firebase Admin
console.log('🔧 Initializing Firebase Admin...\n');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'sarina-ai-2b2c1',
});

async function uploadCharactersToRemoteConfig() {
  try {
    // Read the local JSON file
    console.log('📖 Reading firebase-characters.json...');
    const charactersJson = fs.readFileSync(
      path.join(__dirname, 'firebase-characters.json'),
      'utf8'
    );
    const characters = JSON.parse(charactersJson);
    console.log(`✅ Loaded ${characters.length} characters from local file\n`);

    // Get Remote Config template
    console.log('📥 Fetching current Remote Config template...');
    const template = await admin.remoteConfig().getTemplate();
    console.log('✅ Template fetched successfully\n');

    // Update the characters parameter
    console.log('📝 Updating "characters" parameter...');
    template.parameters['characters'] = {
      defaultValue: {
        value: charactersJson,
      },
      description: `20 AI girlfriend characters with Firebase Storage image URLs (updated ${new Date().toISOString()})`,
    };

    // Validate template
    console.log('🔍 Validating template...');
    const validatedTemplate = await admin.remoteConfig().validateTemplate(template);
    console.log('✅ Template validated successfully\n');

    // Publish template
    console.log('🚀 Publishing to Firebase Remote Config...');
    const publishedTemplate = await admin.remoteConfig().publishTemplate(validatedTemplate);
    console.log('✅ Successfully published!\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 SUCCESS! Characters uploaded to Firebase Remote Config');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`📊 Version: ${publishedTemplate.version.versionNumber}`);
    console.log(`📅 Updated: ${publishedTemplate.version.updateTime}`);
    console.log(`👤 Updated by: ${publishedTemplate.version.updateUser.email}`);
    console.log(`📱 Characters: ${characters.length}`);
    console.log('');
    console.log('✅ Your app will now load these characters with fast image URLs!');
    console.log('');

    // Display character summary
    console.log('👥 Uploaded Characters:');
    console.log('─────────────────────────────────────────────────────\n');
    characters.forEach((char, index) => {
      console.log(`${index + 1}. ${char.name} - ${char.appearance}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n📝 Troubleshooting:');
    console.error('   - Verify your service account has Remote Config Admin permissions');
    console.error('   - Check internet connection');
    console.error('   - Ensure firebase-characters.json is valid JSON');
    process.exit(1);
  }
}

// Run the upload
uploadCharactersToRemoteConfig()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

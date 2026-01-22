const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: 'sarina-ai-2b2c1',
  storageBucket: 'sarina-ai-2b2c1.firebasestorage.app'
};

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: serviceAccount.storageBucket
});

const bucket = admin.storage().bucket();

// Directory containing renamed images
const imagesDir = '/home/raghav/Downloads/girls-renamed';

// Character names (in order)
const characters = [
  'serena', 'maya', 'luna', 'sophie', 'emma',
  'yuki', 'raven', 'chloe', 'sakura', 'aurora',
  'bella', 'akira', 'celeste', 'grace', 'miku',
  'nyx', 'olivia', 'rin', 'iris', 'zara'
];

async function uploadImages() {
  console.log('Starting upload of 20 character images...\n');

  const urls = [];

  for (const character of characters) {
    const filename = `${character}.jpg`;
    const localPath = path.join(imagesDir, filename);
    const storagePath = `characters/${filename}`;

    try {
      if (!fs.existsSync(localPath)) {
        console.log(`❌ ${filename} - File not found`);
        continue;
      }

      console.log(`📤 Uploading ${filename}...`);

      // Upload file
      await bucket.upload(localPath, {
        destination: storagePath,
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            firebaseStorageDownloadTokens: require('crypto').randomBytes(16).toString('hex')
          }
        }
      });

      // Make public
      await bucket.file(storagePath).makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      console.log(`✅ ${filename} - Uploaded successfully`);
      console.log(`   URL: ${publicUrl}\n`);

      urls.push({
        character,
        url: publicUrl
      });

    } catch (error) {
      console.error(`❌ ${filename} - Error:`, error.message, '\n');
    }
  }

  console.log('\n✅ Upload complete!');
  console.log(`\n${urls.length}/20 images uploaded successfully\n`);

  // Save URLs to file
  const urlsFile = path.join(__dirname, 'character-urls.json');
  fs.writeFileSync(urlsFile, JSON.stringify(urls, null, 2));
  console.log(`URLs saved to: ${urlsFile}`);

  return urls;
}

uploadImages()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error);
    process.exit(1);
  });

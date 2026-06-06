/**
 * Seed the Firestore `characters` collection.
 *
 * - Uploads the 6 Figma hero images (assets/characters/*.jpg) to Storage
 *   (characters/<id>.jpg) with a public download token.
 * - Combines the Figma heroes (first) with the legacy roster from
 *   firebase-characters.json (de-duplicated by name), assigns `order`,
 *   and writes each as a document in the `characters` collection.
 *
 * Run:  node scripts/seed-characters-firestore.js
 * Needs service-account-key.json in the project root.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PROJECT_ID = 'sarina-ai-2b2c1';
const BUCKET = 'sarina-ai-2b2c1.firebasestorage.app';

const serviceAccountPath = path.join(ROOT, 'service-account-key.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ service-account-key.json not found in project root.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  projectId: PROJECT_ID,
  storageBucket: BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// The 6 Figma hero characters (mirrors app/data/characters.ts).
const FIGMA_CHARACTERS = [
  { id: 'victoria', name: 'Victoria', tagline: 'The Boss',        appearance: 'realistic', personality: ['Confident', 'Ambitious'],     interests: ['Business', 'Fine Wine'],    tone: ['Commanding', 'Sophisticated'], image: 'victoria.jpg' },
  { id: 'jax',      name: 'Jax',      tagline: 'The Rebel',       appearance: 'realistic', personality: ['Bold', 'Free-spirited'],      interests: ['Music', 'Motorcycles'],     tone: ['Edgy', 'Playful'],             image: 'jax.jpg' },
  { id: 'elena',    name: 'Elena',    tagline: 'The Bold',        appearance: 'realistic', personality: ['Daring', 'Passionate'],       interests: ['Travel', 'Dancing'],        tone: ['Fiery', 'Direct'],             image: 'elena.jpg' },
  { id: 'maya',     name: 'Maya',     tagline: 'The Seductive',   appearance: 'realistic', personality: ['Flirty', 'Alluring'],         interests: ['Poetry', 'Wine Tasting'],   tone: ['Sultry', 'Teasing'],           image: 'maya.jpg' },
  { id: 'luna',     name: 'Luna',     tagline: 'The Mysterious',  appearance: 'realistic', personality: ['Enigmatic', 'Deep'],          interests: ['Astrology', 'Art'],         tone: ['Mysterious', 'Soft'],          image: 'luna.jpg' },
  { id: 'sophia',   name: 'Sophia',   tagline: 'The Fierce',      appearance: 'realistic', personality: ['Strong', 'Independent'],      interests: ['Fitness', 'Adventure'],     tone: ['Bold', 'Warm'],                image: 'sophia.jpg' },
];

async function uploadHeroImage(filename, destId) {
  const localPath = path.join(ROOT, 'assets', 'characters', filename);
  const destination = `characters/${destId}.jpg`;
  const token = crypto.randomUUID();
  await bucket.upload(localPath, {
    destination,
    metadata: {
      contentType: 'image/jpeg',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  const encoded = encodeURIComponent(destination);
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encoded}?alt=media&token=${token}`;
}

async function main() {
  console.log('🌱 Seeding Firestore `characters` collection...\n');

  // 1) Figma heroes — upload images, build docs
  const heroes = [];
  for (let i = 0; i < FIGMA_CHARACTERS.length; i++) {
    const c = FIGMA_CHARACTERS[i];
    process.stdout.write(`📤 Uploading ${c.image} ... `);
    const imageUrl = await uploadHeroImage(c.image, c.id);
    console.log('done');
    heroes.push({
      id: c.id,
      name: c.name,
      tagline: c.tagline,
      appearance: c.appearance,
      personality: c.personality,
      interests: c.interests,
      tone: c.tone,
      imageUrl,
      order: i,
    });
  }

  // 2) Legacy roster — de-dupe names already covered by heroes
  const heroNames = new Set(heroes.map((h) => h.name.toLowerCase()));
  const legacy = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'firebase-characters.json'), 'utf8')
  )
    .filter((c) => !heroNames.has(String(c.name).toLowerCase()))
    .map((c, i) => ({
      id: String(c.id),
      name: c.name,
      tagline: c.tagline,
      appearance: c.appearance,
      personality: c.personality || [],
      interests: c.interests || [],
      tone: c.tone || [],
      imageUrl: c.imageUrl,
      order: heroes.length + i,
    }));

  const all = [...heroes, ...legacy];

  // 3) Write to Firestore in a batch (doc id = character id)
  const batch = db.batch();
  all.forEach((c) => batch.set(db.collection('characters').doc(c.id), c));
  await batch.commit();

  console.log(`\n✅ Seeded ${all.length} characters (${heroes.length} heroes + ${legacy.length} legacy).`);
  console.log('   Next: deploy rules →  firebase deploy --only firestore:rules');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

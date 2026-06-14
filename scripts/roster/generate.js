/**
 * Sarina character roster generator.
 *
 * For each character in the deterministic roster (pools.js) this:
 *   1. generates a tasteful portrait via the Gemini image API,
 *   2. downscales it to a ~512px JPEG (ImageMagick) so the app stays light,
 *   3. uploads it to Firebase Storage (characters/<id>.jpg, public),
 *   4. writes the character doc to the Firestore `characters` collection.
 *
 * Resumable: a manifest (scripts/roster/manifest.json) records finished ids, so
 * re-running only fills in what's missing. Rate-limited and idempotent.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/roster/generate.js [options]
 *     --per=N            characters per category (default 50)
 *     --only=Cat,Cat     restrict to categories (default all 7)
 *     --limit=N          stop after N new characters this run (for pilots)
 *     --model=NAME       image model (default gemini-2.5-flash-image)
 *     --dry              print the roster only; no generation/upload
 *     --no-upload        generate+resize locally only (saved under _pilot/)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { buildRoster } = require('./pools');

// ── args ─────────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  }),
);
const PER = parseInt(args.per || '50', 10);
const ONLY = args.only ? String(args.only).split(',').map((s) => s.trim()) : null;
const LIMIT = args.limit ? parseInt(args.limit, 10) : Infinity;
const MODEL = args.model || 'gemini-2.5-flash-image';
const DRY = !!args.dry;
const UPLOAD = !args['no-upload'];

const ROOT = path.resolve(__dirname, '../..');
const PILOT_DIR = path.join(__dirname, '_pilot');
const MANIFEST = path.join(__dirname, 'manifest.json');
const BUCKET = 'sarina-ai-2b2c1.firebasestorage.app';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── roster ───────────────────────────────────────────────────────────────────
const roster = buildRoster(PER, ONLY);
console.log(`📋 Roster: ${roster.length} characters` +
  (ONLY ? ` (categories: ${ONLY.join(', ')})` : '') + `, ${PER}/category\n`);

if (DRY) {
  const byCat = {};
  roster.forEach((c) => { (byCat[c.categories[0]] ||= []).push(c.name); });
  Object.entries(byCat).forEach(([cat, names]) =>
    console.log(`  ${cat} (${names.length}): ${names.slice(0, 8).join(', ')}…`));
  console.log('\n(dry run — nothing generated)');
  process.exit(0);
}

// ── manifest ─────────────────────────────────────────────────────────────────
const manifest = fs.existsSync(MANIFEST)
  ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  : {};
const saveManifest = () =>
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

// ── image generation ─────────────────────────────────────────────────────────
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY env var is required.');
  process.exit(1);
}

async function generateImage(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`image API HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData)?.inlineData?.data;
  if (!img) throw new Error('no image in response (possibly blocked)');
  return Buffer.from(img, 'base64');
}

// Downscale + center-crop to a square 512px JPEG via ImageMagick.
function toJpeg(pngBuffer, outPath) {
  const tmp = path.join(os.tmpdir(), `sarina_${Date.now()}.png`);
  fs.writeFileSync(tmp, pngBuffer);
  execFileSync('convert', [
    tmp, '-resize', '512x512^', '-gravity', 'center',
    '-extent', '512x512', '-quality', '82', outPath,
  ]);
  fs.unlinkSync(tmp);
}

// ── firebase (lazy: only when uploading) ─────────────────────────────────────
let bucket = null;
let db = null;
function initFirebase() {
  const admin = require('firebase-admin');
  const keyPath = path.join(ROOT, 'service-account-key.json');
  if (!fs.existsSync(keyPath)) {
    console.error('❌ service-account-key.json not found at repo root.');
    process.exit(1);
  }
  admin.initializeApp({
    credential: admin.credential.cert(require(keyPath)),
    projectId: 'sarina-ai-2b2c1',
    storageBucket: BUCKET,
  });
  bucket = admin.storage().bucket();
  db = admin.firestore();
}

async function uploadAndStore(c, jpegPath) {
  const storagePath = `characters/${c.id}.jpg`;
  const crypto = require('crypto');
  await bucket.upload(jpegPath, {
    destination: storagePath,
    metadata: {
      contentType: 'image/jpeg',
      metadata: { firebaseStorageDownloadTokens: crypto.randomBytes(16).toString('hex') },
    },
  });
  await bucket.file(storagePath).makePublic();
  const imageUrl = `https://storage.googleapis.com/${BUCKET}/${storagePath}`;

  const { prompt, ...doc } = c; // never store the prompt
  await db.collection('characters').doc(c.id).set({ ...doc, imageUrl });
  return imageUrl;
}

// ── main loop ────────────────────────────────────────────────────────────────
(async () => {
  if (!fs.existsSync(PILOT_DIR)) fs.mkdirSync(PILOT_DIR, { recursive: true });
  if (UPLOAD) initFirebase();

  // "Done" means we have the final artifact: a remote http URL when uploading,
  // or any saved image when running local-only. (Pilot runs leave file:// URLs,
  // which still need uploading.)
  const isDone = (c) => {
    const url = manifest[c.id]?.imageUrl;
    if (!url) return false;
    return UPLOAD ? url.startsWith('http') : true;
  };
  const todo = roster.filter((c) => !isDone(c));
  const batch = todo.slice(0, LIMIT);
  console.log(`🎨 ${batch.length} to generate (${roster.length - todo.length} already done)\n`);

  let ok = 0, fail = 0;
  for (let i = 0; i < batch.length; i++) {
    const c = batch[i];
    const tag = `[${i + 1}/${batch.length}] ${c.categories[0]} · ${c.name} (${c.id})`;
    try {
      const jpegPath = path.join(PILOT_DIR, `${c.id}.jpg`);
      let reused = false;
      if (fs.existsSync(jpegPath)) {
        reused = true; // already generated (e.g. pilot run) — just (re)upload
      } else {
        const png = await generateImage(c.prompt);
        toJpeg(png, jpegPath);
      }

      let imageUrl = `file://${jpegPath}`;
      if (UPLOAD) imageUrl = await uploadAndStore(c, jpegPath);

      manifest[c.id] = { imageUrl, name: c.name, category: c.categories[0] };
      saveManifest();
      ok++;
      console.log(`  ✅ ${tag}${reused ? ' (reused)' : ''} → ${fs.statSync(jpegPath).size} bytes`);
      if (reused) continue; // skip the rate-limit sleep when no API call was made
    } catch (e) {
      fail++;
      console.log(`  ❌ ${tag} — ${e.message}`);
    }
    await sleep(1200); // gentle rate limit
  }

  console.log(`\n✨ Done. ${ok} ok, ${fail} failed. Manifest: ${MANIFEST}`);
  process.exit(0);
})();

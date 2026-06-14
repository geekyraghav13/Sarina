/**
 * Roster enrichment: gives every existing character a full (first + last) name
 * and its OWN opening story, then updates the Firestore doc in place.
 *
 * Does NOT touch images — ids are unchanged (derived from the first name), so
 * characters/<id>.jpg keeps matching. Only the `name` and `story` fields change.
 *
 * Stories are generated with Gemini text (gemini-2.5-flash): 2-3 first-person
 * bubbles in the character's voice, romantic-but-tasteful, ending on a question.
 *
 * Resumable via scripts/roster/enrich-manifest.json. Rate-limited.
 *
 * Usage: GEMINI_API_KEY=... node scripts/roster/enrich.js [--per=50] [--only=Cat] [--limit=N] [--force]
 */

const fs = require('fs');
const path = require('path');
const { buildRoster } = require('./pools');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  }),
);
const PER = parseInt(args.per || '50', 10);
const ONLY = args.only ? String(args.only).split(',').map((s) => s.trim()) : null;
const LIMIT = args.limit ? parseInt(args.limit, 10) : Infinity;
const FORCE = !!args.force;
const TEXT_MODEL = args.model || 'gemini-2.5-flash';

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST = path.join(__dirname, 'enrich-manifest.json');
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('❌ GEMINI_API_KEY required.'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateStory(c) {
  const prompt =
`You are writing the opening message a flirty, warm AI companion sends when a user first opens the chat with her, in a dating/companion app. Stay romantic but tasteful and safe-for-work (no explicit content).

Character:
- Name: ${c.firstName}
- Vibe: ${c.personality.join(', ')} / ${c.tone.join(', ')}
- Loves: ${c.interests.join(', ')}
- Style: ${c.categories.join(', ')}

Write a short opening "story" of 2 to 3 messages that sets a vivid scene she's in right now and pulls the user in. First person, present tense, in her voice. Each message should be one or two sentences (a bit descriptive, not too short). The final message should invite the user to talk by ending with a warm question. You may use at most one tasteful emoji total.

Return ONLY a JSON array of strings (one per message), nothing else.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.1,
        maxOutputTokens: 600,
        responseMimeType: 'application/json',
        // gemini-2.5-flash "thinks" by default, which eats the token budget and
        // truncates the answer — disable it for these short structured outputs.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });
  if (!res.ok) throw new Error(`text API HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const data = await res.json();
  let txt = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  txt = txt.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const arr = JSON.parse(txt);
  if (!Array.isArray(arr) || arr.length < 2 || !arr.every((s) => typeof s === 'string')) {
    throw new Error('bad story shape');
  }
  return arr.map((s) => s.trim()).filter(Boolean).slice(0, 3);
}

(async () => {
  const admin = require('firebase-admin');
  admin.initializeApp({
    credential: admin.credential.cert(require(path.join(ROOT, 'service-account-key.json'))),
    projectId: 'sarina-ai-2b2c1',
  });
  const db = admin.firestore();

  const roster = buildRoster(PER, ONLY);
  const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
  const save = () => fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  const todo = roster.filter((c) => FORCE || !manifest[c.id]?.story);
  const batch = todo.slice(0, LIMIT);
  console.log(`✍️  Enriching ${batch.length} (${roster.length - todo.length} already done)\n`);

  let ok = 0, fail = 0;
  for (let i = 0; i < batch.length; i++) {
    const c = batch[i];
    const tag = `[${i + 1}/${batch.length}] ${c.categories[0]} · ${c.name} (${c.id})`;
    try {
      const story = await generateStory(c);
      await db.collection('characters').doc(c.id).set(
        { name: c.name, firstName: c.firstName, story },
        { merge: true },
      );
      manifest[c.id] = { name: c.name, story };
      save();
      ok++;
      console.log(`  ✅ ${tag} — "${story[0].slice(0, 60)}…" (${story.length} msgs)`);
    } catch (e) {
      fail++;
      console.log(`  ❌ ${tag} — ${e.message}`);
    }
    await sleep(400);
  }
  console.log(`\n✨ Done. ${ok} ok, ${fail} failed.`);
  process.exit(0);
})();

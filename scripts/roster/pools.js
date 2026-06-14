/**
 * Deterministic roster definition for the Sarina character generator.
 *
 * buildRoster() returns the full list of character objects (no images yet),
 * each with a stable `id`, profile fields, `categories`, and an image-gen
 * `prompt`. It's deterministic: the same name+index always yields the same id
 * and prompt, so the generator is fully resumable.
 *
 * All prompts are deliberately tasteful / safe-for-work (head-and-shoulders
 * portraits) — this is a store-distributed app.
 */

// ── Shared trait pools (varied so personas/look differ) ──────────────────────
const HAIR = [
  'long wavy brown hair', 'sleek black hair', 'honey-blonde hair',
  'auburn curls', 'long straight dark hair', 'shoulder-length chestnut hair',
  'wavy caramel hair', 'jet-black bob', 'soft red waves', 'platinum blonde hair',
];
const OUTFIT = [
  'a stylish casual top', 'an elegant blouse', 'a cozy knit sweater',
  'a chic off-shoulder top', 'a fitted turtleneck', 'a summer dress',
  'a leather jacket', 'a silk blouse', 'a denim jacket', 'a satin top',
];
const VIBE = [
  'warm friendly smile', 'soft confident gaze', 'gentle playful expression',
  'serene elegant look', 'bright cheerful smile', 'calm thoughtful expression',
];

const PERSONALITY = [
  ['Confident', 'Warm'], ['Playful', 'Caring'], ['Ambitious', 'Witty'],
  ['Gentle', 'Dreamy'], ['Bold', 'Adventurous'], ['Sweet', 'Supportive'],
  ['Mysterious', 'Deep'], ['Cheerful', 'Energetic'], ['Elegant', 'Refined'],
  ['Funny', 'Spontaneous'], ['Romantic', 'Passionate'], ['Calm', 'Wise'],
];
const INTERESTS = [
  ['Travel', 'Coffee'], ['Music', 'Dancing'], ['Books', 'Philosophy'],
  ['Fitness', 'Cooking'], ['Art', 'Photography'], ['Gaming', 'Movies'],
  ['Fashion', 'Wine'], ['Nature', 'Yoga'], ['Astrology', 'Poetry'],
  ['Business', 'Fine Dining'], ['Singing', 'Baking'], ['Fashion', 'Travel'],
];
const TONE = [
  ['Warm', 'Playful'], ['Flirty', 'Sweet'], ['Sophisticated', 'Calm'],
  ['Bold', 'Direct'], ['Gentle', 'Caring'], ['Sultry', 'Teasing'],
  ['Cheerful', 'Upbeat'], ['Mysterious', 'Soft'], ['Witty', 'Confident'],
];

// ── Per-category config: names, tagline pool, prompt builder ──────────────────
const CATEGORIES = {
  Realistic: {
    prefix: 're',
    names: ['Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte',
      'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Emily', 'Ella', 'Scarlett',
      'Grace', 'Chloe', 'Victoria', 'Riley', 'Aria', 'Lily', 'Hannah', 'Zoey',
      'Nora', 'Lillian', 'Addison', 'Layla', 'Brooklyn', 'Savannah', 'Claire',
      'Skylar', 'Audrey', 'Bella', 'Hazel', 'Aurora', 'Naomi', 'Eva', 'Ruby',
      'Stella', 'Violet', 'Paisley', 'Sadie', 'Piper', 'Quinn', 'Daisy',
      'Eliza', 'Faith', 'Ivy', 'Josephine', 'Kayla', 'Mackenzie'],
    taglines: ['Loves cozy nights 💕', 'Your favorite person 💖', 'Always down to talk 😊',
      'Sweet and genuine 🌷', 'Here to brighten your day ☀️', 'Adventurous soul 🌟'],
    prompt: (t) =>
      `Professional portrait photograph of a beautiful 24-year-old woman, ${t.hair}, ${t.vibe}, wearing ${t.outfit}, natural makeup, soft studio lighting, head and shoulders, looking at camera, photorealistic, high quality, tasteful, safe for work`,
  },
  Latina: {
    prefix: 'la',
    names: ['Sofia', 'Camila', 'Valentina', 'Isabela', 'Lucia', 'Mariana',
      'Gabriela', 'Daniela', 'Valeria', 'Ximena', 'Antonella', 'Renata',
      'Carolina', 'Catalina', 'Fernanda', 'Mariana', 'Adriana', 'Alejandra',
      'Bianca', 'Carmen', 'Elena', 'Esperanza', 'Florencia', 'Guadalupe',
      'Inés', 'Julieta', 'Lorena', 'Marisol', 'Natalia', 'Paloma', 'Rosa',
      'Salma', 'Selena', 'Talia', 'Veronica', 'Yara', 'Zaira', 'Abril',
      'Belen', 'Constanza', 'Dulce', 'Emilia', 'Frida', 'Itzel', 'Jimena',
      'Lola', 'Maite', 'Noelia', 'Pilar', 'Regina'],
    taglines: ['Caliente y dulce 🌹', 'Loves to dance 💃', 'Fiery and fun 🔥',
      'Passionate heart ❤️', 'Sunshine and salsa ☀️', 'Sweet as flan 🍮'],
    prompt: (t) =>
      `Professional portrait photograph of a beautiful 24-year-old Latina woman, tan glowing skin, ${t.hair}, ${t.vibe}, wearing ${t.outfit}, natural makeup, soft studio lighting, head and shoulders, looking at camera, photorealistic, high quality, tasteful, safe for work`,
  },
  Asian: {
    prefix: 'as',
    names: ['Mei', 'Yuki', 'Sakura', 'Hana', 'Aiko', 'Rina', 'Yuna', 'Mina',
      'Jiwoo', 'Soyeon', 'Hyejin', 'Nayeon', 'Linh', 'Mai', 'Lan', 'Anh',
      'Suki', 'Kira', 'Emi', 'Nana', 'Riko', 'Yui', 'Kaori', 'Miku', 'Haruka',
      'Akari', 'Chinatsu', 'Eri', 'Fumiko', 'Hina', 'Izumi', 'Kana', 'Maki',
      'Natsumi', 'Reina', 'Saki', 'Tomoko', 'Wakana', 'Yoko', 'Bao', 'Cho',
      'Dao', 'Hoa', 'Kim', 'Trang', 'Eun', 'Hae', 'Jin', 'Min', 'Seo'],
    taglines: ['Gentle and dreamy 🌸', 'Sweet and shy 🍵', 'Loves quiet moments 🌙',
      'Soft-spoken charmer 🌺', 'Tea and good books 📚', 'Graceful soul ✨'],
    prompt: (t) =>
      `Professional portrait photograph of a beautiful 23-year-old East Asian woman, fair clear skin, ${t.hair}, ${t.vibe}, wearing ${t.outfit}, natural makeup, soft studio lighting, head and shoulders, looking at camera, photorealistic, high quality, tasteful, safe for work`,
  },
  Ebony: {
    prefix: 'eb',
    names: ['Aaliyah', 'Imani', 'Zuri', 'Nia', 'Amara', 'Sanaa', 'Kaia',
      'Layla', 'Maya', 'Jada', 'Aisha', 'Destiny', 'Halle', 'Kenya',
      'Lena', 'Monique', 'Naomi', 'Olamide', 'Precious', 'Queenie', 'Raven',
      'Simone', 'Tiana', 'Yvonne', 'Adaeze', 'Binta', 'Chioma', 'Dalia',
      'Efia', 'Folake', 'Halima', 'Ife', 'Jamila', 'Kamaria', 'Lulu',
      'Makeda', 'Nadia', 'Oni', 'Penda', 'Rashida', 'Safiya', 'Tariah',
      'Uchenna', 'Vanessa', 'Winnie', 'Zola', 'Asha', 'Brielle', 'Cierra'],
    taglines: ['Bold and beautiful 👑', 'Radiant queen ✨', 'Confidence on fire 🔥',
      'Sweet and strong 💖', 'Loves good vibes 🌟', 'Effortlessly stunning 💫'],
    prompt: (t) =>
      `Professional portrait photograph of a beautiful 24-year-old Black woman, rich dark skin, ${t.hair}, ${t.vibe}, wearing ${t.outfit}, natural makeup, soft studio lighting, head and shoulders, looking at camera, photorealistic, high quality, tasteful, safe for work`,
  },
  Anime: {
    prefix: 'an',
    names: ['Rin', 'Asuka', 'Hikari', 'Yumi', 'Nozomi', 'Kasumi', 'Megumi',
      'Sora', 'Tsukasa', 'Ayame', 'Chiaki', 'Hotaru', 'Ichigo', 'Kotori',
      'Madoka', 'Nagisa', 'Origami', 'Rei', 'Shana', 'Tohru', 'Umi', 'Yoshino',
      'Zero', 'Akeno', 'Chitose', 'Erina', 'Fuuka', 'Himari', 'Inori', 'Juri',
      'Kaede', 'Luka', 'Mio', 'Noel', 'Ouka', 'Reika', 'Sena', 'Tama',
      'Urara', 'Wendy', 'Yukino', 'Aqua', 'Chika', 'Emilia', 'Felix', 'Gou',
      'Hina', 'Ino', 'Karin', 'Lala'],
    taglines: ['Your waifu 💕', 'Tsundere cutie 💢', 'Bubbly and fun 🎀',
      'Loves anime nights 📺', 'Sweet senpai 🌸', 'Magical girl ✨'],
    prompt: (t) =>
      `High quality anime style illustration, portrait of a beautiful anime girl, ${t.hair}, big expressive eyes, ${t.vibe}, wearing ${t.outfit}, detailed soft cel shading, vibrant colors, clean lineart, head and shoulders, safe for work`,
  },
  Fantasy: {
    prefix: 'fa',
    names: ['Luna', 'Seraphina', 'Aurora', 'Celeste', 'Lyra', 'Morgana',
      'Freya', 'Isolde', 'Nyx', 'Ophelia', 'Rhiannon', 'Selene', 'Titania',
      'Vesper', 'Yseult', 'Aelin', 'Briar', 'Calliope', 'Daenys', 'Eirlys',
      'Faye', 'Gwendolyn', 'Hespera', 'Ivria', 'Jora', 'Kaelith', 'Lilith',
      'Mira', 'Nimue', 'Orla', 'Petra', 'Quilla', 'Rowan', 'Sylvaine', 'Thora',
      'Ula', 'Vivienne', 'Wren', 'Xanthe', 'Ylva', 'Zephyrine', 'Amaranth',
      'Brigid', 'Cordelia', 'Drusilla', 'Elowen', 'Faylinn', 'Genevieve',
      'Hecate', 'Iridessa'],
    taglines: ['Mystical and wise ✨', 'Enchantress of hearts 🌙', 'Ethereal beauty 🦋',
      'Keeper of secrets 🔮', 'Starlit dreamer 🌌', 'Fierce and magical ⚔️'],
    prompt: (t) =>
      `Fantasy digital art portrait of a beautiful enchantress woman, ${t.hair}, glowing eyes, delicate ornate jewelry, ${t.vibe}, ethereal magical lighting, intricate detailed fantasy art, head and shoulders, safe for work`,
  },
  Cosplay: {
    prefix: 'co',
    names: ['Yaya', 'Jess', 'Kira', 'Nova', 'Pixie', 'Vexa', 'Suki', 'Lumi',
      'Mira', 'Nyx', 'Echo', 'Vesper', 'Zoe', 'Ruby', 'Sable', 'Tess', 'Wren',
      'Cleo', 'Dahlia', 'Faye', 'Gemma', 'Holly', 'Indra', 'Juno', 'Kiki',
      'Lux', 'Misa', 'Neo', 'Opal', 'Posy', 'Quinn', 'Roxy', 'Star', 'Trixie',
      'Una', 'Vivi', 'Willa', 'Xena', 'Yuri', 'Zara', 'Anya', 'Bex', 'Coco',
      'Dot', 'Elle', 'Fern', 'Gigi', 'Hana', 'Isla', 'June'],
    taglines: ['Cosplay queen 🎮', 'Con crush 💕', 'Lives for cosplay ✨',
      'Your dream character 🌟', 'Playful and creative 🎨', 'Sweet gamer girl 🎀'],
    prompt: (t) =>
      `Portrait photograph of a beautiful young woman in colorful anime-inspired cosplay costume, ${t.hair}, ${t.vibe}, stylish costume with props, studio lighting, photorealistic, high quality, tasteful, safe for work`,
  },
};

// Surnames per category so characters read like real people. Fantasy keeps a
// single evocative name (no surname). Picked by index for determinism.
const SURNAMES = {
  Realistic: ['Carter', 'Bennett', 'Hughes', 'Parker', 'Reed', 'Brooks', 'Morgan',
    'Foster', 'Hayes', 'Coleman', 'Sullivan', 'Russell', 'Bryant', 'Powell',
    'Hart', 'Lane', 'Ford', 'Wells', 'Greene', 'Spencer', 'Walsh', 'Quinn',
    'Sutton', 'Vaughn', 'Barnes'],
  Latina: ['Martinez', 'Garcia', 'Rodriguez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Ramirez', 'Torres', 'Flores', 'Rivera', 'Morales', 'Ortiz', 'Castillo',
    'Reyes', 'Cruz', 'Vargas', 'Mendoza', 'Romero', 'Herrera', 'Delgado',
    'Aguilar', 'Vega', 'Campos', 'Navarro', 'Soto'],
  Asian: ['Tanaka', 'Sato', 'Suzuki', 'Kim', 'Lee', 'Park', 'Chen', 'Wang',
    'Nguyen', 'Tran', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Watanabe', 'Choi',
    'Jung', 'Liu', 'Zhang', 'Pham', 'Le', 'Ito', 'Saito', 'Han', 'Yoon', 'Wu'],
  Ebony: ['Johnson', 'Williams', 'Brown', 'Jackson', 'Harris', 'Robinson',
    'Walker', 'Young', 'Allen', 'Scott', 'Adeyemi', 'Okafor', 'Mensah',
    'Diallo', 'Abara', 'Nwosu', 'Banks', 'Freeman', 'Dubois', 'Mbeki',
    'Osei', 'Achebe', 'Coleman', 'Wright', 'Bell'],
  Anime: ['Tachibana', 'Shirogane', 'Aizawa', 'Kurosawa', 'Himura', 'Saionji',
    'Akiyama', 'Fujimoto', 'Hoshino', 'Minami', 'Sakurai', 'Takamine',
    'Yukimura', 'Amano', 'Kirigaya', 'Natsume', 'Sasaki', 'Ayanami',
    'Hanazono', 'Mizuhara', 'Toujou', 'Shinomiya', 'Kanzaki', 'Hayashi', 'Mori'],
  Cosplay: ['Snow', 'Rae', 'Vale', 'Knox', 'Sterling', 'Cross', 'Frost',
    'Nightingale', 'Sparrow', 'Wilde', 'Raven', 'Vex', 'Star', 'Moon',
    'Foxx', 'Quartz', 'Steele', 'Blaze', 'Pixel', 'Neko', 'Aria', 'Sky',
    'Belle', 'Rose', 'Lux'],
};

const pick = (arr, i) => arr[i % arr.length];
const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
   .replace(/[^a-z0-9]+/g, '');

/**
 * Build the roster.
 * @param {number} perCategory how many characters per category
 * @param {string[]} [only] optional subset of category names
 */
function buildRoster(perCategory, only) {
  const cats = (only && only.length ? only : Object.keys(CATEGORIES));
  const roster = [];
  const usedIds = new Set();
  let order = 100; // generated characters sort after the existing roster

  for (const cat of cats) {
    const cfg = CATEGORIES[cat];
    if (!cfg) throw new Error(`Unknown category: ${cat}`);
    for (let i = 0; i < perCategory; i++) {
      // id is derived from the FIRST name only, so it stays stable even as we
      // add surnames — existing uploaded images (characters/<id>.jpg) keep matching.
      const first = cfg.names[i % cfg.names.length];
      let id = `${cfg.prefix}-${slug(first)}`;
      let n = 2;
      while (usedIds.has(id)) id = `${cfg.prefix}-${slug(first)}-${n++}`;
      usedIds.add(id);

      const surnames = SURNAMES[cat];
      const fullName = surnames ? `${first} ${pick(surnames, i)}` : first;

      const traits = { hair: pick(HAIR, i), outfit: pick(OUTFIT, i + 3), vibe: pick(VIBE, i) };
      roster.push({
        id,
        name: fullName,
        firstName: first,
        tagline: pick(cfg.taglines, i),
        appearance: cat === 'Anime' ? 'anime' : cat === 'Fantasy' ? 'fantasy' : 'realistic',
        personality: pick(PERSONALITY, i + cats.indexOf(cat)),
        interests: pick(INTERESTS, i + 2),
        tone: pick(TONE, i + 1),
        categories: cat === 'Latina' || cat === 'Asian' || cat === 'Ebony'
          ? [cat, 'Realistic']
          : [cat],
        order: order++,
        prompt: cfg.prompt(traits),
      });
    }
  }
  return roster;
}

module.exports = { buildRoster, CATEGORIES };

/**
 * Localized strings for the new onboarding flow.
 *
 * Self-contained (independent of app/i18n locale JSONs) so it can cover ALL
 * languages selectable on the Language screen — including the ones without a
 * full locale file (Arabic, Dutch, Indonesian, Italian, Thai). Falls back to
 * English for any unknown code.
 */

import { useTranslation } from 'react-i18next';

export type InterestLabels = {
  lateNightWalks: string;
  readingPoetry: string;
  gaming: string;
  cooking: string;
  travel: string;
  music: string;
};

export type OnboardingStrings = {
  // Screen 04 — character select
  characterTitle: string;
  characterSubtitle: string;
  startChatting: string;
  // Screen 05 — interests
  interestsTitle: string;
  interestsSubtitle: string;
  finalizeConnection: string;
  /** Step indicator template, e.g. "Step {c} of {n}". */
  step: string;
  interests: InterestLabels;
};

export const ONBOARDING_STRINGS: Record<string, OnboardingStrings> = {
  en: {
    characterTitle: 'Who catches your eye?',
    characterSubtitle: 'Select a companion to begin your journey.',
    startChatting: 'Start Chatting',
    interestsTitle: 'What does she love?',
    interestsSubtitle: 'Select interests to tailor her personality and memory core.',
    finalizeConnection: 'Finalize Connection',
    step: 'Step {c} of {n}',
    interests: { lateNightWalks: 'Late-night walks', readingPoetry: 'Reading poetry', gaming: 'Gaming', cooking: 'Cooking', travel: 'Travel', music: 'Music' },
  },
  es: {
    characterTitle: '¿Quién te llama la atención?',
    characterSubtitle: 'Elige una compañera para comenzar tu viaje.',
    startChatting: 'Empezar a chatear',
    interestsTitle: '¿Qué le encanta?',
    interestsSubtitle: 'Selecciona intereses para personalizar su personalidad y memoria.',
    finalizeConnection: 'Finalizar conexión',
    step: 'Paso {c} de {n}',
    interests: { lateNightWalks: 'Paseos nocturnos', readingPoetry: 'Leer poesía', gaming: 'Videojuegos', cooking: 'Cocinar', travel: 'Viajar', music: 'Música' },
  },
  fr: {
    characterTitle: 'Qui attire votre regard ?',
    characterSubtitle: 'Choisissez une compagne pour commencer votre aventure.',
    startChatting: 'Commencer à discuter',
    interestsTitle: "Qu'est-ce qu'elle aime ?",
    interestsSubtitle: "Sélectionnez des centres d'intérêt pour façonner sa personnalité et sa mémoire.",
    finalizeConnection: 'Finaliser la connexion',
    step: 'Étape {c} sur {n}',
    interests: { lateNightWalks: 'Balades nocturnes', readingPoetry: 'Lire de la poésie', gaming: 'Jeux vidéo', cooking: 'Cuisiner', travel: 'Voyager', music: 'Musique' },
  },
  de: {
    characterTitle: 'Wer fällt dir ins Auge?',
    characterSubtitle: 'Wähle eine Begleiterin, um deine Reise zu beginnen.',
    startChatting: 'Chat starten',
    interestsTitle: 'Was liebt sie?',
    interestsSubtitle: 'Wähle Interessen, um ihre Persönlichkeit und ihr Gedächtnis zu prägen.',
    finalizeConnection: 'Verbindung abschließen',
    step: 'Schritt {c} von {n}',
    interests: { lateNightWalks: 'Nächtliche Spaziergänge', readingPoetry: 'Gedichte lesen', gaming: 'Gaming', cooking: 'Kochen', travel: 'Reisen', music: 'Musik' },
  },
  ja: {
    characterTitle: '気になる人は？',
    characterSubtitle: '旅を始める相手を選んでください。',
    startChatting: 'チャットを始める',
    interestsTitle: '彼女の好きなことは？',
    interestsSubtitle: '興味を選んで、彼女の性格と記憶を形作りましょう。',
    finalizeConnection: 'つながりを完成させる',
    step: 'ステップ {c} / {n}',
    interests: { lateNightWalks: '夜の散歩', readingPoetry: '詩を読む', gaming: 'ゲーム', cooking: '料理', travel: '旅行', music: '音楽' },
  },
  pt: {
    characterTitle: 'Quem chama a sua atenção?',
    characterSubtitle: 'Escolha uma companhia para começar a sua jornada.',
    startChatting: 'Começar a conversar',
    interestsTitle: 'O que ela ama?',
    interestsSubtitle: 'Selecione interesses para moldar a personalidade e a memória dela.',
    finalizeConnection: 'Finalizar conexão',
    step: 'Passo {c} de {n}',
    interests: { lateNightWalks: 'Passeios noturnos', readingPoetry: 'Ler poesia', gaming: 'Jogos', cooking: 'Cozinhar', travel: 'Viajar', music: 'Música' },
  },
  zh: {
    characterTitle: '谁吸引了你的目光？',
    characterSubtitle: '选择一位伴侣，开启你的旅程。',
    startChatting: '开始聊天',
    interestsTitle: '她喜欢什么？',
    interestsSubtitle: '选择兴趣，塑造她的性格与记忆。',
    finalizeConnection: '完成连接',
    step: '第 {c} 步，共 {n} 步',
    interests: { lateNightWalks: '夜间散步', readingPoetry: '读诗', gaming: '游戏', cooking: '烹饪', travel: '旅行', music: '音乐' },
  },
  tr: {
    characterTitle: 'Gözüne kim çarpıyor?',
    characterSubtitle: 'Yolculuğuna başlamak için bir arkadaş seç.',
    startChatting: 'Sohbete başla',
    interestsTitle: 'O neyi sever?',
    interestsSubtitle: 'Kişiliğini ve hafızasını şekillendirmek için ilgi alanları seç.',
    finalizeConnection: 'Bağlantıyı tamamla',
    step: 'Adım {c} / {n}',
    interests: { lateNightWalks: 'Gece yürüyüşleri', readingPoetry: 'Şiir okumak', gaming: 'Oyun', cooking: 'Yemek yapmak', travel: 'Seyahat', music: 'Müzik' },
  },
  ru: {
    characterTitle: 'Кто привлёк твоё внимание?',
    characterSubtitle: 'Выбери спутницу, чтобы начать своё путешествие.',
    startChatting: 'Начать общение',
    interestsTitle: 'Что она любит?',
    interestsSubtitle: 'Выберите интересы, чтобы сформировать её характер и память.',
    finalizeConnection: 'Завершить связь',
    step: 'Шаг {c} из {n}',
    interests: { lateNightWalks: 'Ночные прогулки', readingPoetry: 'Чтение поэзии', gaming: 'Игры', cooking: 'Готовка', travel: 'Путешествия', music: 'Музыка' },
  },
  hi: {
    characterTitle: 'कौन आपका दिल जीतता है?',
    characterSubtitle: 'अपनी यात्रा शुरू करने के लिए एक साथी चुनें।',
    startChatting: 'चैट शुरू करें',
    interestsTitle: 'उसे क्या पसंद है?',
    interestsSubtitle: 'उसकी पर्सनैलिटी और यादों को आकार देने के लिए रुचियाँ चुनें।',
    finalizeConnection: 'कनेक्शन पूरा करें',
    step: 'चरण {c} / {n}',
    interests: { lateNightWalks: 'रात की सैर', readingPoetry: 'कविता पढ़ना', gaming: 'गेमिंग', cooking: 'खाना बनाना', travel: 'यात्रा', music: 'संगीत' },
  },
  it: {
    characterTitle: 'Chi cattura il tuo sguardo?',
    characterSubtitle: 'Scegli una compagna per iniziare il tuo viaggio.',
    startChatting: 'Inizia a chattare',
    interestsTitle: 'Cosa ama?',
    interestsSubtitle: 'Seleziona gli interessi per plasmare la sua personalità e la sua memoria.',
    finalizeConnection: 'Completa la connessione',
    step: 'Passo {c} di {n}',
    interests: { lateNightWalks: 'Passeggiate notturne', readingPoetry: 'Leggere poesie', gaming: 'Videogiochi', cooking: 'Cucinare', travel: 'Viaggiare', music: 'Musica' },
  },
  nl: {
    characterTitle: 'Wie valt jou op?',
    characterSubtitle: 'Kies een metgezel om je reis te beginnen.',
    startChatting: 'Begin met chatten',
    interestsTitle: 'Waar houdt ze van?',
    interestsSubtitle: 'Selecteer interesses om haar persoonlijkheid en geheugen vorm te geven.',
    finalizeConnection: 'Verbinding voltooien',
    step: 'Stap {c} van {n}',
    interests: { lateNightWalks: 'Nachtelijke wandelingen', readingPoetry: 'Poëzie lezen', gaming: 'Gamen', cooking: 'Koken', travel: 'Reizen', music: 'Muziek' },
  },
  id: {
    characterTitle: 'Siapa yang menarik perhatianmu?',
    characterSubtitle: 'Pilih pendamping untuk memulai perjalananmu.',
    startChatting: 'Mulai mengobrol',
    interestsTitle: 'Apa yang dia sukai?',
    interestsSubtitle: 'Pilih minat untuk membentuk kepribadian dan memorinya.',
    finalizeConnection: 'Selesaikan koneksi',
    step: 'Langkah {c} dari {n}',
    interests: { lateNightWalks: 'Jalan malam', readingPoetry: 'Membaca puisi', gaming: 'Bermain game', cooking: 'Memasak', travel: 'Bepergian', music: 'Musik' },
  },
  th: {
    characterTitle: 'ใครสะดุดตาคุณ?',
    characterSubtitle: 'เลือกเพื่อนคู่ใจเพื่อเริ่มต้นการเดินทางของคุณ',
    startChatting: 'เริ่มแชท',
    interestsTitle: 'เธอชอบอะไร?',
    interestsSubtitle: 'เลือกความสนใจเพื่อกำหนดบุคลิกและความทรงจำของเธอ',
    finalizeConnection: 'เชื่อมต่อให้สมบูรณ์',
    step: 'ขั้นตอนที่ {c} จาก {n}',
    interests: { lateNightWalks: 'เดินเล่นยามค่ำคืน', readingPoetry: 'อ่านบทกวี', gaming: 'เล่นเกม', cooking: 'ทำอาหาร', travel: 'ท่องเที่ยว', music: 'ดนตรี' },
  },
  ar: {
    characterTitle: 'من يلفت نظرك؟',
    characterSubtitle: 'اختر رفيقة لتبدأ رحلتك.',
    startChatting: 'ابدأ الدردشة',
    interestsTitle: 'ماذا تحب؟',
    interestsSubtitle: 'اختر الاهتمامات لتشكيل شخصيتها وذاكرتها.',
    finalizeConnection: 'إتمام الاتصال',
    step: 'الخطوة {c} من {n}',
    interests: { lateNightWalks: 'نزهات ليلية', readingPoetry: 'قراءة الشعر', gaming: 'الألعاب', cooking: 'الطبخ', travel: 'السفر', music: 'الموسيقى' },
  },
};

/** Resolve strings for a language code (handles region codes like 'es-MX'). */
export const getOnboardingStrings = (lang?: string): OnboardingStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return ONBOARDING_STRINGS[code] || ONBOARDING_STRINGS.en;
};

/** Format the step template, e.g. formatStep("Step {c} of {n}", 3, 4). */
export const formatStep = (template: string, current: number, total: number): string =>
  template.replace('{c}', String(current)).replace('{n}', String(total));

/** Hook: returns onboarding strings for the user's currently selected language. */
export const useOnboardingStrings = (): OnboardingStrings => {
  const { i18n } = useTranslation();
  return getOnboardingStrings(i18n.language);
};

/** Replace {placeholders} in a template, e.g. interpolate("Hi {name}", {name}). */
export const interpolate = (
  template: string,
  vars: Record<string, string | number>
): string => template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

// ── Screen 06 — "Customize {name}'s Interests" (topic chips) ──────────────────
export type TopicsStrings = {
  customizeTitle: string; // uses {name}
  topicsSubtitle: string;
  catMusic: string;
  catLiterature: string;
  catLifestyle: string;
  ofSelected: string; // uses {n}
  continueLabel: string;
};

export const TOPICS_STRINGS: Record<string, TopicsStrings> = {
  en: { customizeTitle: "Customize {name}'s Interests", topicsSubtitle: 'Select the topics that spark her passion. This shapes her knowledge and conversation style.', catMusic: 'Music & Audio', catLiterature: 'Literature', catLifestyle: 'Lifestyle & Hobbies', ofSelected: 'of {n} Selected', continueLabel: 'Continue' },
  es: { customizeTitle: 'Personaliza los intereses de {name}', topicsSubtitle: 'Elige los temas que despiertan su pasión. Esto moldea su conocimiento y su forma de conversar.', catMusic: 'Música y audio', catLiterature: 'Literatura', catLifestyle: 'Estilo de vida y aficiones', ofSelected: 'de {n} seleccionados', continueLabel: 'Continuar' },
  fr: { customizeTitle: "Personnalisez les centres d'intérêt de {name}", topicsSubtitle: 'Choisissez les sujets qui éveillent sa passion. Cela façonne ses connaissances et son style de conversation.', catMusic: 'Musique et audio', catLiterature: 'Littérature', catLifestyle: 'Style de vie et loisirs', ofSelected: 'sur {n} sélectionnés', continueLabel: 'Continuer' },
  de: { customizeTitle: 'Passe {name}s Interessen an', topicsSubtitle: 'Wähle die Themen, die ihre Leidenschaft wecken. Das prägt ihr Wissen und ihren Gesprächsstil.', catMusic: 'Musik & Audio', catLiterature: 'Literatur', catLifestyle: 'Lifestyle & Hobbys', ofSelected: 'von {n} ausgewählt', continueLabel: 'Weiter' },
  ja: { customizeTitle: '{name}の興味をカスタマイズ', topicsSubtitle: '彼女の情熱を刺激する話題を選んでください。これが彼女の知識と会話のスタイルを形作ります。', catMusic: '音楽＆オーディオ', catLiterature: '文学', catLifestyle: 'ライフスタイル＆趣味', ofSelected: '/ {n} 選択中', continueLabel: '続ける' },
  pt: { customizeTitle: 'Personalize os interesses de {name}', topicsSubtitle: 'Escolha os temas que despertam a paixão dela. Isso molda o conhecimento e o estilo de conversa dela.', catMusic: 'Música e áudio', catLiterature: 'Literatura', catLifestyle: 'Estilo de vida e hobbies', ofSelected: 'de {n} selecionados', continueLabel: 'Continuar' },
  zh: { customizeTitle: '定制{name}的兴趣', topicsSubtitle: '选择能激发她热情的话题。这将塑造她的知识和对话风格。', catMusic: '音乐与音频', catLiterature: '文学', catLifestyle: '生活方式与爱好', ofSelected: '/ {n} 已选择', continueLabel: '继续' },
  tr: { customizeTitle: '{name} için ilgi alanlarını özelleştir', topicsSubtitle: 'Tutkusunu ateşleyen konuları seç. Bu, bilgisini ve konuşma tarzını şekillendirir.', catMusic: 'Müzik ve Ses', catLiterature: 'Edebiyat', catLifestyle: 'Yaşam Tarzı ve Hobiler', ofSelected: '/ {n} seçildi', continueLabel: 'Devam et' },
  ru: { customizeTitle: 'Настройте интересы {name}', topicsSubtitle: 'Выберите темы, которые разжигают её страсть. Это формирует её знания и стиль общения.', catMusic: 'Музыка и аудио', catLiterature: 'Литература', catLifestyle: 'Образ жизни и хобби', ofSelected: 'из {n} выбрано', continueLabel: 'Продолжить' },
  hi: { customizeTitle: '{name} की रुचियाँ कस्टमाइज़ करें', topicsSubtitle: 'उन विषयों को चुनें जो उसके जुनून को जगाते हैं। यह उसके ज्ञान और बातचीत की शैली को आकार देता है।', catMusic: 'संगीत और ऑडियो', catLiterature: 'साहित्य', catLifestyle: 'लाइफस्टाइल और शौक', ofSelected: '{n} में से चयनित', continueLabel: 'जारी रखें' },
  it: { customizeTitle: 'Personalizza gli interessi di {name}', topicsSubtitle: 'Scegli gli argomenti che accendono la sua passione. Questo plasma la sua conoscenza e il suo stile di conversazione.', catMusic: 'Musica e audio', catLiterature: 'Letteratura', catLifestyle: 'Stile di vita e hobby', ofSelected: 'di {n} selezionati', continueLabel: 'Continua' },
  nl: { customizeTitle: 'Pas de interesses van {name} aan', topicsSubtitle: 'Kies de onderwerpen die haar passie aanwakkeren. Dit vormt haar kennis en gespreksstijl.', catMusic: 'Muziek & audio', catLiterature: 'Literatuur', catLifestyle: "Lifestyle & hobby's", ofSelected: 'van {n} geselecteerd', continueLabel: 'Doorgaan' },
  id: { customizeTitle: 'Sesuaikan minat {name}', topicsSubtitle: 'Pilih topik yang membangkitkan gairahnya. Ini membentuk pengetahuan dan gaya percakapannya.', catMusic: 'Musik & Audio', catLiterature: 'Sastra', catLifestyle: 'Gaya Hidup & Hobi', ofSelected: 'dari {n} dipilih', continueLabel: 'Lanjutkan' },
  th: { customizeTitle: 'ปรับแต่งความสนใจของ {name}', topicsSubtitle: 'เลือกหัวข้อที่จุดประกายความหลงใหลของเธอ สิ่งนี้จะกำหนดความรู้และสไตล์การสนทนาของเธอ', catMusic: 'เพลงและเสียง', catLiterature: 'วรรณกรรม', catLifestyle: 'ไลฟ์สไตล์และงานอดิเรก', ofSelected: 'จาก {n} ที่เลือก', continueLabel: 'ต่อไป' },
  ar: { customizeTitle: 'خصّص اهتمامات {name}', topicsSubtitle: 'اختر المواضيع التي تشعل شغفها. هذا يشكّل معرفتها وأسلوبها في الحديث.', catMusic: 'الموسيقى والصوت', catLiterature: 'الأدب', catLifestyle: 'نمط الحياة والهوايات', ofSelected: 'من {n} مُختارة', continueLabel: 'متابعة' },
};

export const getTopicsStrings = (lang?: string): TopicsStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return TOPICS_STRINGS[code] || TOPICS_STRINGS.en;
};

export const useTopicsStrings = (): TopicsStrings => {
  const { i18n } = useTranslation();
  return getTopicsStrings(i18n.language);
};

// Localized labels for the topic chips. Keyed by language → canonical English
// topic → localized label. English (and any missing entry) falls back to the
// canonical English value, which is also what gets stored for the AI.
export const TOPIC_LABELS: Record<string, Record<string, string>> = {
  es: { 'Indie Rock': 'Rock indie', 'Classical Piano': 'Piano clásico', 'Techno': 'Tecno', 'Jazz': 'Jazz', 'Lo-Fi Beats': 'Ritmos Lo-Fi', 'Dark Romance': 'Romance oscuro', 'Sci-Fi': 'Ciencia ficción', 'Poetry': 'Poesía', 'Thrillers': 'Suspense', 'Gourmet Cooking': 'Cocina gourmet', 'Fitness': 'Fitness', 'Yoga': 'Yoga', 'Gaming': 'Videojuegos', 'Travel': 'Viajes', 'Photography': 'Fotografía' },
  fr: { 'Indie Rock': 'Rock indé', 'Classical Piano': 'Piano classique', 'Techno': 'Techno', 'Jazz': 'Jazz', 'Lo-Fi Beats': 'Beats Lo-Fi', 'Dark Romance': 'Romance sombre', 'Sci-Fi': 'Science-fiction', 'Poetry': 'Poésie', 'Thrillers': 'Thrillers', 'Gourmet Cooking': 'Cuisine gastronomique', 'Fitness': 'Fitness', 'Yoga': 'Yoga', 'Gaming': 'Jeux vidéo', 'Travel': 'Voyages', 'Photography': 'Photographie' },
  de: { 'Indie Rock': 'Indie-Rock', 'Classical Piano': 'Klassisches Klavier', 'Techno': 'Techno', 'Jazz': 'Jazz', 'Lo-Fi Beats': 'Lo-Fi-Beats', 'Dark Romance': 'Dark Romance', 'Sci-Fi': 'Science-Fiction', 'Poetry': 'Poesie', 'Thrillers': 'Thriller', 'Gourmet Cooking': 'Gourmetküche', 'Fitness': 'Fitness', 'Yoga': 'Yoga', 'Gaming': 'Gaming', 'Travel': 'Reisen', 'Photography': 'Fotografie' },
  ja: { 'Indie Rock': 'インディーロック', 'Classical Piano': 'クラシックピアノ', 'Techno': 'テクノ', 'Jazz': 'ジャズ', 'Lo-Fi Beats': 'Lo-Fiビート', 'Dark Romance': 'ダークロマンス', 'Sci-Fi': 'SF', 'Poetry': '詩', 'Thrillers': 'スリラー', 'Gourmet Cooking': 'グルメ料理', 'Fitness': 'フィットネス', 'Yoga': 'ヨガ', 'Gaming': 'ゲーム', 'Travel': '旅行', 'Photography': '写真' },
  pt: { 'Indie Rock': 'Rock indie', 'Classical Piano': 'Piano clássico', 'Techno': 'Techno', 'Jazz': 'Jazz', 'Lo-Fi Beats': 'Batidas Lo-Fi', 'Dark Romance': 'Romance sombrio', 'Sci-Fi': 'Ficção científica', 'Poetry': 'Poesia', 'Thrillers': 'Suspense', 'Gourmet Cooking': 'Culinária gourmet', 'Fitness': 'Fitness', 'Yoga': 'Yoga', 'Gaming': 'Jogos', 'Travel': 'Viagens', 'Photography': 'Fotografia' },
  zh: { 'Indie Rock': '独立摇滚', 'Classical Piano': '古典钢琴', 'Techno': '电子乐', 'Jazz': '爵士乐', 'Lo-Fi Beats': 'Lo-Fi 节拍', 'Dark Romance': '黑暗浪漫', 'Sci-Fi': '科幻', 'Poetry': '诗歌', 'Thrillers': '惊悚', 'Gourmet Cooking': '美食烹饪', 'Fitness': '健身', 'Yoga': '瑜伽', 'Gaming': '游戏', 'Travel': '旅行', 'Photography': '摄影' },
  tr: { 'Indie Rock': 'Indie Rock', 'Classical Piano': 'Klasik Piyano', 'Techno': 'Tekno', 'Jazz': 'Caz', 'Lo-Fi Beats': 'Lo-Fi Beat', 'Dark Romance': 'Karanlık Romantizm', 'Sci-Fi': 'Bilim Kurgu', 'Poetry': 'Şiir', 'Thrillers': 'Gerilim', 'Gourmet Cooking': 'Gurme Yemek', 'Fitness': 'Fitness', 'Yoga': 'Yoga', 'Gaming': 'Oyun', 'Travel': 'Seyahat', 'Photography': 'Fotoğrafçılık' },
  ru: { 'Indie Rock': 'Инди-рок', 'Classical Piano': 'Классическое фортепиано', 'Techno': 'Техно', 'Jazz': 'Джаз', 'Lo-Fi Beats': 'Lo-Fi биты', 'Dark Romance': 'Тёмный романс', 'Sci-Fi': 'Научная фантастика', 'Poetry': 'Поэзия', 'Thrillers': 'Триллеры', 'Gourmet Cooking': 'Высокая кухня', 'Fitness': 'Фитнес', 'Yoga': 'Йога', 'Gaming': 'Игры', 'Travel': 'Путешествия', 'Photography': 'Фотография' },
  hi: { 'Indie Rock': 'इंडी रॉक', 'Classical Piano': 'क्लासिकल पियानो', 'Techno': 'टेक्नो', 'Jazz': 'जैज़', 'Lo-Fi Beats': 'लो-फाई बीट्स', 'Dark Romance': 'डार्क रोमांस', 'Sci-Fi': 'साइंस फिक्शन', 'Poetry': 'कविता', 'Thrillers': 'थ्रिलर', 'Gourmet Cooking': 'गॉरमेट कुकिंग', 'Fitness': 'फिटनेस', 'Yoga': 'योग', 'Gaming': 'गेमिंग', 'Travel': 'यात्रा', 'Photography': 'फोटोग्राफी' },
  it: { 'Indie Rock': 'Rock indie', 'Classical Piano': 'Pianoforte classico', 'Techno': 'Techno', 'Jazz': 'Jazz', 'Lo-Fi Beats': 'Beat Lo-Fi', 'Dark Romance': 'Romanticismo oscuro', 'Sci-Fi': 'Fantascienza', 'Poetry': 'Poesia', 'Thrillers': 'Thriller', 'Gourmet Cooking': 'Cucina gourmet', 'Fitness': 'Fitness', 'Yoga': 'Yoga', 'Gaming': 'Videogiochi', 'Travel': 'Viaggi', 'Photography': 'Fotografia' },
  nl: { 'Indie Rock': 'Indierock', 'Classical Piano': 'Klassieke piano', 'Techno': 'Techno', 'Jazz': 'Jazz', 'Lo-Fi Beats': 'Lo-Fi beats', 'Dark Romance': 'Dark romance', 'Sci-Fi': 'Sciencefiction', 'Poetry': 'Poëzie', 'Thrillers': 'Thrillers', 'Gourmet Cooking': 'Gastronomisch koken', 'Fitness': 'Fitness', 'Yoga': 'Yoga', 'Gaming': 'Gamen', 'Travel': 'Reizen', 'Photography': 'Fotografie' },
  id: { 'Indie Rock': 'Indie Rock', 'Classical Piano': 'Piano Klasik', 'Techno': 'Tekno', 'Jazz': 'Jazz', 'Lo-Fi Beats': 'Lo-Fi Beats', 'Dark Romance': 'Romansa Gelap', 'Sci-Fi': 'Fiksi Ilmiah', 'Poetry': 'Puisi', 'Thrillers': 'Thriller', 'Gourmet Cooking': 'Masakan Gourmet', 'Fitness': 'Kebugaran', 'Yoga': 'Yoga', 'Gaming': 'Gim', 'Travel': 'Perjalanan', 'Photography': 'Fotografi' },
  th: { 'Indie Rock': 'อินดี้ร็อก', 'Classical Piano': 'เปียโนคลาสสิก', 'Techno': 'เทคโน', 'Jazz': 'แจ๊ส', 'Lo-Fi Beats': 'บีต Lo-Fi', 'Dark Romance': 'โรแมนซ์ด้านมืด', 'Sci-Fi': 'ไซไฟ', 'Poetry': 'บทกวี', 'Thrillers': 'ทริลเลอร์', 'Gourmet Cooking': 'อาหารกูร์เมต์', 'Fitness': 'ฟิตเนส', 'Yoga': 'โยคะ', 'Gaming': 'เกม', 'Travel': 'ท่องเที่ยว', 'Photography': 'การถ่ายภาพ' },
  ar: { 'Indie Rock': 'روك مستقل', 'Classical Piano': 'بيانو كلاسيكي', 'Techno': 'تكنو', 'Jazz': 'جاز', 'Lo-Fi Beats': 'إيقاعات لو-فاي', 'Dark Romance': 'رومانسية داكنة', 'Sci-Fi': 'خيال علمي', 'Poetry': 'شعر', 'Thrillers': 'إثارة', 'Gourmet Cooking': 'طبخ راقٍ', 'Fitness': 'لياقة بدنية', 'Yoga': 'يوغا', 'Gaming': 'ألعاب', 'Travel': 'سفر', 'Photography': 'تصوير' },
};

export const getTopicLabel = (lang: string | undefined, topic: string): string => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return TOPIC_LABELS[code]?.[topic] ?? topic;
};

/** Hook: returns a labeler that localizes a canonical English topic value. */
export const useTopicLabel = (): ((topic: string) => string) => {
  const { i18n } = useTranslation();
  return (topic: string) => getTopicLabel(i18n.language, topic);
};

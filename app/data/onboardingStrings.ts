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

// ── Screen 07 — "What should {name} call you?" (name entry) ───────────────────
export type NameStrings = {
  nameTitle: string; // uses {name}
  nameSubtitle: string;
  namePlaceholder: string;
  continueLabel: string;
};

export const NAME_STRINGS: Record<string, NameStrings> = {
  en: { nameTitle: 'What should {name} call you?', nameSubtitle: 'She likes to keep things personal.', namePlaceholder: 'Enter your name', continueLabel: 'Continue' },
  es: { nameTitle: '¿Cómo quieres que {name} te llame?', nameSubtitle: 'Le gusta que las cosas sean personales.', namePlaceholder: 'Escribe tu nombre', continueLabel: 'Continuar' },
  fr: { nameTitle: "Comment {name} doit-elle t'appeler ?", nameSubtitle: 'Elle aime que les choses restent personnelles.', namePlaceholder: 'Saisis ton nom', continueLabel: 'Continuer' },
  de: { nameTitle: 'Wie soll {name} dich nennen?', nameSubtitle: 'Sie mag es persönlich.', namePlaceholder: 'Gib deinen Namen ein', continueLabel: 'Weiter' },
  ja: { nameTitle: '{name}に何て呼んでほしい？', nameSubtitle: '彼女は親しみを大切にします。', namePlaceholder: '名前を入力', continueLabel: '続ける' },
  pt: { nameTitle: 'Como quer que {name} te chame?', nameSubtitle: 'Ela gosta de manter as coisas pessoais.', namePlaceholder: 'Digite seu nome', continueLabel: 'Continuar' },
  zh: { nameTitle: '想让{name}怎么称呼你？', nameSubtitle: '她喜欢亲密一点。', namePlaceholder: '输入你的名字', continueLabel: '继续' },
  tr: { nameTitle: '{name} sana nasıl seslensin?', nameSubtitle: 'İşleri kişisel tutmayı sever.', namePlaceholder: 'Adını gir', continueLabel: 'Devam et' },
  ru: { nameTitle: 'Как {name} должна тебя называть?', nameSubtitle: 'Ей нравится, когда всё по-личному.', namePlaceholder: 'Введите ваше имя', continueLabel: 'Продолжить' },
  hi: { nameTitle: '{name} आपको क्या कहकर बुलाए?', nameSubtitle: 'उसे चीज़ें निजी रखना पसंद है।', namePlaceholder: 'अपना नाम लिखें', continueLabel: 'जारी रखें' },
  it: { nameTitle: 'Come vuoi che {name} ti chiami?', nameSubtitle: 'Le piace mantenere le cose personali.', namePlaceholder: 'Inserisci il tuo nome', continueLabel: 'Continua' },
  nl: { nameTitle: 'Hoe moet {name} je noemen?', nameSubtitle: 'Ze houdt het graag persoonlijk.', namePlaceholder: 'Voer je naam in', continueLabel: 'Doorgaan' },
  id: { nameTitle: 'Mau dipanggil apa oleh {name}?', nameSubtitle: 'Dia suka menjaga hal-hal tetap personal.', namePlaceholder: 'Masukkan namamu', continueLabel: 'Lanjutkan' },
  th: { nameTitle: 'อยากให้ {name} เรียกคุณว่าอะไร?', nameSubtitle: 'เธอชอบความเป็นกันเอง', namePlaceholder: 'กรอกชื่อของคุณ', continueLabel: 'ต่อไป' },
  ar: { nameTitle: 'ماذا تريد أن تناديك {name}؟', nameSubtitle: 'تحب أن تبقى الأمور شخصية.', namePlaceholder: 'أدخل اسمك', continueLabel: 'متابعة' },
};

export const getNameStrings = (lang?: string): NameStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return NAME_STRINGS[code] || NAME_STRINGS.en;
};

export const useNameStrings = (): NameStrings => {
  const { i18n } = useTranslation();
  return getNameStrings(i18n.language);
};

// ── Screen 08 — Auth wall ("Don't lose her.") ─────────────────────────────────
export type AuthStrings = {
  authTitle: string;
  authSubtitle: string;
  continueGoogle: string;
  continueGuest: string;
  agreePrefix: string;
  termsLabel: string;
  andLabel: string;
  privacyLabel: string;
};

export const AUTH_STRINGS: Record<string, AuthStrings> = {
  en: { authTitle: "Don't lose her.", authSubtitle: 'Save your progress to chat.', continueGoogle: 'Continue with Google', continueGuest: 'Continue as guest', agreePrefix: 'By continuing, you agree to our', termsLabel: 'Terms', andLabel: 'and', privacyLabel: 'Privacy Policy' },
  es: { authTitle: 'No la pierdas.', authSubtitle: 'Guarda tu progreso para chatear.', continueGoogle: 'Continuar con Google', continueGuest: 'Continuar como invitado', agreePrefix: 'Al continuar, aceptas nuestros', termsLabel: 'Términos', andLabel: 'y', privacyLabel: 'Política de Privacidad' },
  fr: { authTitle: 'Ne la perds pas.', authSubtitle: 'Sauvegarde ta progression pour discuter.', continueGoogle: 'Continuer avec Google', continueGuest: 'Continuer en tant qu’invité', agreePrefix: 'En continuant, tu acceptes nos', termsLabel: 'Conditions', andLabel: 'et', privacyLabel: 'Politique de confidentialité' },
  de: { authTitle: 'Verliere sie nicht.', authSubtitle: 'Speichere deinen Fortschritt zum Chatten.', continueGoogle: 'Mit Google fortfahren', continueGuest: 'Als Gast fortfahren', agreePrefix: 'Indem du fortfährst, stimmst du unseren', termsLabel: 'Nutzungsbedingungen', andLabel: 'und', privacyLabel: 'Datenschutzrichtlinie zu' },
  ja: { authTitle: '彼女を失わないで。', authSubtitle: '進捗を保存してチャットを続けましょう。', continueGoogle: 'Googleで続ける', continueGuest: 'ゲストとして続ける', agreePrefix: '続行すると、以下に同意したものとみなされます：', termsLabel: '利用規約', andLabel: 'および', privacyLabel: 'プライバシーポリシー' },
  pt: { authTitle: 'Não a perca.', authSubtitle: 'Salve seu progresso para conversar.', continueGoogle: 'Continuar com Google', continueGuest: 'Continuar como convidado', agreePrefix: 'Ao continuar, você concorda com nossos', termsLabel: 'Termos', andLabel: 'e', privacyLabel: 'Política de Privacidade' },
  zh: { authTitle: '别失去她。', authSubtitle: '保存进度以继续聊天。', continueGoogle: '使用 Google 继续', continueGuest: '以访客身份继续', agreePrefix: '继续即表示您同意我们的', termsLabel: '条款', andLabel: '和', privacyLabel: '隐私政策' },
  tr: { authTitle: 'Onu kaybetme.', authSubtitle: 'Sohbet için ilerlemeni kaydet.', continueGoogle: 'Google ile devam et', continueGuest: 'Misafir olarak devam et', agreePrefix: 'Devam ederek şunları kabul edersin:', termsLabel: 'Koşullar', andLabel: 've', privacyLabel: 'Gizlilik Politikası' },
  ru: { authTitle: 'Не потеряй её.', authSubtitle: 'Сохрани прогресс, чтобы общаться.', continueGoogle: 'Продолжить с Google', continueGuest: 'Продолжить как гость', agreePrefix: 'Продолжая, вы соглашаетесь с нашими', termsLabel: 'Условиями', andLabel: 'и', privacyLabel: 'Политикой конфиденциальности' },
  hi: { authTitle: 'उसे मत खोना।', authSubtitle: 'चैट के लिए अपनी प्रगति सहेजें।', continueGoogle: 'Google के साथ जारी रखें', continueGuest: 'अतिथि के रूप में जारी रखें', agreePrefix: 'जारी रखकर, आप हमारी', termsLabel: 'शर्तों', andLabel: 'और', privacyLabel: 'गोपनीयता नीति से सहमत हैं' },
  it: { authTitle: 'Non perderla.', authSubtitle: 'Salva i tuoi progressi per chattare.', continueGoogle: 'Continua con Google', continueGuest: 'Continua come ospite', agreePrefix: 'Continuando, accetti i nostri', termsLabel: 'Termini', andLabel: 'e', privacyLabel: 'Politica sulla Privacy' },
  nl: { authTitle: 'Verlies haar niet.', authSubtitle: 'Bewaar je voortgang om te chatten.', continueGoogle: 'Doorgaan met Google', continueGuest: 'Doorgaan als gast', agreePrefix: 'Door door te gaan, ga je akkoord met onze', termsLabel: 'Voorwaarden', andLabel: 'en', privacyLabel: 'Privacybeleid' },
  id: { authTitle: 'Jangan kehilangan dia.', authSubtitle: 'Simpan progresmu untuk mengobrol.', continueGoogle: 'Lanjutkan dengan Google', continueGuest: 'Lanjutkan sebagai tamu', agreePrefix: 'Dengan melanjutkan, kamu menyetujui', termsLabel: 'Ketentuan', andLabel: 'dan', privacyLabel: 'Kebijakan Privasi' },
  th: { authTitle: 'อย่าปล่อยเธอไป', authSubtitle: 'บันทึกความคืบหน้าเพื่อแชท', continueGoogle: 'ดำเนินการต่อด้วย Google', continueGuest: 'ดำเนินการต่อในฐานะผู้เยี่ยมชม', agreePrefix: 'เมื่อดำเนินการต่อ แสดงว่าคุณยอมรับ', termsLabel: 'ข้อกำหนด', andLabel: 'และ', privacyLabel: 'นโยบายความเป็นส่วนตัว' },
  ar: { authTitle: 'لا تفقدها.', authSubtitle: 'احفظ تقدّمك للدردشة.', continueGoogle: 'المتابعة مع Google', continueGuest: 'المتابعة كضيف', agreePrefix: 'بالمتابعة، فإنك توافق على', termsLabel: 'الشروط', andLabel: 'و', privacyLabel: 'سياسة الخصوصية' },
};

export const getAuthStrings = (lang?: string): AuthStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return AUTH_STRINGS[code] || AUTH_STRINGS.en;
};

export const useAuthStrings = (): AuthStrings => {
  const { i18n } = useTranslation();
  return getAuthStrings(i18n.language);
};

// ── Screen 09 — Chat ──────────────────────────────────────────────────────────
export type ChatStrings = {
  online: string;
  messagePlaceholder: string; // uses {name}
  today: string; // timestamp prefix, e.g. "Today, 9:41 PM"
  suggestedReplies: string[]; // starter reply chips
  limit: string; // header chip
  limitTitle: string; // uses {n}
  limitSubtitle: string; // uses {name}
  unlock: string;
  upgradeToContinue: string; // locked composer placeholder
  menuDelete: string; // 3-dot menu: delete conversation
  menuReport: string; // 3-dot menu: report conversation
  menuUpgrade: string; // 3-dot menu: upgrade to Pro
  deleteTitle: string; // delete-confirm dialog title
  deleteBody: string; // delete-confirm dialog body, uses {name}
  deleteConfirm: string; // delete-confirm destructive button
  cancel: string; // generic cancel
};

export const CHAT_STRINGS: Record<string, ChatStrings> = {
  en: { online: 'Online', messagePlaceholder: 'Message {name}...', today: 'Today', suggestedReplies: ['Tell me more about yourself 😊', 'What are you thinking about?', 'How was your day? 💕', 'I missed you 🥺', 'What makes you happy?', "Let's play a game 😏"], limit: 'Limit', limitTitle: "You've used your {n} free messages", limitSubtitle: 'Upgrade to keep chatting with {name} ✨', unlock: 'Unlock', upgradeToContinue: 'Upgrade to continue...', menuDelete: 'Delete conversation', menuReport: 'Report conversation', menuUpgrade: 'Upgrade to Pro', deleteTitle: 'Delete conversation?', deleteBody: 'This permanently deletes your chat with {name}.', deleteConfirm: 'Delete', cancel: 'Cancel' },
  es: { online: 'En línea', messagePlaceholder: 'Escribe a {name}...', today: 'Hoy', suggestedReplies: ['Cuéntame más sobre ti 😊', '¿En qué estás pensando?', '¿Cómo estuvo tu día? 💕', 'Te extrañé 🥺', '¿Qué te hace feliz?', '¿Jugamos a algo? 😏'], limit: 'Límite', limitTitle: 'Has usado tus {n} mensajes gratis', limitSubtitle: 'Mejora para seguir chateando con {name} ✨', unlock: 'Desbloquear', upgradeToContinue: 'Mejora para continuar...', menuDelete: 'Eliminar conversación', menuReport: 'Reportar conversación', menuUpgrade: 'Mejorar a Pro', deleteTitle: '¿Eliminar conversación?', deleteBody: 'Esto elimina permanentemente tu chat con {name}.', deleteConfirm: 'Eliminar', cancel: 'Cancelar' },
  fr: { online: 'En ligne', messagePlaceholder: 'Écrire à {name}...', today: "Aujourd'hui", suggestedReplies: ['Parle-moi un peu de toi 😊', 'À quoi penses-tu ?', 'Comment s’est passée ta journée ? 💕', 'Tu m’as manqué 🥺', 'Qu’est-ce qui te rend heureux ?', 'On joue à un jeu ? 😏'], limit: 'Limite', limitTitle: 'Tu as utilisé tes {n} messages gratuits', limitSubtitle: 'Passe au premium pour continuer avec {name} ✨', unlock: 'Débloquer', upgradeToContinue: 'Améliore pour continuer...', menuDelete: 'Supprimer la conversation', menuReport: 'Signaler la conversation', menuUpgrade: 'Passer à Pro', deleteTitle: 'Supprimer la conversation ?', deleteBody: 'Cela supprime définitivement ta discussion avec {name}.', deleteConfirm: 'Supprimer', cancel: 'Annuler' },
  de: { online: 'Online', messagePlaceholder: 'Nachricht an {name}...', today: 'Heute', suggestedReplies: ['Erzähl mir mehr über dich 😊', 'Woran denkst du gerade?', 'Wie war dein Tag? 💕', 'Ich habe dich vermisst 🥺', 'Was macht dich glücklich?', 'Spielen wir ein Spiel? 😏'], limit: 'Limit', limitTitle: 'Du hast deine {n} kostenlosen Nachrichten verbraucht', limitSubtitle: 'Upgrade, um weiter mit {name} zu chatten ✨', unlock: 'Freischalten', upgradeToContinue: 'Upgrade, um fortzufahren...', menuDelete: 'Konversation löschen', menuReport: 'Konversation melden', menuUpgrade: 'Auf Pro upgraden', deleteTitle: 'Konversation löschen?', deleteBody: 'Dadurch wird dein Chat mit {name} endgültig gelöscht.', deleteConfirm: 'Löschen', cancel: 'Abbrechen' },
  ja: { online: 'オンライン', messagePlaceholder: '{name}にメッセージ...', today: '今日', suggestedReplies: ['あなたのこと、もっと教えて 😊', '今、何を考えてる？', '今日はどうだった？💕', '会いたかったよ 🥺', '何をしてると楽しい？', 'ゲームしよう？😏'], limit: '上限', limitTitle: '無料メッセージ{n}件を使い切りました', limitSubtitle: '{name}とチャットを続けるにはアップグレードを ✨', unlock: '解除', upgradeToContinue: '続けるにはアップグレード...', menuDelete: '会話を削除', menuReport: '会話を報告', menuUpgrade: 'Proにアップグレード', deleteTitle: '会話を削除しますか？', deleteBody: '{name}とのチャットが完全に削除されます。', deleteConfirm: '削除', cancel: 'キャンセル' },
  pt: { online: 'Online', messagePlaceholder: 'Mensagem para {name}...', today: 'Hoje', suggestedReplies: ['Conte-me mais sobre você 😊', 'No que você está pensando?', 'Como foi seu dia? 💕', 'Senti sua falta 🥺', 'O que te faz feliz?', 'Vamos jogar um jogo? 😏'], limit: 'Limite', limitTitle: 'Você usou suas {n} mensagens grátis', limitSubtitle: 'Faça upgrade para continuar com {name} ✨', unlock: 'Desbloquear', upgradeToContinue: 'Faça upgrade para continuar...', menuDelete: 'Excluir conversa', menuReport: 'Denunciar conversa', menuUpgrade: 'Fazer upgrade para Pro', deleteTitle: 'Excluir conversa?', deleteBody: 'Isto exclui permanentemente seu chat com {name}.', deleteConfirm: 'Excluir', cancel: 'Cancelar' },
  zh: { online: '在线', messagePlaceholder: '给{name}发消息...', today: '今天', suggestedReplies: ['多跟我说说你自己吧 😊', '你在想什么呢？', '今天过得怎么样？💕', '我好想你 🥺', '什么让你开心？', '我们玩个游戏吧 😏'], limit: '已达上限', limitTitle: '你已用完{n}条免费消息', limitSubtitle: '升级以继续和{name}聊天 ✨', unlock: '解锁', upgradeToContinue: '升级以继续……', menuDelete: '删除对话', menuReport: '举报对话', menuUpgrade: '升级到 Pro', deleteTitle: '删除对话？', deleteBody: '这将永久删除你与{name}的聊天。', deleteConfirm: '删除', cancel: '取消' },
  tr: { online: 'Çevrimiçi', messagePlaceholder: '{name} kişisine mesaj...', today: 'Bugün', suggestedReplies: ['Bana kendinden bahset 😊', 'Ne düşünüyorsun?', 'Günün nasıldı? 💕', 'Seni özledim 🥺', 'Seni ne mutlu eder?', 'Bir oyun oynayalım mı? 😏'], limit: 'Limit', limitTitle: '{n} ücretsiz mesajını kullandın', limitSubtitle: '{name} ile sohbete devam etmek için yükselt ✨', unlock: 'Kilidi aç', upgradeToContinue: 'Devam etmek için yükselt...', menuDelete: 'Sohbeti sil', menuReport: 'Sohbeti bildir', menuUpgrade: "Pro'ya yükselt", deleteTitle: 'Sohbet silinsin mi?', deleteBody: '{name} ile sohbetin kalıcı olarak silinir.', deleteConfirm: 'Sil', cancel: 'İptal' },
  ru: { online: 'В сети', messagePlaceholder: 'Сообщение для {name}...', today: 'Сегодня', suggestedReplies: ['Расскажи мне о себе 😊', 'О чём ты думаешь?', 'Как прошёл твой день? 💕', 'Я скучала по тебе 🥺', 'Что делает тебя счастливым?', 'Сыграем в игру? 😏'], limit: 'Лимит', limitTitle: 'Вы использовали свои {n} бесплатных сообщений', limitSubtitle: 'Оформите подписку, чтобы продолжить с {name} ✨', unlock: 'Разблокировать', upgradeToContinue: 'Оформите подписку...', menuDelete: 'Удалить переписку', menuReport: 'Пожаловаться', menuUpgrade: 'Перейти на Pro', deleteTitle: 'Удалить переписку?', deleteBody: 'Это навсегда удалит вашу переписку с {name}.', deleteConfirm: 'Удалить', cancel: 'Отмена' },
  hi: { online: 'ऑनलाइन', messagePlaceholder: '{name} को संदेश...', today: 'आज', suggestedReplies: ['अपने बारे में और बताओ 😊', 'तुम क्या सोच रहे हो?', 'तुम्हारा दिन कैसा रहा? 💕', 'मुझे तुम्हारी याद आई 🥺', 'तुम्हें क्या खुश करता है?', 'चलो एक गेम खेलें 😏'], limit: 'सीमा', limitTitle: 'आपने अपने {n} मुफ़्त संदेश इस्तेमाल कर लिए', limitSubtitle: '{name} से चैट जारी रखने के लिए अपग्रेड करें ✨', unlock: 'अनलॉक करें', upgradeToContinue: 'जारी रखने के लिए अपग्रेड करें...', menuDelete: 'बातचीत हटाएँ', menuReport: 'बातचीत की रिपोर्ट करें', menuUpgrade: 'Pro में अपग्रेड करें', deleteTitle: 'बातचीत हटाएँ?', deleteBody: 'इससे {name} के साथ आपकी चैट स्थायी रूप से हट जाएगी।', deleteConfirm: 'हटाएँ', cancel: 'रद्द करें' },
  it: { online: 'Online', messagePlaceholder: 'Messaggio a {name}...', today: 'Oggi', suggestedReplies: ["Parlami un po' di te 😊", 'A cosa stai pensando?', 'Com’è andata la giornata? 💕', 'Mi sei mancato 🥺', 'Cosa ti rende felice?', 'Giochiamo a un gioco? 😏'], limit: 'Limite', limitTitle: 'Hai usato i tuoi {n} messaggi gratuiti', limitSubtitle: "Passa al premium per continuare con {name} ✨", unlock: 'Sblocca', upgradeToContinue: "Esegui l'upgrade per continuare...", menuDelete: 'Elimina conversazione', menuReport: 'Segnala conversazione', menuUpgrade: 'Passa a Pro', deleteTitle: 'Eliminare la conversazione?', deleteBody: 'Questo elimina definitivamente la tua chat con {name}.', deleteConfirm: 'Elimina', cancel: 'Annulla' },
  nl: { online: 'Online', messagePlaceholder: 'Bericht aan {name}...', today: 'Vandaag', suggestedReplies: ['Vertel me meer over jezelf 😊', 'Waar denk je aan?', 'Hoe was je dag? 💕', 'Ik heb je gemist 🥺', 'Wat maakt je blij?', 'Zullen we een spelletje doen? 😏'], limit: 'Limiet', limitTitle: 'Je hebt je {n} gratis berichten gebruikt', limitSubtitle: 'Upgrade om te blijven chatten met {name} ✨', unlock: 'Ontgrendelen', upgradeToContinue: 'Upgrade om door te gaan...', menuDelete: 'Gesprek verwijderen', menuReport: 'Gesprek rapporteren', menuUpgrade: 'Upgraden naar Pro', deleteTitle: 'Gesprek verwijderen?', deleteBody: 'Dit verwijdert je chat met {name} definitief.', deleteConfirm: 'Verwijderen', cancel: 'Annuleren' },
  id: { online: 'Online', messagePlaceholder: 'Pesan ke {name}...', today: 'Hari ini', suggestedReplies: ['Ceritakan lebih banyak tentang dirimu 😊', 'Lagi memikirkan apa?', 'Gimana harimu? 💕', 'Aku kangen kamu 🥺', 'Apa yang membuatmu bahagia?', 'Yuk main game? 😏'], limit: 'Batas', limitTitle: 'Kamu telah memakai {n} pesan gratismu', limitSubtitle: 'Tingkatkan untuk terus mengobrol dengan {name} ✨', unlock: 'Buka', upgradeToContinue: 'Tingkatkan untuk lanjut...', menuDelete: 'Hapus percakapan', menuReport: 'Laporkan percakapan', menuUpgrade: 'Tingkatkan ke Pro', deleteTitle: 'Hapus percakapan?', deleteBody: 'Ini menghapus permanen obrolanmu dengan {name}.', deleteConfirm: 'Hapus', cancel: 'Batal' },
  th: { online: 'ออนไลน์', messagePlaceholder: 'ส่งข้อความถึง {name}...', today: 'วันนี้', suggestedReplies: ['เล่าเรื่องของคุณให้ฟังหน่อยสิ 😊', 'กำลังคิดอะไรอยู่?', 'วันนี้เป็นยังไงบ้าง? 💕', 'คิดถึงนะ 🥺', 'อะไรทำให้คุณมีความสุข?', 'มาเล่นเกมกันไหม? 😏'], limit: 'ครบแล้ว', limitTitle: 'คุณใช้ข้อความฟรี {n} ข้อความหมดแล้ว', limitSubtitle: 'อัปเกรดเพื่อแชทกับ {name} ต่อ ✨', unlock: 'ปลดล็อก', upgradeToContinue: 'อัปเกรดเพื่อไปต่อ...', menuDelete: 'ลบการสนทนา', menuReport: 'รายงานการสนทนา', menuUpgrade: 'อัปเกรดเป็น Pro', deleteTitle: 'ลบการสนทนา?', deleteBody: 'การทำเช่นนี้จะลบแชทของคุณกับ {name} อย่างถาวร', deleteConfirm: 'ลบ', cancel: 'ยกเลิก' },
  ar: { online: 'متصل', messagePlaceholder: 'رسالة إلى {name}...', today: 'اليوم', suggestedReplies: ['أخبرني المزيد عن نفسك 😊', 'بماذا تفكر؟', 'كيف كان يومك؟ 💕', 'اشتقت إليك 🥺', 'ما الذي يسعدك؟', 'هل نلعب لعبة؟ 😏'], limit: 'الحد', limitTitle: 'لقد استخدمت رسائلك المجانية الـ {n}', limitSubtitle: 'قم بالترقية لمواصلة الدردشة مع {name} ✨', unlock: 'فتح', upgradeToContinue: 'قم بالترقية للمتابعة...', menuDelete: 'حذف المحادثة', menuReport: 'الإبلاغ عن المحادثة', menuUpgrade: 'الترقية إلى Pro', deleteTitle: 'حذف المحادثة؟', deleteBody: 'سيؤدي هذا إلى حذف محادثتك مع {name} نهائيًا.', deleteConfirm: 'حذف', cancel: 'إلغاء' },
};

export const getChatStrings = (lang?: string): ChatStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return CHAT_STRINGS[code] || CHAT_STRINGS.en;
};

export const useChatStrings = (): ChatStrings => {
  const { i18n } = useTranslation();
  return getChatStrings(i18n.language);
};

// ── Screen 10 — Home (Recent Connections / characters list) ───────────────────
export type HomeStrings = {
  recentTitle: string;
  recentSubtitle: string;
  discoverTitle: string;
  discoverSubtitle: string;
  emptyTitle: string;
  emptySubtitle: string;
  justNow: string;
  navDiscover: string;
  navMessages: string;
  navSettings: string;
};

export const HOME_STRINGS: Record<string, HomeStrings> = {
  en: { recentTitle: 'Recent Connections', recentSubtitle: 'Pick up where you left off in your private sanctuary.', discoverTitle: 'Choose your Companion', discoverSubtitle: 'Select a companion to have a conversation', emptyTitle: 'No conversations yet', emptySubtitle: 'Head to Discover to meet your companions.', justNow: 'Just now', navDiscover: 'Discover', navMessages: 'Messages', navSettings: 'Settings' },
  es: { recentTitle: 'Conexiones recientes', recentSubtitle: 'Retoma donde lo dejaste en tu santuario privado.', discoverTitle: 'Elige tu compañera', discoverSubtitle: 'Selecciona una compañera para conversar', emptyTitle: 'Aún no hay conversaciones', emptySubtitle: 'Ve a Descubrir para conocer a tus compañeras.', justNow: 'Ahora mismo', navDiscover: 'Descubrir', navMessages: 'Mensajes', navSettings: 'Ajustes' },
  fr: { recentTitle: 'Connexions récentes', recentSubtitle: "Reprends là où tu t'es arrêté dans ton sanctuaire privé.", discoverTitle: 'Choisis ta compagne', discoverSubtitle: 'Sélectionne une compagne pour discuter', emptyTitle: 'Pas encore de conversations', emptySubtitle: 'Va dans Découvrir pour rencontrer tes compagnes.', justNow: "À l'instant", navDiscover: 'Découvrir', navMessages: 'Messages', navSettings: 'Réglages' },
  de: { recentTitle: 'Letzte Verbindungen', recentSubtitle: 'Mach da weiter, wo du in deinem privaten Refugium aufgehört hast.', discoverTitle: 'Wähle deine Begleiterin', discoverSubtitle: 'Wähle eine Begleiterin für ein Gespräch', emptyTitle: 'Noch keine Gespräche', emptySubtitle: 'Geh zu Entdecken, um deine Begleiterinnen zu treffen.', justNow: 'Gerade eben', navDiscover: 'Entdecken', navMessages: 'Nachrichten', navSettings: 'Einstellungen' },
  ja: { recentTitle: '最近のつながり', recentSubtitle: 'あなただけの場所で、続きを楽しみましょう。', discoverTitle: '相手を選んで', discoverSubtitle: '会話する相手を選んでください', emptyTitle: 'まだ会話がありません', emptySubtitle: '「見つける」から相手を探しましょう。', justNow: 'たった今', navDiscover: '見つける', navMessages: 'メッセージ', navSettings: '設定' },
  pt: { recentTitle: 'Conexões recentes', recentSubtitle: 'Continue de onde parou no seu santuário privado.', discoverTitle: 'Escolha sua companhia', discoverSubtitle: 'Selecione uma companhia para conversar', emptyTitle: 'Ainda não há conversas', emptySubtitle: 'Vá para Descobrir para conhecer suas companhias.', justNow: 'Agora mesmo', navDiscover: 'Descobrir', navMessages: 'Mensagens', navSettings: 'Configurações' },
  zh: { recentTitle: '最近的联系', recentSubtitle: '在你的专属空间，继续未完的故事。', discoverTitle: '选择你的伴侣', discoverSubtitle: '选择一位伴侣开始对话', emptyTitle: '还没有对话', emptySubtitle: '去「发现」结识你的伴侣吧。', justNow: '刚刚', navDiscover: '发现', navMessages: '消息', navSettings: '设置' },
  tr: { recentTitle: 'Son bağlantılar', recentSubtitle: 'Özel sığınağında kaldığın yerden devam et.', discoverTitle: 'Arkadaşını seç', discoverSubtitle: 'Sohbet etmek için bir arkadaş seç', emptyTitle: 'Henüz sohbet yok', emptySubtitle: "Arkadaşlarınla tanışmak için Keşfet'e git.", justNow: 'Az önce', navDiscover: 'Keşfet', navMessages: 'Mesajlar', navSettings: 'Ayarlar' },
  ru: { recentTitle: 'Недавние связи', recentSubtitle: 'Продолжи с того места, где остановился, в своём уголке.', discoverTitle: 'Выбери спутницу', discoverSubtitle: 'Выбери спутницу для разговора', emptyTitle: 'Пока нет разговоров', emptySubtitle: 'Загляни в Обзор, чтобы познакомиться со спутницами.', justNow: 'Только что', navDiscover: 'Обзор', navMessages: 'Сообщения', navSettings: 'Настройки' },
  hi: { recentTitle: 'हाल के कनेक्शन', recentSubtitle: 'अपने निजी कोने में वहीं से शुरू करें जहाँ छोड़ा था।', discoverTitle: 'अपनी साथी चुनें', discoverSubtitle: 'बातचीत के लिए एक साथी चुनें', emptyTitle: 'अभी कोई बातचीत नहीं', emptySubtitle: 'अपनी साथियों से मिलने के लिए खोजें पर जाएँ।', justNow: 'अभी', navDiscover: 'खोजें', navMessages: 'संदेश', navSettings: 'सेटिंग्स' },
  it: { recentTitle: 'Connessioni recenti', recentSubtitle: 'Riprendi da dove eri rimasto nel tuo rifugio privato.', discoverTitle: 'Scegli la tua compagna', discoverSubtitle: 'Seleziona una compagna per chiacchierare', emptyTitle: 'Ancora nessuna conversazione', emptySubtitle: 'Vai su Scopri per conoscere le tue compagne.', justNow: 'Proprio ora', navDiscover: 'Scopri', navMessages: 'Messaggi', navSettings: 'Impostazioni' },
  nl: { recentTitle: 'Recente connecties', recentSubtitle: 'Ga verder waar je gebleven was in je eigen plek.', discoverTitle: 'Kies je metgezel', discoverSubtitle: 'Kies een metgezel om mee te praten', emptyTitle: 'Nog geen gesprekken', emptySubtitle: 'Ga naar Ontdekken om je metgezellen te ontmoeten.', justNow: 'Zojuist', navDiscover: 'Ontdekken', navMessages: 'Berichten', navSettings: 'Instellingen' },
  id: { recentTitle: 'Koneksi terbaru', recentSubtitle: 'Lanjutkan dari tempat terakhirmu di ruang pribadimu.', discoverTitle: 'Pilih pendampingmu', discoverSubtitle: 'Pilih pendamping untuk mengobrol', emptyTitle: 'Belum ada percakapan', emptySubtitle: 'Buka Jelajahi untuk menemui pendampingmu.', justNow: 'Baru saja', navDiscover: 'Jelajahi', navMessages: 'Pesan', navSettings: 'Pengaturan' },
  th: { recentTitle: 'การเชื่อมต่อล่าสุด', recentSubtitle: 'กลับมาต่อจากที่ค้างไว้ในพื้นที่ส่วนตัวของคุณ', discoverTitle: 'เลือกคู่สนทนาของคุณ', discoverSubtitle: 'เลือกคู่สนทนาเพื่อพูดคุย', emptyTitle: 'ยังไม่มีบทสนทนา', emptySubtitle: 'ไปที่ค้นพบเพื่อพบกับคู่สนทนาของคุณ', justNow: 'เมื่อกี้นี้', navDiscover: 'ค้นพบ', navMessages: 'ข้อความ', navSettings: 'ตั้งค่า' },
  ar: { recentTitle: 'الاتصالات الأخيرة', recentSubtitle: 'تابع من حيث توقفت في ملاذك الخاص.', discoverTitle: 'اختر رفيقتك', discoverSubtitle: 'اختر رفيقة للدردشة', emptyTitle: 'لا محادثات بعد', emptySubtitle: 'انتقل إلى اكتشف للقاء رفيقاتك.', justNow: 'الآن', navDiscover: 'اكتشف', navMessages: 'الرسائل', navSettings: 'الإعدادات' },
};

export const getHomeStrings = (lang?: string): HomeStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return HOME_STRINGS[code] || HOME_STRINGS.en;
};

export const useHomeStrings = (): HomeStrings => {
  const { i18n } = useTranslation();
  return getHomeStrings(i18n.language);
};

// ── Screen 12 — Settings ──────────────────────────────────────────────────────
export type SettingsStrings = {
  title: string;
  subtitle: string;
  premiumTitle: string;
  premiumSubtitle: string;
  upgradeNow: string;
  premiumActive: string;
  account: string;
  preferences: string;
  support: string;
  editProfile: string;
  subscription: string;
  freePlan: string;
  premiumPlan: string;
  notifications: string;
  appearance: string;
  darkMode: string;
  privacy: string;
  helpCenter: string;
  about: string;
  logout: string;
  logoutConfirm: string;
  cancel: string;
  comingSoon: string;
};

export const SETTINGS_STRINGS: Record<string, SettingsStrings> = {
  en: { title: 'Settings', subtitle: 'Manage your preferences and account.', premiumTitle: 'Get Premium', premiumSubtitle: 'Unlock ultra-realistic interactions and unlimited memory.', upgradeNow: 'Upgrade Now', premiumActive: 'Premium active — enjoy unlimited chats ✨', account: 'Account', preferences: 'Preferences', support: 'Support', editProfile: 'Edit Profile', subscription: 'Subscription', freePlan: 'Free Plan', premiumPlan: 'Premium', notifications: 'Notifications', appearance: 'Appearance', darkMode: 'Dark Mode', privacy: 'Privacy & Security', helpCenter: 'Help Center', about: 'About Sarina', logout: 'Logout', logoutConfirm: "You'll need to sign in again to continue.", cancel: 'Cancel', comingSoon: 'Coming soon' },
  es: { title: 'Ajustes', subtitle: 'Gestiona tus preferencias y tu cuenta.', premiumTitle: 'Hazte Premium', premiumSubtitle: 'Desbloquea interacciones ultrarrealistas y memoria ilimitada.', upgradeNow: 'Mejorar ahora', premiumActive: 'Premium activo: disfruta de chats ilimitados ✨', account: 'Cuenta', preferences: 'Preferencias', support: 'Soporte', editProfile: 'Editar perfil', subscription: 'Suscripción', freePlan: 'Plan gratis', premiumPlan: 'Premium', notifications: 'Notificaciones', appearance: 'Apariencia', darkMode: 'Modo oscuro', privacy: 'Privacidad y seguridad', helpCenter: 'Centro de ayuda', about: 'Acerca de Sarina', logout: 'Cerrar sesión', logoutConfirm: 'Tendrás que iniciar sesión de nuevo para continuar.', cancel: 'Cancelar', comingSoon: 'Próximamente' },
  fr: { title: 'Réglages', subtitle: 'Gère tes préférences et ton compte.', premiumTitle: 'Passer Premium', premiumSubtitle: 'Débloque des interactions ultra-réalistes et une mémoire illimitée.', upgradeNow: 'Améliorer', premiumActive: 'Premium actif — profite de discussions illimitées ✨', account: 'Compte', preferences: 'Préférences', support: 'Assistance', editProfile: 'Modifier le profil', subscription: 'Abonnement', freePlan: 'Formule gratuite', premiumPlan: 'Premium', notifications: 'Notifications', appearance: 'Apparence', darkMode: 'Mode sombre', privacy: 'Confidentialité et sécurité', helpCenter: "Centre d'aide", about: 'À propos de Sarina', logout: 'Déconnexion', logoutConfirm: 'Tu devras te reconnecter pour continuer.', cancel: 'Annuler', comingSoon: 'Bientôt disponible' },
  de: { title: 'Einstellungen', subtitle: 'Verwalte deine Einstellungen und dein Konto.', premiumTitle: 'Premium holen', premiumSubtitle: 'Schalte ultrarealistische Interaktionen und unbegrenztes Gedächtnis frei.', upgradeNow: 'Jetzt upgraden', premiumActive: 'Premium aktiv — genieße unbegrenzte Chats ✨', account: 'Konto', preferences: 'Präferenzen', support: 'Support', editProfile: 'Profil bearbeiten', subscription: 'Abo', freePlan: 'Kostenloser Plan', premiumPlan: 'Premium', notifications: 'Benachrichtigungen', appearance: 'Erscheinungsbild', darkMode: 'Dunkelmodus', privacy: 'Datenschutz & Sicherheit', helpCenter: 'Hilfecenter', about: 'Über Sarina', logout: 'Abmelden', logoutConfirm: 'Du musst dich erneut anmelden, um fortzufahren.', cancel: 'Abbrechen', comingSoon: 'Demnächst' },
  ja: { title: '設定', subtitle: '設定とアカウントを管理します。', premiumTitle: 'プレミアムを入手', premiumSubtitle: '超リアルな対話と無制限のメモリーを解放。', upgradeNow: '今すぐアップグレード', premiumActive: 'プレミアム有効 — 無制限のチャットを楽しんで ✨', account: 'アカウント', preferences: '環境設定', support: 'サポート', editProfile: 'プロフィールを編集', subscription: 'サブスクリプション', freePlan: '無料プラン', premiumPlan: 'プレミアム', notifications: '通知', appearance: '外観', darkMode: 'ダークモード', privacy: 'プライバシーとセキュリティ', helpCenter: 'ヘルプセンター', about: 'Sarinaについて', logout: 'ログアウト', logoutConfirm: '続けるには再度ログインが必要です。', cancel: 'キャンセル', comingSoon: '近日公開' },
  pt: { title: 'Configurações', subtitle: 'Gerencie suas preferências e sua conta.', premiumTitle: 'Obter Premium', premiumSubtitle: 'Desbloqueie interações ultrarrealistas e memória ilimitada.', upgradeNow: 'Fazer upgrade', premiumActive: 'Premium ativo — aproveite conversas ilimitadas ✨', account: 'Conta', preferences: 'Preferências', support: 'Suporte', editProfile: 'Editar perfil', subscription: 'Assinatura', freePlan: 'Plano grátis', premiumPlan: 'Premium', notifications: 'Notificações', appearance: 'Aparência', darkMode: 'Modo escuro', privacy: 'Privacidade e segurança', helpCenter: 'Central de ajuda', about: 'Sobre a Sarina', logout: 'Sair', logoutConfirm: 'Você precisará entrar novamente para continuar.', cancel: 'Cancelar', comingSoon: 'Em breve' },
  zh: { title: '设置', subtitle: '管理你的偏好和账户。', premiumTitle: '开通高级版', premiumSubtitle: '解锁超真实互动和无限记忆。', upgradeNow: '立即升级', premiumActive: '高级版已激活——尽享无限畅聊 ✨', account: '账户', preferences: '偏好设置', support: '支持', editProfile: '编辑资料', subscription: '订阅', freePlan: '免费版', premiumPlan: '高级版', notifications: '通知', appearance: '外观', darkMode: '深色模式', privacy: '隐私与安全', helpCenter: '帮助中心', about: '关于 Sarina', logout: '退出登录', logoutConfirm: '你需要重新登录才能继续。', cancel: '取消', comingSoon: '敬请期待' },
  tr: { title: 'Ayarlar', subtitle: 'Tercihlerini ve hesabını yönet.', premiumTitle: 'Premium Al', premiumSubtitle: 'Ultra gerçekçi etkileşimleri ve sınırsız hafızayı aç.', upgradeNow: 'Şimdi Yükselt', premiumActive: 'Premium aktif — sınırsız sohbetin keyfini çıkar ✨', account: 'Hesap', preferences: 'Tercihler', support: 'Destek', editProfile: 'Profili Düzenle', subscription: 'Abonelik', freePlan: 'Ücretsiz Plan', premiumPlan: 'Premium', notifications: 'Bildirimler', appearance: 'Görünüm', darkMode: 'Koyu Mod', privacy: 'Gizlilik ve Güvenlik', helpCenter: 'Yardım Merkezi', about: 'Sarina Hakkında', logout: 'Çıkış Yap', logoutConfirm: 'Devam etmek için tekrar giriş yapman gerekir.', cancel: 'İptal', comingSoon: 'Yakında' },
  ru: { title: 'Настройки', subtitle: 'Управляй настройками и аккаунтом.', premiumTitle: 'Получить Premium', premiumSubtitle: 'Открой сверхреалистичное общение и безлимитную память.', upgradeNow: 'Улучшить', premiumActive: 'Premium активен — наслаждайся безлимитными чатами ✨', account: 'Аккаунт', preferences: 'Параметры', support: 'Поддержка', editProfile: 'Изменить профиль', subscription: 'Подписка', freePlan: 'Бесплатный план', premiumPlan: 'Premium', notifications: 'Уведомления', appearance: 'Оформление', darkMode: 'Тёмная тема', privacy: 'Конфиденциальность и безопасность', helpCenter: 'Центр помощи', about: 'О Sarina', logout: 'Выйти', logoutConfirm: 'Чтобы продолжить, нужно снова войти.', cancel: 'Отмена', comingSoon: 'Скоро' },
  hi: { title: 'सेटिंग्स', subtitle: 'अपनी प्राथमिकताएँ और खाता प्रबंधित करें।', premiumTitle: 'प्रीमियम लें', premiumSubtitle: 'अल्ट्रा-रियलिस्टिक बातचीत और असीमित मेमोरी अनलॉक करें।', upgradeNow: 'अभी अपग्रेड करें', premiumActive: 'प्रीमियम सक्रिय — असीमित चैट का आनंद लें ✨', account: 'खाता', preferences: 'प्राथमिकताएँ', support: 'सहायता', editProfile: 'प्रोफ़ाइल संपादित करें', subscription: 'सब्सक्रिप्शन', freePlan: 'फ्री प्लान', premiumPlan: 'प्रीमियम', notifications: 'सूचनाएँ', appearance: 'दिखावट', darkMode: 'डार्क मोड', privacy: 'गोपनीयता और सुरक्षा', helpCenter: 'सहायता केंद्र', about: 'Sarina के बारे में', logout: 'लॉग आउट', logoutConfirm: 'जारी रखने के लिए आपको फिर से साइन इन करना होगा।', cancel: 'रद्द करें', comingSoon: 'जल्द आ रहा है' },
  it: { title: 'Impostazioni', subtitle: 'Gestisci le tue preferenze e il tuo account.', premiumTitle: 'Passa a Premium', premiumSubtitle: 'Sblocca interazioni ultrarealistiche e memoria illimitata.', upgradeNow: 'Esegui upgrade', premiumActive: 'Premium attivo — goditi chat illimitate ✨', account: 'Account', preferences: 'Preferenze', support: 'Supporto', editProfile: 'Modifica profilo', subscription: 'Abbonamento', freePlan: 'Piano gratuito', premiumPlan: 'Premium', notifications: 'Notifiche', appearance: 'Aspetto', darkMode: 'Modalità scura', privacy: 'Privacy e sicurezza', helpCenter: 'Centro assistenza', about: 'Informazioni su Sarina', logout: 'Esci', logoutConfirm: 'Dovrai accedere di nuovo per continuare.', cancel: 'Annulla', comingSoon: 'Prossimamente' },
  nl: { title: 'Instellingen', subtitle: 'Beheer je voorkeuren en account.', premiumTitle: 'Premium nemen', premiumSubtitle: 'Ontgrendel ultrarealistische interacties en onbeperkt geheugen.', upgradeNow: 'Nu upgraden', premiumActive: 'Premium actief — geniet van onbeperkte chats ✨', account: 'Account', preferences: 'Voorkeuren', support: 'Ondersteuning', editProfile: 'Profiel bewerken', subscription: 'Abonnement', freePlan: 'Gratis abonnement', premiumPlan: 'Premium', notifications: 'Meldingen', appearance: 'Weergave', darkMode: 'Donkere modus', privacy: 'Privacy en beveiliging', helpCenter: 'Helpcentrum', about: 'Over Sarina', logout: 'Uitloggen', logoutConfirm: 'Je moet opnieuw inloggen om door te gaan.', cancel: 'Annuleren', comingSoon: 'Binnenkort' },
  id: { title: 'Pengaturan', subtitle: 'Kelola preferensi dan akunmu.', premiumTitle: 'Dapatkan Premium', premiumSubtitle: 'Buka interaksi ultra-realistis dan memori tanpa batas.', upgradeNow: 'Tingkatkan Sekarang', premiumActive: 'Premium aktif — nikmati obrolan tanpa batas ✨', account: 'Akun', preferences: 'Preferensi', support: 'Dukungan', editProfile: 'Edit Profil', subscription: 'Langganan', freePlan: 'Paket Gratis', premiumPlan: 'Premium', notifications: 'Notifikasi', appearance: 'Tampilan', darkMode: 'Mode Gelap', privacy: 'Privasi & Keamanan', helpCenter: 'Pusat Bantuan', about: 'Tentang Sarina', logout: 'Keluar', logoutConfirm: 'Kamu perlu masuk lagi untuk melanjutkan.', cancel: 'Batal', comingSoon: 'Segera hadir' },
  th: { title: 'การตั้งค่า', subtitle: 'จัดการการตั้งค่าและบัญชีของคุณ', premiumTitle: 'รับพรีเมียม', premiumSubtitle: 'ปลดล็อกการโต้ตอบสมจริงสุด ๆ และความจำไม่จำกัด', upgradeNow: 'อัปเกรดเลย', premiumActive: 'พรีเมียมเปิดใช้งานแล้ว — สนุกกับแชทไม่จำกัด ✨', account: 'บัญชี', preferences: 'การตั้งค่า', support: 'ช่วยเหลือ', editProfile: 'แก้ไขโปรไฟล์', subscription: 'การสมัครสมาชิก', freePlan: 'แผนฟรี', premiumPlan: 'พรีเมียม', notifications: 'การแจ้งเตือน', appearance: 'รูปลักษณ์', darkMode: 'โหมดมืด', privacy: 'ความเป็นส่วนตัวและความปลอดภัย', helpCenter: 'ศูนย์ช่วยเหลือ', about: 'เกี่ยวกับ Sarina', logout: 'ออกจากระบบ', logoutConfirm: 'คุณต้องเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ', cancel: 'ยกเลิก', comingSoon: 'เร็ว ๆ นี้' },
  ar: { title: 'الإعدادات', subtitle: 'أدر تفضيلاتك وحسابك.', premiumTitle: 'احصل على بريميوم', premiumSubtitle: 'افتح تفاعلات فائقة الواقعية وذاكرة غير محدودة.', upgradeNow: 'الترقية الآن', premiumActive: 'بريميوم مُفعّل — استمتع بدردشات غير محدودة ✨', account: 'الحساب', preferences: 'التفضيلات', support: 'الدعم', editProfile: 'تعديل الملف الشخصي', subscription: 'الاشتراك', freePlan: 'الخطة المجانية', premiumPlan: 'بريميوم', notifications: 'الإشعارات', appearance: 'المظهر', darkMode: 'الوضع الداكن', privacy: 'الخصوصية والأمان', helpCenter: 'مركز المساعدة', about: 'حول Sarina', logout: 'تسجيل الخروج', logoutConfirm: 'ستحتاج إلى تسجيل الدخول مرة أخرى للمتابعة.', cancel: 'إلغاء', comingSoon: 'قريبًا' },
};

export const getSettingsStrings = (lang?: string): SettingsStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return SETTINGS_STRINGS[code] || SETTINGS_STRINGS.en;
};

export const useSettingsStrings = (): SettingsStrings => {
  const { i18n } = useTranslation();
  return getSettingsStrings(i18n.language);
};

// Delete-account strings (kept separate so the Settings block stays readable).
export type DeleteAccountStrings = {
  deleteAccount: string;
  deleteConfirm: string;
  delete: string;
  deleteFailed: string;
};

export const DELETE_ACCOUNT_STRINGS: Record<string, DeleteAccountStrings> = {
  en: { deleteAccount: 'Delete Account', deleteConfirm: "This permanently deletes your account and all your data. This can't be undone.", delete: 'Delete', deleteFailed: "Couldn't delete your account. Please sign out, sign in again, and retry." },
  es: { deleteAccount: 'Eliminar cuenta', deleteConfirm: 'Esto elimina permanentemente tu cuenta y todos tus datos. No se puede deshacer.', delete: 'Eliminar', deleteFailed: 'No se pudo eliminar tu cuenta. Cierra sesión, vuelve a entrar e inténtalo de nuevo.' },
  fr: { deleteAccount: 'Supprimer le compte', deleteConfirm: 'Cela supprime définitivement ton compte et toutes tes données. Action irréversible.', delete: 'Supprimer', deleteFailed: 'Impossible de supprimer ton compte. Déconnecte-toi, reconnecte-toi et réessaie.' },
  de: { deleteAccount: 'Konto löschen', deleteConfirm: 'Dies löscht dein Konto und alle deine Daten endgültig. Nicht rückgängig zu machen.', delete: 'Löschen', deleteFailed: 'Konto konnte nicht gelöscht werden. Melde dich ab, wieder an und versuche es erneut.' },
  ja: { deleteAccount: 'アカウントを削除', deleteConfirm: 'アカウントとすべてのデータが完全に削除されます。元に戻せません。', delete: '削除', deleteFailed: 'アカウントを削除できませんでした。一度ログアウトして再度ログインし、もう一度お試しください。' },
  pt: { deleteAccount: 'Excluir conta', deleteConfirm: 'Isso exclui permanentemente sua conta e todos os seus dados. Não pode ser desfeito.', delete: 'Excluir', deleteFailed: 'Não foi possível excluir sua conta. Saia, entre novamente e tente de novo.' },
  zh: { deleteAccount: '删除账户', deleteConfirm: '这将永久删除你的账户和所有数据，且无法恢复。', delete: '删除', deleteFailed: '无法删除你的账户。请退出登录后重新登录再试。' },
  tr: { deleteAccount: 'Hesabı Sil', deleteConfirm: 'Bu, hesabını ve tüm verilerini kalıcı olarak siler. Geri alınamaz.', delete: 'Sil', deleteFailed: 'Hesabın silinemedi. Çıkış yapıp tekrar giriş yap ve yeniden dene.' },
  ru: { deleteAccount: 'Удалить аккаунт', deleteConfirm: 'Это навсегда удалит ваш аккаунт и все данные. Отменить нельзя.', delete: 'Удалить', deleteFailed: 'Не удалось удалить аккаунт. Выйдите, войдите снова и повторите попытку.' },
  hi: { deleteAccount: 'खाता हटाएं', deleteConfirm: 'इससे आपका खाता और सारा डेटा स्थायी रूप से हट जाएगा। इसे वापस नहीं लाया जा सकता।', delete: 'हटाएं', deleteFailed: 'आपका खाता नहीं हटाया जा सका। कृपया साइन आउट करके फिर साइन इन करें और दोबारा कोशिश करें।' },
  it: { deleteAccount: 'Elimina account', deleteConfirm: 'Questo elimina definitivamente il tuo account e tutti i tuoi dati. Non è reversibile.', delete: 'Elimina', deleteFailed: 'Impossibile eliminare il tuo account. Esci, accedi di nuovo e riprova.' },
  nl: { deleteAccount: 'Account verwijderen', deleteConfirm: 'Hiermee worden je account en al je gegevens permanent verwijderd. Dit kan niet ongedaan worden gemaakt.', delete: 'Verwijderen', deleteFailed: 'Je account kon niet worden verwijderd. Log uit, log opnieuw in en probeer het nog eens.' },
  id: { deleteAccount: 'Hapus Akun', deleteConfirm: 'Ini akan menghapus akun dan semua datamu secara permanen. Tidak bisa dibatalkan.', delete: 'Hapus', deleteFailed: 'Tidak bisa menghapus akunmu. Keluar, masuk lagi, lalu coba ulang.' },
  th: { deleteAccount: 'ลบบัญชี', deleteConfirm: 'การกระทำนี้จะลบบัญชีและข้อมูลทั้งหมดของคุณอย่างถาวร และไม่สามารถย้อนกลับได้', delete: 'ลบ', deleteFailed: 'ไม่สามารถลบบัญชีของคุณได้ กรุณาออกจากระบบ เข้าสู่ระบบใหม่ แล้วลองอีกครั้ง' },
  ar: { deleteAccount: 'حذف الحساب', deleteConfirm: 'سيؤدي هذا إلى حذف حسابك وكل بياناتك نهائيًا. لا يمكن التراجع عنه.', delete: 'حذف', deleteFailed: 'تعذّر حذف حسابك. سجّل الخروج ثم الدخول مرة أخرى وأعد المحاولة.' },
};

export const getDeleteAccountStrings = (lang?: string): DeleteAccountStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return DELETE_ACCOUNT_STRINGS[code] || DELETE_ACCOUNT_STRINGS.en;
};

export const useDeleteAccountStrings = (): DeleteAccountStrings => {
  const { i18n } = useTranslation();
  return getDeleteAccountStrings(i18n.language);
};

// Extra Settings strings (share/rate/report/legal/notification toggle).
export type SettingsExtraStrings = {
  shareApp: string;
  rateUs: string;
  reportProblem: string;
  terms: string;
  privacyPolicy: string;
  notifEnabled: string;
  notifDisabled: string;
  shareMessage: string; // app URL appended in code
};

export const SETTINGS_EXTRA_STRINGS: Record<string, SettingsExtraStrings> = {
  en: { shareApp: 'Share App', rateUs: 'Rate Us', reportProblem: 'Report a Problem', terms: 'Terms of Service', privacyPolicy: 'Privacy Policy', notifEnabled: 'Notifications are on ✓', notifDisabled: "Turn on notifications in your phone's Settings so she can reach you.", shareMessage: 'Meet your AI companion on Sarina 💕' },
  es: { shareApp: 'Compartir app', rateUs: 'Califícanos', reportProblem: 'Reportar un problema', terms: 'Términos del servicio', privacyPolicy: 'Política de privacidad', notifEnabled: 'Las notificaciones están activadas ✓', notifDisabled: 'Activa las notificaciones en los ajustes de tu teléfono para que ella pueda contactarte.', shareMessage: 'Conoce a tu compañera de IA en Sarina 💕' },
  fr: { shareApp: "Partager l'app", rateUs: 'Notez-nous', reportProblem: 'Signaler un problème', terms: "Conditions d'utilisation", privacyPolicy: 'Politique de confidentialité', notifEnabled: 'Les notifications sont activées ✓', notifDisabled: 'Active les notifications dans les réglages de ton téléphone pour qu’elle puisse te joindre.', shareMessage: 'Rencontre ta compagne IA sur Sarina 💕' },
  de: { shareApp: 'App teilen', rateUs: 'Bewerte uns', reportProblem: 'Problem melden', terms: 'Nutzungsbedingungen', privacyPolicy: 'Datenschutzrichtlinie', notifEnabled: 'Benachrichtigungen sind an ✓', notifDisabled: 'Aktiviere Benachrichtigungen in den Einstellungen deines Handys, damit sie dich erreichen kann.', shareMessage: 'Triff deine KI-Begleiterin auf Sarina 💕' },
  ja: { shareApp: 'アプリを共有', rateUs: '評価する', reportProblem: '問題を報告', terms: '利用規約', privacyPolicy: 'プライバシーポリシー', notifEnabled: '通知はオンです ✓', notifDisabled: '彼女から連絡が届くように、スマホの設定で通知をオンにしてね。', shareMessage: 'SarinaでAIの相手に出会おう 💕' },
  pt: { shareApp: 'Compartilhar app', rateUs: 'Avalie-nos', reportProblem: 'Relatar um problema', terms: 'Termos de Serviço', privacyPolicy: 'Política de Privacidade', notifEnabled: 'As notificações estão ativadas ✓', notifDisabled: 'Ative as notificações nas configurações do seu celular para ela poder falar com você.', shareMessage: 'Conheça sua companhia de IA no Sarina 💕' },
  zh: { shareApp: '分享应用', rateUs: '给我们评分', reportProblem: '报告问题', terms: '服务条款', privacyPolicy: '隐私政策', notifEnabled: '通知已开启 ✓', notifDisabled: '在手机设置中开启通知，她才能联系到你。', shareMessage: '在 Sarina 遇见你的 AI 伴侣 💕' },
  tr: { shareApp: 'Uygulamayı paylaş', rateUs: 'Bizi değerlendir', reportProblem: 'Sorun bildir', terms: 'Hizmet Şartları', privacyPolicy: 'Gizlilik Politikası', notifEnabled: 'Bildirimler açık ✓', notifDisabled: 'O sana ulaşabilsin diye telefon ayarlarından bildirimleri aç.', shareMessage: "Sarina'da yapay zekâ arkadaşınla tanış 💕" },
  ru: { shareApp: 'Поделиться приложением', rateUs: 'Оценить нас', reportProblem: 'Сообщить о проблеме', terms: 'Условия использования', privacyPolicy: 'Политика конфиденциальности', notifEnabled: 'Уведомления включены ✓', notifDisabled: 'Включи уведомления в настройках телефона, чтобы она могла связаться с тобой.', shareMessage: 'Познакомься со своей ИИ-спутницей в Sarina 💕' },
  hi: { shareApp: 'ऐप शेयर करें', rateUs: 'हमें रेट करें', reportProblem: 'समस्या रिपोर्ट करें', terms: 'सेवा की शर्तें', privacyPolicy: 'गोपनीयता नीति', notifEnabled: 'सूचनाएँ चालू हैं ✓', notifDisabled: 'अपने फ़ोन की सेटिंग्स में नोटिफिकेशन चालू करें ताकि वो आप तक पहुँच सके।', shareMessage: 'Sarina पर अपनी AI साथी से मिलें 💕' },
  it: { shareApp: "Condividi l'app", rateUs: 'Valutaci', reportProblem: 'Segnala un problema', terms: 'Termini di Servizio', privacyPolicy: 'Informativa sulla Privacy', notifEnabled: 'Le notifiche sono attive ✓', notifDisabled: 'Attiva le notifiche nelle impostazioni del telefono così può raggiungerti.', shareMessage: 'Conosci la tua compagna IA su Sarina 💕' },
  nl: { shareApp: 'App delen', rateUs: 'Beoordeel ons', reportProblem: 'Probleem melden', terms: 'Servicevoorwaarden', privacyPolicy: 'Privacybeleid', notifEnabled: 'Meldingen staan aan ✓', notifDisabled: 'Zet meldingen aan in je telefooninstellingen zodat ze je kan bereiken.', shareMessage: 'Ontmoet je AI-metgezel op Sarina 💕' },
  id: { shareApp: 'Bagikan aplikasi', rateUs: 'Beri nilai', reportProblem: 'Laporkan masalah', terms: 'Ketentuan Layanan', privacyPolicy: 'Kebijakan Privasi', notifEnabled: 'Notifikasi aktif ✓', notifDisabled: 'Aktifkan notifikasi di pengaturan ponselmu agar dia bisa menghubungimu.', shareMessage: 'Temui pendamping AI-mu di Sarina 💕' },
  th: { shareApp: 'แชร์แอป', rateUs: 'ให้คะแนนเรา', reportProblem: 'รายงานปัญหา', terms: 'ข้อกำหนดการใช้งาน', privacyPolicy: 'นโยบายความเป็นส่วนตัว', notifEnabled: 'เปิดการแจ้งเตือนอยู่ ✓', notifDisabled: 'เปิดการแจ้งเตือนในการตั้งค่าโทรศัพท์ของคุณ เพื่อให้เธอติดต่อคุณได้', shareMessage: 'พบกับคู่หู AI ของคุณบน Sarina 💕' },
  ar: { shareApp: 'مشاركة التطبيق', rateUs: 'قيّمنا', reportProblem: 'الإبلاغ عن مشكلة', terms: 'شروط الخدمة', privacyPolicy: 'سياسة الخصوصية', notifEnabled: 'الإشعارات مفعّلة ✓', notifDisabled: 'فعّل الإشعارات من إعدادات هاتفك حتى تتمكن من الوصول إليك.', shareMessage: 'تعرّف على رفيقتك الذكية على Sarina 💕' },
};

export const getSettingsExtraStrings = (lang?: string): SettingsExtraStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return SETTINGS_EXTRA_STRINGS[code] || SETTINGS_EXTRA_STRINGS.en;
};

export const useSettingsExtraStrings = (): SettingsExtraStrings => {
  const { i18n } = useTranslation();
  return getSettingsExtraStrings(i18n.language);
};

// ── Voice Call — Incoming call (68:125) + Active call (57:3) ───────────────────
export type CallStrings = {
  incomingCall: string; // top label on incoming screen
  decline: string;
  answer: string;
  talkingTo: string; // uses {name}
  connecting: string;
  inProgress: string; // status while connected
  callEnded: string;
  timeLeft: string; // uses {time}, e.g. "0:45 left"
  endCall: string;
  congratsTitle: string;
  congratsBody: string; // uses {name}
  creditsEndedTitle: string; // "Your credits are over"
  creditsEndedBody: string; // generic fallback wait line
  creditsEndedWeekly: string; // "Wait for next week to renew."
  creditsEndedYearly: string; // "Wait for next year to renew."
  buyMore: string; // CTA: buy a top-up
  maybeLater: string; // dismiss the top-up prompt
  creditsEndedTopupBody: string; // shown when a top-up is offered
  topupUnavailableTitle: string; // when the placement returns no offering
  topupUnavailableBody: string;
  micTitle: string;
  micBody: string;
  callFailed: string;
  unavailableTitle: string;
  unavailableBody: string;
};

export const CALL_STRINGS: Record<string, CallStrings> = {
  en: { incomingCall: 'Incoming Call...', decline: 'Decline', answer: 'Answer', talkingTo: 'Talking to {name}', connecting: 'Connecting...', inProgress: 'In progress...', callEnded: 'Call ended', timeLeft: '{time} left', endCall: 'End call', congratsTitle: 'Congratulations! 🎉', congratsBody: 'Welcome to Premium! Now you can call {name}. Tap the call button again to start. 💕', creditsEndedTitle: 'Your credits are over', creditsEndedBody: 'Wait for your plan to renew.', creditsEndedWeekly: 'Wait for next week to renew.', creditsEndedYearly: 'Wait for next year to renew.', buyMore: 'Buy more minutes', maybeLater: 'Maybe later', creditsEndedTopupBody: "You're out of call time. Buy more minutes to keep talking, or wait for your plan to renew.", topupUnavailableTitle: 'Top-ups unavailable', topupUnavailableBody: 'More call minutes aren’t available right now. Please try again later or wait for your plan to renew.', micTitle: 'Microphone needed', micBody: 'Allow microphone access to make voice calls.', callFailed: 'Call failed, please try again.', unavailableTitle: 'Not available in Expo Go', unavailableBody: 'Voice calls need the installed app (a dev/production build).' },
  es: { incomingCall: 'Llamada entrante...', decline: 'Rechazar', answer: 'Contestar', talkingTo: 'Hablando con {name}', connecting: 'Conectando...', inProgress: 'En curso...', callEnded: 'Llamada finalizada', timeLeft: '{time} restante', endCall: 'Colgar', congratsTitle: '¡Felicidades! 🎉', congratsBody: '¡Bienvenido a Premium! Ahora puedes llamar a {name}. Toca el botón de llamada otra vez para empezar. 💕', creditsEndedTitle: 'Tus créditos se acabaron', creditsEndedBody: 'Espera a que se renueve tu plan.', creditsEndedWeekly: 'Espera a la próxima semana para renovar.', creditsEndedYearly: 'Espera al próximo año para renovar.', buyMore: 'Comprar más minutos', maybeLater: 'Quizás luego', creditsEndedTopupBody: 'Te quedaste sin tiempo de llamada. Compra más minutos para seguir hablando o espera a que se renueve tu plan.', topupUnavailableTitle: 'Recargas no disponibles', topupUnavailableBody: 'Por ahora no hay más minutos disponibles. Inténtalo más tarde o espera a que se renueve tu plan.', micTitle: 'Se necesita el micrófono', micBody: 'Permite el acceso al micrófono para hacer llamadas de voz.', callFailed: 'La llamada falló, inténtalo de nuevo.', unavailableTitle: 'No disponible en Expo Go', unavailableBody: 'Las llamadas de voz requieren la app instalada (una compilación de desarrollo/producción).' },
  fr: { incomingCall: 'Appel entrant...', decline: 'Refuser', answer: 'Répondre', talkingTo: 'En ligne avec {name}', connecting: 'Connexion...', inProgress: 'En cours...', callEnded: 'Appel terminé', timeLeft: '{time} restant', endCall: 'Raccrocher', congratsTitle: 'Félicitations ! 🎉', congratsBody: 'Bienvenue dans Premium ! Tu peux maintenant appeler {name}. Appuie à nouveau sur le bouton d’appel pour commencer. 💕', creditsEndedTitle: 'Tes crédits sont épuisés', creditsEndedBody: 'Attends le renouvellement de ton offre.', creditsEndedWeekly: 'Attends la semaine prochaine pour le renouvellement.', creditsEndedYearly: 'Attends l’année prochaine pour le renouvellement.', buyMore: 'Acheter plus de minutes', maybeLater: 'Plus tard', creditsEndedTopupBody: 'Tu n’as plus de temps d’appel. Achète plus de minutes pour continuer à parler, ou attends le renouvellement de ton offre.', topupUnavailableTitle: 'Recharges indisponibles', topupUnavailableBody: 'Plus de minutes ne sont pas disponibles pour le moment. Réessaie plus tard ou attends le renouvellement de ton offre.', micTitle: 'Microphone requis', micBody: "Autorise l'accès au micro pour passer des appels.", callFailed: "L'appel a échoué, réessaie.", unavailableTitle: 'Indisponible dans Expo Go', unavailableBody: "Les appels vocaux nécessitent l'app installée (build dev/production)." },
  de: { incomingCall: 'Eingehender Anruf...', decline: 'Ablehnen', answer: 'Annehmen', talkingTo: 'Im Gespräch mit {name}', connecting: 'Verbinde...', inProgress: 'Läuft...', callEnded: 'Anruf beendet', timeLeft: '{time} übrig', endCall: 'Auflegen', congratsTitle: 'Glückwunsch! 🎉', congratsBody: 'Willkommen bei Premium! Jetzt kannst du {name} anrufen. Tippe erneut auf die Anruftaste, um zu starten. 💕', creditsEndedTitle: 'Dein Guthaben ist aufgebraucht', creditsEndedBody: 'Warte auf die Verlängerung deines Abos.', creditsEndedWeekly: 'Warte bis nächste Woche auf die Verlängerung.', creditsEndedYearly: 'Warte bis nächstes Jahr auf die Verlängerung.', buyMore: 'Mehr Minuten kaufen', maybeLater: 'Vielleicht später', creditsEndedTopupBody: 'Deine Anrufzeit ist aufgebraucht. Kaufe mehr Minuten, um weiterzureden, oder warte auf die Verlängerung deines Abos.', topupUnavailableTitle: 'Aufladungen nicht verfügbar', topupUnavailableBody: 'Aktuell sind keine weiteren Minuten verfügbar. Versuche es später erneut oder warte auf die Verlängerung deines Abos.', micTitle: 'Mikrofon benötigt', micBody: 'Erlaube den Mikrofonzugriff für Sprachanrufe.', callFailed: 'Anruf fehlgeschlagen, bitte erneut versuchen.', unavailableTitle: 'In Expo Go nicht verfügbar', unavailableBody: 'Sprachanrufe brauchen die installierte App (ein Dev-/Produktions-Build).' },
  ja: { incomingCall: '着信中...', decline: '拒否', answer: '応答', talkingTo: '{name}と通話中', connecting: '接続中...', inProgress: '通話中...', callEnded: '通話終了', timeLeft: '残り{time}', endCall: '通話終了', congratsTitle: 'おめでとう！🎉', congratsBody: 'プレミアムへようこそ！これで{name}に電話できます。もう一度通話ボタンを押して始めてね。💕', creditsEndedTitle: 'クレジットがなくなりました', creditsEndedBody: 'プランの更新をお待ちください。', creditsEndedWeekly: '来週の更新をお待ちください。', creditsEndedYearly: '来年の更新をお待ちください。', buyMore: '通話時間を追加購入', maybeLater: 'あとで', creditsEndedTopupBody: '通話時間がなくなりました。続けるには時間を追加購入するか、プランの更新をお待ちください。', topupUnavailableTitle: '追加購入は利用できません', topupUnavailableBody: '現在、追加の通話時間を購入できません。後でもう一度お試しいただくか、プランの更新をお待ちください。', micTitle: 'マイクが必要です', micBody: '音声通話のためにマイクへのアクセスを許可してください。', callFailed: '通話に失敗しました。もう一度お試しください。', unavailableTitle: 'Expo Go では利用不可', unavailableBody: '音声通話にはインストール済みアプリ（開発/本番ビルド）が必要です。' },
  pt: { incomingCall: 'Chamada recebida...', decline: 'Recusar', answer: 'Atender', talkingTo: 'Falando com {name}', connecting: 'Conectando...', inProgress: 'Em andamento...', callEnded: 'Chamada encerrada', timeLeft: '{time} restante', endCall: 'Encerrar', congratsTitle: 'Parabéns! 🎉', congratsBody: 'Bem-vindo ao Premium! Agora você pode ligar para {name}. Toque no botão de chamada de novo para começar. 💕', creditsEndedTitle: 'Seus créditos acabaram', creditsEndedBody: 'Aguarde a renovação do seu plano.', creditsEndedWeekly: 'Aguarde a próxima semana para renovar.', creditsEndedYearly: 'Aguarde o próximo ano para renovar.', buyMore: 'Comprar mais minutos', maybeLater: 'Talvez depois', creditsEndedTopupBody: 'Seu tempo de chamada acabou. Compre mais minutos para continuar conversando ou aguarde a renovação do seu plano.', topupUnavailableTitle: 'Recargas indisponíveis', topupUnavailableBody: 'Mais minutos não estão disponíveis no momento. Tente novamente mais tarde ou aguarde a renovação do seu plano.', micTitle: 'Microfone necessário', micBody: 'Permita o acesso ao microfone para fazer chamadas de voz.', callFailed: 'A chamada falhou, tente novamente.', unavailableTitle: 'Indisponível no Expo Go', unavailableBody: 'Chamadas de voz precisam do app instalado (build de dev/produção).' },
  zh: { incomingCall: '来电...', decline: '拒接', answer: '接听', talkingTo: '正在与{name}通话', connecting: '连接中...', inProgress: '通话中...', callEnded: '通话结束', timeLeft: '剩余{time}', endCall: '挂断', congratsTitle: '恭喜！🎉', congratsBody: '欢迎加入会员！现在你可以给{name}打电话了。再次点击通话按钮即可开始。💕', creditsEndedTitle: '你的额度已用完', creditsEndedBody: '请等待套餐续订。', creditsEndedWeekly: '请等待下周续订。', creditsEndedYearly: '请等待明年续订。', buyMore: '购买更多通话时间', maybeLater: '以后再说', creditsEndedTopupBody: '你的通话时间已用完。购买更多时间即可继续通话，或等待套餐续订。', topupUnavailableTitle: '暂无法购买', topupUnavailableBody: '目前无法购买更多通话时间。请稍后再试或等待套餐续订。', micTitle: '需要麦克风', micBody: '请允许使用麦克风以进行语音通话。', callFailed: '通话失败，请重试。', unavailableTitle: 'Expo Go 中不可用', unavailableBody: '语音通话需要已安装的应用（开发/生产版本）。' },
  tr: { incomingCall: 'Gelen arama...', decline: 'Reddet', answer: 'Cevapla', talkingTo: '{name} ile konuşuyorsun', connecting: 'Bağlanıyor...', inProgress: 'Devam ediyor...', callEnded: 'Arama bitti', timeLeft: '{time} kaldı', endCall: 'Bitir', congratsTitle: 'Tebrikler! 🎉', congratsBody: "Premium'a hoş geldin! Artık {name} kişisini arayabilirsin. Başlamak için arama düğmesine tekrar dokun. 💕", creditsEndedTitle: 'Kredilerin bitti', creditsEndedBody: 'Planının yenilenmesini bekle.', creditsEndedWeekly: 'Yenilenmesi için gelecek haftayı bekle.', creditsEndedYearly: 'Yenilenmesi için gelecek yılı bekle.', buyMore: 'Daha fazla dakika al', maybeLater: 'Belki sonra', creditsEndedTopupBody: 'Arama sürenin doldu. Konuşmaya devam etmek için daha fazla dakika al ya da planının yenilenmesini bekle.', topupUnavailableTitle: 'Yükleme yapılamıyor', topupUnavailableBody: 'Şu anda daha fazla dakika alınamıyor. Daha sonra tekrar dene ya da planının yenilenmesini bekle.', micTitle: 'Mikrofon gerekli', micBody: 'Sesli arama yapmak için mikrofon erişimine izin ver.', callFailed: 'Arama başarısız, lütfen tekrar dene.', unavailableTitle: "Expo Go'da kullanılamıyor", unavailableBody: 'Sesli aramalar yüklü uygulamayı gerektirir (dev/prod derlemesi).' },
  ru: { incomingCall: 'Входящий вызов...', decline: 'Отклонить', answer: 'Ответить', talkingTo: 'Разговор с {name}', connecting: 'Соединение...', inProgress: 'Идёт разговор...', callEnded: 'Звонок завершён', timeLeft: 'Осталось {time}', endCall: 'Завершить', congratsTitle: 'Поздравляем! 🎉', congratsBody: 'Добро пожаловать в Premium! Теперь вы можете позвонить {name}. Нажмите кнопку вызова ещё раз, чтобы начать. 💕', creditsEndedTitle: 'Кредиты закончились', creditsEndedBody: 'Дождитесь продления подписки.', creditsEndedWeekly: 'Дождитесь продления на следующей неделе.', creditsEndedYearly: 'Дождитесь продления в следующем году.', buyMore: 'Купить ещё минуты', maybeLater: 'Позже', creditsEndedTopupBody: 'Время на звонки закончилось. Купите ещё минуты, чтобы продолжить разговор, или дождитесь продления подписки.', topupUnavailableTitle: 'Пополнение недоступно', topupUnavailableBody: 'Сейчас купить дополнительные минуты нельзя. Попробуйте позже или дождитесь продления подписки.', micTitle: 'Нужен микрофон', micBody: 'Разрешите доступ к микрофону для голосовых звонков.', callFailed: 'Не удалось позвонить, попробуйте снова.', unavailableTitle: 'Недоступно в Expo Go', unavailableBody: 'Голосовые звонки требуют установленного приложения (dev/prod сборка).' },
  hi: { incomingCall: 'आ रही कॉल...', decline: 'अस्वीकार', answer: 'उठाएँ', talkingTo: '{name} से बात हो रही है', connecting: 'कनेक्ट हो रहा है...', inProgress: 'जारी है...', callEnded: 'कॉल समाप्त', timeLeft: '{time} बची', endCall: 'समाप्त करें', congratsTitle: 'बधाई हो! 🎉', congratsBody: 'प्रीमियम में आपका स्वागत है! अब आप {name} को कॉल कर सकते हैं। शुरू करने के लिए कॉल बटन फिर दबाएँ। 💕', creditsEndedTitle: 'आपके क्रेडिट खत्म हो गए', creditsEndedBody: 'प्लान रिन्यू होने का इंतज़ार करें।', creditsEndedWeekly: 'अगले हफ़्ते रिन्यू होने का इंतज़ार करें।', creditsEndedYearly: 'अगले साल रिन्यू होने का इंतज़ार करें।', buyMore: 'और मिनट खरीदें', maybeLater: 'बाद में', creditsEndedTopupBody: 'आपका कॉल समय खत्म हो गया। बात जारी रखने के लिए और मिनट खरीदें, या प्लान रिन्यू होने का इंतज़ार करें।', topupUnavailableTitle: 'टॉप-अप उपलब्ध नहीं', topupUnavailableBody: 'अभी और मिनट उपलब्ध नहीं हैं। कृपया बाद में कोशिश करें या प्लान रिन्यू होने का इंतज़ार करें।', micTitle: 'माइक्रोफ़ोन चाहिए', micBody: 'वॉइस कॉल के लिए माइक्रोफ़ोन की अनुमति दें।', callFailed: 'कॉल विफल, कृपया फिर कोशिश करें।', unavailableTitle: 'Expo Go में उपलब्ध नहीं', unavailableBody: 'वॉइस कॉल के लिए इंस्टॉल किया गया ऐप चाहिए (dev/production बिल्ड)।' },
  it: { incomingCall: 'Chiamata in arrivo...', decline: 'Rifiuta', answer: 'Rispondi', talkingTo: 'In chiamata con {name}', connecting: 'Connessione...', inProgress: 'In corso...', callEnded: 'Chiamata terminata', timeLeft: '{time} rimasti', endCall: 'Termina', congratsTitle: 'Congratulazioni! 🎉', congratsBody: 'Benvenuto in Premium! Ora puoi chiamare {name}. Tocca di nuovo il pulsante di chiamata per iniziare. 💕', creditsEndedTitle: 'I tuoi crediti sono finiti', creditsEndedBody: 'Attendi il rinnovo del piano.', creditsEndedWeekly: 'Attendi la prossima settimana per il rinnovo.', creditsEndedYearly: 'Attendi il prossimo anno per il rinnovo.', buyMore: 'Acquista più minuti', maybeLater: 'Forse dopo', creditsEndedTopupBody: 'Hai esaurito il tempo per le chiamate. Acquista più minuti per continuare a parlare o attendi il rinnovo del piano.', topupUnavailableTitle: 'Ricariche non disponibili', topupUnavailableBody: 'Al momento non è possibile acquistare altri minuti. Riprova più tardi o attendi il rinnovo del piano.', micTitle: 'Serve il microfono', micBody: "Consenti l'accesso al microfono per le chiamate vocali.", callFailed: 'Chiamata non riuscita, riprova.', unavailableTitle: 'Non disponibile in Expo Go', unavailableBody: "Le chiamate vocali richiedono l'app installata (build dev/produzione)." },
  nl: { incomingCall: 'Inkomende oproep...', decline: 'Weigeren', answer: 'Opnemen', talkingTo: 'In gesprek met {name}', connecting: 'Verbinden...', inProgress: 'Bezig...', callEnded: 'Gesprek beëindigd', timeLeft: '{time} over', endCall: 'Ophangen', congratsTitle: 'Gefeliciteerd! 🎉', congratsBody: 'Welkom bij Premium! Je kunt {name} nu bellen. Tik nogmaals op de belknop om te starten. 💕', creditsEndedTitle: 'Je tegoed is op', creditsEndedBody: 'Wacht tot je abonnement wordt verlengd.', creditsEndedWeekly: 'Wacht tot volgende week op verlenging.', creditsEndedYearly: 'Wacht tot volgend jaar op verlenging.', buyMore: 'Meer minuten kopen', maybeLater: 'Misschien later', creditsEndedTopupBody: 'Je beltijd is op. Koop meer minuten om door te praten of wacht tot je abonnement wordt verlengd.', topupUnavailableTitle: 'Bijkopen niet beschikbaar', topupUnavailableBody: 'Meer minuten zijn nu niet beschikbaar. Probeer het later opnieuw of wacht tot je abonnement wordt verlengd.', micTitle: 'Microfoon nodig', micBody: 'Geef toegang tot de microfoon voor spraakoproepen.', callFailed: 'Oproep mislukt, probeer opnieuw.', unavailableTitle: 'Niet beschikbaar in Expo Go', unavailableBody: 'Spraakoproepen vereisen de geïnstalleerde app (dev/productie-build).' },
  id: { incomingCall: 'Panggilan masuk...', decline: 'Tolak', answer: 'Jawab', talkingTo: 'Berbicara dengan {name}', connecting: 'Menghubungkan...', inProgress: 'Berlangsung...', callEnded: 'Panggilan berakhir', timeLeft: 'Sisa {time}', endCall: 'Akhiri', congratsTitle: 'Selamat! 🎉', congratsBody: 'Selamat datang di Premium! Sekarang kamu bisa menelepon {name}. Ketuk tombol panggil lagi untuk mulai. 💕', creditsEndedTitle: 'Kreditmu sudah habis', creditsEndedBody: 'Tunggu paketmu diperbarui.', creditsEndedWeekly: 'Tunggu minggu depan untuk diperbarui.', creditsEndedYearly: 'Tunggu tahun depan untuk diperbarui.', buyMore: 'Beli lebih banyak menit', maybeLater: 'Nanti saja', creditsEndedTopupBody: 'Waktu teleponmu habis. Beli lebih banyak menit untuk lanjut mengobrol, atau tunggu paketmu diperbarui.', topupUnavailableTitle: 'Isi ulang tidak tersedia', topupUnavailableBody: 'Menit tambahan belum tersedia saat ini. Coba lagi nanti atau tunggu paketmu diperbarui.', micTitle: 'Perlu mikrofon', micBody: 'Izinkan akses mikrofon untuk panggilan suara.', callFailed: 'Panggilan gagal, coba lagi.', unavailableTitle: 'Tidak tersedia di Expo Go', unavailableBody: 'Panggilan suara butuh aplikasi terpasang (build dev/produksi).' },
  th: { incomingCall: 'สายเรียกเข้า...', decline: 'ปฏิเสธ', answer: 'รับสาย', talkingTo: 'กำลังคุยกับ {name}', connecting: 'กำลังเชื่อมต่อ...', inProgress: 'กำลังดำเนินการ...', callEnded: 'วางสายแล้ว', timeLeft: 'เหลือ {time}', endCall: 'วางสาย', congratsTitle: 'ยินดีด้วย! 🎉', congratsBody: 'ยินดีต้อนรับสู่พรีเมียม! ตอนนี้คุณโทรหา {name} ได้แล้ว แตะปุ่มโทรอีกครั้งเพื่อเริ่ม 💕', creditsEndedTitle: 'เครดิตของคุณหมดแล้ว', creditsEndedBody: 'รอให้แพ็กเกจต่ออายุ', creditsEndedWeekly: 'รอสัปดาห์หน้าเพื่อต่ออายุ', creditsEndedYearly: 'รอปีหน้าเพื่อต่ออายุ', buyMore: 'ซื้อเวลาเพิ่ม', maybeLater: 'ไว้ทีหลัง', creditsEndedTopupBody: 'เวลาโทรของคุณหมดแล้ว ซื้อเวลาเพิ่มเพื่อคุยต่อ หรือรอให้แพ็กเกจต่ออายุ', topupUnavailableTitle: 'ยังเติมเวลาไม่ได้', topupUnavailableBody: 'ขณะนี้ยังซื้อเวลาเพิ่มไม่ได้ โปรดลองใหม่ภายหลังหรือรอให้แพ็กเกจต่ออายุ', micTitle: 'ต้องใช้ไมโครโฟน', micBody: 'อนุญาตการเข้าถึงไมโครโฟนเพื่อโทรด้วยเสียง', callFailed: 'โทรไม่สำเร็จ โปรดลองอีกครั้ง', unavailableTitle: 'ใช้ไม่ได้ใน Expo Go', unavailableBody: 'การโทรด้วยเสียงต้องใช้แอปที่ติดตั้งแล้ว (บิลด์ dev/production)' },
  ar: { incomingCall: 'مكالمة واردة...', decline: 'رفض', answer: 'رد', talkingTo: 'تتحدث مع {name}', connecting: 'جارٍ الاتصال...', inProgress: 'جارية...', callEnded: 'انتهت المكالمة', timeLeft: 'بقي {time}', endCall: 'إنهاء', congratsTitle: 'مبروك! 🎉', congratsBody: 'مرحبًا بك في بريميوم! يمكنك الآن الاتصال بـ {name}. اضغط زر الاتصال مرة أخرى للبدء. 💕', creditsEndedTitle: 'انتهى رصيدك', creditsEndedBody: 'انتظر تجديد باقتك.', creditsEndedWeekly: 'انتظر الأسبوع القادم للتجديد.', creditsEndedYearly: 'انتظر العام القادم للتجديد.', buyMore: 'شراء المزيد من الدقائق', maybeLater: 'لاحقًا', creditsEndedTopupBody: 'انتهى وقت مكالماتك. اشترِ المزيد من الدقائق لمواصلة الحديث، أو انتظر تجديد باقتك.', topupUnavailableTitle: 'الشحن غير متاح', topupUnavailableBody: 'لا يمكن شراء المزيد من الدقائق حاليًا. حاول لاحقًا أو انتظر تجديد باقتك.', micTitle: 'الميكروفون مطلوب', micBody: 'اسمح بالوصول إلى الميكروفون لإجراء المكالمات الصوتية.', callFailed: 'فشلت المكالمة، حاول مرة أخرى.', unavailableTitle: 'غير متاح في Expo Go', unavailableBody: 'تتطلب المكالمات الصوتية التطبيق المثبّت (إصدار تطوير/إنتاج).' },
};

export const getCallStrings = (lang?: string): CallStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return CALL_STRINGS[code] || CALL_STRINGS.en;
};

export const useCallStrings = (): CallStrings => {
  const { i18n } = useTranslation();
  return getCallStrings(i18n.language);
};

/** Plan-aware "wait to renew" line: next week (weekly) / next year (yearly). */
export const creditsRenewBody = (s: CallStrings, tier: string | null): string =>
  tier === 'weekly'
    ? s.creditsEndedWeekly
    : tier === 'yearly'
    ? s.creditsEndedYearly
    : s.creditsEndedBody;

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

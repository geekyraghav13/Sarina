/**
 * Localized strings for the new onboarding flow.
 *
 * Self-contained (independent of app/i18n locale JSONs) so it can cover ALL
 * languages selectable on the Language screen — including the ones without a
 * full locale file (Arabic, Dutch, Indonesian, Italian, Thai). Falls back to
 * English for any unknown code.
 */

import { useTranslation } from 'react-i18next';

export type OnboardingStrings = {
  characterTitle: string;
  characterSubtitle: string;
  startChatting: string;
};

export const ONBOARDING_STRINGS: Record<string, OnboardingStrings> = {
  en: {
    characterTitle: 'Who catches your eye?',
    characterSubtitle: 'Select a companion to begin your journey.',
    startChatting: 'Start Chatting',
  },
  es: {
    characterTitle: '¿Quién te llama la atención?',
    characterSubtitle: 'Elige una compañera para comenzar tu viaje.',
    startChatting: 'Empezar a chatear',
  },
  fr: {
    characterTitle: 'Qui attire votre regard ?',
    characterSubtitle: 'Choisissez une compagne pour commencer votre aventure.',
    startChatting: 'Commencer à discuter',
  },
  de: {
    characterTitle: 'Wer fällt dir ins Auge?',
    characterSubtitle: 'Wähle eine Begleiterin, um deine Reise zu beginnen.',
    startChatting: 'Chat starten',
  },
  ja: {
    characterTitle: '気になる人は？',
    characterSubtitle: '旅を始める相手を選んでください。',
    startChatting: 'チャットを始める',
  },
  pt: {
    characterTitle: 'Quem chama a sua atenção?',
    characterSubtitle: 'Escolha uma companhia para começar a sua jornada.',
    startChatting: 'Começar a conversar',
  },
  zh: {
    characterTitle: '谁吸引了你的目光？',
    characterSubtitle: '选择一位伴侣，开启你的旅程。',
    startChatting: '开始聊天',
  },
  tr: {
    characterTitle: 'Gözüne kim çarpıyor?',
    characterSubtitle: 'Yolculuğuna başlamak için bir arkadaş seç.',
    startChatting: 'Sohbete başla',
  },
  ru: {
    characterTitle: 'Кто привлёк твоё внимание?',
    characterSubtitle: 'Выбери спутницу, чтобы начать своё путешествие.',
    startChatting: 'Начать общение',
  },
  hi: {
    characterTitle: 'कौन आपका दिल जीतता है?',
    characterSubtitle: 'अपनी यात्रा शुरू करने के लिए एक साथी चुनें।',
    startChatting: 'चैट शुरू करें',
  },
  it: {
    characterTitle: 'Chi cattura il tuo sguardo?',
    characterSubtitle: 'Scegli una compagna per iniziare il tuo viaggio.',
    startChatting: 'Inizia a chattare',
  },
  nl: {
    characterTitle: 'Wie valt jou op?',
    characterSubtitle: 'Kies een metgezel om je reis te beginnen.',
    startChatting: 'Begin met chatten',
  },
  id: {
    characterTitle: 'Siapa yang menarik perhatianmu?',
    characterSubtitle: 'Pilih pendamping untuk memulai perjalananmu.',
    startChatting: 'Mulai mengobrol',
  },
  th: {
    characterTitle: 'ใครสะดุดตาคุณ?',
    characterSubtitle: 'เลือกเพื่อนคู่ใจเพื่อเริ่มต้นการเดินทางของคุณ',
    startChatting: 'เริ่มแชท',
  },
  ar: {
    characterTitle: 'من يلفت نظرك؟',
    characterSubtitle: 'اختر رفيقة لتبدأ رحلتك.',
    startChatting: 'ابدأ الدردشة',
  },
};

/** Resolve strings for a language code (handles region codes like 'es-MX'). */
export const getOnboardingStrings = (lang?: string): OnboardingStrings => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  return ONBOARDING_STRINGS[code] || ONBOARDING_STRINGS.en;
};

/** Hook: returns onboarding strings for the user's currently selected language. */
export const useOnboardingStrings = (): OnboardingStrings => {
  const { i18n } = useTranslation();
  return getOnboardingStrings(i18n.language);
};

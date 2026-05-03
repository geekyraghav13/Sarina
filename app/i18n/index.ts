import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import tr from './locales/tr.json';
import ru from './locales/ru.json';
import es from './locales/es.json';
import hi from './locales/hi.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  pt: { translation: pt },
  tr: { translation: tr },
  ru: { translation: ru },
  es: { translation: es },
  hi: { translation: hi },
  de: { translation: de },
  zh: { translation: zh },
  ja: { translation: ja },
};

// Initialize i18n with async language detection
const initI18n = async () => {
  // Check if user has saved a language preference
  const savedLanguage = await AsyncStorage.getItem('user_language');

  // Use saved language if available, otherwise use device language, finally fallback to English
  const initialLanguage = savedLanguage || Localization.getLocales()[0]?.languageCode || 'en';

  console.log('🌍 Initializing i18n with language:', initialLanguage);

  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

// Initialize immediately
initI18n();

export default i18n;

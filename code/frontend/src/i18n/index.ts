import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import si from './locales/si.json';
import ta from './locales/ta.json';

const LANG_STORAGE_KEY = 'syncro-lang';

const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
const defaultLang = ['en', 'si', 'ta'].includes(savedLang as string) ? savedLang! : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      si: { translation: si },
      ta: { translation: ta },
    },
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    missingKeyHandler: (_lngs, _ns, key) => {
      console.warn(`[i18n] Missing translation key: "${key}"`);
    },
    saveMissing: true,
  });

// Persist language choice and sync <html lang> on every change
i18n.on('languageChanged', (lang: string) => {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  document.documentElement.lang = lang;
});

// Set initial html lang attribute
document.documentElement.lang = defaultLang;

export default i18n;

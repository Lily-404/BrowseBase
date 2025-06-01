import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en';
import zhTranslations from './locales/zh';

const resources = {
  en: enTranslations,
  zh: zhTranslations
};

i18n
  .use(LanguageDetector)  // 添加语言检测器
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',  // 设置回退语言为英文
    detection: {
      order: ['navigator'],  // 使用浏览器语言设置
      lookupFromPathIndex: 0,
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';
import i18n from 'i18next';
import Backend from 'i18next-http-backend';

const splitDomain = window.location.hostname.split(".");
const hostWithoutSubdomainArr = splitDomain.slice(splitDomain.length - 2,splitDomain.length);
const cookieDomain = "." + hostWithoutSubdomainArr.join(".");

const detectionOption = {
  order: ['cookie', 'localStorage','querystring', 'navigator',  'htmlTag', 'path', 'subdomain'],
  lookupQuerystring: 'lang',
  lookupCookie: 'i18next',
  caches: ['cookie'],
  cookieMinutes: 10080,
  cookieDomain: cookieDomain,
}

const backendOptions = {
  loadPath: '/locales/{{lng}}.json'
  // allowMultiLoading: false
}

i18n
    // Load translations by xhr
    // .use(initReactI18next)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    .use(Backend)
    .use(initReactI18next)
    .init({
      // resources,
      backend: backendOptions,
      // lng: "en",
      fallbackLng: {
        'ja': ['jp'],
        'zh-TW': ['hant'],
        'zh-HK': ['hant'],
        'zh-CN': ['hans'],
        'zh-SG': ['hans'],
      },
      keySeparator: false,
      load: 'languageOnly',
      interpolation: {
        escapeValue: false,
      },
      react: {
        wait: true,
        useSuspense: false
      },
      // debug: true,
      detection: detectionOption,
      nsSeparator: false
    }, (error, t) => {
      console.error(error);
    });

export default i18n;
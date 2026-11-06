// Languages the site can be published in. English is the reference language.
// To add a language: add a line here, add its UI strings in ui.mjs, then add translated
// pages under content/translations/<code>/ (see content/translations/README.md).
export const defaultLocale = 'en';

export const locales = {
  en: { name: 'English', dir: 'ltr', og: 'en_US' },
  ko: { name: '한국어', dir: 'ltr', og: 'ko_KR' },
  es: { name: 'Español', dir: 'ltr', og: 'es_ES' },
  'zh-Hans': { name: '简体中文', dir: 'ltr', og: 'zh_CN' },
  'zh-Hant': { name: '繁體中文', dir: 'ltr', og: 'zh_TW' },
  ja: { name: '日本語', dir: 'ltr', og: 'ja_JP' },
  de: { name: 'Deutsch', dir: 'ltr', og: 'de_DE' },
  fa: { name: 'فارسی', dir: 'rtl', og: 'fa_IR' },
  pt: { name: 'Português', dir: 'ltr', og: 'pt_BR' },
  tr: { name: 'Türkçe', dir: 'ltr', og: 'tr_TR' },
};

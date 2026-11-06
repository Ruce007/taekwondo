// Translation helper. Pages are rendered one at a time, so a single "current language" is enough.
import { ui } from './ui.mjs';
import { defaultLocale, locales } from './locales.mjs';

let current = defaultLocale;
export const setLocale = (code) => {
  if (!locales[code]) throw new Error(`unknown language "${code}" (see src/i18n/locales.mjs)`);
  current = code;
};
export const getLocale = () => current;

// t('seeAlso')  or  t('checked', { date: '5 November 2026' }). Falls back to English.
export function t(key, vars = {}) {
  const raw = ui[current]?.[key] ?? ui[defaultLocale][key];
  if (raw === undefined) throw new Error(`missing interface string "${key}" in src/i18n/ui.mjs`);
  return raw.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

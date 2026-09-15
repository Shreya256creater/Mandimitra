import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations.js';

const STORAGE_KEY = 'mm_lang';
const I18nContext = createContext(null);

function lookup(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return Object.entries(vars).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    String(str),
  );
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'hi' || saved === 'mr' ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'en' ? 'en' : lang;
  }, [lang]);

  const value = useMemo(() => {
    function t(key, vars) {
      const raw = lookup(translations[lang], key) ?? lookup(translations.en, key) ?? key;
      return interpolate(raw, vars);
    }
    return {
      lang,
      setLang: (next) => {
        if (next === 'en' || next === 'hi' || next === 'mr') setLangState(next);
      },
      t,
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'silverhands_lang';

const LanguageContext = createContext({ lang: 'en', setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'ta' ? 'ta' : 'en';
  });

  const setLang = (value) => {
    // Accept both direct values and functional updaters (e.g. l => l === 'en' ? 'ta' : 'en')
    const next = typeof value === 'function' ? value(lang) : value;
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

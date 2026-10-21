import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { I18N_TRANSLATIONS } from '../constants/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('vstep_lang') || 'vi';
  });

  useEffect(() => {
    localStorage.setItem('vstep_lang', language);
  }, [language]);

  const t = useCallback((key, fallback = '') => {
    const dict = I18N_TRANSLATIONS[language] || I18N_TRANSLATIONS.vi;
    return dict[key] !== undefined ? dict[key] : (fallback || key);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

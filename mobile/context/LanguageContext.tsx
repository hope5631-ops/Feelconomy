import React, { createContext, useContext, useState } from 'react';
import { TRANSLATIONS, LanguageCode } from '../constants/translations';

type LanguageContextType = {
    lang: LanguageCode;
    setLang: (lang: LanguageCode) => void;
    t: typeof TRANSLATIONS['ko'];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<LanguageCode>('ko');

    const value = {
        lang,
        setLang,
        t: TRANSLATIONS[lang],
    };

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

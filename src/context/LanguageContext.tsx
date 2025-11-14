"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Import translations
import idTranslations from "../locales/id.json";
import enTranslations from "../locales/en.json";

const translations = {
  id: idTranslations,
  en: enTranslations,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("id");

  useEffect(() => {
    const saved = typeof window !== "undefined" 
      ? (localStorage.getItem("lang") as Language | null) 
      : null;
    const initial = saved || "id";
    setLang(initial);
    if (typeof document !== "undefined") {
      document.documentElement.lang = initial;
    }
  }, []);

  const selectLang = (value: Language) => {
    setLang(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", value);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = value;
    }
  };

  // Translation function
  const t = (key: string, vars?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translations[lang];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        let fallback: any = translations.en;
        for (const k of keys) {
          if (fallback && typeof fallback === "object" && k in fallback) {
            fallback = fallback[k];
          } else {
            return key; // Return key if not found anywhere
          }
        }
        value = fallback;
        break;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    if (!vars) {
      return value;
    }

    return Object.entries(vars).reduce((acc, [varKey, varValue]) => {
      const matcher = new RegExp(`{{\\s*${varKey}\\s*}}`, "g");
      return acc.replace(matcher, String(varValue));
    }, value);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: selectLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

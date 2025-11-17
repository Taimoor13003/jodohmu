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

type TranslationObject = { [key: string]: TranslationNode };
type TranslationNode = string | TranslationObject;

const translations: Record<Language, TranslationNode> = {
  id: idTranslations as TranslationNode,
  en: enTranslations as TranslationNode,
};

const isTranslationObject = (value: TranslationNode | undefined): value is TranslationObject =>
  typeof value === "object" && value !== null;

const resolveTranslation = (node: TranslationNode | undefined, segments: string[]): string | undefined => {
  let current: TranslationNode | undefined = node;

  for (const segment of segments) {
    if (!isTranslationObject(current)) {
      return undefined;
    }

    current = current[segment];

    if (current === undefined) {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
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
    const segments = key.split(".");
    const localized = resolveTranslation(translations[lang], segments);
    const fallback = localized ?? resolveTranslation(translations.en, segments);
    const value = fallback ?? key;

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

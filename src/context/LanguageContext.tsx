"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isEnglishPath, localizeHref, switchLanguagePath, toEnglishPath } from "@/lib/i18n-routes";

type Language = "id" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  // Internal link for the current language: /pricing becomes /en/pricing on English pages
  localize: (href: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Import translations
import idTranslations from "../locales/id.json";
import enTranslations from "../locales/en.json";

type TranslationNode =
  | string
  | number
  | boolean
  | null
  | TranslationNode[]
  | { [key: string]: TranslationNode };

const translations: Record<Language, TranslationNode> = {
  id: idTranslations as TranslationNode,
  en: enTranslations as TranslationNode,
};

const isTranslationObject = (value: TranslationNode | undefined): value is { [key: string]: TranslationNode } =>
  typeof value === "object" && value !== null;

const resolveTranslation = (node: TranslationNode | undefined, segments: string[]): string | undefined => {
  let current: TranslationNode | undefined = node;

  for (const segment of segments) {
    if (!isTranslationObject(current)) {
      return undefined;
    }

    current = (current as Record<string, TranslationNode>)[segment];

    if (current === undefined) {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
};

// Pages with an English twin get their language from the URL (routeLang) and
// the switcher navigates between the two. Pages without one (dashboard, admin,
// careers, older posts) keep the saved preference and translate in place.
export function LanguageProvider({ children, routeLang = "id" }: { children: ReactNode; routeLang?: Language }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const translatesInPlace = !isEnglishPath(pathname) && !toEnglishPath(pathname);
  const [savedLang, setSavedLang] = useState<Language>(routeLang);

  useEffect(() => {
    if (!translatesInPlace) {
      // Remember the language of the URL the visitor is reading, so in-place pages follow it
      try {
        localStorage.setItem("lang", routeLang);
      } catch {}
      document.documentElement.lang = routeLang;
      return;
    }
    let saved: Language | null = null;
    try {
      saved = localStorage.getItem("lang") as Language | null;
    } catch {}
    const initial = saved === "en" || saved === "id" ? saved : routeLang;
    setSavedLang(initial);
    document.documentElement.lang = initial;
  }, [translatesInPlace, routeLang]);

  const lang = translatesInPlace ? savedLang : routeLang;

  const selectLang = (value: Language) => {
    try {
      localStorage.setItem("lang", value);
    } catch {}
    if (translatesInPlace) {
      setSavedLang(value);
      document.documentElement.lang = value;
      return;
    }
    if (value !== routeLang) router.push(switchLanguagePath(pathname, value));
  };

  // Follows the language on screen, so an in-place page showing English links back to /en
  const localize = (href: string) => localizeHref(href, lang);

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
    <LanguageContext.Provider value={{ lang, setLang: selectLang, t, localize }}>
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

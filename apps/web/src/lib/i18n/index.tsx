import * as React from "react";
import { en, type TKey } from "./en";
import { fa } from "./fa";
import { ru } from "./ru";
import { zh } from "./zh";

export type Lang = "en" | "fa" | "ru" | "zh";
export type { TKey };

const dicts: Record<Lang, Record<TKey, string>> = { en, fa, ru, zh };

export const LANGUAGES: { code: Lang; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "EN", dir: "ltr" },
  { code: "fa", label: "FA", dir: "rtl" },
  { code: "ru", label: "RU", dir: "ltr" },
  { code: "zh", label: "ZH", dir: "ltr" },
];

export const NATIVE_LABELS: Record<Lang, string> = {
  en: "English",
  fa: "فارسی",
  ru: "Русский",
  zh: "中文",
};

const STORAGE_KEY = "mrd_lang";

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = React.createContext<I18nState | null>(null);

export function useI18n(): I18nState {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

function loadStoredLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
  return stored && dicts[stored] ? stored : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(loadStoredLang);

  const dir: "ltr" | "rtl" = lang === "fa" ? "rtl" : "ltr";

  // Drive <html lang dir> from React state so the document, form controls,
  // and any portal content (dialogs, dropdowns) all follow the language.
  React.useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
  }, [lang, dir]);

  const setLang = React.useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const t = React.useCallback((key: TKey) => dicts[lang][key] || en[key], [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t, dir }}>{children}</I18nContext.Provider>;
}

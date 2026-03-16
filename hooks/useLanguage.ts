"use client";

import { useEffect, useState } from "react";

export type AppLanguage = "ko" | "en";

const STORAGE_KEY = "church-lunch-language";

export function useLanguage(defaultLanguage: AppLanguage = "ko") {
  const [language, setLanguage] = useState<AppLanguage>(defaultLanguage);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

    if (savedLanguage === "ko" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  return { language, setLanguage };
}

import { createContext, useContext, useEffect } from "react";
import { translate, type Language } from "./catalog";
export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>({ language: "it", setLanguage: () => {} });
export function useI18n() {
  const context = useContext(LanguageContext);
  return { ...context, t: (text: string) => translate(text, context.language) };
}

/** Localise document metadata on the client without changing routes or analysis. */
export function usePageLanguage(title: string, description: string) {
  const { language } = useI18n();
  useEffect(() => {
    document.title = translate(title, language);
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]']) {
      document.querySelector(selector)?.setAttribute("content", translate(description, language));
    }
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", translate(title, language));
  }, [title, description, language]);
}

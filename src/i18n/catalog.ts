import en from "./en.json";
export type Language = "it" | "en";
export function translate(text: string, language: Language): string {
  return language === "en" ? ((en as Record<string, string>)[text] ?? text) : text;
}

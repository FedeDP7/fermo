const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "@": "a", $: "s" };

/** Lowercase, strip accents, unify spaces and quotes. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** De-obfuscate a single word (p0ste -> poste) — used only for brand matching. */
export function deLeet(word: string): string {
  return word.replace(/[013345@$]/g, (c) => LEET[c] ?? c);
}

/** Fix obfuscated URLs such as "sito [.] com" or "sito(dot)com". */
export function deobfuscateUrls(text: string): string {
  return text
    .replace(/\s*\[\s*\.\s*\]\s*/g, ".")
    .replace(/\s*\(\s*(\.|dot|punto)\s*\)\s*/gi, ".")
    .replace(/hxxp/gi, "http");
}

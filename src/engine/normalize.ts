const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "@": "a", $: "s" };

/** Lowercase, strip accents, unify quotes and spaces. Original text is never modified. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Fix leet only inside words that mix letters and digits (p0ste -> poste). */
export function deLeetWords(text: string): string {
  return text.replace(/[a-z0-9@$]+/g, (w) => (/[a-z]/.test(w) && /[0-9@$]/.test(w) ? w.replace(/[0-9@$]/g, (c) => LEET[c] ?? c) : w));
}

export function deLeet(word: string): string {
  return word.replace(/[0-9@$]/g, (c) => LEET[c] ?? c);
}

/** Sentence/clause split used to keep request + object in the same scope. */
export function clauses(norm: string): string[] {
  return norm
    .split(/[.!?;\n]+|,\s+(?=ma |pero |e poi )/)
    .map((c) => c.trim())
    .filter(Boolean);
}

const NEG = /\b(non|mai|evita(re)?|nessun[oa]?|guardati dal|diffida)\b/;

/** True when a negation/protective word appears before `index` inside the clause. */
export function negatedBefore(clause: string, index: number): boolean {
  return NEG.test(clause.slice(0, index));
}

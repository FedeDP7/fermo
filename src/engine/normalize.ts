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

export interface Clause {
  text: string;
  start: number;
}

/** Same clauses as `clauses()`, with their start offset in `norm`. */
export function clauseSpans(norm: string): Clause[] {
  const out: Clause[] = [];
  const re = /[.!?;\n]+|,\s+(?=ma |pero |e poi )/g;
  let last = 0;
  const push = (from: number, to: number) => {
    const raw = norm.slice(from, to);
    const lead = raw.length - raw.trimStart().length;
    const text = raw.trim();
    if (text) out.push({ text, start: from + lead });
  };
  for (const m of norm.matchAll(re)) {
    push(last, m.index);
    last = m.index + m[0].length;
  }
  push(last, norm.length);
  return out;
}

/**
 * Normalizes like `normalize()` while recording, for each output char, the index of the
 * original char it came from. Returns null map when the result differs (no certain mapping).
 */
export function normalizeWithMap(text: string): { norm: string; map: number[] | null } {
  let out = "";
  const map: number[] = [];
  let i = 0;
  for (const ch of text) {
    const base = ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/[’‘`´]/g, "'").replace(/[“”«»]/g, '"').replace(/[\u200B-\u200D\uFEFF]/g, "");
    for (const c of base) {
      if ((c === " " || c === "\t") && (out.endsWith(" ") || out.endsWith("\t"))) continue;
      out += c === "\t" ? " " : c;
      map.push(i);
    }
    i += ch.length;
  }
  // trim
  let s = 0;
  while (s < out.length && /\s/.test(out[s]!)) s++;
  let e = out.length;
  while (e > s && /\s/.test(out[e - 1]!)) e--;
  const norm = out.slice(s, e);
  const expected = normalize(text);
  return norm === expected ? { norm, map: map.slice(s, e) } : { norm: expected, map: null };
}

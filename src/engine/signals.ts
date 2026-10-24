import { BRANDS } from "./config/brands";
import { RULES } from "./config/rules";
import { deLeet } from "./normalize";
import type { Context, LinkReport, Signal } from "./types";

export function detectBrands(norm: string): string[] {
  const words = deLeet(norm);
  return BRANDS.filter((b) => b.keywords.some((k) => new RegExp(`\\b${k.replace(/\./g, "\\.")}\\b`).test(words))).map((b) => b.name);
}

export function detectSignals(norm: string, ctx: Context, links: LinkReport[], brands: string[]): Signal[] {
  const out: Signal[] = [];
  for (const r of RULES) {
    if (r.patterns.some((re) => re.test(norm))) {
      out.push({ id: r.id, title: r.title, explanation: r.explanation, weight: Math.round(r.weight * (r.boost?.[ctx] ?? 1)) });
    }
  }
  const bad = links.filter((l) => l.verdict === "sospetto");
  if (bad.length) {
    out.push({ id: "link_sospetto", title: "Contiene un link sospetto", explanation: "Almeno un link ha caratteristiche tipiche dei siti truffa. Non aprirlo.", weight: Math.max(...bad.map((l) => l.score)) });
  }
  const unofficial = links.filter((l) => l.verdict !== "ufficiale");
  if (brands.length && unofficial.length) {
    out.push({ id: "brand_link", title: `Cita ${brands[0]} ma il link non è ufficiale`, explanation: `Il messaggio nomina ${brands.join(", ")}, ma il link porta a un sito diverso da quello ufficiale.`, weight: 25 });
  }
  return out;
}

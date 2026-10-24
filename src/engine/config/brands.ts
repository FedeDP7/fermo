export type BrandKind = "ente" | "banca" | "pagamenti" | "marketplace" | "corriere";

export interface Brand {
  name: string;
  kind: BrandKind;
  /** Regexes over normalized text (accents stripped, lowercase, leet fixed). */
  aliases: RegExp[];
  domains: string[];
  /** Tokens that, found inside a foreign hostname, imitate the brand. */
  tokens: string[];
}

export const BRANDS: Brand[] = [
  { name: "Agenzia delle Entrate-Riscossione", kind: "ente", aliases: [/\bagenzia (delle )?entrate[ -]riscossione\b/, /\bader\b/], domains: ["agenziaentrateriscossione.gov.it"], tokens: ["entrateriscossione"] },
  { name: "Agenzia delle Entrate", kind: "ente", aliases: [/\bagenzia (delle )?entrate\b/, /\ba+g\.? ?entrate\b/, /\bag\.? entrate\b/, /\bade\b/, /\bagenziaentrate\b/], domains: ["agenziaentrate.gov.it"], tokens: ["agenziaentrate", "entrate"] },
  { name: "INPS", kind: "ente", aliases: [/\binps\b/], domains: ["inps.it"], tokens: ["inps"] },
  { name: "PostePay", kind: "pagamenti", aliases: [/\bpostepay\b/], domains: ["postepay.it", "poste.it"], tokens: ["postepay"] },
  { name: "Poste Italiane", kind: "banca", aliases: [/\bposte( italiane)?\b/, /\bbancoposta\b/], domains: ["poste.it", "posteitaliane.it"], tokens: ["poste", "posteitaliane", "bancoposta"] },
  { name: "Intesa Sanpaolo", kind: "banca", aliases: [/\bintesa( sanpaolo| san paolo)?\b/], domains: ["intesasanpaolo.com"], tokens: ["intesasanpaolo", "intesa"] },
  { name: "UniCredit", kind: "banca", aliases: [/\bunicredit\b/], domains: ["unicredit.it"], tokens: ["unicredit"] },
  { name: "PayPal", kind: "pagamenti", aliases: [/\bpaypal\b/], domains: ["paypal.com", "paypal.it", "paypal.me"], tokens: ["paypal"] },
  { name: "Subito", kind: "marketplace", aliases: [/\bsubito\.it\b/, /\bsu subito\b/], domains: ["subito.it"], tokens: ["subito"] },
  { name: "Vinted", kind: "marketplace", aliases: [/\bvinted\b/], domains: ["vinted.it", "vinted.com"], tokens: ["vinted"] },
  { name: "Amazon", kind: "marketplace", aliases: [/\bamazon\b/], domains: ["amazon.it", "amazon.com"], tokens: ["amazon"] },
];

export const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "ow.ly", "rebrand.ly", "shorturl.at", "t.ly", "rb.gy", "tiny.cc", "s.id", "v.gd"];

/** Free subdomain services often abused (explained, weak weight). */
export const FREE_SUBDOMAIN_SUFFIXES = ["us.cc", "eu.org", "duckdns.org", "no-ip.org", "ddns.net"];

/** Legitimate hosting platforms: never suspicious by themselves. */
export const HOSTING_PLATFORMS = ["vercel.app", "netlify.app", "github.io", "pages.dev", "web.app", "lovable.app"];

export const UNUSUAL_TLDS = ["xyz", "top", "click", "online", "site", "live", "icu", "buzz", "cfd", "sbs", "rest", "monster", "support", "help", "work", "vip", "cc", "tk", "ml", "ga", "cf", "gq"];

/** Exact or "." + domain match. Never substring. */
export function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith("." + domain);
}

export function knownDomainFor(host: string): string | null {
  for (const b of BRANDS) for (const d of b.domains) if (hostMatches(host, d)) return d;
  for (const d of HOSTING_PLATFORMS) if (hostMatches(host, d)) return null;
  return null;
}

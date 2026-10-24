import { parse } from "tldts";
import { BRANDS, FREE_SUBDOMAIN_SUFFIXES, HOSTING_PLATFORMS, SHORTENERS, UNUSUAL_TLDS, hostMatches, type Brand } from "./config/brands";
import { LINK_WEIGHTS } from "./config/rules";
import { deLeet } from "./normalize";
import type { LinkIndicator, LinkReport, ParsedUrl } from "./types";

const SCHEME_RE = /\bh(?:tt|xx)ps?:\/\/[^\s<>"'`]+/gi;
const DOT = String.raw`(?:\.|\[\.\]|\(dot\)|\(\.\))`;
const BARE_RE = new RegExp(String.raw`(?<![\p{L}\p{N}@._-])(?:[\p{L}\p{N}-]+${DOT})+\p{L}{2,}(?::\d+)?(?:\/[^\s<>"'\x60]*)?`, "giu");
const TRAIL = /[.,;:!?)\]}'"»]+$/;

export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]!;
      dp[j] = Math.min(dp[j]! + 1, dp[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length]!;
}

function toAsciiHost(host: string): string {
  if (/^[\x00-\x7f]*$/.test(host)) return host;
  try {
    return new URL(`http://${host}`).hostname;
  } catch {
    return host;
  }
}

export function parseUrl(original: string): ParsedUrl | null {
  const obfuscated = /hxxp|\[\.\]|\(dot\)|\(\.\)/i.test(original);
  const cleaned = original
    .replace(/^hxxp/i, "http")
    .replace(/\[\.\]|\(dot\)|\(\.\)/gi, ".")
    .replace(TRAIL, "");
  const m = /^(https?):\/\//i.exec(cleaned);
  const protocol = m ? (m[1]!.toLowerCase() as "http" | "https") : null;
  const rest = m ? cleaned.slice(m[0].length) : cleaned;
  const authority = rest.split(/[/?#]/)[0] ?? "";
  const hasAt = authority.includes("@");
  const hostPort = hasAt ? authority.slice(authority.lastIndexOf("@") + 1) : authority;
  const rawHost = hostPort.replace(/:\d+$/, "").replace(/\.$/, "").toLowerCase();
  if (!rawHost) return null;
  const hostname = toAsciiHost(rawHost);
  const p = parse(hostname, { allowPrivateDomains: true });
  if (!p.isIp && !(p.isIcann || p.isPrivate)) return null;
  if (!p.isIp && !p.domain && !protocol) return null;
  return {
    original,
    cleaned,
    protocol,
    hostname,
    domain: p.isIp ? null : p.domain,
    publicSuffix: p.publicSuffix,
    subdomain: p.subdomain || null,
    isIp: !!p.isIp,
    isPrivateSuffix: !!p.isPrivate,
    hasAt,
    obfuscated,
    punycode: hostname.split(".").some((l) => l.startsWith("xn--")) || rawHost !== hostname,
  };
}

export function extractUrls(text: string): ParsedUrl[] {
  const out: ParsedUrl[] = [];
  const seen = new Set<string>();
  let rest = text;
  for (const m of text.matchAll(SCHEME_RE)) {
    rest = rest.replace(m[0], " ".repeat(m[0].length));
    const u = parseUrl(m[0]);
    if (u && !seen.has(u.cleaned)) out.push(u), seen.add(u.cleaned);
  }
  for (const m of rest.matchAll(BARE_RE)) {
    const u = parseUrl(m[0]);
    if (u && !seen.has(u.cleaned)) out.push(u), seen.add(u.cleaned);
  }
  return out;
}

const CONFUSABLE: Record<string, string> = { "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x", "і": "i", "ӏ": "l", "ѕ": "s", "ԁ": "d", "ɡ": "g", "ո": "n" };

function unicodeLabel(u: ParsedUrl): string {
  const m = /^(?:h(?:tt|xx)ps?:\/\/)?(?:[^@/]*@)?([^/:?#]+)/i.exec(u.cleaned);
  return (m?.[1] ?? "").toLowerCase();
}

export interface LinkContext {
  claimedBrand: Brand | null;
  mentionedBrands: Brand[];
  sensitiveRequest: boolean;
}

export function analyzeLink(u: ParsedUrl, ctx: LinkContext): LinkReport {
  const host = u.hostname;
  const indicators: LinkIndicator[] = [];
  const add = (id: keyof typeof LINK_WEIGHTS, label: string) => indicators.push({ id, label, weight: LINK_WEIGHTS[id] });

  let matchesKnown: string | null = null;
  let ownerBrand: Brand | null = null;
  for (const b of BRANDS) for (const d of b.domains) if (!matchesKnown && hostMatches(host, d)) (matchesKnown = d), (ownerBrand = b);
  const onHosting = HOSTING_PLATFORMS.some((d) => hostMatches(host, d));

  const claimed = ctx.claimedBrand;
  let reference: string[] = claimed ? claimed.domains : [];
  const mismatch = !!claimed && !claimed.domains.some((d) => hostMatches(host, d));

  if (!matchesKnown) {
    const labels = host.split(".").map((l) => deLeet(l.replace(/-/g, "")));
    const base = deLeet((u.domain ?? host).split(".")[0]!.replace(/-/g, ""));

    if (claimed && mismatch) {
      add("brand_discordante", `Il messaggio dice di essere ${claimed.name}, ma il link non porta a ${claimed.domains[0]}.`);
    }
    // Brand token inside a foreign hostname
    const imitated = BRANDS.find((b) => b.tokens.some((t) => t.length >= 4 && labels.some((l) => l.includes(t))));
    if (imitated) {
      add("imitazione_hostname", `L'indirizzo contiene "${imitated.tokens.find((t) => labels.some((l) => l.includes(t)))}" per sembrare ${imitated.name}, ma il sito è un altro.`);
      if (!reference.length) reference = imitated.domains;
    } else if (claimed?.kind === "ente" && labels.some((l) => /gov/.test(l)) && !host.endsWith(".gov.it")) {
      add("imitazione_hostname", `L'indirizzo usa "gov" per sembrare un sito governativo, ma i siti pubblici italiani finiscono con .gov.it.`);
    }
    // Typosquatting (contextual: tighter when the brand is mentioned)
    if (!imitated) {
      for (const b of BRANDS) {
        const mentioned = ctx.mentionedBrands.includes(b);
        const hit = b.domains.find((d) => {
          const off = d.split(".")[0]!;
          const dist = levenshtein(base, off);
          return off.length >= 5 && dist > 0 && dist <= (mentioned ? 2 : 1);
        });
        if (hit) {
          add("typosquatting", `"${u.domain}" somiglia molto a "${hit}" (${b.name}) ma non è lo stesso indirizzo.`);
          if (!reference.length) reference = b.domains;
          break;
        }
      }
    }
    // Homoglyphs
    const uni = unicodeLabel(u);
    if (u.punycode) {
      const mapped = uni.replace(/./g, (c) => CONFUSABLE[c] ?? c);
      const b = BRANDS.find((x) => x.domains.some((d) => hostMatches(mapped, d)));
      if (b) {
        add("omoglifi", `L'indirizzo usa lettere di altri alfabeti che imitano "${b.domains[0]}".`);
        if (!reference.length) reference = b.domains;
      } else add("punycode", "L'indirizzo contiene caratteri speciali non latini.");
    }
    if (SHORTENERS.some((d) => hostMatches(host, d))) add("shortener", "È un link accorciato: la destinazione reale è sconosciuta e FERMO non la apre.");
    if (u.isIp) ctx.sensitiveRequest ? add("ip_sensibile", "Il link usa un indirizzo numerico e il messaggio chiede dati o pagamenti.") : add("ip", "Il link usa un indirizzo numerico invece di un nome.");
    if (u.obfuscated) add("offuscato", "Il link è scritto in modo camuffato (es. [.] o hxxp) per sfuggire ai controlli.");
    if (u.isPrivateSuffix && FREE_SUBDOMAIN_SUFFIXES.includes(u.publicSuffix ?? "")) {
      add("sottodominio_gratuito", `"${u.domain}" è un nome creato su "${u.publicSuffix}", un servizio di indirizzi gratuiti: chiunque può crearne uno.`);
    } else if (!onHosting && u.publicSuffix && UNUSUAL_TLDS.includes(u.publicSuffix.split(".").pop()!)) {
      add("tld_insolito", `L'estensione ".${u.publicSuffix}" è insolita per un servizio italiano.`);
    }
    if (u.protocol === "http") add("http", "Il link non usa una connessione protetta (https).");
    if (!onHosting && (u.domain ?? "").split("-").length >= 3) add("trattini", "Il nome contiene molti trattini.");
  }
  if (u.hasAt) add("chiocciola", "L'indirizzo contiene una @: tutto ciò che sta prima è ignorato e il sito vero è quello dopo.");

  const strong = indicators.some((i) => i.weight >= 15);
  const verdict: LinkReport["verdict"] = matchesKnown && !mismatch && !u.hasAt ? "dominio noto" : strong ? "sospetto" : "da verificare";
  return {
    ...u,
    claimedBrand: claimed?.name ?? (ownerBrand && mismatch ? null : null),
    referenceDomains: reference,
    matchesKnown,
    mismatch: mismatch || (!!reference.length && !matchesKnown),
    indicators,
    verdict,
  };
}

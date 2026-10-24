import { parse } from "tldts";
import { BRANDS, OFFICIAL_DOMAINS, RISKY_TLDS, SHORTENERS } from "./config/brands";
import { deLeet, deobfuscateUrls } from "./normalize";
import type { LinkReport } from "./types";

const URL_RE = /\b((?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:\/[^\s<>"']*)?)/gi;
const IP_URL_RE = /\bhttps?:\/\/\d{1,3}(?:\.\d{1,3}){3}[^\s]*/gi;

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

export function extractUrls(text: string): string[] {
  const t = deobfuscateUrls(text);
  const found = new Set<string>();
  for (const m of t.matchAll(IP_URL_RE)) found.add(m[0].replace(/[.,;:!?)]+$/, ""));
  for (const m of t.matchAll(URL_RE)) {
    const raw = (m[1] ?? "").replace(/[.,;:!?)]+$/, "");
    if ([...found].some((f) => f.includes(raw))) continue;
    const p = parse(raw);
    if (!p.domain || !p.isIcann) continue; // ignore things like "ad es.it" non-domains? isIcann checks real TLD
    if (!/[a-z]/i.test(p.domainWithoutSuffix ?? "")) continue;
    found.add(raw);
  }
  return [...found];
}

export function analyzeUrl(raw: string): LinkReport {
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  const p = parse(withScheme);
  const hostname = (p.hostname ?? raw).toLowerCase();
  const domain = (p.domain ?? hostname).toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  if (OFFICIAL_DOMAINS.includes(domain)) {
    return { raw, hostname, domain, verdict: "ufficiale", reasons: ["Il dominio corrisponde a un sito ufficiale noto. Controlla comunque di averlo scritto tu."], score: 0 };
  }

  if (p.isIp) {
    reasons.push("Il link usa un indirizzo numerico invece di un nome: i siti seri non lo fanno.");
    score += 30;
  }
  if (/^http:\/\//i.test(raw)) {
    reasons.push("Il link non usa una connessione protetta (https).");
    score += 5;
  }
  if (SHORTENERS.includes(domain)) {
    reasons.push("È un link accorciato: nasconde la destinazione reale.");
    score += 20;
  }
  if (p.publicSuffix && RISKY_TLDS.includes(p.publicSuffix)) {
    reasons.push(`L'estensione ".${p.publicSuffix}" è economica e spesso usata per siti truffa.`);
    score += 15;
  }
  if (hostname.includes("xn--")) {
    reasons.push("Il nome contiene caratteri speciali che possono imitare lettere normali.");
    score += 25;
  }

  const base = deLeet(p.domainWithoutSuffix ?? "").replace(/-/g, "");
  const sub = (p.subdomain ?? "").replace(/-/g, "");
  const path = withScheme.toLowerCase().replace(/-/g, "");
  for (const brand of BRANDS) {
    for (const off of brand.domains) {
      const offBase = off.split(".")[0] ?? "";
      if (offBase.length < 4) continue;
      const mentions = sub.includes(offBase) || base.includes(offBase) || path.includes(offBase);
      const close = base !== offBase && levenshtein(base, offBase) <= 2 && base.length >= 4;
      if (close) {
        reasons.push(`"${domain}" somiglia a "${off}" (${brand.name}) ma non è lo stesso sito.`);
        score += 40;
      } else if (mentions) {
        reasons.push(`Usa il nome "${brand.name}" ma il sito vero è "${domain}", non ${off}.`);
        score += 35;
      }
      if (close || mentions) break;
    }
  }
  if ((p.domainWithoutSuffix ?? "").split("-").length >= 3) {
    reasons.push("Il nome del sito contiene molti trattini, tipico dei siti improvvisati.");
    score += 10;
  }
  if (hostname.split(".").length >= 5) {
    reasons.push("L'indirizzo ha molti livelli: il nome che conta è solo quello prima dell'estensione.");
    score += 10;
  }

  if (reasons.length === 0) reasons.push("Nessuna anomalia strutturale evidente, ma non è un sito ufficiale noto. Non possiamo verificarne l'affidabilità.");
  const verdict = score >= 30 ? "sospetto" : "attenzione";
  return { raw, hostname, domain, verdict, reasons, score: Math.min(score, 60) };
}

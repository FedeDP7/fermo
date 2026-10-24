import type { Context } from "./types";

const KEYWORDS: Record<Exclude<Context, "GENERICO">, RegExp[]> = {
  ISTITUZIONALE: [/agenzia (delle )?entrate/, /\binps\b/, /\bfisco\b/, /\bf24\b/, /\bspid\b/, /rimborso fiscale/, /\bcomune\b/, /\bministero\b/, /cartella esattoriale/],
  BANCA_PAGAMENTI: [/\bbanca\b/, /\bconto\b/, /\bcarta\b/, /\bhome banking\b/, /\bpostepay\b/, /\bbonifico\b/, /\baddebito\b/, /\btransazione\b/],
  CONSEGNA: [/\bpacco\b/, /\bspedizione\b/, /\bcorriere\b/, /\bconsegna\b/, /\bgiacenza\b/, /\btracking\b/],
  AFFITTO: [/\baffitt/, /\bappartamento\b/, /\bmonolocale\b/, /\bbilocale\b/, /\bstanza\b/, /\bcanone\b/, /\bcaparra\b/, /\bproprietari[oa]\b/, /\bcontratto di locazione\b/, /\bcasa\b/],
  COMPRAVENDITA: [/\bvendo\b/, /\bacquist/, /\bannuncio\b/, /\bsubito\b/, /\bmarketplace\b/, /\bvinted\b/, /\bpaypal\b/, /\bspedisco\b/, /\bcompra/, /\boggetto\b/, /\biphone\b/],
};

export const CONTEXT_LABELS: Record<Context, string> = {
  ISTITUZIONALE: "Ente pubblico / fisco",
  BANCA_PAGAMENTI: "Banca o pagamenti",
  CONSEGNA: "Consegna pacchi",
  AFFITTO: "Affitto casa",
  COMPRAVENDITA: "Compravendita online",
  GENERICO: "Messaggio generico",
};

export function classifyContext(norm: string): Context {
  let best: Context = "GENERICO";
  let bestScore = 0;
  for (const [ctx, list] of Object.entries(KEYWORDS) as [Context, RegExp[]][]) {
    const s = list.reduce((n, re) => n + (re.test(norm) ? 1 : 0), 0);
    if (s > bestScore) {
      best = ctx;
      bestScore = s;
    }
  }
  return best;
}

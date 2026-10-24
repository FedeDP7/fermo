import type { Context } from "./types";

const KEYWORDS: Record<Exclude<Context, "GENERICO">, RegExp[]> = {
  ISTITUZIONALE: [/agenzia (delle )?entrate/, /\ba+g\.? ?entrate\b/, /\binps\b/, /\bfisco\b/, /\bfiscale\b/, /\bf24\b/, /\bspid\b/, /\bministero\b/, /cartella esattoriale/],
  BANCA_PAGAMENTI: [/\bbanca\b/, /\bconto corrente\b/, /\bhome banking\b/, /\bpostepay\b/, /\baddebito\b/, /\btransazione\b/, /\bcarta di credito\b/],
  CONSEGNA: [/\bpacco\b/, /\bcorriere\b/, /\bconsegna\b/, /\bgiacenza\b/, /\btracking\b/],
  AFFITTO: [/\baffitt/, /\bappartamento\b/, /\b(mono|bi|tri|quadri)locale\b/, /\bstanza\b/, /\bcanone\b/, /\bcaparra\b/, /\bvisit[ae]\b/, /\bchiavi\b/],
  COMPRAVENDITA: [/\bvendo\b/, /\binteressat[oa]\b/, /\bannuncio\b/, /\bsubito\.it\b/, /\bvinted\b/, /\bmarketplace\b/, /\boggetto\b/, /\bcommission[ei]\b/, /\bspedisco\b/],
  FAMIGLIA: [/\bmamma\b/, /\bpapa\b/, /\bnuovo numero\b/, /\bcambiato numero\b/, /\bnonn[oa]\b/, /\bfigli[oa]\b/],
};

export const CONTEXT_LABELS: Record<Context, string> = {
  ISTITUZIONALE: "Ente pubblico / fisco",
  BANCA_PAGAMENTI: "Banca o pagamenti",
  CONSEGNA: "Consegna pacchi",
  AFFITTO: "Affitto casa",
  COMPRAVENDITA: "Compravendita online",
  FAMIGLIA: "Messaggio da un familiare",
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

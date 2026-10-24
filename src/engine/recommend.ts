import type { Context, Level, Signal } from "./types";

const BY_CONTEXT: Record<Context, string[]> = {
  ISTITUZIONALE: [
    "Non cliccare il link: entra nel sito dell'ente scrivendo tu l'indirizzo (es. agenziaentrate.gov.it) o usa l'app ufficiale.",
    "Gli enti pubblici non chiedono dati della carta né rimborsi via SMS.",
    "In caso di dubbio chiama il numero ufficiale dell'ente, preso dal suo sito.",
  ],
  BANCA_PAGAMENTI: [
    "Non comunicare mai codici, PIN o password: la banca non li chiede.",
    "Chiama la banca al numero scritto sul retro della tua carta.",
    "Controlla i movimenti solo dall'app ufficiale della banca.",
  ],
  CONSEGNA: [
    "Controlla la spedizione solo sul sito o sull'app del negozio dove hai comprato.",
    "Nessun corriere chiede piccoli pagamenti via SMS per consegnare.",
    "Non inserire i dati della carta su link ricevuti per messaggio.",
  ],
  AFFITTO: [
    "Non versare caparre o anticipi prima di aver visto la casa di persona.",
    "Chiedi di incontrare il proprietario e verifica che sia davvero lui (documento e titolo di proprietà).",
    "Firma un contratto regolare prima di qualsiasi pagamento tracciabile.",
  ],
  COMPRAVENDITA: [
    "Paga solo con metodi che ti proteggono (PayPal 'beni e servizi' o pagamento sulla piattaforma).",
    "Resta nella chat della piattaforma: non spostarti su WhatsApp o email.",
    "Se puoi, vedi l'oggetto di persona e paga alla consegna.",
  ],
  GENERICO: [
    "Non aprire link e non rispondere con dati personali.",
    "Verifica contattando la persona o l'azienda con un recapito che conosci già.",
    "Chiedi un parere a un familiare o a una persona di fiducia prima di agire.",
  ],
};

const REPLIES: Partial<Record<Context, string>> = {
  AFFITTO: "Buongiorno, sono interessato. Prima di qualsiasi pagamento vorrei visitare l'appartamento di persona e incontrarla. Quando possiamo fissare un appuntamento?",
  COMPRAVENDITA: "Ciao, sono interessato. Preferisco pagare con PayPal \"beni e servizi\" o tramite la piattaforma, oppure di persona al ritiro. Va bene per te?",
  ISTITUZIONALE: "",
};

export function buildRecommendations(ctx: Context, level: Level, signals: Signal[]): { recommendations: string[]; safeReply: string | null } {
  const recs = [...BY_CONTEXT[ctx]];
  if (signals.some((s) => s.id === "paypal_amici") && ctx !== "COMPRAVENDITA") recs[2] = "Non pagare con PayPal 'amici e familiari' chi non conosci: non sei protetto.";
  if (level === "BASSO") recs[2] = "Nessun segnale forte trovato, ma resta prudente: FERMO non può garantire che il messaggio sia sicuro.";
  const reply = REPLIES[ctx];
  return { recommendations: recs.slice(0, 3), safeReply: reply ? reply : level !== "BASSO" && ctx !== "ISTITUZIONALE" && ctx !== "CONSEGNA" && ctx !== "BANCA_PAGAMENTI" ? null : null };
}

import type { Context, Level, Signal, Situation } from "./types";

const PHISHING_IDS = ["brand_discordante", "imitazione_hostname", "typosquatting", "omoglifi"];
const PAYMENT_IDS = ["gift_card", "metodo_irrecuperabile", "pagamento_eccesso", "paypal_amici"];

export function detectSituation(signals: Signal[], context: Context, corporateBrand = false): Situation {
  const ids = new Set(signals.map((s) => s.id));
  if (!signals.length) return "NESSUNA";
  if (ids.has("cambio_iban")) return "CAMBIO_IBAN";
  if (ids.has("dirigente_pagamento")) return "CEO_FRAUD";
  if ((corporateBrand || context === "AZIENDALE") && (ids.has("credenziali") || PHISHING_IDS.some((i) => ids.has(i)))) return "PHISHING_AZIENDALE";
  if (context === "AZIENDALE" && (ids.has("beneficiario_cambiato") || PAYMENT_IDS.some((i) => ids.has(i)) || ids.has("ostacola_verifica") || ids.has("minaccia"))) return "FATTURA";
  if (ids.has("credenziali")) return "CREDENZIALI";
  if (PHISHING_IDS.some((i) => ids.has(i))) return "PHISHING";
  if (ids.has("finto_parente")) return "FINTO_PARENTE";
  if (ids.has("caparra") || ids.has("no_visita") || context === "AFFITTO") return "AFFITTO";
  if (ids.has("fuori_piattaforma") || ids.has("paypal_amici") || context === "COMPRAVENDITA") return "MARKETPLACE";
  if (PAYMENT_IDS.some((i) => ids.has(i))) return "PAGAMENTO";
  if (ids.has("impersonazione_debole")) return "PHISHING";
  return "NESSUNA";
}

const RECS: Record<Situation, string[]> = {
  CAMBIO_IBAN: [
    "Sospendi temporaneamente l'autorizzazione al pagamento.",
    "Contatta il fornitore tramite un recapito già verificato e indipendente dalla comunicazione ricevuta.",
    "Segui la procedura interna di approvazione e verifica delle coordinate.",
  ],
  CEO_FRAUD: [
    "Non effettuare il trasferimento richiesto prima della verifica.",
    "Verifica l'identità del richiedente attraverso un canale aziendale conosciuto.",
    "Coinvolgi il responsabile amministrativo o il referente della sicurezza.",
  ],
  PHISHING_AZIENDALE: [
    "Non aprire il link sospetto e non inserire credenziali.",
    "Accedi al servizio attraverso l'applicazione o il sito aziendale noto.",
    "Se hai già inserito credenziali, contatta immediatamente il referente IT e avvia le procedure di protezione dell'account.",
  ],
  FATTURA: [
    "Verifica la corrispondenza con ordine, contratto o precedente documentazione.",
    "Controlla autonomamente beneficiario e coordinate.",
    "Richiedi conferma secondo le procedure aziendali prima di autorizzare il pagamento.",
  ],
  CREDENZIALI: [
    "Non condividere OTP, PIN, password o CVV con nessuno, nemmeno con chi dice di essere la banca.",
    "Contatta il servizio usando il numero ufficiale (es. sul retro della carta o nell'app).",
    "Se hai già comunicato un codice, chiama subito la banca per bloccare carta e accessi.",
  ],
  PHISHING: [
    "Non aprire il link e non rispondere al messaggio.",
    "Controlla eventuali comunicazioni solo dall'app ufficiale o digitando tu l'indirizzo del sito.",
    "Se hai inserito dati, cambia la password e avvisa subito la banca o l'ente.",
  ],
  FINTO_PARENTE: [
    "Chiama il familiare al numero che conosci già, non a quello nuovo.",
    "Non fare bonifici o ricariche finché non hai parlato con lui a voce.",
    "Fai una domanda a cui solo il vero familiare saprebbe rispondere.",
  ],
  AFFITTO: [
    "Non pagare caparre o anticipi prima di aver visto la casa di persona.",
    "Verifica chi affitta: documento, titolo di proprietà e un contratto regolare.",
    "Se il proprietario non può farti visitare l'immobile, considera di lasciar perdere.",
  ],
  MARKETPLACE: [
    "Resta nella chat della piattaforma: lì hai più tutele e la cronologia della trattativa.",
    "Usa metodi protetti: pagamento della piattaforma o PayPal 'beni e servizi'.",
    "Se puoi, vedi l'oggetto di persona e paga alla consegna.",
  ],
  PAGAMENTO: [
    "Verifica beneficiario e causale attraverso un canale indipendente, non quello del messaggio.",
    "Evita ricariche, gift card o criptovalute verso persone che non conosci.",
    "Prima di pagare, chiedi un parere a una persona di fiducia.",
  ],
  NESSUNA: [
    "Se il messaggio ti chiede soldi o dati, verifica comunque con un recapito che conosci già.",
    "Non aprire link se non sei sicuro di chi li ha inviati.",
    "FERMO non può garantire che un messaggio sia sicuro: in caso di dubbio, chiedi un parere.",
  ],
};

const REPLIES: Partial<Record<Situation, string>> = {
  AFFITTO: "Buongiorno, l'appartamento mi interessa. Prima di qualsiasi pagamento vorrei visitarlo di persona e vedere un documento e il titolo di proprietà. Quando possiamo fissare la visita?",
  MARKETPLACE: "Ciao, grazie dell'interesse. Preferisco continuare qui sulla piattaforma e usare un pagamento protetto (il sistema della piattaforma o PayPal 'beni e servizi'). Va bene per te?",
};

export function buildRecommendations(situation: Situation, level: Level): { recommendations: string[]; safeReply: string | null } {
  const recs = [...RECS[situation]];
  if (level === "BASSO" && !["NESSUNA", "CAMBIO_IBAN", "CEO_FRAUD", "PHISHING_AZIENDALE", "FATTURA"].includes(situation)) recs[2] = RECS.NESSUNA[2] ?? "In caso di dubbio, chiedi un parere.";
  // No reply for phishing / impersonation: never write back to the sender.
  const safeReply = level !== "BASSO" ? (REPLIES[situation] ?? null) : null;
  return { recommendations: recs, safeReply };
}

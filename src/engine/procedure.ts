import type { AnalysisResult, Situation } from "./types";

export const SITUATION_LABELS: Record<Situation, string> = {
  CAMBIO_IBAN: "Cambio coordinate bancarie",
  CEO_FRAUD: "Richiesta economica attribuita a un dirigente",
  PHISHING_AZIENDALE: "Possibile phishing aziendale",
  FATTURA: "Richiesta di pagamento da verificare",
  CREDENZIALI: "Richiesta di credenziali",
  PHISHING: "Possibile phishing",
  FINTO_PARENTE: "Possibile finto familiare",
  AFFITTO: "Richiesta relativa a un affitto",
  MARKETPLACE: "Compravendita online",
  PAGAMENTO: "Richiesta di pagamento",
  NESSUNA: "Comunicazione da valutare",
};

/** Generic suggested steps, never a claim that company policies are configured. */
export function buildProcedure(r: AnalysisResult): string[] {
  if (r.situation === "CAMBIO_IBAN") return [
    "Metti in attesa il pagamento e l'aggiornamento delle coordinate.",
    "Recupera il numero del fornitore già presente nell'anagrafica aziendale, non dalla comunicazione.",
    "Verifica verbalmente la richiesta e confrontala con la documentazione già disponibile.",
    "Richiedi un secondo controllo se previsto dalle procedure interne.",
    "Procedi soltanto dopo la conferma e l'approvazione prevista.",
  ];
  if (r.situation === "CEO_FRAUD") return [
    "Metti in attesa il trasferimento richiesto.",
    "Contatta il dirigente tramite un numero o un canale interno già conosciuto.",
    "Verifica motivo, beneficiario e autorizzazione con il responsabile amministrativo.",
    "Non saltare i controlli interni per urgenza o riservatezza.",
    "Procedi solo dopo conferma indipendente e approvazione.",
  ];
  if (r.situation === "PHISHING_AZIENDALE") return [
    "Interrompi l'accesso dal link ricevuto e non inserire password o codici.",
    "Apri l'app aziendale o un indirizzo già noto per verificare l'avviso.",
    "Coinvolgi il referente IT per valutare la comunicazione.",
    "Se hai già comunicato credenziali, avvisa subito l'IT e segui la procedura di protezione dell'account.",
  ];
  if (r.situation === "FATTURA") return [
    "Metti in attesa l'autorizzazione se i dati non coincidono.",
    "Confronta fattura, ordine e contratto con la documentazione disponibile.",
    "Verifica beneficiario e coordinate tramite un contatto già noto.",
    "Richiedi conferma e approvazione secondo le regole interne.",
  ];
  return [
    r.level === "BASSO" ? "Verifica comunque richieste economiche o di dati prima di agire." : "Metti in attesa l'azione richiesta finché i dubbi non sono chiariti.",
    ...r.recommendations.slice(0, 2),
    "Se riguarda il lavoro, coinvolgi il referente appropriato e segui le regole interne.",
  ];
}

/** Allowlist only generated information: never input, excerpts, domains, brands or addresses. */
export function buildManagerSummary(r: AnalysisResult): string {
  return [
    "FERMO — Riepilogo di verifica",
    `Tipo: ${SITUATION_LABELS[r.situation]}`,
    `Livello: ${r.level} · Indice orientativo: ${r.score}/100 (non una probabilità)`,
    "Segnali principali:",
    ...(r.signals.length ? r.signals.slice(0, 5).map((s) => `- ${s.id === "impersonazione_debole" ? "Il testo dichiara un servizio noto" : s.title}`) : ["- Nessun segnale noto rilevato"]),
    "Verifiche consigliate:",
    ...buildProcedure(r).map((step, i) => `${i + 1}. ${step}`),
    "Procedura consigliata da adattare alle regole interne. L'analisi è euristica e non costituisce una verifica definitiva del mittente o della comunicazione.",
    "Testo originale e dati riservati non inclusi. Nessuna segnalazione inviata automaticamente.",
  ].join("\n");
}
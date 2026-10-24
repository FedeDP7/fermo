import type { Context } from "../types";

export interface Rule {
  id: string;
  title: string;
  explanation: string;
  patterns: RegExp[]; // applied to normalized text
  weight: number;
  boost?: Partial<Record<Context, number>>; // multiplier per context
}

export const THRESHOLDS = { medio: 30, alto: 65 };

export const RULES: Rule[] = [
  {
    id: "urgenza",
    title: "Ti mette fretta",
    explanation: "Il messaggio impone tempi strettissimi. La fretta serve a non farti ragionare.",
    patterns: [/\b(urgente|immediatamente|subito|entro (24|48) ?ore|entro oggi|ultimo avviso|ultim[oa] possibilita|scade oggi|al piu presto)\b/],
    weight: 15,
  },
  {
    id: "minaccia",
    title: "Minaccia conseguenze",
    explanation: "Parla di blocchi, sanzioni o sospensioni per spaventarti.",
    patterns: [/\b(sospes[oa]|sospensione|bloccat[oa]|blocco|sanzion[ei]|pignoramento|multa|verra (chiuso|disattivato)|disattivazione|azioni legali)\b/],
    weight: 15,
  },
  {
    id: "dati_sensibili",
    title: "Chiede dati riservati",
    explanation: "Nessun ente o banca chiede codici, PIN, password o dati della carta via messaggio.",
    patterns: [/\b(otp|pin|password|codice (di )?(sicurezza|verifica|conferma)|cvv|numero (della )?carta|credenziali|dati (della carta|bancari|personali))\b/],
    weight: 25,
    boost: { BANCA_PAGAMENTI: 1.2, ISTITUZIONALE: 1.2 },
  },
  {
    id: "rimborso",
    title: "Promette un rimborso o un premio",
    explanation: "Rimborsi o vincite inattese sono un'esca molto comune.",
    patterns: [/\b(rimborso|hai diritto|credito d.imposta a tuo favore|hai vinto|premio|bonus di|accredito in attesa)\b/],
    weight: 15,
    boost: { ISTITUZIONALE: 1.4 },
  },
  {
    id: "clicca_link",
    title: "Ti chiede di cliccare un link",
    explanation: "Spinge ad aprire un link per 'verificare' o 'confermare'. Meglio andare sul sito ufficiale digitando tu l'indirizzo.",
    patterns: [/\b(clicca|accedi|verifica|conferma|aggiorna) (qui|al link|il link|sul link|subito|i tuoi dati|l.account)\b/, /\b(link|collegamento) (qui )?sotto\b/],
    weight: 10,
  },
  {
    id: "anticipo",
    title: "Chiede soldi in anticipo",
    explanation: "Pagare caparra o anticipo prima di vedere casa o merce è il cuore di molte truffe.",
    patterns: [/\b(caparra|anticipo|deposito cauzionale|acconto|prima mensilita|pagamento anticipato|bloccare (l.appartamento|la casa|la stanza))\b/],
    weight: 20,
    boost: { AFFITTO: 1.5, COMPRAVENDITA: 1.3 },
  },
  {
    id: "pagamento_irrevocabile",
    title: "Metodo di pagamento non tutelato",
    explanation: "Bonifico istantaneo, ricariche, gift card o criptovalute sono quasi impossibili da recuperare.",
    patterns: [/\b(western union|moneygram|ricarica (postepay|la mia postepay)|gift ?card|carta regalo|bitcoin|crypto|criptovalut[ae]|usdt|bonifico istantaneo)\b/],
    weight: 25,
  },
  {
    id: "paypal_amici",
    title: "PayPal 'amici e familiari'",
    explanation: "Con 'amici e familiari' non hai la protezione acquisti: se la merce non arriva perdi i soldi.",
    patterns: [/\b(amici e (familiari|parenti)|friends (and|&) family|amici e famiglia)\b/],
    weight: 35,
    boost: { COMPRAVENDITA: 1.3 },
  },
  {
    id: "cambio_canale",
    title: "Vuole spostarsi su un'altra chat",
    explanation: "Spostare la conversazione fuori dalla piattaforma elimina le tutele del sito.",
    patterns: [/\b(scrivimi su|contattami su|continuiamo su|passiamo su|sentiamoci su) (whatsapp|telegram|email|mail)\b/, /\b(whatsapp|telegram) al (numero )?\+?\d/],
    weight: 15,
    boost: { COMPRAVENDITA: 1.3, AFFITTO: 1.3 },
  },
  {
    id: "estero",
    title: "Controparte all'estero o non disponibile",
    explanation: "Il proprietario o venditore 'all'estero' che non può incontrarti è uno schema classico.",
    patterns: [/\b(sono all.estero|vivo all.estero|lavoro all.estero|mi trovo (a|in) (londra|parigi|germania|inghilterra|spagna|francia)|trasferit[oa] per lavoro|non posso (mostrar|far vedere|incontrar))/],
    weight: 20,
    boost: { AFFITTO: 1.4 },
  },
  {
    id: "corriere_venditore",
    title: "Spedizione 'gestita' da loro",
    explanation: "Corrieri o agenzie proposti dalla controparte che chiedono pagamenti o dati sono spesso falsi.",
    patterns: [/\b(il mio corriere|corriere di fiducia|ritiro tramite corriere|agenzia (di )?spedizion[ei] (mia|di fiducia)|airbnb (ti|vi) mandera|chiavi (via|per) corriere|spedisco le chiavi)\b/],
    weight: 20,
  },
  {
    id: "prezzo_basso",
    title: "Offerta troppo conveniente",
    explanation: "Un prezzo molto sotto mercato serve ad attirarti e farti decidere in fretta.",
    patterns: [/\b(prezzo (stracciato|bassissimo|imperdibile)|occasione unica|affare|sotto costo|regalo|svendo)\b/],
    weight: 10,
  },
  {
    id: "spese_consegna",
    title: "Piccolo pagamento per sbloccare un pacco",
    explanation: "Chiedere pochi euro per 'sbloccare' una consegna è una tecnica per rubare i dati della carta.",
    patterns: [/\b(pacco|spedizione|consegna) .{0,40}(in giacenza|sospes[ao]|bloccat[oa]|non consegnat[oa])\b/, /\b(paga|pagare|versare) .{0,20}\d+[,.]\d{2} ?(eur|€)/],
    weight: 20,
    boost: { CONSEGNA: 1.3 },
  },
];

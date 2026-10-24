import { BRANDS, type Brand } from "./config/brands";
import { LINK_DECEPTION_IDS, TEXT_WEIGHTS } from "./config/rules";
import { clauses, deLeetWords, negatedBefore } from "./normalize";
import type { LinkReport, Signal } from "./types";

type TextId = keyof typeof TEXT_WEIGHTS;

const TEXT_INFO: Record<TextId, { title: string; explanation: string }> = {
  credenziali: { title: "Chiede codici o password", explanation: "Ti viene chiesto di comunicare OTP, PIN, password o CVV. Nessuna banca, ente o persona seria li chiede: con questi codici possono svuotarti il conto." },
  finto_parente: { title: "Possibile finto familiare", explanation: "Qualcuno dice di avere un nuovo numero e ti chiede soldi. È una truffa molto diffusa: chiama il numero che conosci già." },
  caparra: { title: "Caparra prima di vedere la casa", explanation: "Ti chiedono soldi per 'bloccare' l'immobile prima che tu l'abbia visto o abbia verificato chi lo affitta." },
  gift_card: { title: "Pagamento con gift card", explanation: "Le carte regalo non sono un metodo di pagamento tra persone: una volta dato il codice, i soldi sono persi." },
  paypal_amici: { title: "PayPal 'amici e familiari'", explanation: "Con questa opzione non hai la protezione acquisti. In una trattativa tra sconosciuti, se qualcosa va storto è difficile recuperare il denaro." },
  metodo_irrecuperabile: { title: "Metodo di pagamento difficile da recuperare", explanation: "Ricariche, money transfer o criptovalute sono quasi impossibili da annullare." },
  pagamento_eccesso: { title: "Pagamento in eccesso da restituire", explanation: "Chi 'paga di più per errore' e chiede la differenza spesso usa pagamenti falsi o revocabili." },
  no_visita: { title: "Impossibile vedere la casa", explanation: "Il proprietario dice di non poter mostrare l'immobile o di spedire le chiavi: così non puoi verificare che esista e che sia suo." },
  documenti: { title: "Chiede documenti personali", explanation: "Ti vengono chiesti documenti d'identità o dati personali prima di qualsiasi verifica: possono essere usati per furti d'identità." },
  fuori_piattaforma: { title: "Vuole spostarsi su un'altra chat", explanation: "Uscire dalla piattaforma (es. su WhatsApp) ti fa perdere tutele e cronologia della trattativa." },
  segretezza: { title: "Chiede di mantenere il segreto", explanation: "Ti chiede di non parlarne con nessuno: serve a evitare che qualcuno ti metta in guardia." },
  minaccia: { title: "Minaccia legata a una richiesta", explanation: "Prospetta blocchi o sanzioni se non fai qualcosa: è una leva per spaventarti." },
  urgenza: { title: "Fretta per farti agire", explanation: "Ti chiede di agire subito. La fretta serve a non lasciarti il tempo di verificare." },
  impersonazione_debole: { title: "Dice di essere un'azienda o un ente", explanation: "Il messaggio si presenta a nome di un servizio noto. Non è una prova di truffa, ma non è nemmeno una prova che sia vero." },
  invito_comunicazione: { title: "Invito generico ad aprire qualcosa", explanation: "Ti invita a 'controllare' o 'visualizzare' una comunicazione senza dire di cosa si tratta." },
  denaro_inatteso: { title: "Promette soldi inattesi", explanation: "Rimborsi, premi o accrediti inattesi accompagnati da una richiesta sono un'esca comune." },
};

const LINK_TITLES: Record<string, string> = {
  brand_discordante: "Il link non è del servizio citato",
  imitazione_hostname: "Indirizzo che imita un nome noto",
  typosquatting: "Indirizzo quasi uguale a uno noto",
  omoglifi: "Lettere camuffate nell'indirizzo",
  shortener: "Link accorciato",
  ip_sensibile: "Indirizzo numerico",
  ip: "Indirizzo numerico",
  chiocciola: "Indirizzo con @ ingannevole",
  offuscato: "Link camuffato",
  sottodominio_gratuito: "Indirizzo creato gratuitamente",
  tld_insolito: "Estensione insolita",
  http: "Connessione non protetta",
  trattini: "Molti trattini nel nome",
  punycode: "Caratteri speciali nell'indirizzo",
};

const ACTION = String.raw`\b(paga|pagare|pagami|pagarmi|invia|inviami|inviare|manda|mandami|mandare|clicca|accedi|conferma|verifica|aggiorna|versa|versare|bonifico|caparra|ricarica|rispondi|inserisci|regolarizza|chiama|compila|scarica|controlla)\b`;
const ACTION_RE = new RegExp(ACTION);
const REQ_VERB = String.raw`\b(mandami|mandameli|mandamelo|inviami|invia|inviare|dammi|dimmi|comunicami|comunica|comunicare|fornisci(mi)?|fornire|inserisci|digita|conferma|confermare|scrivimi|leggimi|girami|passami|dettami|ripetimi|mi serve|ho bisogno del|devi (inviare|comunicare|dare|fornire|inserire|confermare))\b`;
const CRED_TARGET = String.raw`\b(otp|pin|password|cvv|cvc|credenziali|codic[ei] (otp|di verifica|di sicurezza|ricevut[oi]|sms|di accesso|che ti (e )?arrivat[oi]|a \d cifre)|dati della (tua )?carta|numero della (tua )?carta)\b`;

/** True if some clause matches and the match is not preceded by a negation in that clause. */
function inClause(cls: string[], re: RegExp, { negatable = true } = {}): boolean {
  return cls.some((c) => {
    const m = re.exec(c);
    return !!m && (!negatable || !negatedBefore(c, m.index + 1));
  });
}

function both(cls: string[], a: RegExp, b: RegExp): boolean {
  return cls.some((c) => {
    const ma = a.exec(c);
    return !!ma && b.test(c) && !negatedBefore(c, ma.index + 1);
  });
}

export interface BrandDetection {
  mentioned: Brand[];
  claimed: Brand | null;
}

const CLAIM_BEFORE = /(da parte di|gentile cliente|caro cliente|il team|dal team|servizio clienti|assistenza)\s*$/;

export function detectBrands(norm: string, urls: string[]): BrandDetection {
  let text = norm;
  for (const u of urls) text = text.split(u.toLowerCase()).join(" ");
  text = deLeetWords(text);
  const mentioned: Brand[] = [];
  let claimed: Brand | null = null;
  for (const b of BRANDS) {
    for (const re of b.aliases) {
      const m = re.exec(text);
      if (!m) continue;
      if (!mentioned.includes(b)) mentioned.push(b);
      const after = text.slice(m.index + m[0].length, m.index + m[0].length + 4);
      const isClaim =
        m.index <= 30 ||
        /^\s*:/.test(after) ||
        CLAIM_BEFORE.test(text.slice(Math.max(0, m.index - 30), m.index)) ||
        new RegExp(`(il tuo|la tua) (conto|carta|account|profilo|pratica)[^.]{0,20}${m[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(text);
      if (isClaim && !claimed && b.kind !== "marketplace") claimed = b;
      if (isClaim && !claimed && b.kind === "marketplace" && /^\s*:/.test(after)) claimed = b;
      break;
    }
  }
  return { mentioned, claimed };
}

const PROPERTY = /\b(affitt\w*|appartamento|casa|stanza|camera|immobile|chiavi|(mono|bi|tri|quadri)locale|locazione)\b/;

export function detectTextSignals(norm: string): TextId[] {
  const cls = clauses(norm);
  const ids: TextId[] = [];
  const on = (id: TextId, cond: boolean) => cond && ids.push(id);

  on("credenziali", inClause(cls, new RegExp(`${REQ_VERB}[^.]{0,40}?${CRED_TARGET}`)));

  const newNumber = /\b(nuovo numero|numero nuovo|cambiato numero|ho perso il telefono|telefono (rotto|caduto|guasto)|salva (questo|il mio nuovo) numero|questo e il mio (nuovo )?numero)\b/;
  const moneyAsk = /\b(bonifico|soldi|pagare|pagamento|prestito|prestarmi|anticipar\w*|ricarica|\d+ ?(euro|eur|€))\b/;
  on("finto_parente", newNumber.test(norm) && moneyAsk.test(norm) && /\b(puoi|potresti|mi (fai|serve|servono)|devi|fammi|mandami|inviami|ho bisogno)\b/.test(norm));

  const property = PROPERTY.test(norm);
  on("caparra", property && both(cls, /\b(caparra|anticipo|acconto|deposito( cauzionale)?|prima mensilita)\b/, /\b(invia\w*|manda\w*|versa\w*|bonifico|pag\w+|bloccare|serve|richiedo|devi)\b/));
  on("no_visita", property && /\b(non posso (organizzare|fare|mostrar\w*|far(ti)? vedere|incontrar\w*)|non (e|sara) possibile (visitar\w*|vedere)|niente visite|senza (visita|vederl\w)|sono all'estero|vivo all'estero|lavoro all'estero|(ti |vi )?spedisco le chiavi|chiavi (con|via|tramite|per) (il )?corriere)/.test(norm));

  on("gift_card", both(cls, /\b(gift ?card|carte? regalo|buon[oi] (amazon|regalo)|steam card|google play card|itunes)\b/, /\b(pag\w+|compra\w*|acquista\w*|manda\w*|invia\w*|codic[ei]|dammi)\b/));
  on("paypal_amici", inClause(cls, /\b(amici e (familiari|parenti)|friends (and|&) family|amici e famiglia)\b/));
  on("metodo_irrecuperabile", both(cls, /\b(ricarica\w* (sulla |la |una )?(mia |sua )?(postepay|carta prepagata)|western union|moneygram|bitcoin|criptovalut\w+|crypto|usdt)\b/, /\b(pag\w+|invia\w*|manda\w*|fai|fare|ricarica\w*|versa\w*|serve)\b/));
  on("pagamento_eccesso", /\b(ti ho (pagato|inviato|mandato|versato) (di )?(piu|troppo)|pagato in eccesso|per errore (ti )?ho (pagato|inviato|mandato)|(restituisci|rimanda|rimborsami|ridammi|rendimi)(mi)? (la differenza|il resto|l'eccedenza))/.test(norm));

  on("documenti", inClause(cls, /\b(inviami|mandami|manda|invia|mi serve|fammi avere|serve)\b[^.]{0,40}\b(documento|carta d'identita|carta di identita|patente|codice fiscale|passaporto|selfie|busta paga|foto (del|della) (documento|carta))\b/));
  on("fuori_piattaforma", inClause(cls, /\b(continuiamo|passiamo|scrivimi|contattami|sentiamoci|possiamo (continuare|sentirci|parlare)|parliamo|spostiamoci|aggiungimi)\b[^.]{0,25}\b(whatsapp|telegram|e-?mail|signal|messenger)\b/) || /\b(whatsapp|telegram) al (numero )?\+?\d/.test(norm));
  on("segretezza", /\b(non dirlo a nessuno|non dire (niente|nulla) a nessuno|tienilo (segreto|per te)|(resti|rimanga) tra noi|non avvisare (la banca|nessuno)|non parlarne con nessuno|non dirlo (alla banca|a mamma|a papa))\b/.test(norm));

  const threat = /\b(blocc(ato|ata|o|heremo|hiamo|era|herà)|sospes[oa]|sospensione|sospenderemo|sanzion\w+|pignorament\w+|chiusura del conto|disattiv\w+|denuncia|azioni legali|multa)\b/;
  on("minaccia", inClause(cls, threat) && ACTION_RE.test(norm));
  const urgent = /\b(entro (\d+|un'?|una|poche|oggi|domani)\s?(ore|ora|minuti|giorni|giorno)?|subito|immediatamente|al piu presto|urgente(mente)?|oggi stesso|ultimo avviso|scade (oggi|domani)|senza ritardo)/;
  on("urgenza", cls.some((c) => { const m = urgent.exec(c); return !!m && ACTION_RE.test(c) && !/\bnon (c'e|ce) fretta|non ho fretta\b/.test(c) && !negatedBefore(c, m.index + 1); }));

  on("invito_comunicazione", inClause(cls, /\b(controlla|visualizza|consulta|apri|leggi|scarica|verifica)\b[^.]{0,40}\b(comunicazion\w+|messaggio|documento|notifica|sistema|dati aggiornati|avviso|pratica|fattura)\b/) || /\be disponibile una (nuova )?(comunicazione|notifica)\b/.test(norm));
  on("denaro_inatteso", inClause(cls, /\b(rimborso|hai vinto|premio|accredito|a tuo favore|hai diritto|bonus di|vincita)\b/) && ACTION_RE.test(norm));

  return ids;
}

export function buildSignals(textIds: TextId[], links: LinkReport[], claimed: Brand | null): Signal[] {
  const out: Signal[] = textIds.map((id) => ({ id, ...TEXT_INFO[id], ...TEXT_WEIGHTS[id] }));

  // Aggregate link indicators across links: one signal per phenomenon (max weight).
  const best = new Map<string, { label: string; weight: number }>();
  for (const l of links) for (const i of l.indicators) if ((best.get(i.id)?.weight ?? -1) < i.weight) best.set(i.id, i);
  // Same deception (brand mismatch / imitation / typo / homoglyph): keep only the strongest.
  const deception = [...best.entries()].filter(([id]) => LINK_DECEPTION_IDS.includes(id)).sort((a, b) => b[1].weight - a[1].weight);
  for (const [id] of deception.slice(1)) best.delete(id);
  if (best.has("ip_sensibile")) best.delete("ip");
  for (const [id, i] of best) out.push({ id, title: LINK_TITLES[id] ?? id, explanation: i.label, group: "LINK", weight: i.weight });

  const linkDeception = deception.length > 0;
  if (claimed && !linkDeception && !textIds.includes("impersonazione_debole")) {
    const w = TEXT_WEIGHTS.impersonazione_debole;
    out.push({ id: "impersonazione_debole", ...TEXT_INFO.impersonazione_debole, title: `Dice di essere ${claimed.name}`, ...w });
  }
  return out;
}

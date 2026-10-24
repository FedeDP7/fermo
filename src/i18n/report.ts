import type { AnalysisResult, Signal, LinkReport } from "@/engine/types";
import { buildManagerSummary, buildProcedure, SITUATION_LABELS } from "@/engine/procedure";
import { translate, type Language } from "./catalog";

// Presentation-only copy. IDs, weights, input, excerpts and parsed URLs are never changed.
export const signalsEn: Record<string, [string, string]> = {
  cambio_iban: [
    "Request to change bank details",
    "A bank-detail change can be legitimate, but confirm it through a previously verified contact before updating records or paying.",
  ],
  dirigente_pagamento: [
    "Payment request attributed to an executive",
    "The text claims an executive role and requests money. FERMO does not verify identity: urgency and confidentiality can indicate BEC fraud.",
  ],
  ostacola_verifica: [
    "Discourages independent checks",
    "The request discourages calling, involving colleagues or following checks, reducing the opportunity for independent verification.",
  ],
  beneficiario_cambiato: [
    "Changed payment beneficiary",
    "Verify that the new payee matches the contract and supplier through an independent channel.",
  ],
  credenziali: [
    "Asks for codes or passwords",
    "The message asks you to share an OTP, PIN, password or CVV. These credentials can be used to access your accounts.",
  ],
  finto_parente: [
    "Possible family impersonation",
    "Someone claims to have a new number and asks for money. Call the number you already know.",
  ],
  caparra: [
    "Deposit requested before a viewing",
    "Money is requested to reserve a property before you have viewed it or verified the landlord.",
  ],
  gift_card: [
    "Gift card payment",
    "Once you share a gift card code, the value can be spent and may be lost.",
  ],
  paypal_amici: [
    "PayPal friends and family",
    "This option does not include purchase protection. Recovering money from a stranger can be difficult.",
  ],
  metodo_irrecuperabile: [
    "Payment method difficult to recover",
    "Top-ups, money transfers and cryptocurrency payments can be very difficult to reverse.",
  ],
  pagamento_eccesso: [
    "Overpayment to be refunded",
    "Someone who claims to have overpaid and asks for the difference may be using a fake or reversible payment.",
  ],
  no_visita: [
    "Property viewing unavailable",
    "The owner cannot show the property or offers to post the keys, preventing you from checking ownership and availability.",
  ],
  documenti: [
    "Requests personal documents",
    "Identity documents or personal information are requested before verification; these could be used for identity theft.",
  ],
  fuori_piattaforma: [
    "Requests moving to another chat",
    "Leaving the platform can mean losing its protections and conversation history.",
  ],
  segretezza: [
    "Requests secrecy",
    "The sender asks you not to tell anyone, which can prevent others from warning you.",
  ],
  minaccia: [
    "Threat tied to a request",
    "Account blocks or penalties are presented as consequences of not acting, creating pressure.",
  ],
  urgenza: [
    "Pressure to act quickly",
    "The message asks you to act immediately, leaving less time to verify.",
  ],
  impersonazione_debole: [
    "Claims to represent a known service",
    "Claiming a known service is neither evidence of fraud nor proof of authenticity.",
  ],
  invito_comunicazione: [
    "Generic invitation to open something",
    "The text asks you to view a notification or document without explaining its purpose.",
  ],
  denaro_inatteso: [
    "Promises unexpected money",
    "Unexpected refunds, prizes or credits accompanied by a request are a common lure.",
  ],
  brand_discordante: [
    "Link does not match the claimed service",
    "The link does not match the reference domain of the claimed service.",
  ],
  imitazione_hostname: [
    "Address imitates a known name",
    "The hostname contains a known brand name but belongs to a different domain.",
  ],
  typosquatting: [
    "Address resembles a known domain",
    "The domain resembles a known address but is not the same.",
  ],
  omoglifi: [
    "Lookalike letters in the address",
    "Letters from another alphabet imitate a known domain.",
  ],
  shortener: [
    "Shortened link",
    "The final destination is unknown. FERMO does not open or expand the link.",
  ],
  ip_sensibile: [
    "Numeric address",
    "The link uses a numeric address and the message requests information or payment.",
  ],
  ip: ["Numeric address", "The link uses a numeric address instead of a domain name."],
  chiocciola: [
    "Misleading @ in address",
    "The actual host is after the @ character; the part before it is not the destination.",
  ],
  offuscato: ["Obfuscated link", "The link is disguised, for example with [.] or hxxp."],
  sottodominio_gratuito: [
    "Free subdomain",
    "The address uses a free subdomain service where anyone can register a name.",
  ],
  tld_insolito: [
    "Unusual domain extension",
    "The extension is unusual for an Italian service; this alone does not prove fraud.",
  ],
  http: ["Unencrypted connection", "The address does not use HTTPS."],
  trattini: ["Many hyphens in the name", "The domain contains several hyphens."],
  punycode: ["Special characters in the address", "The address contains non-Latin characters."],
};
export function signalCopy(signal: Signal, language: Language): Signal {
  if (language === "it") return signal;
  const copy = signalsEn[signal.id];
  return copy ? { ...signal, title: copy[0], explanation: copy[1] } : signal;
}
export function linkCopy(link: LinkReport, language: Language): LinkReport {
  if (language === "it") return link;
  return {
    ...link,
    indicators: link.indicators.map((indicator) => ({
      ...indicator,
      label:
        indicator.id === "brand_discordante"
          ? `The message claims to be from ${link.claimedBrand ?? "a known service"}, but the link does not match ${link.referenceDomains.join(", ")}.`
          : (signalsEn[indicator.id]?.[1] ?? indicator.label),
    })),
  };
}
export function managerSummary(r: AnalysisResult, language: Language): string {
  if (language === "it") return buildManagerSummary(r);
  const t = (s: string) => translate(s, language);
  return [
    t("FERMO — Riepilogo di verifica"),
    `Type: ${t(SITUATION_LABELS[r.situation])}`,
    `Level: ${t(r.level)} · Indicative score: ${r.score}/100 (not a probability)`,
    t("Segnali principali:"),
    ...(r.signals.length
      ? r.signals.slice(0, 5).map((s) => `- ${signalCopy(s, language).title}`)
      : [`- ${t("Nessun segnale noto rilevato")}`]),
    t("Verifiche consigliate:"),
    ...buildProcedure(r).map((step, i) => `${i + 1}. ${t(step)}`),
    t(
      "Procedura consigliata da adattare alle regole interne. L'analisi è euristica e non costituisce una verifica definitiva del mittente o della comunicazione.",
    ),
    t(
      "Testo originale e dati riservati non inclusi. Nessuna segnalazione inviata automaticamente.",
    ),
  ].join("\n");
}

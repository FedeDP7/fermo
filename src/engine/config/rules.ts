import type { Group } from "../types";

export const THRESHOLDS = { medio: 25, alto: 60 };

export const GROUP_CAPS: Record<Group, number> = {
  LINK: 55,
  CREDENZIALI: 65,
  PAGAMENTI: 40,
  IDENTITA: 50,
  CONTESTO: 35,
  PRESSIONE: 18,
  GENERICI: 10,
};

export const GROUP_LABELS: Record<Group, string> = {
  LINK: "Link",
  CREDENZIALI: "Credenziali",
  PAGAMENTI: "Pagamenti",
  IDENTITA: "Identità",
  CONTESTO: "Contesto",
  PRESSIONE: "Pressione",
  GENERICI: "Indizi deboli",
};

/** Text rule weights. Each id belongs to exactly one group. */
export const TEXT_WEIGHTS = {
  cambio_iban: { group: "PAGAMENTI", weight: 25 },
  dirigente_pagamento: { group: "IDENTITA", weight: 35 },
  ostacola_verifica: { group: "CONTESTO", weight: 25 },
  beneficiario_cambiato: { group: "PAGAMENTI", weight: 20 },
  credenziali: { group: "CREDENZIALI", weight: 65 },
  finto_parente: { group: "IDENTITA", weight: 48 },
  caparra: { group: "PAGAMENTI", weight: 35 },
  gift_card: { group: "PAGAMENTI", weight: 35 },
  paypal_amici: { group: "PAGAMENTI", weight: 28 },
  metodo_irrecuperabile: { group: "PAGAMENTI", weight: 30 },
  pagamento_eccesso: { group: "PAGAMENTI", weight: 30 },
  no_visita: { group: "CONTESTO", weight: 25 },
  documenti: { group: "CONTESTO", weight: 20 },
  fuori_piattaforma: { group: "CONTESTO", weight: 18 },
  segretezza: { group: "CONTESTO", weight: 18 },
  minaccia: { group: "PRESSIONE", weight: 18 },
  urgenza: { group: "PRESSIONE", weight: 12 },
  impersonazione_debole: { group: "GENERICI", weight: 12 },
  invito_comunicazione: { group: "GENERICI", weight: 8 },
  denaro_inatteso: { group: "GENERICI", weight: 20 },
} as const satisfies Record<string, { group: Group; weight: number }>;

/** Link indicator weights (all in group LINK). */
export const LINK_WEIGHTS = {
  brand_discordante: 45,
  imitazione_hostname: 40,
  typosquatting: 35,
  omoglifi: 25,
  shortener: 28,
  ip_sensibile: 20,
  ip: 5,
  chiocciola: 20,
  offuscato: 15,
  http: 3,
  tld_insolito: 4,
  trattini: 4,
  sottodominio_gratuito: 6,
  punycode: 5,
};

/** Same deception expressed in different ways: only the strongest counts. */
export const LINK_DECEPTION_IDS = ["brand_discordante", "imitazione_hostname", "typosquatting", "omoglifi"];

export const BONUSES = [
  { id: "iban_verifica", label: "Cambio IBAN + verifiche scoraggiate", points: 10, requires: ["cambio_iban", "ostacola_verifica"] },
  { id: "ente_dominio", label: "Ente impersonato + dominio discordante", points: 15, requires: ["brand_discordante"] },
  { id: "cred_link", label: "Credenziali richieste + link sospetto", points: 12, requires: ["credenziali", "@link_sospetto"] },
  { id: "caparra_visita", label: "Caparra + impossibilità di verifica", points: 15, requires: ["caparra", "no_visita"] },
  { id: "fuori_metodo", label: "Fuori piattaforma + metodo rischioso", points: 8, requires: ["fuori_piattaforma", "@metodo_rischioso"] },
  { id: "parente_urgenza", label: "Finto parente + richiesta urgente", points: 10, requires: ["finto_parente", "urgenza"] },
];

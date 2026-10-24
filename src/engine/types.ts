export type Context =
  | "ISTITUZIONALE"
  | "BANCA_PAGAMENTI"
  | "CONSEGNA"
  | "AFFITTO"
  | "COMPRAVENDITA"
  | "FAMIGLIA"
  | "GENERICO";

export type Level = "BASSO" | "MEDIO" | "ALTO";

export type Group = "LINK" | "CREDENZIALI" | "PAGAMENTI" | "IDENTITA" | "CONTESTO" | "PRESSIONE" | "GENERICI";

export interface Signal {
  id: string;
  title: string;
  explanation: string;
  group: Group;
  weight: number;
}

export interface ParsedUrl {
  original: string;
  cleaned: string;
  protocol: "https" | "http" | null;
  hostname: string;
  domain: string | null; // registrable domain, null when not determinable
  publicSuffix: string | null;
  subdomain: string | null;
  isIp: boolean;
  isPrivateSuffix: boolean;
  hasAt: boolean;
  obfuscated: boolean;
  punycode: boolean;
}

export interface LinkIndicator {
  id: string;
  label: string;
  weight: number;
}

export interface LinkReport extends ParsedUrl {
  /** Brand the message claims to be, if any. */
  claimedBrand: string | null;
  /** Official domain(s) of the claimed or imitated brand. */
  referenceDomains: string[];
  matchesKnown: string | null; // the known domain this host belongs to
  mismatch: boolean;
  indicators: LinkIndicator[];
  verdict: "dominio noto" | "da verificare" | "sospetto";
}

export interface GroupBreakdown {
  group: Group;
  raw: number;
  cap: number;
  applied: number;
}

export interface Bonus {
  id: string;
  label: string;
  points: number;
}

export interface Breakdown {
  groups: GroupBreakdown[];
  bonuses: Bonus[];
  subtotal: number;
  total: number;
}

export type Situation = "CREDENZIALI" | "PHISHING" | "FINTO_PARENTE" | "AFFITTO" | "MARKETPLACE" | "PAGAMENTO" | "NESSUNA";

export interface AnalysisResult {
  score: number;
  level: Level;
  context: Context;
  contextLabel: string;
  situation: Situation;
  claimedBrand: string | null;
  signals: Signal[];
  links: LinkReport[];
  breakdown: Breakdown;
  recommendations: string[];
  safeReply: string | null;
}

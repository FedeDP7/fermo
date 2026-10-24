export type Context =
  | "ISTITUZIONALE"
  | "BANCA_PAGAMENTI"
  | "CONSEGNA"
  | "AFFITTO"
  | "COMPRAVENDITA"
  | "GENERICO";

export type Level = "BASSO" | "MEDIO" | "ALTO";

export interface Signal {
  id: string;
  title: string;
  explanation: string;
  weight: number;
}

export interface LinkReport {
  raw: string;
  hostname: string;
  domain: string;
  verdict: "ufficiale" | "attenzione" | "sospetto";
  reasons: string[];
  score: number;
}

export interface AnalysisResult {
  score: number;
  level: Level;
  context: Context;
  contextLabel: string;
  signals: Signal[];
  links: LinkReport[];
  recommendations: string[];
  safeReply: string | null;
  brands: string[];
}

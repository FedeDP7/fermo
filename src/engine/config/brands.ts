export interface Brand {
  name: string;
  keywords: string[]; // normalized words that mention the brand
  domains: string[]; // official registrable domains
}

export const BRANDS: Brand[] = [
  { name: "Agenzia delle Entrate", keywords: ["agenzia delle entrate", "agenzia entrate", "agenziaentrate"], domains: ["agenziaentrate.gov.it", "agenziaentrate.it"] },
  { name: "INPS", keywords: ["inps"], domains: ["inps.it"] },
  { name: "Poste Italiane", keywords: ["poste italiane", "poste", "postepay", "bancoposta"], domains: ["poste.it", "posteitaliane.it"] },
  { name: "Intesa Sanpaolo", keywords: ["intesa sanpaolo", "intesa"], domains: ["intesasanpaolo.com"] },
  { name: "UniCredit", keywords: ["unicredit"], domains: ["unicredit.it", "unicredit.eu"] },
  { name: "PayPal", keywords: ["paypal"], domains: ["paypal.com", "paypal.it", "paypal.me"] },
  { name: "Amazon", keywords: ["amazon"], domains: ["amazon.it", "amazon.com"] },
  { name: "BRT", keywords: ["brt", "bartolini"], domains: ["brt.it"] },
  { name: "DHL", keywords: ["dhl"], domains: ["dhl.it", "dhl.com"] },
  { name: "GLS", keywords: ["gls"], domains: ["gls-italy.com"] },
  { name: "SDA", keywords: ["sda"], domains: ["sda.it"] },
  { name: "Subito", keywords: ["subito.it", "subito"], domains: ["subito.it"] },
  { name: "Idealista", keywords: ["idealista"], domains: ["idealista.it"] },
  { name: "Immobiliare.it", keywords: ["immobiliare.it"], domains: ["immobiliare.it"] },
  { name: "Telepass", keywords: ["telepass"], domains: ["telepass.com"] },
  { name: "Enel", keywords: ["enel"], domains: ["enel.it"] },
];

export const OFFICIAL_DOMAINS = BRANDS.flatMap((b) => b.domains);

export const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "ow.ly", "rebrand.ly", "shorturl.at", "t.ly", "rb.gy", "tiny.cc"];

export const RISKY_TLDS = ["xyz", "top", "click", "info", "online", "site", "live", "icu", "buzz", "shop", "cfd", "sbs", "rest", "monster", "support", "help", "link", "work", "club", "vip"];

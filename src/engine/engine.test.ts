import { describe, expect, it } from "vitest";
import { analyzeMessage } from "./analyze";
import { EXAMPLES } from "./examples";
import { analyzeLink, extractUrls, parseUrl } from "./urls";
import { levelFor } from "./score";

const ids = (t: string) => analyzeMessage(t).signals.map((s) => s.id);
const ctx = { claimedBrand: null, mentionedBrands: [], sensitiveRequest: false };

describe("examples", () => {
  it("SMS Entrate is ALTO with domain mismatch vs agenziaentrate.gov.it", () => {
    const r = analyzeMessage(EXAMPLES[0]!.text);
    expect(r.level).toBe("ALTO");
    expect(r.claimedBrand).toBe("Agenzia delle Entrate");
    expect(r.links[0]!.domain).toBe("fiscale-gov.us.cc");
    expect(r.links[0]!.referenceDomains).toContain("agenziaentrate.gov.it");
    expect(r.links[0]!.mismatch).toBe(true);
  });
  it("Affitto is ALTO with caparra and no visit", () => {
    const r = analyzeMessage(EXAMPLES[1]!.text);
    expect(r.level).toBe("ALTO");
    expect(r.signals.map((s) => s.id)).toEqual(expect.arrayContaining(["caparra", "no_visita"]));
  });
  it("Vendita online is MEDIO without urgency", () => {
    const r = analyzeMessage(EXAMPLES[2]!.text);
    expect(r.level).toBe("MEDIO");
    expect(r.signals.map((s) => s.id)).not.toContain("urgenza");
  });
});

describe("mention vs request", () => {
  it("'Mandami il codice OTP' is a credential request", () => expect(ids("Mandami il codice OTP")).toContain("credenziali"));
  it("'Non comunicare il tuo codice OTP' is not", () => expect(ids("Non comunicare il tuo codice OTP a nessuno")).not.toContain("credenziali"));
  it("'Non condividere la tua password' is not", () => expect(ids("Non condividere la tua password")).not.toContain("credenziali"));
  it("'Mandami subito la password' is", () => expect(ids("Mandami subito la password")).toContain("credenziali"));
  it("'Sei urgente?' is not urgency", () => expect(ids("Sei urgente?")).not.toContain("urgenza"));
  it("payment deadline with threat triggers pressure", () => {
    const i = ids("Devi pagare entro un'ora o blocchiamo il conto");
    expect(i).toContain("urgenza");
    expect(i).toContain("minaccia");
  });
  it("normal bank/transfer message is BASSO", () => {
    expect(analyzeMessage("Ciao, ti ho fatto il bonifico in banca per la cena. Il codice OTP è arrivato, tutto ok.").level).toBe("BASSO");
  });
  it("credential request alone is ALTO", () => expect(analyzeMessage("Mandami il codice OTP che ti è arrivato").level).toBe("ALTO"));
});

describe("fake relative", () => {
  it("new number + money request", () => {
    expect(ids("Ciao mamma, questo è il mio nuovo numero. Mi serve un bonifico di 900 euro, puoi farlo?")).toContain("finto_parente");
  });
});

describe("urls", () => {
  it("brand in subdomain is not the brand", () => {
    const u = parseUrl("https://poste.it.verifica-accesso.com")!;
    expect(u.domain).toBe("verifica-accesso.com");
    expect(analyzeLink(u, ctx).matchesKnown).toBeNull();
  });
  it("official subdomain matches", () => expect(analyzeLink(parseUrl("https://www.poste.it")!, ctx).verdict).toBe("dominio noto"));
  it("handles no protocol, trailing punctuation, hxxp and [.]", () => {
    const u = extractUrls("vai su poste-sicure.com. oppure hxxp://evil[.]xyz/a").map((x) => x.hostname);
    expect(u).toEqual(expect.arrayContaining(["poste-sicure.com", "evil.xyz"]));
  });
  it("@ in URL uses the real host", () => expect(parseUrl("http://paypal.com@evil.xyz/login")!.hostname).toBe("evil.xyz"));
  it("hosting platforms are not suspicious by themselves", () => expect(analyzeLink(parseUrl("https://mio-sito.vercel.app")!, ctx).verdict).toBe("da verificare"));
  it("typosquat is suspicious", () => expect(analyzeLink(parseUrl("https://paypa1.com")!, ctx).verdict).toBe("sospetto"));
  it("a plain link alone does not raise the score", () => expect(analyzeMessage("Guarda questa ricetta: https://www.giallozafferano.it/ricetta").score).toBe(0));
  it("link group capped at 55", () => {
    const r = analyzeMessage("http://paypa1-login-secure-verify.xyz@bit.ly/x hxxp://192.168.0.1");
    expect(r.breakdown.groups.find((g) => g.group === "LINK")!.applied).toBeLessThanOrEqual(55);
  });
});

describe("thresholds", () => {
  it("0-24 BASSO, 25-59 MEDIO, 60+ ALTO", () => {
    expect(levelFor(24)).toBe("BASSO");
    expect(levelFor(25)).toBe("MEDIO");
    expect(levelFor(59)).toBe("MEDIO");
    expect(levelFor(60)).toBe("ALTO");
  });
  it("displayed score equals breakdown total", () => {
    for (const e of EXAMPLES) {
      const r = analyzeMessage(e.text);
      expect(r.score).toBe(r.breakdown.total);
    }
  });
  it("phishing gets no reply to the sender", () => expect(analyzeMessage(EXAMPLES[0]!.text).safeReply).toBeNull());
});

import { describe, expect, it } from "vitest";
import { analyzeMessage } from "./analyze";
import { GROUP_CAPS } from "./config/rules";
import { levelFor } from "./score";
import { extractUrls, parseUrl } from "./urls";

const ids = (t: string) => analyzeMessage(t).signals.map((s) => s.id);

describe("QA build 3", () => {
  it("T1 SMS Entrate: ALTO, impersonation, domain compare, no reputation claim", () => {
    const r = analyzeMessage("AAg.Entrate : E disponibile una nuova comunicazione fiscale. Controlla il sistema per visualizzare i dati aggiornati. https://fiscale-gov.us.cc/it3");
    expect(r.level).toBe("ALTO");
    expect(r.claimedBrand).toBe("Agenzia delle Entrate");
    expect(r.links[0]!.referenceDomains).toContain("agenziaentrate.gov.it");
    expect(r.links[0]!.mismatch).toBe(true);
    const text = JSON.stringify(r).toLowerCase();
    expect(text).not.toMatch(/whois|reputazion|blacklist/);
  });

  it("T2 deceptive subdomain", () => {
    const r = analyzeMessage("Controlla il conto su https://poste.it.verifica-accesso.com/login");
    const l = r.links[0]!;
    expect(l.domain).toBe("verifica-accesso.com");
    expect(l.matchesKnown).toBeNull();
    expect(l.indicators.map((i) => i.id)).toContain("imitazione_hostname");
  });

  it("T3 known domain: matches poste.it, not ALTO, no authenticity guarantee", () => {
    const r = analyzeMessage("Il tuo pacco arriverà domani. Traccia su https://www.poste.it/cerca/index.html");
    expect(r.links[0]!.matchesKnown).toBe("poste.it");
    expect(r.level).not.toBe("ALTO");
    expect(JSON.stringify(r).toLowerCase()).not.toMatch(/autentic[oa] garantit|sicuro al 100|e sicuro/);
  });

  it("T4 shortener: detected, at least MEDIO", () => {
    const r = analyzeMessage("https://bit.ly/3xYz");
    expect(r.links[0]!.indicators.map((i) => i.id)).toContain("shortener");
    expect(r.level).not.toBe("BASSO");
  });

  it("T5 OTP request: ALTO", () => expect(analyzeMessage("Mandami subito il codice OTP che hai appena ricevuto.").level).toBe("ALTO"));

  it("T6 protective message", () => {
    const r = analyzeMessage("Il tuo codice è 482913. Non comunicarlo a nessuno.");
    expect(r.signals.map((s) => s.id)).not.toContain("credenziali");
    expect(r.level).not.toBe("ALTO");
  });

  it("T7 fake relative: ALTO", () => expect(analyzeMessage("Ciao mamma, ho cambiato numero. Mi servono 300 euro urgenti, ti spiego dopo.").level).toBe("ALTO"));

  it("T8 normal chat: BASSO, no signals", () => {
    const r = analyzeMessage("Ciao, ci vediamo domani alle 18 per cena?");
    expect(r.level).toBe("BASSO");
    expect(r.signals).toHaveLength(0);
  });

  it("T9 legit sale not ALTO", () => expect(analyzeMessage("Vendo iPhone usato a 300 euro. Ritiro a mano a Forlì.").level).not.toBe("ALTO"));

  it("T10 risky marketplace: MEDIO, off-platform, risky payment, no urgency", () => {
    const r = analyzeMessage("Ciao! Possiamo continuare su WhatsApp? Preferisco PayPal amici e familiari. Non ho fretta.");
    const i = r.signals.map((s) => s.id);
    expect(r.level).toBe("MEDIO");
    expect(i).toContain("fuori_piattaforma");
    expect(i).toContain("paypal_amici");
    expect(i).not.toContain("urgenza");
  });

  it("T11 rental: ALTO", () => expect(analyzeMessage("Non posso mostrarti l'immobile. Mandami subito la caparra per bloccarlo, poi spedisco le chiavi.").level).toBe("ALTO"));

  it("T12 malformed URLs: no crash, no invented domains", () => {
    const inputs = ["http://paypal.com@evil.xyz/a", "http://192.168.0.1/login", "https://pаypal.com", "https://xn--pypal-4ve.com", "visita poste.it.", "http://", "https://.", "www.", "ag.entrate", "http://@", "https://exa mple.com", "a".repeat(5000) + ".com"];
    for (const t of inputs) expect(() => analyzeMessage(t)).not.toThrow();
    expect(parseUrl("http://paypal.com@evil.xyz/a")!.hostname).toBe("evil.xyz");
    expect(parseUrl("http://192.168.0.1/login")!.domain).toBeNull();
    expect(extractUrls("visita poste.it.")[0]!.hostname).toBe("poste.it");
    expect(extractUrls("http://")).toHaveLength(0);
    expect(extractUrls("ag.entrate")).toHaveLength(0);
    expect(parseUrl("https://xn--pypal-4ve.com")!.punycode).toBe(true);
  });

  it("T14 very short text", () => expect(ids("Mandami il PIN")).toContain("credenziali"));

  it("T15 score math is consistent", () => {
    const inputs = [
      "AAg.Entrate : E disponibile una nuova comunicazione fiscale. https://fiscale-gov.us.cc/it3",
      "Mandami il codice OTP subito o blocchiamo il conto https://bit.ly/x http://192.168.0.1 hxxp://poste-it[.]xyz",
      "Ciao mamma, ho cambiato numero. Mi servono 300 euro urgenti",
      "Non posso mostrarti l'immobile. Mandami subito la caparra per bloccarlo, poi spedisco le chiavi.",
      "Ciao, ci vediamo domani?",
    ];
    for (const t of inputs) {
      const r = analyzeMessage(t);
      const b = r.breakdown;
      for (const g of b.groups) {
        const raw = r.signals.filter((s) => s.group === g.group).reduce((n, s) => n + s.weight, 0);
        expect(g.raw).toBe(raw);
        expect(g.applied).toBe(Math.min(raw, GROUP_CAPS[g.group]));
      }
      const link = b.groups.find((g) => g.group === "LINK");
      if (link) expect(link.applied).toBeLessThanOrEqual(55);
      expect(new Set(b.bonuses.map((x) => x.id)).size).toBe(b.bonuses.length);
      const sum = b.groups.reduce((n, g) => n + g.applied, 0) + b.bonuses.reduce((n, x) => n + x.points, 0);
      expect(b.subtotal).toBe(sum);
      expect(r.score).toBe(Math.min(100, sum));
      expect(r.level).toBe(levelFor(r.score));
      expect(new Set(r.signals.map((s) => s.id)).size).toBe(r.signals.length);
    }
  });

  it("T16 pasted HTML is treated as plain text", () => {
    expect(() => analyzeMessage('<script>alert(1)</script><img src=x onerror=alert(1)>')).not.toThrow();
  });
});

describe("excerpts", () => {
  it("excerpt text is the user's original wording at the tracked position", () => {
    const t = "Per bloccare l'appartamento   INVIAMI subito una caparra. Sono all’estero.";
    const r = analyzeMessage(t);
    for (const s of r.signals) if (s.excerpt) expect(t.slice(s.excerpt.start, s.excerpt.end)).toBe(s.excerpt.text);
    expect(r.signals.find((s) => s.id === "caparra")!.excerpt!.text).toBe("caparra");
    expect(r.signals.find((s) => s.id === "no_visita")!.excerpt!.text).toBe("Sono all’estero");
  });
  it("accented text maps back correctly", () => {
    const r = analyzeMessage("Ciao mamma, è il mio nuovo numero. Mi servono 300 euro, puoi farmi un bonifico?");
    expect(r.signals.find((s) => s.id === "finto_parente")!.excerpt!.text).toBe("nuovo numero");
  });
});

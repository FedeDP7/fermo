import { describe, expect, it } from "vitest";
import { analyzeMessage } from "./analyze";
import { BUSINESS_EXAMPLES } from "./examples";
import { buildManagerSummary, buildProcedure } from "./procedure";

describe("B2B rules and privacy", () => {
  for (const example of BUSINESS_EXAMPLES) it(`${example.label}: combined signals produce ALTO`, () => {
    expect(analyzeMessage(example.text).level).toBe("ALTO");
  });
  it("an ordinary payment notice is not ALTO", () => {
    const r = analyzeMessage("Buongiorno, la fattura 2841 di 870 euro scade il 30 ottobre. Pagamento sul consueto IBAN del contratto.");
    expect(r.level).toBe("BASSO");
    expect(r.signals).toHaveLength(0);
  });
  it("IBAN change alone requires verification without being ALTO", () => {
    const r = analyzeMessage("Abbiamo cambiato IBAN.");
    expect(r.situation).toBe("CAMBIO_IBAN");
    expect(r.level).toBe("MEDIO");
    expect(r.signals.map(s => s.id)).toEqual(["cambio_iban"]);
    expect(buildProcedure(r)).toHaveLength(5);
  });
  it("director email alone is not fraud", () => {
    const r = analyzeMessage("Ciao, sono l'amministratore. La riunione è alle 10.");
    expect(r.score).toBe(0);
  });
  it("director payment alone is not ALTO", () => {
    expect(analyzeMessage("Sono il direttore. Puoi effettuare il pagamento previsto dal contratto?").level).toBe("MEDIO");
  });
  it("CEO example contains actual identity, secrecy and urgency signals", () => {
    const r = analyzeMessage(BUSINESS_EXAMPLES.find(e => e.id === "ceo")?.text ?? "");
    expect(r.situation).toBe("CEO_FRAUD");
    expect(r.signals.map(s => s.id)).toEqual(expect.arrayContaining(["dirigente_pagamento", "segretezza", "urgenza", "ostacola_verifica"]));
  });
  it("corporate service imitation differs from official domains", () => {
    const r = analyzeMessage(BUSINESS_EXAMPLES.find(e => e.id === "account")?.text ?? "");
    expect(r.situation).toBe("PHISHING_AZIENDALE");
    expect(r.links[0]?.domain).toBe("example.com");
    expect(r.links[0]?.mismatch).toBe(true);
    expect(analyzeMessage("Microsoft 365: accedi su https://login.microsoftonline.com").links[0]?.verdict).toBe("dominio noto");
    expect(analyzeMessage("Google Workspace: accedi su https://accounts.google.com").links[0]?.verdict).toBe("dominio noto");
  });
  it("invoice with changed beneficiary and risky channel gets invoice procedure", () => {
    const r = analyzeMessage("Fattura: nuovo beneficiario. Invia il pagamento tramite bitcoin subito.");
    expect(r.situation).toBe("FATTURA");
    expect(r.signals.map(s => s.id)).toContain("beneficiario_cambiato");
  });
  it("protective IBAN advice does not create a change signal", () => {
    expect(analyzeMessage("Non cambiare IBAN senza verificare.").signals.map(s => s.id)).not.toContain("cambio_iban");
  });
  it("manager summary excludes input, excerpts, IBAN, credentials and addresses", () => {
    const input = "Abbiamo cambiato IBAN. IT60X0542811101000000123456. Cliente Mario Rossi mario@azienda.it. Mandami la password segreto123 su https://evil.example.com/private";
    const r = analyzeMessage(input);
    const summary = buildManagerSummary(r);
    for (const secret of [input, "IT60X0542811101000000123456", "Mario Rossi", "mario@azienda.it", "segreto123", "evil.example.com"]) expect(summary).not.toContain(secret);
    expect(r.situation).toBe("CAMBIO_IBAN");
  });
});
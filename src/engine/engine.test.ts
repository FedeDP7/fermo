import { describe, expect, it } from "vitest";
import { analyze } from "./analyze";
import { EXAMPLES } from "./examples";
import { analyzeUrl, extractUrls } from "./urls";

describe("FERMO engine", () => {
  for (const ex of EXAMPLES) {
    it(`example "${ex.label}" is ALTO`, () => {
      expect(analyze(ex.text).level).toBe("ALTO");
    });
  }
  it("fake tax SMS is classified as institutional", () => {
    expect(analyze(EXAMPLES[0]!.text).context).toBe("ISTITUZIONALE");
  });
  it("rental example is classified as AFFITTO", () => {
    expect(analyze(EXAMPLES[1]!.text).context).toBe("AFFITTO");
  });
  it("neutral text is BASSO", () => {
    expect(analyze("Ciao mamma, stasera arrivo per cena verso le otto.").level).toBe("BASSO");
  });
  it("official domain is not penalised", () => {
    expect(analyzeUrl("https://www.agenziaentrate.gov.it/portale").verdict).toBe("ufficiale");
  });
  it("typosquat is suspicious", () => {
    expect(analyzeUrl("https://paypa1.com/login").verdict).toBe("sospetto");
  });
  it("brand in subdomain is suspicious", () => {
    expect(analyzeUrl("http://poste.it.verifica-conto.xyz").verdict).toBe("sospetto");
  });
  it("extracts URLs without scheme", () => {
    expect(extractUrls("vai su poste-sicure.com ora")).toContain("poste-sicure.com");
  });
  it("score stays within 0-100", () => {
    const s = analyze(EXAMPLES.map((e) => e.text).join(" ")).score;
    expect(s).toBeLessThanOrEqual(100);
  });
});

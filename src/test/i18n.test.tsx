import { fireEvent, render, screen, within, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, useI18n, translate } from "@/i18n";
import { managerSummary, signalCopy, linkCopy, signalsEn } from "@/i18n/report";
import { analyzeMessage } from "@/engine/analyze";
import { buildRecommendations } from "@/engine/recommend";
import { buildProcedure, SITUATION_LABELS } from "@/engine/procedure";
import { TEXT_WEIGHTS, LINK_WEIGHTS, GROUP_LABELS, BONUSES } from "@/engine/config/rules";
import { CONTEXT_LABELS } from "@/engine/context";
import type { Situation, Level } from "@/engine/types";
import { Route } from "@/routes/index";
import { CompanyOverview } from "@/components/fermo/CompanyOverview";

const AnalysisPage = Route.options.component!;
function Switcher() {
  const { setLanguage } = useI18n();
  return (
    <>
      <button onClick={() => setLanguage("en")}>English</button>
      <button onClick={() => setLanguage("it")}>Italiano</button>
    </>
  );
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Authored interface translations", () => {
  it("switches the interface, errors, reports and copied summary without translating input", async () => {
    const copy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: copy },
    });
    render(
      <LanguageProvider>
        <Switcher />
        <AnalysisPage />
      </LanguageProvider>,
    );
    expect(screen.getByRole("button", { name: "Analizza il messaggio" })).toBeInTheDocument();
    fireEvent.click(screen.getByText("English"));
    fireEvent.click(screen.getByRole("button", { name: "Analyse message" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Paste a message first");
    const input = "Abbiamo cambiato IBAN. IT60X0542811101000000123456. Cliente Riservato.";
    fireEvent.change(screen.getByLabelText("Message text"), { target: { value: input } });
    fireEvent.click(screen.getByRole("button", { name: "Analyse message" }));
    const report = screen.getByRole("dialog", { name: "Analysis result" });
    expect(within(report).getAllByText("Request to change bank details")[0]).toBeInTheDocument();
    expect(
      within(report).getByText("Put the payment and bank-detail update on hold."),
    ).toBeInTheDocument();
    fireEvent.click(within(report).getByRole("button", { name: "Copy summary for your manager" }));
    await vi.waitFor(() => expect(copy).toHaveBeenCalled());
    const summary = copy.mock.calls[0]![0] as string;
    expect(summary).toContain("FERMO — Verification summary");
    expect(summary).not.toContain("Riservato");
    expect(summary).not.toContain("IT60X");
    fireEvent.click(within(report).getByRole("button", { name: "Close" }));
    expect(screen.getByLabelText("Message text")).toHaveValue(input);
    fireEvent.click(screen.getByText("Italiano"));
    expect(screen.getByRole("button", { name: "Apri il report completo" })).toBeInTheDocument();
  });

  it("covers recommendations, procedures, labels and every configured signal", () => {
    const base = analyzeMessage("Abbiamo cambiato IBAN.");
    for (const situation of Object.keys(SITUATION_LABELS) as Situation[])
      for (const level of ["BASSO", "MEDIO", "ALTO"] as Level[]) {
        const { recommendations, safeReply } = buildRecommendations(situation, level);
        const texts = [
          ...recommendations,
          ...buildProcedure({ ...base, situation, level, recommendations }),
          ...(safeReply ? [safeReply] : []),
          SITUATION_LABELS[situation],
        ];
        for (const text of texts) expect(translate(text, "en"), text).not.toBe(text);
      }
    for (const text of [
      ...Object.values(GROUP_LABELS),
      ...Object.values(CONTEXT_LABELS),
      ...BONUSES.map((b) => b.label),
    ])
      expect(translate(text, "en")).not.toBe(text);
    for (const id of [...Object.keys(TEXT_WEIGHTS), ...Object.keys(LINK_WEIGHTS)])
      expect(signalsEn[id], id).toBeDefined();
  });

  it("does not mutate analysis, scoring, original excerpts or URLs", () => {
    const result = analyzeMessage(
      "Microsoft 365: inserisci la password su https://microsoft-login.example.com.",
    );
    const original = JSON.stringify(result);
    result.signals.forEach((signal) => signalCopy(signal, "en"));
    result.links.forEach((link) => linkCopy(link, "en"));
    managerSummary(result, "en");
    expect(JSON.stringify(result)).toBe(original);
  });

  it("translates the company demo and its roadmap disclaimers", () => {
    render(
      <LanguageProvider>
        <Switcher />
        <CompanyOverview />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByText("English"));
    expect(screen.getByText("DEMO DATA — simulated scenario")).toBeInTheDocument();
    expect(
      screen.getAllByText("Planned developments, not an available offer")[0],
    ).toBeInTheDocument();
  });
});

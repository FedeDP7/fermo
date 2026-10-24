import { fireEvent, render, screen, within, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Route } from "@/routes/index";

const AnalysisPage = Route.options.component!;
afterEach(cleanup);

describe("Analysis report dialog", () => {
  it("opens, closes and reopens the report and clears it after input changes", () => {
    render(<AnalysisPage />);
    fireEvent.change(screen.getByLabelText("Testo della comunicazione"), {
      target: { value: "Abbiamo cambiato IBAN." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analizza il messaggio" }));
    const report = screen.getByRole("dialog", { name: "Il risultato dell'analisi" });
    expect(
      within(report).getByText("Procedura consigliata per la tua azienda"),
    ).toBeInTheDocument();
    fireEvent.click(within(report).getByRole("button", { name: "Chiudi" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Apri il report completo" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Chiudi" }));
    fireEvent.change(screen.getByLabelText("Testo della comunicazione"), {
      target: { value: "Nuovo testo" },
    });
    expect(
      screen.queryByRole("button", { name: "Apri il report completo" }),
    ).not.toBeInTheDocument();
  });

  it("does not open for empty input", () => {
    render(<AnalysisPage />);
    fireEvent.click(screen.getByRole("button", { name: "Analizza il messaggio" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

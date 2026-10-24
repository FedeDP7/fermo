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
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Motivo principale")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Apri il report completo" }));
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

  it("compares examples through labelled summaries without opening a dialog", () => {
    render(<AnalysisPage />);
    fireEvent.click(screen.getByRole("button", { name: "Cambio IBAN fornitore" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Analisi dell’esempio" })).toBeInTheDocument();
    expect(screen.getByText("Richiesta di cambio coordinate bancarie")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Falso CEO" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Richiesta economica attribuita a un dirigente")).toBeInTheDocument();
    expect(screen.queryByText("Richiesta di cambio coordinate bancarie")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Analizza il messaggio" }));
    expect(screen.queryByRole("heading", { name: "Analisi dell’esempio" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not open for empty input", () => {
    render(<AnalysisPage />);
    fireEvent.click(screen.getByRole("button", { name: "Analizza il messaggio" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

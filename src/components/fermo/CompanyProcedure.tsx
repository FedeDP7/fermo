import { useI18n } from "@/i18n";
import { useState } from "react";
import { Check, Copy, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildProcedure } from "@/engine/procedure";
import { managerSummary } from "@/i18n/report";
import type { AnalysisResult } from "@/engine/types";

export function CompanyProcedure({ r }: { r: AnalysisResult }) {
  const { t, language } = useI18n();
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  return (
    <section className="animate-card-in border-t border-primary pt-7">
      <div className="mb-3 flex items-start gap-3">
        <ClipboardCheck aria-hidden className="mt-1 h-6 w-6 shrink-0 text-primary" />
        <h2 className="text-2xl font-extrabold">{t("Procedura consigliata per la tua azienda")}</h2>
      </div>
      <p className="mb-5 text-base text-muted-foreground">
        {t("Da adattare alle regole interne: FERMO non dispone delle policy della tua azienda.")}
      </p>
      <ol className="space-y-4">
        {buildProcedure(r).map((step, i) => (
          <li key={t(step)} className="flex gap-3">
            <span className="font-extrabold text-primary">{i + 1}.</span>
            <span>{t(step)}</span>
          </li>
        ))}
      </ol>
      <Button
        variant="outline"
        className="mt-6 min-h-14 w-full whitespace-normal border-primary px-4 text-base font-bold text-primary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(managerSummary(r, language));
            setStatus("copied");
          } catch {
            setStatus("error");
          }
        }}
      >
        {status === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
        {status === "copied" ? t("Riepilogo copiato") : t("Copia riepilogo per il responsabile")}
      </Button>
      <p role="status" className="mt-2 text-sm text-muted-foreground">
        {status === "error"
          ? t("Copia non riuscita. Consenti l'accesso agli appunti e riprova.")
          : t(
              "Il riepilogo esclude testo originale e dati riservati. Non viene inviato automaticamente.",
            )}
      </p>
    </section>
  );
}

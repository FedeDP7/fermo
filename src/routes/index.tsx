import { useI18n, usePageLanguage } from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { MAX_LENGTH, analyzeMessage } from "@/engine/analyze";
import { BUSINESS_EXAMPLES, EXAMPLES } from "@/engine/examples";
import type { AnalysisResult } from "@/engine/types";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, LockKeyhole, ScanText, FileSearch, ShieldCheck, Users } from "lucide-react";
import { CompanyProcedure } from "@/components/fermo/CompanyProcedure";
import {
  Breakdown,
  LinkAnalysis,
  Recommendations,
  RiskGauge,
  SafeReply,
  SignalList,
} from "@/components/fermo/Results";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FERMO — Verifica comunicazioni e pagamenti per le PMI" },
      {
        name: "description",
        content:
          "Un controllo in più. Un rischio in meno. FERMO aiuta le PMI a riconoscere phishing e richieste economiche sospette con analisi locale e verifiche guidate.",
      },
      { property: "og:title", content: "FERMO — Un controllo in più. Un rischio in meno." },
      {
        property: "og:description",
        content:
          "Analizza comunicazioni aziendali, riconosci segnali di frode e segui una procedura prudente prima di autorizzare un pagamento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  usePageLanguage(
    "FERMO — Verifica comunicazioni e pagamenti per le PMI",
    "Un controllo in più. Un rischio in meno. FERMO aiuta le PMI a riconoscere phishing e richieste economiche sospette con analisi locale e verifiche guidate.",
  );
  const { t, language } = useI18n();
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [empty, setEmpty] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reportTitleRef = useRef<HTMLHeadingElement>(null);

  const run = (t = text) => {
    if (!t.trim()) {
      setEmpty(true);
      setResult(null);
      inputRef.current?.focus();
      return;
    }
    setEmpty(false);
    setResult(analyzeMessage(t));
    setReportOpen(true);
  };

  const reset = () => {
    setReportOpen(false);
    setText("");
    setResult(null);
    setEmpty(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  return (
    <main className="studio-page">
      <aside className="studio-intro">
        <h1>
          {t("Un controllo")}
          <br /> {t("in più.")}
          <br />
          <span>
            {t("Un rischio")}
            <br /> {t("in meno.")}
          </span>
        </h1>
        <p className="studio-lead">{t("Verifica una comunicazione prima di agire.")}</p>
        <div className="studio-benefits">
          <div>
            <FileSearch aria-hidden />
            <div>
              <h2>{t("Individua i segnali sospetti")}</h2>
              <p>{t("Analizza email, messaggi e richieste di pagamento.")}</p>
            </div>
          </div>
          <div>
            <ShieldCheck aria-hidden />
            <div>
              <h2>{t("Un controllo per la tua azienda")}</h2>
              <p>{t("Indicazioni pratiche prima di prendere una decisione.")}</p>
            </div>
          </div>
          <div>
            <Users aria-hidden />
            <div>
              <h2>{t("Più consapevolezza per tutti")}</h2>
              <p>{t("Strumenti semplici, pensati per le PMI.")}</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="studio-workspace">
        <div className="studio-editor">
          <section aria-labelledby="analysis-title">
            <h2 id="analysis-title">{t("Controlla una comunicazione")}</h2>
            <p className="studio-description">
              {t(
                "Incolla il testo di un'email o di un messaggio che ti sembra sospetto. FERMO ti aiuta a riconoscere i segnali e capire come agire.",
              )}
            </p>
            <div className="studio-input-label">
              <label htmlFor="msg">{t("Testo della comunicazione")}</label>
              <span id="msg-help">
                {text.length.toLocaleString(language === "it" ? "it-IT" : "en-GB")} /{" "}
                {MAX_LENGTH.toLocaleString(language === "it" ? "it-IT" : "en-GB")}
              </span>
            </div>
            <textarea
              id="msg"
              ref={inputRef}
              value={text}
              maxLength={MAX_LENGTH}
              onChange={(e) => {
                setText(e.target.value);
                setResult(null);
                if (empty) setEmpty(false);
              }}
              aria-describedby="msg-help msg-privacy"
              aria-invalid={empty}
              placeholder={t("Incolla qui la comunicazione da controllare…")}
            />
            <div className="studio-input-footer">
              <span>
                <LockKeyhole aria-hidden />
                {t("Analisi locale · Nessun messaggio salvato")}
              </span>
              {text && (
                <button type="button" onClick={reset}>
                  {t("Cancella")}
                </button>
              )}
            </div>
            <p id="msg-privacy" className="studio-privacy">
              {t(
                "Rimuovi dati personali, credenziali e informazioni riservate non necessarie all'analisi.",
              )}
            </p>
            <p className="studio-privacy">
              {t("Il motore di analisi è configurato per messaggi in italiano.")}
            </p>
            {empty && (
              <p role="alert" className="studio-error">
                {t("Incolla prima il testo del messaggio, poi premi “Analizza”.")}
              </p>
            )}
            <Button type="button" onClick={() => run()} className="studio-analyze">
              <ScanText aria-hidden />
              {t("Analizza il messaggio")}
              <ArrowRight aria-hidden />
            </Button>
          </section>
          <section className="studio-examples" aria-labelledby="ex">
            <h2 id="ex">{t("Prova con un esempio")}</h2>
            <p>{t("Seleziona uno scenario aziendale per vedere come funziona.")}</p>
            <div className="studio-example-buttons">
              {BUSINESS_EXAMPLES.map((ex) => (
                <Button
                  key={ex.id}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setText(ex.text);
                    run(ex.text);
                  }}
                >
                  {t(ex.label)}
                </Button>
              ))}
            </div>
            <details>
              <summary>{t("Altri esempi: SMS, affitto e vendita online")}</summary>
              <div className="studio-example-buttons">
                {EXAMPLES.map((ex) => (
                  <Button
                    key={ex.id}
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setText(ex.text);
                      run(ex.text);
                    }}
                  >
                    {t(ex.label)}
                  </Button>
                ))}
              </div>
            </details>
          </section>
        </div>
        <div className="studio-results" aria-live="polite">
          <h2>{result ? t("Il risultato dell'analisi") : t("Un controllo prima di agire")}</h2>
          {result ? (
            <>
              <RiskGauge r={result} />
              <p className="mb-5 text-muted-foreground">
                {t(
                  "Il report completo è disponibile in una finestra dedicata, con segnali e verifiche consigliate.",
                )}
              </p>
              <Button type="button" onClick={() => setReportOpen(true)} className="w-full min-h-12">
                {t("Apri il report completo")}
              </Button>
            </>
          ) : (
            <div className="studio-empty">
              <span className="studio-empty-icon">
                <ShieldCheck aria-hidden />
              </span>
              <h3>{t("Una decisione più consapevole, in tre passaggi.")}</h3>
              <ol>
                <li>
                  <span>1</span>
                  <div>
                    <strong>{t("Incolla la comunicazione")}</strong>
                    <p>{t("Un'email, un SMS o una richiesta di pagamento.")}</p>
                  </div>
                </li>
                <li>
                  <span>2</span>
                  <div>
                    <strong>{t("Comprendi i segnali")}</strong>
                    <p>{t("Leggi il livello orientativo e le motivazioni.")}</p>
                  </div>
                </li>
                <li>
                  <span>3</span>
                  <div>
                    <strong>{t("Verifica prima di procedere")}</strong>
                    <p>
                      {t(
                        "Segui i passaggi consigliati e condividi il riepilogo con il responsabile.",
                      )}
                    </p>
                  </div>
                </li>
              </ol>
              <p className="studio-empty-note">
                {t(
                  "Il report si aprirà in una finestra dedicata. Puoi anche provare uno degli esempi.",
                )}
              </p>
            </div>
          )}
        </div>
      </div>
      <Dialog open={reportOpen && !!result} onOpenChange={setReportOpen}>
        <DialogContent
          className="studio-report-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            reportTitleRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <div className="studio-report-heading">
            <DialogTitle
              ref={reportTitleRef}
              tabIndex={-1}
              className="text-2xl font-extrabold outline-none"
            >
              {t("Il risultato dell'analisi")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "Segnali rilevati e verifiche consigliate. L'indice è orientativo, non una probabilità.",
              )}
            </DialogDescription>
          </div>
          <div className="studio-results studio-report-body" key={result?.input}>
            {result && (
              <>
                <RiskGauge r={result} />
                <Recommendations r={result} />
                <CompanyProcedure key={`${result.input}-${result.score}`} r={result} />
                <SignalList r={result} />
                <LinkAnalysis r={result} />
                {result.safeReply && <SafeReply text={result.safeReply} />}
                <Breakdown r={result} />
                <section className="studio-disclaimer">
                  <h3>{t("Da tenere presente")}</h3>
                  <p>
                    {t(
                      "L'indice è orientativo, non una probabilità di truffa. FERMO non garantisce che un messaggio sia sicuro, non apre i link e non verifica il mittente.",
                    )}
                  </p>
                </section>
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  className="w-full min-h-12 whitespace-normal"
                >
                  {t("Analizza un altro messaggio")}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <footer className="studio-footer">
        <LockKeyhole aria-hidden />
        <strong>{t("Il contenuto resta sul tuo dispositivo")}</strong>
        <span>{t("Analisi locale nel browser. Nessun login e nessun messaggio salvato.")}</span>
      </footer>
    </main>
  );
}

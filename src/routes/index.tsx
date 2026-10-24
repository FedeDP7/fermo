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
          Un controllo
          <br /> in più.
          <br />
          <span>
            Un rischio
            <br /> in meno.
          </span>
        </h1>
        <p className="studio-lead">Verifica una comunicazione prima di agire.</p>
        <div className="studio-benefits">
          <div>
            <FileSearch aria-hidden />
            <div>
              <h2>Individua i segnali sospetti</h2>
              <p>Analizza email, messaggi e richieste di pagamento.</p>
            </div>
          </div>
          <div>
            <ShieldCheck aria-hidden />
            <div>
              <h2>Un controllo per la tua azienda</h2>
              <p>Indicazioni pratiche prima di prendere una decisione.</p>
            </div>
          </div>
          <div>
            <Users aria-hidden />
            <div>
              <h2>Più consapevolezza per tutti</h2>
              <p>Strumenti semplici, pensati per le PMI.</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="studio-workspace">
        <div className="studio-editor">
          <section aria-labelledby="analysis-title">
            <h2 id="analysis-title">Controlla una comunicazione</h2>
            <p className="studio-description">
              Incolla il testo di un'email o di un messaggio che ti sembra sospetto. FERMO ti aiuta
              a riconoscere i segnali e capire come agire.
            </p>
            <div className="studio-input-label">
              <label htmlFor="msg">Testo della comunicazione</label>
              <span id="msg-help">
                {text.length.toLocaleString("it-IT")} / {MAX_LENGTH.toLocaleString("it-IT")}
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
              placeholder="Incolla qui la comunicazione da controllare…"
            />
            <div className="studio-input-footer">
              <span>
                <LockKeyhole aria-hidden />
                Analisi locale · Nessun messaggio salvato
              </span>
              {text && (
                <button type="button" onClick={reset}>
                  Cancella
                </button>
              )}
            </div>
            <p id="msg-privacy" className="studio-privacy">
              Rimuovi dati personali, credenziali e informazioni riservate non necessarie
              all'analisi.
            </p>
            {empty && (
              <p role="alert" className="studio-error">
                Incolla prima il testo del messaggio, poi premi “Analizza”.
              </p>
            )}
            <Button type="button" onClick={() => run()} className="studio-analyze">
              <ScanText aria-hidden />
              Analizza il messaggio
              <ArrowRight aria-hidden />
            </Button>
          </section>
          <section className="studio-examples" aria-labelledby="ex">
            <h2 id="ex">Prova con un esempio</h2>
            <p>Seleziona uno scenario aziendale per vedere come funziona.</p>
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
                  {ex.label}
                </Button>
              ))}
            </div>
            <details>
              <summary>Altri esempi: SMS, affitto e vendita online</summary>
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
                    {ex.label}
                  </Button>
                ))}
              </div>
            </details>
          </section>
        </div>
        <div className="studio-results" aria-live="polite">
          <h2>{result ? "Il risultato dell'analisi" : "Un controllo prima di agire"}</h2>
          {result ? (
            <>
              <RiskGauge r={result} />
              <p className="mb-5 text-muted-foreground">
                Il report completo è disponibile in una finestra dedicata, con segnali e verifiche
                consigliate.
              </p>
              <Button type="button" onClick={() => setReportOpen(true)} className="w-full min-h-12">
                Apri il report completo
              </Button>
            </>
          ) : (
            <div className="studio-empty">
              <span className="studio-empty-icon">
                <ShieldCheck aria-hidden />
              </span>
              <h3>Una decisione più consapevole, in tre passaggi.</h3>
              <ol>
                <li>
                  <span>1</span>
                  <div>
                    <strong>Incolla la comunicazione</strong>
                    <p>Un'email, un SMS o una richiesta di pagamento.</p>
                  </div>
                </li>
                <li>
                  <span>2</span>
                  <div>
                    <strong>Comprendi i segnali</strong>
                    <p>Leggi il livello orientativo e le motivazioni.</p>
                  </div>
                </li>
                <li>
                  <span>3</span>
                  <div>
                    <strong>Verifica prima di procedere</strong>
                    <p>
                      Segui i passaggi consigliati e condividi il riepilogo con il responsabile.
                    </p>
                  </div>
                </li>
              </ol>
              <p className="studio-empty-note">
                Il report si aprirà in una finestra dedicata. Puoi anche provare uno degli esempi.
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
              Il risultato dell'analisi
            </DialogTitle>
            <DialogDescription>
              Segnali rilevati e verifiche consigliate. L'indice è orientativo, non una probabilità.
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
                  <h3>Da tenere presente</h3>
                  <p>
                    L'indice è orientativo, non una probabilità di truffa. FERMO non garantisce che
                    un messaggio sia sicuro, non apre i link e non verifica il mittente.
                  </p>
                </section>
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  className="w-full min-h-12 whitespace-normal"
                >
                  Analizza un altro messaggio
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <footer className="studio-footer">
        <LockKeyhole aria-hidden />
        <strong>Il contenuto resta sul tuo dispositivo</strong>
        <span>Analisi locale nel browser. Nessun login e nessun messaggio salvato.</span>
      </footer>
    </main>
  );
}

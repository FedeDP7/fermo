import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { MAX_LENGTH, analyzeMessage } from "@/engine/analyze";
import { BUSINESS_EXAMPLES, EXAMPLES } from "@/engine/examples";
import type { AnalysisResult } from "@/engine/types";
import { Button } from "@/components/ui/button";
import { ArrowRight, LockKeyhole, ScanText } from "lucide-react";
import { CompanyProcedure } from "@/components/fermo/CompanyProcedure";
import { Breakdown, LinkAnalysis, Recommendations, RiskGauge, SafeReply, SignalList } from "@/components/fermo/Results";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FERMO — Verifica comunicazioni e pagamenti per le PMI" },
      { name: "description", content: "Un controllo in più. Un rischio in meno. FERMO aiuta le PMI a riconoscere phishing e richieste economiche sospette con analisi locale e verifiche guidate." },
      { property: "og:title", content: "FERMO — Un controllo in più. Un rischio in meno." },
      { property: "og:description", content: "Analizza comunicazioni aziendali, riconosci segnali di frode e segui una procedura prudente prima di autorizzare un pagamento." },
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
  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const run = (t = text) => {
    if (!t.trim()) {
      setEmpty(true);
      setResult(null);
      inputRef.current?.focus();
      return;
    }
    setEmpty(false);
    setResult(analyzeMessage(t));
    setTimeout(() => resultRef.current?.focus(), 50);
  };

  const reset = () => {
    setText("");
    setResult(null);
    setEmpty(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:py-10">
      <header className="mb-9">
        <p className="text-base font-bold text-primary">PER LE PMI · Un controllo in più. Un rischio in meno.</p>
        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">Proteggi la tua azienda dalle frodi digitali, prima che diventino un costo.</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">FERMO aiuta dipendenti e responsabili a riconoscere comunicazioni sospette, tentativi di phishing e richieste di pagamento fraudolente, spiegando i rischi e indicando come agire.</p>
      </header>

      <section className="border-t border-border pt-6">
        <h2 className="text-2xl font-extrabold">Controlla una comunicazione sospetta</h2>
        <p className="mb-5 mt-2 text-base text-muted-foreground">Hai ricevuto un'email, una richiesta di pagamento o un messaggio insolito? Analizzalo prima di procedere.</p>
        <label htmlFor="msg" className="mb-2 block text-lg font-bold">Incolla la comunicazione</label>
        <textarea
          id="msg"
          ref={inputRef}
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => { setText(e.target.value); if (empty) setEmpty(false); }}
          aria-describedby="msg-help msg-privacy"
          aria-invalid={empty}
          placeholder="Email di un fornitore, richiesta di bonifico, avviso di accesso…"
          className="min-h-[190px] w-full resize-y rounded-xl border-2 border-input bg-background p-4 text-lg placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <div id="msg-help" className="mt-1 flex justify-between text-base text-muted-foreground">
          <span>{text.length.toLocaleString("it-IT")} / {MAX_LENGTH.toLocaleString("it-IT")} caratteri</span>
          {text && <Button type="button" variant="link" onClick={reset} className="h-auto p-0 text-base">Cancella</Button>}
        </div>
        <p id="msg-privacy" className="mt-3 text-sm text-muted-foreground">Prima di incollare, rimuovi dati personali, credenziali e informazioni aziendali riservate non necessarie all'analisi.</p>
        {empty && <p role="alert" className="mt-3 rounded-lg bg-secondary px-4 py-3">Incolla prima il testo del messaggio che ti ha insospettito, poi premi "Analizza".</p>}
        <Button
          type="button"
          onClick={() => run()}
          className="mt-4 min-h-14 w-full whitespace-normal text-lg font-extrabold"
        >
          <ScanText aria-hidden />
          Analizza il messaggio
          <ArrowRight aria-hidden />
        </Button>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><LockKeyhole aria-hidden className="h-4 w-4 shrink-0" />Analisi locale · Nessun login · Nessun messaggio salvato</p>
      </section>

      <section className="mt-6" aria-labelledby="ex">
        <h2 id="ex" className="mb-3 text-lg font-semibold text-muted-foreground">Prova uno scenario aziendale</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {BUSINESS_EXAMPLES.map((ex) => (
            <Button
              key={ex.id}
              type="button"
              onClick={() => { setText(ex.text); run(ex.text); }}
              variant="outline"
              className="h-auto min-h-14 whitespace-normal px-3 py-3 text-base font-semibold"
            >
              {ex.label}
            </Button>
          ))}
        </div>
        <details className="mt-4 text-base"><summary className="cursor-pointer text-muted-foreground">Altri esempi: SMS, affitto e vendita online</summary><div className="mt-3 flex flex-wrap gap-2">{EXAMPLES.map(ex => <Button key={ex.id} variant="outline" className="min-h-12 text-base" onClick={() => { setText(ex.text); run(ex.text); }}>{ex.label}</Button>)}</div></details>
      </section>

      {result && (
        <div ref={resultRef} tabIndex={-1} aria-live="polite" className="mt-10 space-y-5 outline-none">
          <RiskGauge r={result} />
          <Recommendations r={result} />
          <CompanyProcedure key={`${result.input}-${result.score}`} r={result} />
          <SignalList r={result} />
          <LinkAnalysis r={result} />
          {result.safeReply && <SafeReply text={result.safeReply} />}
          <Breakdown r={result} />
          <section className="animate-card-in space-y-2 rounded-2xl border border-border p-5 text-base text-muted-foreground">
            <h2 className="font-bold text-foreground">Avvertenze</h2>
            <p>L'indice è orientativo: si basa su segnali noti e non è una probabilità di truffa. FERMO non può garantire che un messaggio sia sicuro.</p>
            <p>FERMO non apre i link, non verifica il mittente e non offre consulenza legale o finanziaria.</p>
          </section>
          <Button type="button" variant="outline" onClick={reset} className="min-h-14 w-full whitespace-normal border-primary text-lg font-bold text-primary">
            Analizza un altro messaggio
          </Button>
        </div>
      )}

      <footer className="mt-12 border-t border-border pt-6 text-base text-muted-foreground">
        <p>Il messaggio viene analizzato solo sul tuo dispositivo: non viene inviato né salvato.</p>
      </footer>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { MAX_LENGTH, analyzeMessage } from "@/engine/analyze";
import { EXAMPLES } from "@/engine/examples";
import type { AnalysisResult } from "@/engine/types";
import { Breakdown, LinkAnalysis, Recommendations, RiskGauge, SafeReply, SignalList } from "@/components/fermo/Results";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FERMO — Un secondo prima di perdere soldi" },
      { name: "description", content: "Messaggio strano? Incollalo qui. FERMO ti mostra a cosa fare attenzione e come proteggerti. Tutto nel tuo browser." },
      { property: "og:title", content: "FERMO — Un secondo prima di perdere soldi" },
      { property: "og:description", content: "Capisci in un attimo se un messaggio ha i segnali di una truffa." },
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
    <main className="mx-auto max-w-[620px] px-5 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-2xl font-extrabold tracking-[6px] text-primary">FERMO</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">Un secondo prima di perdere soldi.</h1>
        <p className="mt-4 text-lg text-muted-foreground">Messaggio strano? Incollalo qui. FERMO ti mostra a cosa fare attenzione e come proteggerti.</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <label htmlFor="msg" className="mb-2 block text-lg font-bold">Incolla il messaggio</label>
        <textarea
          id="msg"
          ref={inputRef}
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => { setText(e.target.value); if (empty) setEmpty(false); }}
          aria-describedby="msg-help"
          aria-invalid={empty}
          placeholder="SMS, WhatsApp, email o annuncio…"
          className="min-h-[190px] w-full resize-y rounded-xl border-2 border-input bg-background p-4 text-lg placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <div id="msg-help" className="mt-1 flex justify-between text-base text-muted-foreground">
          <span>{text.length.toLocaleString("it-IT")} / {MAX_LENGTH.toLocaleString("it-IT")} caratteri</span>
          {text && <button type="button" onClick={reset} className="underline underline-offset-4 hover:text-foreground">Cancella</button>}
        </div>
        {empty && <p role="alert" className="mt-3 rounded-lg bg-secondary px-4 py-3">Incolla prima il testo del messaggio che ti ha insospettito, poi premi "Analizza".</p>}
        <button
          type="button"
          onClick={() => run()}
          className="mt-4 min-h-14 w-full rounded-xl bg-primary text-xl font-extrabold text-primary-foreground transition hover:brightness-110"
        >
          Analizza il messaggio
        </button>
      </section>

      <section className="mt-6" aria-labelledby="ex">
        <h2 id="ex" className="mb-3 text-lg font-semibold text-muted-foreground">Oppure prova un esempio:</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => { setText(ex.text); run(ex.text); }}
              className="min-h-14 rounded-xl border border-border bg-card px-4 py-3 text-lg font-semibold transition-colors hover:border-primary"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </section>

      {result && (
        <div ref={resultRef} tabIndex={-1} aria-live="polite" className="mt-10 space-y-5 outline-none">
          <RiskGauge r={result} />
          <Recommendations r={result} />
          <SignalList r={result} />
          <LinkAnalysis r={result} />
          {result.safeReply && <SafeReply text={result.safeReply} />}
          <Breakdown r={result} />
          <section className="space-y-2 rounded-2xl border border-border p-5 text-base text-muted-foreground">
            <h2 className="font-bold text-foreground">Avvertenze</h2>
            <p>L'indice è orientativo: si basa su segnali noti e non è una probabilità di truffa. FERMO non può garantire che un messaggio sia sicuro.</p>
            <p>FERMO non apre i link, non verifica il mittente e non offre consulenza legale o finanziaria.</p>
          </section>
          <button type="button" onClick={reset} className="min-h-14 w-full rounded-xl border-2 border-primary text-lg font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
            Analizza un altro messaggio
          </button>
        </div>
      )}

      <footer className="mt-12 border-t border-border pt-6 text-base text-muted-foreground">
        <p>Il messaggio viene analizzato solo sul tuo dispositivo: non viene inviato né salvato.</p>
      </footer>
    </main>
  );
}

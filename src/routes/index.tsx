import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { analyze } from "@/engine/analyze";
import { EXAMPLES } from "@/engine/examples";
import type { AnalysisResult } from "@/engine/types";
import { LinkAnalysis, Recommendations, RiskGauge, SafeReply, SignalList } from "@/components/fermo/Results";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FERMO — Un secondo prima di perdere soldi" },
      { name: "description", content: "Incolla un SMS, WhatsApp, email o annuncio: FERMO ti spiega i segnali di una possibile truffa. Tutto nel tuo browser." },
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
  const resultRef = useRef<HTMLDivElement>(null);

  const run = (t = text) => {
    if (!t.trim()) return;
    setResult(analyze(t));
    setTimeout(() => resultRef.current?.focus(), 50);
  };

  return (
    <main className="mx-auto max-w-[620px] px-5 py-10 sm:py-14">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl font-extrabold text-primary-foreground">✋</span>
          <h1 className="text-4xl font-extrabold tracking-tight">FERMO</h1>
        </div>
        <p className="mt-3 text-2xl font-semibold">Un secondo prima di perdere soldi.</p>
        <p className="mt-2 text-muted-foreground">Incolla un messaggio sospetto: SMS, WhatsApp, email o annuncio. Ti spieghiamo cosa non torna.</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <label htmlFor="msg" className="mb-2 block text-lg font-bold">1. Incolla qui il messaggio</label>
        <textarea
          id="msg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="Es. «Il tuo pacco è in giacenza, paga 1,99€ qui…»"
          className="w-full resize-y rounded-xl border-2 border-input bg-background p-4 text-lg placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <div className="mt-1 flex justify-between text-base text-muted-foreground">
          <span>{text.length} caratteri</span>
          {text && (
            <button type="button" onClick={() => { setText(""); setResult(null); }} className="underline underline-offset-4 hover:text-foreground">
              Cancella
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => run()}
          disabled={!text.trim()}
          className="mt-4 min-h-14 w-full rounded-xl bg-primary text-xl font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-50"
        >
          2. Analizza
        </button>
      </section>

      <section className="mt-6" aria-labelledby="ex">
        <h2 id="ex" className="mb-3 text-base font-semibold text-muted-foreground">Oppure prova un esempio:</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => { setText(ex.text); run(ex.text); }}
              className="min-h-14 rounded-xl border border-border bg-card px-4 py-3 text-base font-semibold transition-colors hover:border-primary"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </section>

      {result && (
        <div ref={resultRef} tabIndex={-1} aria-live="polite" className="mt-10 space-y-5 outline-none">
          <RiskGauge r={result} />
          <SignalList r={result} />
          <LinkAnalysis r={result} />
          <Recommendations r={result} />
          {result.safeReply && <SafeReply text={result.safeReply} />}
        </div>
      )}

      <footer className="mt-12 space-y-2 border-t border-border pt-6 text-base text-muted-foreground">
        <p>L'indice è una stima basata su segnali noti, non una probabilità di truffa. FERMO non può garantire che un messaggio sia sicuro.</p>
        <p>Il messaggio viene analizzato solo sul tuo dispositivo: non viene inviato né salvato, e i link non vengono aperti.</p>
      </footer>
    </main>
  );
}

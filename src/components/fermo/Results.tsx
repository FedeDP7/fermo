import { useState } from "react";
import type { AnalysisResult, Level, LinkReport } from "@/engine/types";

const LEVEL_STYLE: Record<Level, { text: string; bar: string; label: string; sub: string }> = {
  ALTO: { text: "text-destructive", bar: "bg-destructive", label: "Rischio ALTO", sub: "Fermati. Ci sono molti segnali tipici di una truffa." },
  MEDIO: { text: "text-warning", bar: "bg-warning", label: "Rischio MEDIO", sub: "Attenzione. Alcuni segnali richiedono una verifica." },
  BASSO: { text: "text-success", bar: "bg-success", label: "Rischio BASSO", sub: "Nessun segnale forte trovato. Questo non significa che sia sicuro." },
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function RiskGauge({ r }: { r: AnalysisResult }) {
  const s = LEVEL_STYLE[r.level];
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-glow)]">
      <p className="text-base text-muted-foreground">Indice orientativo di rischio</p>
      <div className="mt-1 flex items-baseline gap-3">
        <span className={`text-6xl font-extrabold ${s.text}`}>{r.score}</span>
        <span className="text-xl text-muted-foreground">/ 100</span>
      </div>
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary" role="presentation">
        <div className={`h-full rounded-full ${s.bar} transition-all duration-700`} style={{ width: `${Math.max(r.score, 3)}%` }} />
      </div>
      <p className={`mt-4 text-2xl font-bold ${s.text}`}>{s.label}</p>
      <p className="mt-1">{s.sub}</p>
      <p className="mt-3 text-base text-muted-foreground">Tipo di messaggio: <strong className="text-foreground">{r.contextLabel}</strong></p>
    </section>
  );
}

export function SignalList({ r }: { r: AnalysisResult }) {
  return (
    <Card title="Cosa abbiamo notato">
      {r.signals.length === 0 ? (
        <p className="text-muted-foreground">Non abbiamo trovato segnali noti di truffa.</p>
      ) : (
        <ul className="space-y-4">
          {r.signals.map((s) => (
            <li key={s.id} className="border-l-4 border-primary pl-4">
              <p className="font-bold">{s.title}</p>
              <p className="text-muted-foreground">{s.explanation}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const VERDICT: Record<LinkReport["verdict"], string> = {
  ufficiale: "text-success",
  attenzione: "text-warning",
  sospetto: "text-destructive",
};

export function LinkAnalysis({ r }: { r: AnalysisResult }) {
  if (!r.links.length) return null;
  return (
    <Card title="Controllo dei link">
      <p className="mb-4 text-base text-muted-foreground">Analizziamo solo come è scritto l'indirizzo. Non apriamo i link.</p>
      <ul className="space-y-5">
        {r.links.map((l) => (
          <li key={l.raw}>
            <p className="break-all rounded-lg bg-secondary px-3 py-2 font-mono text-base">{l.raw}</p>
            <p className="mt-2">
              Sito reale: <strong>{l.domain}</strong> · <span className={`font-bold uppercase ${VERDICT[l.verdict]}`}>{l.verdict}</span>
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-6 text-muted-foreground">
              {l.reasons.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function Recommendations({ r }: { r: AnalysisResult }) {
  return (
    <Card title="Cosa fare adesso">
      <ol className="space-y-4">
        {r.recommendations.map((x, i) => (
          <li key={x} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
            <span>{x}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function SafeReply({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card title="Una risposta prudente">
      <p className="rounded-xl bg-secondary p-4 italic">{text}</p>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="mt-4 min-h-14 w-full rounded-xl border-2 border-primary font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        {copied ? "Copiato ✓" : "Copia la risposta"}
      </button>
    </Card>
  );
}

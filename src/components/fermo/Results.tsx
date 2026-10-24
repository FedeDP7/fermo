import { useState } from "react";
import { GROUP_LABELS } from "@/engine/config/rules";
import type { AnalysisResult, Level, LinkReport } from "@/engine/types";

const LEVEL_STYLE: Record<Level, { text: string; bar: string; border: string; label: string; sub: string }> = {
  ALTO: { text: "text-risk-high", bar: "bg-risk-high", border: "border-risk-high", label: "Rischio ALTO", sub: "Fermati. Ci sono segnali forti tipici di una truffa." },
  MEDIO: { text: "text-risk-mid", bar: "bg-risk-mid", border: "border-risk-mid", label: "Rischio MEDIO", sub: "Attenzione. Alcuni elementi vanno verificati prima di agire." },
  BASSO: { text: "text-risk-low", bar: "bg-risk-low", border: "border-risk-low", label: "Rischio BASSO", sub: "Nessun segnale forte trovato. Questo non significa che il messaggio sia sicuro." },
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
    <section className={`rounded-2xl border-2 ${s.border} bg-card p-6`}>
      <p className={`text-3xl font-extrabold ${s.text}`}>{s.label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-5xl font-extrabold">{r.score}</span>
        <span className="text-lg text-muted-foreground">/ 100 · indice orientativo</span>
      </div>
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary" aria-hidden>
        <div className={`h-full rounded-full ${s.bar} transition-all duration-700`} style={{ width: `${Math.max(r.score, 3)}%` }} />
      </div>
      <p className="mt-4 text-lg">{s.sub}</p>
      <p className="mt-2 text-base text-muted-foreground">Tipo di messaggio: <strong className="text-foreground">{r.contextLabel}</strong></p>
    </section>
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

export function SignalList({ r }: { r: AnalysisResult }) {
  return (
    <Card title="Perché FERMO ti avvisa">
      {r.signals.length === 0 ? (
        <p className="text-muted-foreground">Non abbiamo trovato segnali noti di truffa in questo testo.</p>
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
  "dominio noto": "text-risk-low",
  "da verificare": "text-risk-mid",
  sospetto: "text-risk-high",
};

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="break-all font-bold">{v}</dd>
    </div>
  );
}

export function LinkAnalysis({ r }: { r: AnalysisResult }) {
  if (!r.links.length) return null;
  return (
    <Card title="Controllo dei link">
      <p className="mb-4 text-base text-muted-foreground">FERMO legge solo come è scritto l'indirizzo: non apre i link e non può verificare chi c'è dietro.</p>
      <ul className="space-y-6">
        {r.links.map((l) => (
          <li key={l.cleaned} className="rounded-xl bg-secondary p-4">
            <p className="break-all font-mono text-base">{l.original}</p>
            <dl className="mt-3 space-y-1">
              {l.claimedBrand && <Row k="Il messaggio dice di essere:" v={l.claimedBrand} />}
              <Row k="Il link porta a:" v={l.domain ?? (l.isIp ? `indirizzo numerico ${l.hostname}` : "Dominio non determinabile")} />
              {l.referenceDomains.length > 0 && <Row k="Dominio di riferimento:" v={l.referenceDomains.join(", ")} />}
            </dl>
            {l.mismatch && <p className="mt-2 inline-block rounded-md bg-risk-high px-2 py-1 text-base font-extrabold text-primary-foreground">NON COINCIDE</p>}
            <p className="mt-2">Esito: <span className={`font-bold uppercase ${VERDICT[l.verdict]}`}>{l.verdict}</span></p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
              {l.indicators.map((x) => <li key={x.id}>{x.label}</li>)}
              {l.verdict === "dominio noto" && <li>L'indirizzo appartiene a un sito ufficiale noto. Questo non garantisce che il messaggio sia autentico.</li>}
              {l.indicators.length === 0 && l.verdict !== "dominio noto" && <li>Nessuna anomalia evidente nell'indirizzo, ma non è un sito che FERMO conosce: non possiamo dire se è affidabile.</li>}
            </ul>
          </li>
        ))}
      </ul>
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
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
        className="mt-4 min-h-14 w-full rounded-xl border-2 border-primary font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        {copied ? "Copiato ✓" : "Copia la risposta"}
      </button>
    </Card>
  );
}

export function Breakdown({ r }: { r: AnalysisResult }) {
  const b = r.breakdown;
  return (
    <details className="rounded-2xl border border-border bg-card p-6 [&_summary]:cursor-pointer">
      <summary className="text-xl font-bold">Come è stato calcolato</summary>
      <table className="mt-4 w-full text-left text-base">
        <thead className="text-muted-foreground">
          <tr><th className="py-1">Segnale</th><th>Gruppo</th><th className="text-right">Punti</th></tr>
        </thead>
        <tbody>
          {r.signals.map((s) => (
            <tr key={s.id} className="border-t border-border"><td className="py-2 pr-2">{s.title}</td><td>{GROUP_LABELS[s.group]}</td><td className="text-right">+{s.weight}</td></tr>
          ))}
        </tbody>
      </table>
      {b.groups.length > 0 && (
        <>
          <h3 className="mt-5 font-bold">Totale per gruppo (con limite)</h3>
          <ul className="mt-1 space-y-1">
            {b.groups.map((g) => (
              <li key={g.group} className="flex justify-between">
                <span>{GROUP_LABELS[g.group]} <span className="text-muted-foreground">(max {g.cap})</span>{g.raw > g.cap && <span className="text-risk-mid"> · limitato da {g.raw}</span>}</span>
                <span>{g.applied}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {b.bonuses.length > 0 && (
        <>
          <h3 className="mt-5 font-bold">Combinazioni</h3>
          <ul className="mt-1 space-y-1">
            {b.bonuses.map((x) => <li key={x.id} className="flex justify-between"><span>{x.label}</span><span>+{x.points}</span></li>)}
          </ul>
        </>
      )}
      <p className="mt-5 flex justify-between border-t border-border pt-3 text-lg font-extrabold">
        <span>Totale{b.subtotal > 100 ? ` (limitato da ${b.subtotal})` : ""}</span><span>{b.total} / 100</span>
      </p>
    </details>
  );
}

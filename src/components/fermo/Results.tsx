import { signalCopy, linkCopy } from "@/i18n/report";
import { useI18n } from "@/i18n";
import { useState } from "react";
import { Check, Copy, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { GROUP_LABELS } from "@/engine/config/rules";
import type { AnalysisResult, Level, LinkReport } from "@/engine/types";

const LEVEL_STYLE: Record<
  Level,
  {
    text: string;
    bar: string;
    border: string;
    label: string;
    sub: string;
    Icon: typeof ShieldAlert;
  }
> = {
  ALTO: {
    text: "text-risk-high",
    bar: "bg-risk-high",
    border: "border-risk-high",
    label: "Rischio ALTO",
    sub: "Ci sono segnali forti tipici di una truffa: non agire prima di verificare.",
    Icon: ShieldAlert,
  },
  MEDIO: {
    text: "text-risk-mid",
    bar: "bg-risk-mid",
    border: "border-risk-mid",
    label: "Rischio MEDIO",
    sub: "Alcuni elementi vanno verificati prima di agire.",
    Icon: TriangleAlert,
  },
  BASSO: {
    text: "text-risk-low",
    bar: "bg-risk-low",
    border: "border-risk-low",
    label: "Rischio BASSO",
    sub: "Nessun segnale forte trovato, ma questo non significa che il messaggio sia sicuro.",
    Icon: ShieldCheck,
  },
};

function Card({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="animate-card-in rounded-2xl border border-border bg-card p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function RiskGauge({ r }: { r: AnalysisResult }) {
  const { t, language } = useI18n();
  const s = LEVEL_STYLE[r.level];
  return (
    <section
      className={`studio-gauge animate-card-in rounded-2xl border-2 ${s.border} bg-card p-6 sm:p-8`}
    >
      <div className="flex items-center gap-4">
        <s.Icon aria-hidden className={`h-12 w-12 shrink-0 ${s.text}`} strokeWidth={2.2} />
        <div>
          <p className={`text-3xl font-extrabold ${s.text}`}>{t(s.label)}</p>
          <p className="text-base text-muted-foreground">{t(r.contextLabel)}</p>
        </div>
        <p className="ml-auto text-right">
          <span className="block text-5xl font-extrabold leading-none sm:text-6xl">{r.score}</span>
          <span className="text-base text-muted-foreground">{t("su 100")}</span>
        </p>
      </div>
      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-secondary" aria-hidden>
        <div
          className={`h-full rounded-full ${s.bar} transition-[width] duration-[600ms] ease-out`}
          style={{ width: `${Math.max(r.score, 3)}%` }}
        />
      </div>
      <p className="mt-5 text-lg font-semibold">{t(s.sub)}</p>
      <p className="mt-1 text-base text-muted-foreground">
        {t("Indice orientativo, non una probabilità.")}
      </p>
    </section>
  );
}

export function Recommendations({ r }: { r: AnalysisResult }) {
  const { t, language } = useI18n();
  return (
    <section
      className="animate-card-in rounded-2xl border-2 border-primary bg-card p-6 sm:p-8"
      style={{ animationDelay: "60ms" }}
    >
      <h2 className="mb-5 text-2xl font-extrabold">{t("Cosa fare adesso")}</h2>
      <ol className="space-y-5">
        {r.recommendations.map((x, i) => (
          <li key={t(x)} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-primary-foreground">
              {i + 1}
            </span>
            <span className="pt-1 text-lg">{t(x)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SignalList({ r }: { r: AnalysisResult }) {
  const { t, language } = useI18n();
  return (
    <Card title={t("Perché FERMO ti avvisa")} delay={120}>
      {r.signals.length === 0 ? (
        <p className="text-muted-foreground">
          {t("Non abbiamo trovato segnali noti di truffa in questo testo.")}
        </p>
      ) : (
        <ul className="space-y-5">
          {r.signals.map((original) => {
            const s = signalCopy(original, language);
            return (
              <li key={s.id} className="border-l-4 border-primary pl-4">
                <p className="font-bold">{t(s.title)}</p>
                {s.excerpt && (
                  <p className="my-1">
                    <span className="sr-only">{t("Parole che hanno attivato il segnale:")}</span>
                    <mark className="rounded bg-primary/20 px-1.5 py-0.5 font-semibold text-foreground">
                      «{s.excerpt.text}»
                    </mark>
                  </p>
                )}
                <p className="text-muted-foreground">{t(s.explanation)}</p>
              </li>
            );
          })}
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

/** Plain-text anatomy of the hostname: never a clickable link. */
function HostAnatomy({ l }: { l: LinkReport }) {
  const { t, language } = useI18n();
  const host = l.hostname;
  const dom = l.domain;
  const prefix = dom && host.endsWith(dom) ? host.slice(0, host.length - dom.length) : "";
  const proto = l.protocol ? `${l.protocol}://` : "";
  const path = l.cleaned.replace(/^h(?:tt|xx)ps?:\/\//i, "").replace(/^[^/?#]*/, "");
  return (
    <p
      className="break-all font-mono text-base leading-relaxed"
      aria-label={`${t("Indirizzo:")} ${l.cleaned}`}
    >
      <span className="text-muted-foreground">
        {proto}
        {prefix}
      </span>
      <span
        className={`rounded px-1 font-bold ${l.mismatch ? "bg-risk-high text-risk-foreground" : "bg-primary/20 text-foreground"}`}
      >
        {dom ?? host}
      </span>
      <span className="text-muted-foreground">{path}</span>
    </p>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="break-all font-bold">{v}</dd>
    </div>
  );
}

export function LinkAnalysis({ r }: { r: AnalysisResult }) {
  const { t, language } = useI18n();
  if (!r.links.length) return null;
  return (
    <Card title={t("Controllo dei link")} delay={180}>
      <p className="mb-4 text-base text-muted-foreground">
        {t(
          "Il sito vero è la parte evidenziata. FERMO legge solo come è scritto l'indirizzo: non apre i link e non può verificare chi c'è dietro.",
        )}
      </p>
      <ul className="space-y-6">
        {r.links.map((original) => {
          const l = linkCopy(original, language);
          return (
            <li key={l.cleaned} className="rounded-xl bg-secondary p-4">
              <HostAnatomy l={l} />
              <dl className="mt-4 space-y-1">
                {l.claimedBrand && <Row k={t("Il messaggio dice di essere:")} v={l.claimedBrand} />}
                <Row
                  k={t("Il link porta a:")}
                  v={
                    l.domain ??
                    (l.isIp
                      ? `${t("indirizzo numerico")} ${l.hostname}`
                      : t("Dominio non determinabile"))
                  }
                />
                {l.referenceDomains.length > 0 && (
                  <Row k={t("Dominio di riferimento:")} v={l.referenceDomains.join(", ")} />
                )}
              </dl>
              {l.mismatch && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-risk-high px-3 py-1 text-base font-extrabold text-risk-foreground">
                  <TriangleAlert aria-hidden className="h-4 w-4" /> {t("NON COINCIDE")}
                </p>
              )}
              <p className="mt-3">
                {t("Esito:")}{" "}
                <span className={`font-bold uppercase ${VERDICT[l.verdict]}`}>{t(l.verdict)}</span>
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
                {l.indicators.map((x) => (
                  <li key={x.id}>{t(x.label)}</li>
                ))}
                {l.verdict === "dominio noto" && (
                  <li>
                    {t(
                      "L'indirizzo appartiene a un sito ufficiale noto. Questo non garantisce che il messaggio sia autentico.",
                    )}
                  </li>
                )}
                {l.indicators.length === 0 && l.verdict !== "dominio noto" && (
                  <li>
                    {t(
                      "Nessuna anomalia evidente nell'indirizzo, ma non è un sito che FERMO conosce: non possiamo dire se è affidabile.",
                    )}
                  </li>
                )}
              </ul>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function SafeReply({ text }: { text: string }) {
  const { t, language } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <Card title={t("Una risposta prudente")} delay={240}>
      <p className="rounded-xl bg-secondary p-4 italic">{t(text)}</p>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(t(text));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
        className={`mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary font-bold transition-colors ${copied ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary hover:text-primary-foreground"}`}
      >
        {copied ? (
          <Check aria-hidden className="h-5 w-5" />
        ) : (
          <Copy aria-hidden className="h-5 w-5" />
        )}
        <span aria-live="polite">{copied ? t("Copiato") : t("Copia la risposta")}</span>
      </button>
    </Card>
  );
}

export function Breakdown({ r }: { r: AnalysisResult }) {
  const { t, language } = useI18n();
  const b = r.breakdown;
  return (
    <details
      className="animate-card-in rounded-2xl border border-border bg-card p-6 [&_summary]:cursor-pointer"
      style={{ animationDelay: "300ms" }}
    >
      <summary className="text-xl font-bold">{t("Come è stato calcolato")}</summary>
      <table className="mt-4 w-full text-left text-base">
        <thead className="text-muted-foreground">
          <tr>
            <th className="py-1">{t("Segnale")}</th>
            <th>{t("Gruppo")}</th>
            <th className="text-right">{t("Punti")}</th>
          </tr>
        </thead>
        <tbody>
          {r.signals.map((original) => {
            const s = signalCopy(original, language);
            return (
              <tr key={s.id} className="border-t border-border">
                <td className="py-2 pr-2">{t(s.title)}</td>
                <td>{t(GROUP_LABELS[s.group])}</td>
                <td className="text-right">+{s.weight}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {b.groups.length > 0 && (
        <>
          <h3 className="mt-5 font-bold">{t("Totale per gruppo (con limite)")}</h3>
          <ul className="mt-1 space-y-1">
            {b.groups.map((g) => (
              <li key={g.group} className="flex justify-between">
                <span>
                  {t(GROUP_LABELS[g.group])}{" "}
                  <span className="text-muted-foreground">(max {g.cap})</span>
                  {g.raw > g.cap && (
                    <span className="text-risk-mid">
                      {" "}
                      {t("· limitato da")}
                      {g.raw}
                    </span>
                  )}
                </span>
                <span>{g.applied}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {b.bonuses.length > 0 && (
        <>
          <h3 className="mt-5 font-bold">{t("Combinazioni")}</h3>
          <ul className="mt-1 space-y-1">
            {b.bonuses.map((x) => (
              <li key={x.id} className="flex justify-between">
                <span>{t(x.label)}</span>
                <span>+{x.points}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-5 flex justify-between border-t border-border pt-3 text-lg font-extrabold">
        <span>
          {t("Totale")}
          {b.subtotal > 100 ? ` (${t("limitato da")} ${b.subtotal})` : ""}
        </span>
        <span>{b.total} / 100</span>
      </p>
    </details>
  );
}

import { Building2, ShieldCheck, Users, Plug } from "lucide-react";

const RISKS = [
  { label: "BASSO", count: 62, style: "bg-risk-low" },
  { label: "MEDIO", count: 37, style: "bg-risk-mid" },
  { label: "ALTO", count: 29, style: "bg-risk-high" },
];
const TYPES = [{ label: "Phishing aziendale", count: 28 }, { label: "Cambio IBAN", count: 19 }, { label: "Falso dirigente", count: 12 }, { label: "Fatture dubbie", count: 7 }];
const TREND = [18, 24, 20, 31, 35];
const TIERS = [
  { name: "START", audience: "Microimprese e piccoli team", Icon: ShieldCheck, items: ["Analisi delle comunicazioni", "Procedure di verifica", "Materiale di sensibilizzazione"] },
  { name: "TEAM", audience: "PMI con più reparti", Icon: Users, items: ["Workspace aziendale e autorizzazioni", "Dashboard aggregata", "Procedure personalizzabili", "Formazione dei dipendenti"] },
  { name: "BUSINESS", audience: "Aziende con esigenze di integrazione", Icon: Plug, items: ["Integrazioni e ticketing", "Segnalazioni centralizzate", "Reportistica", "Policy aziendali configurabili"] },
];

export function CompanyOverview() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
      <header className="mb-8 max-w-3xl">
        <p className="mb-3 flex items-center gap-2 text-base font-bold text-primary"><Building2 aria-hidden className="h-5 w-5" /> PANORAMICA AZIENDALE · DEMO</p>
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">FERMO per le aziende</h1>
        <p className="mt-4 text-lg text-muted-foreground">Una piattaforma pensata per aiutare le PMI a rendere più sicure le decisioni quotidiane dei propri collaboratori.</p>
      </header>
      <section aria-labelledby="demo-heading" className="border-y border-border py-8">
        <h2 id="demo-heading" className="text-lg font-extrabold text-risk-mid">DATI DIMOSTRATIVI — scenario simulato</h2>
        <p className="mt-2 text-base text-muted-foreground">Numeri inventati per illustrare una futura vista aggregata. Non sono attività reali né analisi effettuate in questa sessione.</p>
        <div className="mt-7 grid gap-7 md:grid-cols-3">
          <div><p className="text-muted-foreground">Verifiche eseguite · periodo simulato</p><p className="mt-2 text-6xl font-extrabold">128</p><p className="mt-3 text-base text-muted-foreground">Nessun dipendente reale monitorato.</p></div>
          <div className="md:col-span-2"><h3 className="mb-3 font-bold">Distribuzione dei livelli di rischio</h3>
            <div className="flex h-5 overflow-hidden rounded-md" aria-hidden>{RISKS.map(r => <div key={r.label} className={r.style} style={{ width: `${r.count / 128 * 100}%` }} />)}</div>
            <dl className="mt-4 grid grid-cols-3 gap-3">{RISKS.map(r => <div key={r.label}><dt className="text-sm font-bold text-muted-foreground">{r.label}</dt><dd className="text-2xl font-extrabold">{r.count}</dd></div>)}</dl>
          </div>
        </div>
        <div className="mt-9 grid gap-9 md:grid-cols-2">
          <div><h3 className="mb-4 text-xl font-bold">Tipologie da approfondire</h3><ul className="space-y-3">{TYPES.map(t => <li key={t.label}><div className="mb-1 flex justify-between gap-3 text-base"><span>{t.label}</span><span className="font-bold">{t.count}</span></div><div className="h-2 bg-secondary" aria-hidden><div className="h-full bg-primary" style={{ width: `${t.count / 28 * 100}%` }} /></div></li>)}</ul><p className="mt-3 text-sm text-muted-foreground">66 verifiche con segnali da approfondire; non frodi confermate.</p></div>
          <div><h3 className="mb-4 text-xl font-bold">Trend delle verifiche · simulato</h3><div className="grid h-44 grid-cols-5 items-end gap-3" role="img" aria-label="Settimane simulate: 18, 24, 20, 31 e 35 verifiche">{TREND.map((count, i) => <div key={i} className="flex h-full flex-col justify-end text-center"><span className="text-base font-bold">{count}</span><div className="mt-1 bg-primary/60" style={{ height: `${count / 35 * 110}px` }} /><span className="mt-2 text-sm text-muted-foreground">S{i + 1}</span></div>)}</div></div>
        </div>
      </section>
      <section className="grid gap-7 border-b border-border py-8 md:grid-cols-2">
        <div><h2 className="text-xl font-bold">Aree di sensibilizzazione · esempio</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground"><li>Riconoscere portali di accesso imitativi.</li><li>Verificare i cambi di coordinate dei fornitori.</li><li>Gestire richieste urgenti attribuite a dirigenti.</li></ul></div>
        <div><h2 className="text-xl font-bold">Procedure da rafforzare · esempio</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground"><li>Recapiti verificati nell'anagrafica fornitori.</li><li>Seconda approvazione per modifiche ai pagamenti.</li><li>Un referente noto per comunicazioni dubbie.</li></ul></div>
      </section>
      <section className="py-9">
        <p className="mb-3 text-sm font-extrabold text-primary">VISIONE FUTURA · NON ATTIVABILE NELL'MVP</p>
        <h2 className="max-w-3xl text-3xl font-extrabold">Una piattaforma progettata per crescere con la tua azienda</h2>
        <div className="mt-7 grid gap-5 lg:grid-cols-3">{TIERS.map(t => <article key={t.name} className="rounded-lg border border-border p-6"><t.Icon aria-hidden className="mb-4 h-6 w-6 text-primary" /><h3 className="text-xl font-extrabold">FERMO {t.name}</h3><p className="mt-2 text-base text-muted-foreground">{t.audience}</p><p className="mt-4 text-sm font-bold text-risk-mid">Sviluppi previsti, non offerta disponibile</p><ul className="mt-3 list-disc space-y-2 pl-5 text-base">{t.items.map(x => <li key={x}>{x}</li>)}</ul></article>)}</div>
        <p className="mt-6 text-base text-muted-foreground">Login, workspace, report e integrazioni non sono disponibili nell'MVP. Un utilizzo multiutente reale richiederà separazione sicura delle aziende, autorizzazioni e valutazioni privacy e sicurezza. Nessuna classifica individuale o sorveglianza dei lavoratori.</p>
      </section>
    </main>
  );
}
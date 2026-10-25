# Route FERMO

Il progetto usa il routing basato su file di TanStack Start.

| File | Funzione |
| --- | --- |
| `__root.tsx` | Layout condiviso, navbar, provider, metadati di base e gestione degli errori |
| `index.tsx` | `/`: analisi delle comunicazioni, riepilogo e report su richiesta |
| `aziende.tsx` | `/aziende`: panoramica aziendale con dati esplicitamente simulati |

Conservare `<Outlet />` nel layout e le due pagine distinte. Il motore di analisi rimane in `src/engine`, indipendente da React.

`src/routeTree.gen.ts` viene generato dal router ed è importato dall'app e dai test: non modificarlo a mano. Non aggiungere convenzioni di routing di Next.js o Remix.

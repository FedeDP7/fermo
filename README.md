# FERMO

**Un controllo in più. Un rischio in meno.**

MVP sviluppato per l'hackathon Starting Finance × Paradigma, Padova, 24 ottobre 2026. FERMO aiuta i dipendenti delle PMI italiane a valutare comunicazioni sospette prima di pagare, aprire link o condividere credenziali.

## Funzionalità disponibili

- Analisi deterministica di testo in italiano, eseguita nel browser.
- Indice euristico 0–100, segnali spiegati, analisi sintattica dei domini e raccomandazioni.
- Scenari aziendali: cambio IBAN, falso dirigente, phishing aziendale e richieste di pagamento.
- Riepilogo compatto e report completo su richiesta; procedura consigliata e riepilogo copiabile per il responsabile.
- Interfaccia IT/EN, tema chiaro/scuro e layout responsive. La lingua dell'interfaccia non cambia le regole di analisi, configurate per messaggi italiani.
- Pagina `/aziende` con dati simulati e presentazione della roadmap SaaS.

Login, workspace multiutente, database, registro delle verifiche, integrazioni e verifica bancaria degli IBAN **non sono implementati**. La dashboard aziendale è una demo, non una raccolta di attività reali.

## Limiti e riservatezza

L'indice è orientativo, non una probabilità di frode e non garantisce l'autenticità o la sicurezza di una comunicazione. FERMO non apre i link e non verifica l'identità del mittente. Le indicazioni vanno adattate alle procedure interne dell'azienda.

Il testo rimane nello stato del browser: il motore non lo trasmette né lo salva. Solo la preferenza del tema viene persistita in `localStorage`. Il riepilogo per il responsabile esclude contenuto originale, estratti e report URL. Rimuovere comunque dati riservati non necessari prima di incollare un messaggio.

L'app carica Manrope da Google Fonts e conserva gli hook opzionali di segnalazione errori della piattaforma Lovable. Analisi locale non significa che l'intera applicazione sia priva di richieste di rete.

## Sviluppo locale

Prerequisiti: Node.js 22.12 o successivo e Bun compatibile con il lockfile del progetto. `bun.lock` è il lockfile di riferimento.

```sh
git clone https://github.com/FedeDP7/snap-to-pixel-pages.git
cd snap-to-pixel-pages
bun install --frozen-lockfile
bun run dev
```

Usare l'indirizzo stampato da Vite nel terminale. L'MVP non richiede chiavi API o credenziali per l'analisi.

```sh
bun run test
bunx tsc --noEmit
bun run lint
bun run build
```

Il lint globale presenta ancora segnalazioni in file preesistenti, in particolare di formattazione e in `src/engine/urls.ts`; non è un controllo attualmente tutto verde. Le verifiche automatiche non sostituiscono la prova del sito pubblicato.

## Architettura

- `src/engine/`: funzioni pure, indipendenti da React; pesi, soglie e domini in `config/`.
- `src/components/fermo/`: componenti dell'interfaccia.
- `src/routes/`: layout condiviso e pagine di analisi e panoramica aziendale.
- `src/i18n/`: traduzioni scritte e adattamento dei testi del report; nessuna traduzione remota dei messaggi.
- `src/test/` e test nel motore: regressioni di analisi, privacy, routing e interfaccia.
- `logo/`: logo utilizzato dall'applicazione.

Stack: React, TypeScript, Tailwind CSS, TanStack Start, Vite, tldts e Vitest. Il rendering dell'app usa TanStack Start/SSR; il motore di analisi viene chiamato localmente dall'interfaccia.

## GitHub e pubblicazione Lovable

La branch collegata è `main`. I commit inviati a GitHub si sincronizzano con il progetto Lovable. Prima di pubblicare, controllare la sincronizzazione e l'anteprima, poi usare **Publish → Publish changes** in Lovable. Il push non equivale alla pubblicazione del sito.

Non usare force push e non riscrivere commit già pubblicati: la cronologia è condivisa con Lovable. Conservare `.lovable/project.json` e la configurazione di build.

## Cosa versionare

Versionare sorgenti, test, documentazione, asset effettivamente utilizzati, configurazioni e `bun.lock`. Non aggiungere messaggi reali, documenti aziendali, credenziali, file `.env`, dipendenze installate, output di build, report locali o configurazioni personali degli assistenti.

Le skill installate sotto `.agents/skills` sono strumenti locali facoltativi e non servono per compilare o usare FERMO. Il vecchio piano Lovable e lo screenshot di lavoro rimangono esclusi dal ramo corrente. File rimossi dal ramo possono comunque essere presenti nella cronologia Git.

## Licenze e componenti terze

Non è stata scelta una licenza open-source per il codice originale FERMO. Le dipendenze e le componenti terze mantengono le proprie licenze: vedere [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

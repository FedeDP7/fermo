# Contribuire a FERMO

FERMO è un MVP per le PMI italiane, pubblicato tramite Lovable. Segnalazioni e proposte possono essere presentate tramite issue e pull request su GitHub.

## Segnalazioni

Descrivere il problema, i passaggi per riprodurlo, il comportamento atteso e il browser utilizzato. Per i risultati di analisi, fornire un testo sintetico che riproduca il caso, senza dati reali di persone o aziende.

Issue, commenti, allegati e pull request sono pubblici: non inserire credenziali, IBAN reali, messaggi riservati, file `.env` o screenshot con informazioni personali. Per vulnerabilità o informazioni sensibili, concordare un canale privato con il manutentore prima di condividere i dettagli.

## Modifiche

1. Aprire una branch dedicata e mantenere la modifica circoscritta.
2. Seguire [AGENTS.md](AGENTS.md) e [DESIGN.md](DESIGN.md).
3. Usare `bun install --frozen-lockfile`; `bun.lock` è il lockfile di riferimento.
4. Eseguire `bun run test`, `bunx tsc --noEmit` e `bun run build`. Controllare anche `bun run lint`, distinguendo problemi introdotti dalla modifica e segnalazioni già presenti.
5. Descrivere nella pull request cosa cambia e come è stato verificato. Per modifiche visive, includere schermate desktop e mobile prive di dati riservati.

L'analisi deve rimanere deterministica e locale; i punteggi sono indici euristici, non probabilità di frode. Le modifiche alle regole richiedono regressioni significative, inclusi casi legittimi. Conservare la distinzione tra funzioni disponibili, dati simulati e roadmap.

Non riscrivere la cronologia già pubblicata e non usare force push: `main` è collegata a Lovable. Un push non sostituisce la pubblicazione del sito nell'editor Lovable.

## Licenze

Il repository pubblico non ha ancora una licenza open-source per il codice originale. Consultare il README e [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md); le licenze delle componenti terze restano applicabili.

# FERMO — Piano tecnico MVP (hackathon 3h)

"Un secondo prima di perdere soldi." Analisi deterministica nel browser: nessun login, database, API remota o memorizzazione. Flusso: INCOLLA → ANALIZZA → COMPRENDI → AGISCI.

## 1. Piano tecnico (10 punti)
1. Design system in `src/styles.css`: palette scura (oklch dei colori forniti), Manrope via `<link>`, testo base 18px, pulsanti min 56px, colonna centrata max 620px.
2. Una sola pagina `/` (stato locale: input → risultato), head() con titolo/descrizione FERMO.
3. Configurazione statica: brand italiani (Agenzia Entrate, INPS, Poste, banche, corrieri, PayPal, Amazon...) con domini ufficiali; TLD a rischio; shortener noti.
4. Normalizzazione testo: minuscole, rimozione accenti, unificazione spazi, de-offuscamento leggero (es. "p0ste" → "poste", punti spaziati negli URL).
5. Classificazione contesto: ISTITUZIONALE / BANCA-PAGAMENTI / CONSEGNA / AFFITTO / COMPRAVENDITA / GENERICO, tramite dizionari di parole chiave con punteggio.
6. Parsing URL con `tldts`: estrazione link (anche senza schema), dominio registrabile, sottodominio, TLD, IP, punycode, shortener, brand nel sottodominio ma dominio diverso, typosquatting (distanza di Levenshtein ≤2 dai domini ufficiali), http senza TLS. Gli URL non vengono mai resi cliccabili.
7. Rilevamento segnali: regole dichiarative `{id, pattern, peso, contesti, spiegazione}` — urgenza, minacce (sospensione, multa), richiesta dati/OTP/PIN/IBAN, pagamento anticipato/caparra, bonifico/ricarica/crypto/gift card, PayPal "amici e familiari", spostamento su WhatsApp/Telegram, prezzo troppo basso, proprietario all'estero, rimborso inatteso.
8. Scoring spiegabile: somma pesata, moltiplicatori di contesto (es. anticipo pesa di più in AFFITTO), combinazioni (brand + link non ufficiale), clamp 0–100. Soglie: <30 BASSO, 30–64 MEDIO, ≥65 ALTO. Mai "sicuro": il BASSO dice "nessun segnale forte rilevato, resta prudente".
9. Raccomandazioni: 3 consigli selezionati per contesto e segnali + risposta prudente da copiare (Clipboard API reale) quando pertinente.
10. Test Vitest sul motore: i tre esempi devono risultare ALTO, testo neutro BASSO, dominio ufficiale non penalizzato, typosquat rilevato.

## 2. Componenti UI
- `Header` (logo/nome, slogan)
- `MessageInput` (textarea grande, contatore, pulsante Analizza, Cancella)
- `ExamplePicker` (3 esempi precaricati)
- `RiskGauge` (indice 0–100 + livello con colore e testo, non solo colore)
- `SignalList` (segnali con spiegazione in linguaggio semplice)
- `LinkAnalysis` (per ogni link: dominio, verdetto strutturale, motivi)
- `Recommendations` (3 azioni)
- `SafeReply` (testo + pulsante Copia)
- `Disclaimer` (indice euristico, non probabilità; nessun dato salvato)

## 3. Moduli (`src/engine/`)
| Modulo | Responsabilità |
|---|---|
| `config/brands.ts` | brand, domini ufficiali, alias |
| `config/rules.ts` | regole, pesi, soglie, TLD/shortener |
| `normalize.ts` | pulizia e de-offuscamento |
| `context.ts` | classificazione del contesto |
| `urls.ts` | estrazione e analisi strutturale con tldts |
| `signals.ts` | applicazione regole → segnali |
| `score.ts` | punteggio, livello, contributi |
| `recommend.ts` | consigli e risposta prudente |
| `analyze.ts` | orchestratore puro `analyze(text) → Result` |
| `types.ts` | tipi condivisi |
| `examples.ts` | i tre esempi |
| `__tests__/` | test Vitest |

Il motore è puro (nessun React), quindi testabile e estendibile nei prompt successivi.

## 4. Dipendenze
Solo `tldts`. Tutto il resto è già nel progetto (React, Tailwind, Vitest).

## 5. Rischi tecnici
- Falsi positivi/negativi delle regole testuali → pesi tarati sui test, linguaggio prudente.
- Estrazione URL incompleta (link senza http, offuscati) → regex tollerante + test.
- Typosquatting rumoroso → confronto solo con domini dei brand citati o noti.
- Accessibilità (contrasto accent, focus visibile, aria-live sul risultato).
- Tempo: P1/P2 solo se P0 è stabile.

## 6. Sequenza (3h)
- 0:00–0:20 design system, layout, pagina e componenti statici.
- 0:20–1:20 motore: config, normalize, urls, context, signals, score.
- 1:20–1:50 recommend + collegamento UI e risultati.
- 1:50–2:20 test Vitest e taratura pesi sugli esempi.
- 2:20–2:45 accessibilità, responsive, rifiniture.
- 2:45–3:00 verifica end-to-end e demo.

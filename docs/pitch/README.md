# Pitch FERMO

[Apri il pitch FERMO (PDF, 13 slide)](FERMO-pitch.pdf).

Pitch dell'hackathon Starting Finance × Paradigma, Padova, 24 ottobre 2026. Versione fornita dal team e pubblicata il 25 ottobre 2026, conservando struttura, impaginazione, immagini e logo originali, con correzioni fattuali e minimi ritocchi ai testi.

`FERMO-pitch.pdf` è il documento di riferimento: è una copia identica dell'allegato «FERMO – Pitch.pdf», senza ulteriori modifiche al contenuto. Sostituisce la precedente versione con impaginazione ricostruita.

## Demo e accesso

[Anteprima Lovable](https://preview--demo-fermo.lovable.app/): al controllo del 24 ottobre 2026 reindirizza al login Lovable. Non è un link pubblico utilizzabile senza autenticazione. Prima della presentazione usare il sito pubblicato con Lovable oppure avviare il progetto localmente. Il push su GitHub non pubblica automaticamente il sito.

La slide 4 mostra uno **schema illustrativo**, non una schermata del sito. L'esito è coerente con il motore verificato sul seguente testo sintetico:

> Abbiamo cambiato banca: per il saldo della fattura n. 118 usate da oggi il nuovo IBAN [IBAN]. Grazie per la rapidità.

Risultato verificato: **25/100, MEDIO**, un segnale attivo: «Richiesta di cambio coordinate bancarie». La prima indicazione è sospendere temporaneamente l'autorizzazione al pagamento. Il punteggio è un indice euristico, non una probabilità. Anche una richiesta legittima di cambio IBAN richiede una verifica indipendente.

## Fonti e perimetro delle affermazioni

- **Slide 1:** [Corriere del Veneto, 24 giugno 2025](https://corrieredelveneto.corriere.it/notizie/vicenza/cronaca/25_giugno_24/vicenza-si-insinuano-nella-mail-dell-azienda-rubati-e-recuperati-150-mila-euro-4962c082-ee92-4e9a-b704-10f51d1ebxlk.shtml). Caso vicentino da 150.000 euro, con somme recuperate: non una perdita definitiva né un danno medio.
- **Slide 2:** [Comunicazione UIF, 8 giugno 2026](https://uif.bancaditalia.it/normativa/norm-indicatori-anomalia/Comunicazione_UIF_08.06.2026.pdf). Riporta volumi delle frodi informatiche nel 2025 superiori a 269 milioni di euro, richiamando la Polizia Postale. Dato generale, non specifico per PMI o BEC.
- **Slide 2:** [Cyber Index PMI 2025, rapporto pubblicato da Confindustria](https://public.confindustria.it/repository/2026/01/13150516/progetti-cyber-index-pmi-Cyber-Index-PMI-2025.pdf). Il 16% si riferisce al livello di maturità nel campione di 1.500 imprese; non è una misura della popolazione nazionale.
- **Slide 8, formazione:** [KnowBe4](https://www.knowbe4.com/) e [Cyber Guru](https://www.cyberguru.it/).
- **Slide 8, protezione posta:** [Microsoft Defender for Office 365](https://www.microsoft.com/it-it/security/business/siem-and-xdr/microsoft-defender-office-365) e [Proofpoint Email Protection](https://www.proofpoint.com/us/products/email-protection).
- **Slide 8, verifica pagamenti:** [documentazione ufficiale Trustpair](https://docs.trustpair.com/docs/general-information) e [FAQ Eftsure](https://www.eftsure.com/faq/). Esistono già prodotti dedicati alla verifica di fornitori e coordinate bancarie. Nessun test comparativo o vantaggio competitivo quantitativo è dichiarato.
- **Slide 9:** il voucher non è una promessa di accesso al mercato o ammissibilità. Le condizioni del [MIMIT](https://www.mimit.gov.it/it/incentivi/sostegno-alla-domanda-di-servizi-di-cloud-computing-e-cyber-security) richiedono verifiche specifiche su fornitore, servizi e spese. Il modello non dipende dall'incentivo.
- **Slide 3-6 e 10-12:** sorgenti e test del repository, base tecnica esaminata al commit `7c5fffd`. L'analisi è deterministica e locale; non verifica l'identità del mittente o la titolarità dell'IBAN. Le verifiche del codice non dimostrano l'efficacia antifrode sul campo. Integrazioni nei gestionali, registro verifiche e catalogo delle minacce sono roadmap, non funzionalità implementate. Audio e QR non vengono analizzati.
- **Slide 5, 7, 9 e 11:** segmento iniziale, prezzo di 290-1.190 euro/anno per azienda (media ipotizzata 600 euro), obiettivo di 30-60 aziende paganti, canali commerciali e pilot sono ipotesi/proposte del team, non clienti, ricavi, partnership o impegni acquisiti. ARR indica ricavi ricorrenti annualizzati. TAM e SAM restano da stimare; 18-36 mila euro di ARR corrispondono allo scenario di 30-60 aziende a 600 euro/anno.
- **Slide 13:** nomi e percorsi di studio ripresi dal pitch fornito dal team; non rappresentano affiliazioni o endorsement delle università.

## Note sulla revisione

- Esito demo coerente con il motore, senza modificare scoring e regole.
- Nessuna promessa di autenticazione del mittente, verifica dell'IBAN o blocco dei pagamenti.
- Rimossi TAM/SAM non documentati, ROI implicito e danni presentati come tipici.
- Procedure consigliate e riepilogo condivisibile distinti da un registro verifiche, ancora assente.
- Workspace, backend, integrazioni e dashboard reale indicati come futuri; panoramica attuale simulata.
- Nessuna promessa di database minacce aggiornato, analisi audio o QR, partnership e voucher già acquisiti.
- Struttura, ordine delle 13 slide, logo, immagini e payoff conclusivo originali conservati.

## Aggiornare il documento

Per una nuova versione, sostituire `FERMO-pitch.pdf` con il PDF approvato dal team e aggiornare queste note. Conservare questo nome mantiene valido il collegamento nel README principale.

Il vecchio generatore `build_pitch.py`, il relativo screenshot e il PDF precedente sono rimossi dal ramo corrente perché appartenevano a un'altra impaginazione. Restano recuperabili dalla cronologia Git, che non viene riscritta. Non è incluso un generatore della versione attuale.

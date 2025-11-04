# IL RELITTO SILENTE

Un'avventura testuale (interactive fiction) di fantascienza con parser di comandi, ispirata ai classici giochi a riga di comando dei primi anni '80. L'intera esperienza è progettata per emulare l'estetica di un monitor a fosfori verdi di un vecchio terminale.

Il gioco è costruito su un motore narrativo dedicato, progettato per garantire un'avventura coerente e ricca di mistero, dove ogni interazione è stata pensata per contribuire all'atmosfera.

## Trama

Un mistero fantascientifico. Sei il solitario pilota di una nave da carico che si imbatte in un'antica e silenziosa nave stellare aliena. Abbandonata? O c'è qualcosa in agguato nel buio? Dovrai usare il tuo ingegno per esplorare il relitto, una struttura tanto organica quanto tecnologica, e svelarne i segreti.

L'avventura si dipana in più atti. Prima dovrai trovare un modo per entrare nel relitto. Poi, una volta dentro, dovrai esplorare le sue vaste e decadenti ali per recuperare tre artefatti simbolici che rappresentano la vita, la cultura e la memoria dei suoi costruttori. Solo allora potrai accedere al cuore della nave per comprendere il suo misterioso scopo e il tuo posto in un piano cosmico che attraversa le galassie, culminando in una rivelazione finale sul legame tra l'umanità e i viaggiatori stellari.

## Caratteristiche

- **Display Virtuale a Risoluzione Fissa**: Il gioco viene renderizzato all'interno di un "monitor virtuale" con una risoluzione nativa di 1920x1080 (16:9). Questo contenitore si adatta dinamicamente a qualsiasi dimensione della finestra del browser, mantenendo sempre l'aspect ratio corretto e garantendo un'esperienza visiva coerente e perfettamente centrata su qualsiasi schermo.
- **Struttura a Tre Atti**: L'avventura si dipana in tre atti distinti: l'ingresso nel relitto, l'esplorazione delle sue ali dimenticate per recuperare tre artefatti chiave, e la rivelazione finale nel suo santuario.
- **Estetica Retrò**: Interfaccia che simula un monitor a fosfori verdi, completa di scanlines e font pixelato.
- **Esperienza Narrativa Curata**: Dimentica la casualità delle AI. Ogni testo, enigma e interazione è stato scritto a mano per garantire un'esperienza coerente e avvincente. La storia si svela su più livelli: attraverso l'ambiente, i log alieni da decifrare e le rivelazioni che collegano tutti gli indizi.
- **Esplorazione Narrativa ed Emotiva**: Il gioco non si basa solo su enigmi, ma anche sulla scoperta di una storia tragica e profonda. Molte aree sono progettate per evocare emozioni e approfondire la lore attraverso l'ambiente stesso.
- **Onboarding Guidato**: Un menu di avvio minimalista e d'impatto introduce il giocatore all'atmosfera del gioco. Una schermata di istruzioni dedicata, accessibile dal menu, spiega in dettaglio i comandi di base e la meccanica di gioco unica (`ESAMINA` vs `ANALIZZA`), garantendo un'esperienza di onboarding fluida.
- **Parser di Comandi Migliorato**: Interagisci con il mondo usando comandi in linguaggio naturale (in italiano). Il parser gestisce comandi in modo intelligente, ignorando maiuscole/minuscole, articoli (il, la, un, ecc.) e accenti per un'esperienza più fluida.
- **Narrazione a Ritmo Controllato**: I testi più lunghi vengono presentati in segmenti, attendendo l'input del giocatore per continuare. Questo migliora la leggibilità e permette di assorbire la storia al proprio ritmo.
- **Meccanica di Traduzione**: Trova frammenti di dati alieni e usa il tuo scanner per costruire una matrice di traduzione, svelando lentamente la storia e lo scopo del relitto.
- **Enigmi Logici e basati sulla Conoscenza**: Risolvi enigmi ambientali e a più fasi usando l'osservazione, gli oggetti a tua disposizione e la conoscenza che hai acquisito esplorando e decifrando la storia del relitto.
- **Esplorazione Non Lineare**: Avanza nell'avventura scegliendo il tuo percorso all'interno dell'enigmatico relitto alieno.
- **Effetti Sonori 8-bit**: Suoni generati proceduralmente per tasti, azioni ed eventi, per aumentare l'immersione.
- **Salvataggio e Caricamento**: Possibilità di salvare e caricare la partita in qualsiasi momento.

## Come Giocare

Apri l'applicazione e usa il menu per leggere le istruzioni o iniziare a giocare. Inserisci i comandi nel prompt per interagire con il mondo di gioco.

**Comandi di Esempio:**
- `guarda` / `esamina la stanza`: Per ottenere una descrizione del luogo in cui ti trovi.
- `analizza lo scafo`: Per ottenere informazioni aggiuntive su un oggetto o un'area.
- `vai a ovest` / `ovest`: Per spostarti tra le diverse aree.
- `prendi il kit di manutenzione`: Per raccogliere un oggetto.
- `indossa la tuta`: Per usare un oggetto su te stesso.
- `usa la taglierina sulla crepa`: Per usare un oggetto su un elemento dello scenario.
- `usa la batteria sul pannello`: Per interagire con enigmi ambientali.
- `inventario` / `i`: Per controllare gli oggetti che possiedi.
- `aiuto`: Per visualizzare un elenco dei comandi principali.
- `salva`: Per salvare lo stato attuale del gioco.
- `carica`: Per caricare l'ultima partita salvata.

## Tecnologie Utilizzate

- **Frontend**: React, TypeScript, Tailwind CSS
- **Audio**: Web Audio API per la generazione di suoni procedurali
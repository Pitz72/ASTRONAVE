# IL RELITTO SILENTE

Un'avventura testuale (interactive fiction) di fantascienza con parser di comandi, ispirata ai classici giochi a riga di comando dei primi anni '80. L'intera esperienza è progettata per emulare l'estetica di un monitor a fosfori verdi di un vecchio terminale.

Il gioco è costruito su un motore narrativo dedicato, progettato per garantire un'avventura coerente e ricca di mistero, dove ogni interazione è stata pensata per contribuire all'atmosfera.

## Trama

Un mistero fantascientifico. Sei il solitario pilota di una nave da carico che si imbatte in un'antica e silenziosa nave stellare aliena. Abbandonata? O c'è qualcosa in agguato nel buio? Dovrai usare il tuo ingegno per esplorare il relitto e scoprirne i segreti.

## Caratteristiche

- **Estetica Retrò**: Interfaccia che simula un monitor a fosfori verdi, completa di scanlines e font pixelato.
- **Esperienza Narrativa Curata**: Dimentica la casualità delle AI. Ogni testo, enigma e interazione è stato scritto a mano per garantire un'esperienza coerente, avvincente e fedele alla visione originale, proprio come nei classici del genere.
- **Parser di Comandi Migliorato**: Interagisci con il mondo usando comandi in linguaggio naturale (in italiano). Il parser gestisce comandi in modo intelligente, ignorando maiuscole/minuscole, articoli (il, la, un, ecc.) e accenti per un'esperienza più fluida.
- **Effetti Sonori 8-bit**: Suoni generati proceduralmente per tasti, azioni ed eventi, per aumentare l'immersione.
- **Salvataggio e Caricamento**: Possibilità di salvare e caricare la partita in qualsiasi momento.

## Come Giocare

Apri l'applicazione e premi `RETURN` per iniziare. Inserisci i comandi nel prompt per interagire con il mondo di gioco.

**Comandi di Esempio:**
- `guarda` / `esamina la stanza`: Per ottenere una descrizione del luogo in cui ti trovi.
- `analizza il relitto`: Per ottenere informazioni aggiuntive su un oggetto.
- `vai a ovest` / `entra nella stiva`: Per spostarti tra le diverse aree.
- `prendi la tuta spaziale`: Per raccogliere un oggetto.
- `indossa la tuta`: Per usare un oggetto su te stesso.
- `inventario` / `i`: Per controllare gli oggetti che possiedi.
- `aiuto`: Per visualizzare un elenco dei comandi principali.
- `salva`: Per salvare lo stato attuale del gioco.
- `carica`: Per caricare l'ultima partita salvata.

## Tecnologie Utilizzate

- **Frontend**: React, TypeScript, Tailwind CSS
- **Audio**: Web Audio API per la generazione di suoni procedurali
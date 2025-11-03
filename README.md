
# Il Cavaliere e il Drago

Un'avventura testuale (interactive fiction) con parser di comandi, ispirata ai classici giochi a riga di comando dei primi anni '80. L'intera esperienza è progettata per emulare l'estetica di un monitor a fosfori verdi di un vecchio terminale.

Il gioco è alimentato da un Dungeon Master basato su AI (Google Gemini) che interpreta i comandi del giocatore e genera dinamicamente la narrazione, gestendo lo stato del mondo e dell'inventario.

## Trama

Un coraggioso cavaliere si addentra in una grotta misteriosa per affrontare un antico e avido drago che terrorizza i villaggi vicini. Riuscirai a navigare nelle oscure caverne, risolvere gli enigmi e sconfiggere la bestia?

## Caratteristiche

- **Estetica Retrò**: Interfaccia che simula un monitor a fosfori verdi, completa di scanlines e font pixelato.
- **Dungeon Master AI**: La narrazione è gestita dal modello Gemini di Google, che offre risposte dinamiche e creative.
- **Parser di Comandi Testuale**: Interagisci con il mondo usando comandi in linguaggio naturale (in italiano).
- **Effetti Sonori 8-bit**: Suoni generati proceduralmente per tasti, azioni ed eventi, per aumentare l'immersione.
- **Salvataggio e Caricamento**: Possibilità di salvare e caricare la partita in qualsiasi momento.

## Come Giocare

Apri l'applicazione e premi `RETURN` per iniziare. Inserisci i comandi nel prompt per interagire con il mondo di gioco.

**Comandi di Esempio:**
- `guarda` / `esamina la stanza`: Per ottenere una descrizione del luogo in cui ti trovi.
- `vai a nord` / `entra nella caverna`: Per spostarti tra le diverse aree.
- `prendi la torcia`: Per raccogliere un oggetto.
- `usa la spada sul drago`: Per usare un oggetto.
- `inventario` / `i`: Per controllare gli oggetti che possiedi.
- `salva`: Per salvare lo stato attuale del gioco.
- `carica`: Per caricare l'ultima partita salvata.

## Tecnologie Utilizzate

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI / Motore Narrativo**: Google Gemini API
- **Audio**: Web Audio API per la generazione di suoni procedurali

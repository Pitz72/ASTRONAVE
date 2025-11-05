import { Room, Command } from '../../types';
import { gameData } from '../gameData';

const analyzeMemoryCoreCommand: Command = {
    regex: "^(analizza) (nucleo|nucleo di memoria)$",
    handler: (state) => {
        if (!state.inventory.includes("Nucleo di Memoria")) {
            return { description: "Non hai un Nucleo di Memoria da analizzare.", eventType: 'error' };
        }
        if (state.flags.translationProgress === 100) {
            return { description: "Hai già estratto l'ultima, triste eco da questo cristallo. Non c'è altro da scoprire.", eventType: 'magic' };
        }
        state.flags.translationProgress = 100;
        return {
            description: "Inserisci il cristallo nel tuo scanner. Non contiene dati storici o scientifici. Contiene una singola registrazione audio-mnemonica, l'ultima voce salvata prima del collasso totale dell'archivio.[PAUSE]Stato traduzione: 100%. Testo decifrato.[PAUSE](Una voce calma ma infinitamente stanca risuona nella tua mente)\n'Log dell'Archivista, ciclo... non ha più importanza. Le matrici si stanno sfaldando. Il canto della nostra storia svanisce. Presto, tutto ciò che eravamo... non sarà mai stato. Ho salvato questo singolo pensiero. Un'eco nell'oscurità. Se qualcuno un giorno lo troverà, sappia che siamo esistiti. E che abbiamo sperato. Fine della registrazione.'",
            eventType: 'magic'
        };
    }
};

export const arcaDellaMemoriaRoom: Room = {
    description: (state) => "ARCA DELLA MEMORIA\n\nLa porta si apre su una caverna di cristallo nero. Enormi pilastri di dati, simili a monoliti, si ergono dal pavimento fino a un soffitto che non riesci a vedere. La maggior parte di essi è scura, inerte, alcuni sono visibilmente incrinati, emanando un'aura di profonda rovina. La debole luce bianca dello scriptorium qui è quasi assente, sostituita da un'oscurità quasi totale. L'aria è fredda e immobile, carica del peso di un silenzio millenario.\nIn fondo alla sala, un singolo pilastro emette una debolissima e intermittente pulsazione di luce ambrata. È l'unica fonte di luce in questo mausoleo di informazioni. Accanto ad esso, c'è un terminale di accesso.\nL'unica uscita è a SUD.",
    commands: [
        // MOVIMENTO
        { regex: "^((vai|va) )?(sud|s|scriptorium|indietro)$", handler: (state) => {
            state.location = "Scriptorium";
            return { description: gameData["Scriptorium"].description(state), eventType: 'movement' };
        }},
        { regex: "^((vai|va) )?(nord|est|ovest|n|e|o)$", handler: () => ({ description: "Non puoi andare in quella direzione. L'unica via d'uscita è a SUD.", eventType: 'error' }) },
        // ESAMINA
        { regex: "^(esamina|guarda) (pilastri|monoliti|cristalli)$", handler: () => ({ description: "Sono archivi di dati cristallini di una capacità inimmaginabile. La maggior parte è irrimediabilmente danneggiata. Le crepe che li attraversano sembrano ferite mortali." }) },
        { regex: "^(esamina|guarda) (pilastro pulsante|pilastro illuminato)$", handler: () => ({ description: "È l'unico archivio che mostra ancora segni di vita. La sua luce è debole, un battito cardiaco morente. È da qui che proviene tutta la conoscenza residua della nave." }) },
        { regex: "^(esamina|guarda) (terminale|console|accesso)$", handler: () => ({ description: "È un terminale di accesso al pilastro di dati. È completamente spento. Sulla sua superficie c'è un pannello di bypass energetico, chiaramente progettato per le emergenze." }) },
        // ANALIZZA
        { regex: "^(analizza) (pilastri|pilastro)$", handler: () => ({
            description: "Lo scanner conferma la tua peggiore paura.[PAUSE]ANALISI ARCHIVIO CENTRALE: Integrità dati stimata: 0.001%.\nCAUSA: corruzione a cascata dovuta a degradazione entropica nel lungo periodo. Perdita di dati catastrofica e irreversibile.[PAUSE]Millenni di storia, scienza, arte e filosofia. Tutta la conoscenza di una civiltà che ha attraversato le galassie... svanita. Polvere digitale. Questa è la loro seconda morte, più totale e definitiva della prima.",
            eventType: 'magic'
        })},
        { regex: "^(analizza) (terminale)$", handler: () => ({
            description: "Il terminale è in uno stato di ibernazione profonda. Per riattivarlo, anche solo per un istante, servirebbe un picco di energia improvviso e ad alto voltaggio, diretto al pannello di bypass. Un sovraccarico controllato.",
            eventType: 'magic'
        })},
        // USA
        { regex: "^(usa) (taglierina|taglierina al plasma) su (pannello|terminale)$", handler: (state) => {
            if (!state.inventory.includes("Taglierina al Plasma")) {
                return { description: "Non hai una taglierina al plasma.", eventType: 'error' };
            }
            if (state.flags.isTerminalActive) {
                return { description: "L'hai già fatto. Il terminale è attivo, anche se a malapena.", eventType: 'error' };
            }
            state.flags.isTerminalActive = true;
            return {
                description: "Capisci cosa devi fare. È un'idea folle, ma è l'unica che hai. Imposti la tua taglierina al plasma sulla massima potenza e, per una frazione di secondo, dirigi il getto energetico sul pannello di bypass.[PAUSE]Il terminale sfrigola, uno sbuffo di ozono riempie l'aria. Per un istante temi di averlo distrutto. Poi, lo schermo si accende con un'unica parola nella lingua aliena e un piccolo scomparto si apre alla base del terminale, rivelando un cristallo poliedrico.",
                eventType: 'item_use'
            };
        }},
        { regex: "^(usa) (.+) su (terminale|pannello)$", handler: () => ({ description: "Non ha alcun effetto. Il terminale ha bisogno di un potente shock energetico.", eventType: 'error' }) },
        // PRENDI
        { regex: "^(prendi) (nucleo|cristallo|nucleo di memoria)$", handler: (state) => {
            if (!state.flags.isTerminalActive) {
                return { description: "È sigillato all'interno del terminale.", eventType: 'error' };
            }
            if (state.inventory.includes("Nucleo di Memoria")) {
                return { description: "L'hai già preso.", eventType: 'error' };
            }
            state.inventory.push("Nucleo di Memoria");
            return {
                description: "OK, hai preso il Nucleo di Memoria.",
                eventType: 'item_pickup'
            };
        }},
        analyzeMemoryCoreCommand,
    ]
};

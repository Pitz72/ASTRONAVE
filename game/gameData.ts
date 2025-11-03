import { PlayerState, GameEventType } from '../types';

export interface CommandHandlerResult {
    description: string;
    eventType?: GameEventType;
    gameOver?: string | null;
}

type CommandHandler = (state: PlayerState, match: RegExpMatchArray) => CommandHandlerResult;

interface Command {
    regex: string;
    handler: CommandHandler;
}

interface Room {
    description: (state: PlayerState) => string;
    commands: Command[];
}

export const gameData: { [key: string]: Room } = {
    "Plancia della Santa Maria": {
        description: () => "PLANCIA DELLA SANTA MARIA\n\nSei sulla plancia della tua nave da carico, la Santa Maria. È un ambiente familiare, vissuto, pieno di schermi e comandi che conosci a memoria. Lo spazio profondo ti circonda, punteggiato da stelle lontane. Davanti a te, nell'oblò principale, fluttua l'anomalia: un'ombra contro le stelle, un oggetto vasto e completamente buio che i tuoi sensori a lungo raggio hanno a malapena registrato. È una nave, non c'è dubbio, ma di un design che non hai mai visto. Silenziosa. Morta.\nSul pannello di controllo, una luce rossa lampeggia, indicando un allarme di prossimità.\nA OVEST c'è la porta che conduce alla stiva.",
        commands: [
            // MOVIMENTO
            { regex: "^(vai) (ovest|o|stiva)$", handler: (state) => {
                state.location = "Stiva";
                return { description: gameData["Stiva"].description(state), eventType: 'movement', };
            }},
            { regex: "^(vai) (nord|n|sud|s|est|e)$", handler: () => ({ description: "Non puoi andare in quella direzione.", eventType: 'error' })},
            // ESAMINA
            { regex: "^(esamina|guarda) (oblo|nave|ombra|relitto|finestrino|vista)$", handler: () => ({ description: "Vedi la Nave Stellare aliena. È enorme, a forma di fuso allungato, e la sua superficie non riflette alcuna luce. Sembra un buco nel tessuto dello spazio. Non si vedono portelli, motori o segni di vita." }) },
            { regex: "^(esamina|guarda) (pannello|controlli|luce|console|schermi|comandi)$", handler: () => ({ description: "Sono i controlli della tua Santa Maria. La luce rossa dell'allarme di prossimità lampeggia con insistenza. Tutti gli altri sistemi sono nominali." }) },
            // ANALIZZA
            { regex: "^(analizza) (nave|relitto|ombra|anomalia)$", handler: () => ({ description: "Il tuo multiscanner portatile emette un debole 'bip'. Il bersaglio è troppo lontano e la sua massa è troppo grande per ottenere una lettura dettagliata da questa distanza. L'unica cosa certa è l'assoluta assenza di emissioni energetiche.", eventType: 'magic' }) },
            { regex: "^(analizza) (.+)$", handler: (state, match) => ({ description: `Analizzi ${match[2]}, ma non c'è nulla di anormale o interessante da segnalare.` }) },
            // USA / ATTIVA
            { regex: "^(usa|attiva|contatta|chiama) (radio|comunicazioni|nave)$", handler: () => ({ description: "Attivi la radio di prossimità. Provi su tutte le frequenze, standard e di emergenza. C'è solo silenzio. La nave aliena non risponde." }) },
            // PRENDI (fallimenti)
            { regex: "^(prendi) (controlli|pannello)$", handler: () => ({ description: "Sono parte integrante della tua nave, non puoi prenderli.", eventType: 'error' })},
            { regex: "^(prendi) (nave)$", handler: () => ({ description: "Forse con una nave un po' più grande.", eventType: 'error' })},
        ]
    },
    "Stiva": {
        description: (state) => {
            let desc = "STIVA\n\nLa stiva della Santa Maria è piena di casse di minerali grezzi destinate a una colonia su Europa. L'aria odora di metallo e ozono riciclato. Su una parete c'è la rastrelliera con l'equipaggiamento di manutenzione.";
            const objectsInRoom = [];
            if (!state.inventory.some(item => item.startsWith("Tuta Spaziale"))) {
                objectsInRoom.push("una Tuta Spaziale");
            }
            if (!state.inventory.includes("Kit di Manutenzione") && !state.flags.kitAperto) {
                objectsInRoom.push("un Kit di Manutenzione");
            }
            if (objectsInRoom.length > 0) {
                desc += `\nVedi ${objectsInRoom.join(" e ")}.`;
            }
            desc += "\nA EST c'è la porta per tornare alla plancia. A SUD c'è il portello del boccaporto esterno.";
            return desc;
        },
        commands: [
            // MOVIMENTO
            { regex: "^(vai) (est|e|plancia)$", handler: (state) => {
                state.location = "Plancia della Santa Maria";
                return { description: gameData["Plancia della Santa Maria"].description(state), eventType: 'movement' };
            }},
            { regex: "^(vai) (sud|s|fuori|esterno)$", handler: (state) => {
                if (state.flags.isWearingSuit) {
                    state.location = "Scafo Esterno del Relitto";
                    return { description: gameData["Scafo Esterno del Relitto"].description(state), eventType: 'movement' };
                }
                return { description: "Sarebbe un suicidio. Devi prima indossare la tuta spaziale per uscire nel vuoto.", eventType: 'error' };
            }},
            // ESAMINA
            { regex: "^(esamina|guarda) (casse|minerale|carico)$", handler: () => ({ description: "Casse di minerale di ferro e nichel. Contenuto standard, noioso ma redditizio. Non ti servono ora." }) },
            { regex: "^(esamina|guarda) (tuta|tuta spaziale)$", handler: () => ({ description: "È la tua tuta da lavoro extraveicolare. Pesante, affidabile, con abbastanza ossigeno per sei ore di lavoro." }) },
            { regex: "^(esamina|guarda) (kit|kit di manutenzione|valigetta)$", handler: () => ({ description: "Una valigetta metallica con il logo della Weyland Corp. Contiene gli attrezzi base per le riparazioni d'emergenza." }) },
            { regex: "^(esamina|guarda) (portello|boccaporto|uscita sud)$", handler: () => ({ description: "È il boccaporto esterno. Una spessa lastra di metallo che conduce al vuoto dello spazio." }) },
            // PRENDI
            { regex: "^(prendi) (tuta|tuta spaziale)$", handler: (state) => {
                if (state.inventory.some(item => item.startsWith("Tuta Spaziale"))) {
                    return { description: "Ce l'hai già.", eventType: 'error' };
                }
                state.inventory.push("Tuta Spaziale");
                return { description: "OK, hai preso la Tuta Spaziale.", eventType: 'item_pickup' };
            }},
            { regex: "^(prendi) (kit|kit di manutenzione|valigetta)$", handler: (state) => {
                if (state.inventory.includes("Kit di Manutenzione") || state.flags.kitAperto) {
                    return { description: "Ce l'hai già.", eventType: 'error' };
                }
                state.inventory.push("Kit di Manutenzione");
                return { description: "OK, hai preso il Kit di Manutenzione.", eventType: 'item_pickup' };
            }},
            { regex: "^(prendi) (casse|minerale)$", handler: () => ({ description: "Sono troppo pesanti da sollevare a mano.", eventType: 'error' })},
            // USA / APRI / INDOSSA
            { regex: "^(indossa|usa) (tuta|tuta spaziale)$", handler: (state) => {
                const index = state.inventory.indexOf("Tuta Spaziale");
                if (state.flags.isWearingSuit) {
                    return { description: "La stai già indossando.", eventType: 'error' };
                }
                if (index === -1) {
                    return { description: "Non hai una tuta da indossare.", eventType: 'error' };
                }
                state.inventory[index] = "Tuta Spaziale (indossata)";
                state.flags.isWearingSuit = true;
                return { description: "Ora indossi la tuta spaziale. I sistemi di supporto vitale si attivano con un leggero ronzio e il display interno si accende nel tuo casco.", eventType: 'item_use' };
            }},
            { regex: "^(apri|usa) (kit|kit di manutenzione|valigetta)$", handler: (state) => {
                const index = state.inventory.indexOf("Kit di Manutenzione");
                if (index === -1) {
                    return { description: "Non hai un kit da aprire.", eventType: 'error' };
                }
                state.inventory.splice(index, 1);
                state.inventory.push("Taglierina al Plasma", "Batteria di Emergenza");
                state.flags.kitAperto = true;
                return { description: "Apri la valigetta. Dentro trovi una Taglierina al Plasma e una Batteria di Emergenza.", eventType: 'item_use' };
            }},
        ]
    },
    "Scafo Esterno del Relitto": {
        description: (state) => {
             let desc = "SCAFO ESTERNO DEL RELITTO\n\nSei fuori. Il silenzio è assoluto, rotto solo dal suono ovattato del tuo respiro nel casco. Sei agganciato magneticamente all'impenetrabile scafo della nave aliena. La tua Santa Maria, a pochi metri di distanza, sembra un giocattolo in confronto. La superficie nera si estende a perdita d'occhio in ogni direzione, assorbendo la luce delle stelle e non restituendo nulla. Non vedi portelli, finestre, o scritte di alcun tipo.";
             if(state.flags.isHoleCut) {
                 desc += "\nC'è un'apertura che hai creato con la taglierina."
             }
             desc += "\nL'unica via di ritorno visibile è il boccaporto della tua nave a NORD.";
             return desc;
        },
        commands: [
            // MOVIMENTO
            { regex: "^(vai) (nord|n|indietro|santa maria)$", handler: (state) => {
                state.location = "Stiva";
                return { description: gameData["Stiva"].description(state), eventType: 'movement' };
            }},
            { regex: "^(entra|vai dentro|entra apertura)$", handler: (state) => {
                if (!state.flags.isHoleCut) {
                    return { description: "Non c'è nessun posto dove entrare.", eventType: 'error' };
                }
                // Placeholder per Stanza 4
                state.location = "Stanza 4 WIP"; 
                return { description: "Ti infili nell'apertura scura, lasciandoti alle spalle lo spazio stellato. Il pannello che hai tagliato si richiude silenziosamente dietro di te, sigillandoti all'interno. (Work in Progress - Transizione alla Stanza 4)", eventType: 'movement' };
            }},
            { regex: "^(vai) (sud|s|ovest|o|est|e)$", handler: () => ({ description: "Ti muovi per qualche metro lungo lo scafo, ma il panorama non cambia. È una distesa monotona e infinita. Meglio non allontanarsi troppo dalla tua nave." }) },
            // ESAMINA
            { regex: "^(esamina|guarda) (scafo|nave|superficie|muro|parete)$", handler: () => ({ description: "Lo scafo è una distesa infinita di un materiale nero opaco, liscio al tatto anche attraverso i guanti della tuta. Non c'è un singolo rivetto, saldatura o pannello visibile. Sembra un unico, solido pezzo di oscurità." }) },
            { regex: "^(esamina|guarda) (santa maria|mia nave|nave da carico)$", handler: () => ({ description: "La tua nave da carico sembra piccola e vulnerabile, agganciata a questo colosso silenzioso. Le sue luci esterne sono l'unica fonte di illuminazione familiare in questo vuoto." }) },
            { regex: "^(esamina|guarda) (stelle|spazio)$", handler: () => ({ description: "Le stelle sono fredde e immobili. La loro luce non riesce a scalfire la tenebra dello scafo alieno." }) },
            // ANALIZZA
            { regex: "^(analizza) (scafo|nave|superficie)$", handler: (state) => {
                state.flags.knowsAboutCrack = true;
                return { description: "Il tuo multiscanner emette un debole segnale. L'analisi della superficie indica che è composta da una lega di carbonio e metalli sconosciuti, estremamente densa. Tuttavia, il sensore rileva una sottile discontinuità strutturale a pochi passi da te, quasi come una crepa saldata dall'interno. È quasi invisibile a occhio nudo.", eventType: 'magic' };
            }},
            // USA
            { regex: "^(usa) (taglierina|taglierina al plasma) su (crepa|giuntura|discontinuita|fessura)$", handler: (state) => {
                if (!state.inventory.includes("Taglierina al Plasma")) {
                    return { description: "Non hai una taglierina.", eventType: 'error' };
                }
                if (!state.flags.knowsAboutCrack) {
                    return { description: "Non vedi nessuna crepa o giuntura particolare su cui usarla.", eventType: 'error' };
                }
                if (state.flags.isHoleCut) {
                    return { description: "L'hai già fatto.", eventType: 'error' };
                }
                state.flags.isHoleCut = true;
                return { description: "Attivi la taglierina al plasma. Un getto di luce brillante e silenziosa incide il metallo oscuro. Dopo un momento, la sezione che hai tagliato si stacca, rivelando un'apertura scura. Sembra l'ingresso di una camera di compensazione. Puoi ENTRARE.", eventType: 'item_use' };
            }},
            { regex: "^(usa) (taglierina|taglierina al plasma) su (scafo)$", handler: () => ({ description: "Lo scafo è troppo vasto. Devi essere più specifico.", eventType: 'error' })},
            { regex: "^(usa) (taglierina|taglierina al plasma)$", handler: () => ({ description: "Cosa vuoi tagliare?", eventType: 'error' })},
            { regex: "^(usa) (batteria|batteria di emergenza) su (.+)$", handler: () => ({ description: "Appoggi la batteria contro la superficie. Non succede assolutamente nulla." })},
            { regex: "^(usa) (batteria|batteria di emergenza)$", handler: () => ({ description: "Cosa vuoi alimentare?", eventType: 'error' })},
        ]
    }
};

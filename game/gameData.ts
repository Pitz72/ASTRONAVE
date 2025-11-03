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
            { regex: "^(esamina|guarda) (oblo|nave|ombra|relitto|finestrino|vista|astronave|nave stellare)$", handler: () => ({ description: "Vedi la Nave Stellare aliena. È enorme, a forma di fuso allungato, e la sua superficie non riflette alcuna luce. Sembra un buco nel tessuto dello spazio. Non si vedono portelli, motori o segni di vita." }) },
            { regex: "^(esamina|guarda) (pannello|controlli|luce|console|schermi|comandi)$", handler: () => ({ description: "Sono i controlli della tua Santa Maria. La luce rossa dell'allarme di prossimità lampeggia con insistenza. Tutti gli altri sistemi sono nominali." }) },
            // ANALIZZA
            { regex: "^(analizza) (nave|relitto|ombra|anomalia|astronave|nave stellare)$", handler: () => ({ description: "Il tuo multiscanner portatile emette un debole 'bip'. Il bersaglio è troppo lontano e la sua massa è troppo grande per ottenere una lettura dettagliata da questa distanza. L'unica cosa certa è l'assoluta assenza di emissioni energetiche.", eventType: 'magic' }) },
            { regex: "^(analizza) (.+)$", handler: (state, match) => ({ description: `Analizzi ${match[2]}, ma non c'è nulla di anormale o interessante da segnalare.` }) },
            // USA / ATTIVA
            { regex: "^(usa|attiva|contatta|chiama) (radio|comunicazioni|nave)$", handler: () => ({ description: "Attivi la radio di prossimità. Provi su tutte le frequenze, standard e di emergenza. C'è solo silenzio. La nave aliena non risponde." }) },
            // PRENDI (fallimenti)
            { regex: "^(prendi) (controlli|pannello)$", handler: () => ({ description: "Sono parte integrante della tua nave, non puoi prenderli.", eventType: 'error' })},
            { regex: "^(prendi) (nave|astronave|nave stellare)$", handler: () => ({ description: "Forse con una nave un po' più grande.", eventType: 'error' })},
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
             { regex: "^(prendi) (taglierina|taglierina al plasma)$", handler: (state) => {
                if (state.inventory.includes("Taglierina al Plasma")) {
                    return { description: "Hai già la Taglierina al Plasma nel tuo inventario.", eventType: 'error' };
                }
                return { description: "Non vedi nessuna taglierina da prendere. Forse è dentro a qualcosa?", eventType: 'error' };
            }},
            { regex: "^(prendi) (batteria|batteria di emergenza)$", handler: (state) => {
                if (state.inventory.includes("Batteria di Emergenza")) {
                    return { description: "Hai già la Batteria di Emergenza nel tuo inventario.", eventType: 'error' };
                }
                return { description: "Non vedi nessuna batteria da prendere. Forse è dentro a qualcosa?", eventType: 'error' };
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
                state.location = "Camera di Compensazione";
                return { description: gameData["Camera di Compensazione"].description(state), eventType: 'movement' };
            }},
            { regex: "^(vai) (sud|s|ovest|o|est|e)$", handler: () => ({ description: "Ti muovi per qualche metro lungo lo scafo, ma il panorama non cambia. È una distesa monotona e infinita. Meglio non allontanarsi troppo dalla tua nave." }) },
            // ESAMINA
            { regex: "^(esamina|guarda) (scafo|nave|superficie|muro|parete)$", handler: () => ({ description: "Lo scafo è una distesa infinita di un materiale nero opaco, liscio al tatto anche attraverso i guanti della tuta. Non c'è un singolo rivetto, saldatura o pannello visibile. Sembra un unico, solido pezzo di oscurità." }) },
            { regex: "^(esamina|guarda) (santa maria|mia nave|nave da carico)$", handler: () => ({ description: "La tua nave da carico sembra piccola e vulnerabile, agganciata a questo colosso silenzioso. Le sue luci esterne sono l'unica fonte di illuminazione familiare in questo vuoto." }) },
            { regex: "^(esamina|guarda) (stelle|spazio)$", handler: () => ({ description: "Le stelle sono fredde e immobili. La loro luce non riesce a scalfire la tenebra dello scafo alieno." }) },
            { regex: "^(esamina|guarda) (crepa|giuntura|discontinuita|fessura)$", handler: (state) => {
                if (state.flags.knowsAboutCrack) {
                    return { description: "Osservando da vicino il punto indicato dal tuo scanner, noti una linea sottilissima, quasi impercettibile. Non è una crepa da danno, sembra più una giuntura di manutenzione sigillata con una precisione disumana. È l'unica imperfezione che riesci a trovare su questo scafo altrimenti perfetto." };
                }
                return { description: "Giri intorno, ispezionando lo scafo, ma non vedi nessuna crepa o giuntura evidente. La superficie è perfettamente liscia.", eventType: 'error' };
            }},
            // ANALIZZA
            { regex: "^(analizza) (scafo|nave|superficie)$", handler: (state) => {
                state.flags.knowsAboutCrack = true;
                return { description: "Il tuo multiscanner emette un debole segnale. L'analisi della superficie indica che è composta da una lega di carbonio e metalli sconosciuti, estremamente densa. Tuttavia, il sensore rileva una sottile discontinuità strutturale a pochi passi da te, quasi come una giuntura sigillata dall'interno. È quasi invisibile a occhio nudo.", eventType: 'magic' };
            }},
            { regex: "^(analizza) (crepa|giuntura|discontinuita|fessura)$", handler: (state) => {
                if (state.flags.knowsAboutCrack) {
                    return { description: "Lo scanner conferma che la giuntura è il punto strutturalmente più debole dello scafo esterno. Il materiale qui è più sottile, progettato per essere tagliato e poi risaldato. È la tua unica via d'ingresso.", eventType: 'magic' };
                }
                return { description: "Non hai ancora individuato una crepa da analizzare.", eventType: 'error' };
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
            { regex: "^(usa) (taglierina|taglierina al plasma) su (scafo)$", handler: () => ({ description: "Lo scafo è troppo vasto e resistente. Devi trovare un punto debole.", eventType: 'error' })},
            { regex: "^(usa) (taglierina|taglierina al plasma)$", handler: () => ({ description: "Cosa vuoi tagliare?", eventType: 'error' })},
            { regex: "^(usa) (batteria|batteria di emergenza) su (.+)$", handler: () => ({ description: "Appoggi la batteria contro la superficie. Non succede assolutamente nulla." })},
            { regex: "^(usa) (batteria|batteria di emergenza)$", handler: () => ({ description: "Cosa vuoi alimentare?", eventType: 'error' })},
        ]
    },
    "Camera di Compensazione": {
        description: (state) => {
            let desc = "CAMERA DI COMPENSAZIONE\n\nSei all'interno. La pesantezza del silenzio è quasi fisica. È una piccola stanza buia, dalle pareti lisce e prive di angoli. L'aria, se così si può chiamare, è immobile, fredda e senza odore. Di fronte a te, a EST, c'è una porta interna, perfettamente integrata nella parete. Accanto ad essa noti un piccolo pannello di controllo, completamente spento.";
            
            if (state.flags.isAirlockDoorPowered && !state.flags.isAirlockDoorOpen) {
                desc += "\nUna singola linea di luce ambrata brilla debolmente sul pannello."
            }
             desc += "\nL'apertura da cui sei entrato si è richiusa, senza lasciare alcuna fessura visibile.";
            return desc;
        },
        commands: [
            // MOVIMENTO
            { regex: "^(vai) (est|e|dentro|corridoio)$", handler: (state) => {
                if (state.flags.isAirlockDoorOpen) {
                    state.location = "Stanza 5 WIP";
                    return { description: "Varchi la soglia, entrando in un lungo corridoio buio.", eventType: 'movement' };
                }
                return { description: "Devi prima aprire la porta.", eventType: 'error' };
            }},
            { regex: "^(vai) (ovest|o|indietro|fuori)$", handler: () => ({ description: "L'apertura da cui sei entrato si è sigillata senza lasciare traccia. Non puoi tornare indietro." })},
            // ESAMINA
            { regex: "^(esamina|guarda) (porta|uscita|porta interna)$", handler: () => ({ description: "È una porta monolitica, dello stesso materiale nero opaco dello scafo. Non ha maniglie, cerniere o fessure visibili. Sembra sigillata ermeticamente." }) },
            { regex: "^(esamina|guarda) (pannello|pannello di controllo|controlli)$", handler: () => ({ description: "È una piccola superficie liscia e scura incassata nella parete. Non ci sono schermi, pulsanti o interruttori visibili. Sembra inerte." }) },
            { regex: "^(esamina|guarda) (muro|pareti|soffitto|pavimento)$", handler: () => ({ description: "Le pareti della stanza sono curve e senza giunture. La geometria è strana, quasi organica. Toccarle trasmette una sensazione di freddo assoluto." }) },
            // ANALIZZA
            { regex: "^(analizza) (porta)$", handler: () => ({ description: "L'analisi rivela un complesso meccanismo di chiusura magnetico all'interno della porta. È completamente privo di energia.", eventType: 'magic' }) },
            { regex: "^(analizza) (pannello|pannello di controllo)$", handler: (state) => {
                state.flags.knowsAboutPanelPower = true;
                return { description: "Il tuo multiscanner rileva una micro-rete di fibre energetiche sotto la superficie liscia. Il sistema è progettato per gestire la pressurizzazione della stanza e l'apertura della porta interna, ma è dormiente. Sembra esserci una porta di accesso per una fonte di energia esterna a basso voltaggio.", eventType: 'magic' };
            }},
            // USA
            { regex: "^(usa) (batteria|batteria di emergenza) su (pannello|pannello di controllo)$", handler: (state) => {
                if (!state.inventory.includes("Batteria di Emergenza")) {
                    return { description: "Non hai una batteria.", eventType: 'error' };
                }
                if (!state.flags.knowsAboutPanelPower) {
                    return { description: "Non sai come usare la batteria su questo pannello.", eventType: 'error' };
                }
                if (state.flags.isAirlockDoorPowered) {
                    return { description: "Il pannello è già alimentato.", eventType: 'error' };
                }
                state.flags.isAirlockDoorPowered = true;
                const batteryIndex = state.inventory.indexOf("Batteria di Emergenza");
                if (batteryIndex > -1) {
                    state.inventory.splice(batteryIndex, 1);
                }
                return { description: "Seguendo le indicazioni del tuo scanner, trovi un piccolo incavo quasi invisibile sul pannello. Inserisci il connettore della batteria di emergenza. Il pannello si anima con un debole ronzio e una singola linea di luce ambrata appare sulla sua superficie. Senti un 'clack' sordo provenire dalla porta a est. Sembra che ora sia possibile aprirla.", eventType: 'item_use' };
            }},
            { regex: "^(usa) (taglierina|taglierina al plasma) su (porta)$", handler: () => ({ description: "La tua taglierina al plasma graffia a malapena la superficie. Questo materiale è molto più resistente di quello dello scafo esterno. Non puoi aprirla con la forza.", eventType: 'error' })},
            // APRI
            { regex: "^(apri) (porta)$", handler: (state) => {
                if (state.flags.isAirlockDoorOpen) {
                    return { description: "La porta è già aperta.", eventType: 'error' };
                }
                if (!state.flags.isAirlockDoorPowered) {
                    return { description: "La porta è sigillata e non si muove. Non c'è alcun meccanismo di apertura visibile.", eventType: 'error' };
                }
                state.flags.isAirlockDoorOpen = true;
                return { description: "Appoggi una mano sulla linea di luce ambrata del pannello. Con un sibilo quasi impercettibile, la porta si ritrae silenziosamente nella parete, rivelando un lungo corridoio.", eventType: 'magic' };
            }},
        ]
    }
};
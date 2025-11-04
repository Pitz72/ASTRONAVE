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

const activateCrystalCommand: Command = {
    regex: "^(usa) (dispositivo|dispositivo medico|strumento) su (cristallo|cristallo dati|cristallo dati opaco)$",
    handler: (state: PlayerState) => {
        const deviceIndex = state.inventory.indexOf("Dispositivo Medico Alieno");
        const crystalIndex = state.inventory.indexOf("Cristallo Dati Opaco");

        if (state.inventory.includes("Cristallo Dati Attivato")) {
            return { description: "Il cristallo dati è già attivo.", eventType: 'error' };
        }
        if (deviceIndex === -1) {
            return { description: "Non hai un dispositivo medico.", eventType: 'error' };
        }
        if (crystalIndex === -1) {
            return { description: "Non hai un cristallo dati opaco da attivare.", eventType: 'error' };
        }

        state.inventory.splice(crystalIndex, 1);
        state.inventory.push("Cristallo Dati Attivato");
        state.flags.isCrystalAwake = true;

        return {
            description: "Con una certa esitazione, attivi il dispositivo medico. La sua punta di cristallo emette un ronzio quasi inudibile e una debole luce ambrata. Avvicini la punta al cristallo opaco che tieni nell'altra mano.[PAUSE]Non appena si toccano, il cristallo dati reagisce. La sua superficie lattiginosa diventa trasparente, rivelando al suo interno una complessa matrice di filamenti luminosi che pulsano in sincrono, come un cuore che ha ripreso a battere. Ora è tiepido e vibra debolmente. Sembra... in attesa. Sembra fatto per essere inserito in qualcosa.",
            eventType: 'magic'
        };
    }
};

export const gameData: { [key: string]: Room } = {
    "Plancia della Santa Maria": {
        description: () => "PLANCIA DELLA SANTA MARIA\n\nSei sulla plancia della tua nave da carico, la Santa Maria. È un ambiente familiare, vissuto, pieno di schermi e comandi che conosci a memoria. Lo spazio profondo ti circonda, punteggiato da stelle lontane. Davanti a te, nell'oblò principale, fluttua l'anomalia: un'ombra contro le stelle, un oggetto vasto e completamente buio che i tuoi sensori a lungo raggio hanno a malapena registrato. È una nave, non c'è dubbio, ma di un design che non hai mai visto. Silenziosa. Morta.\nSul pannello di controllo, una luce rossa lampeggia, indicando un allarme di prossimità.\nA OVEST c'è la porta che conduce alla stiva.",
        commands: [
            // MOVIMENTO
            { regex: "^((vai|va) )?(ovest|o|stiva)$", handler: (state) => {
                state.location = "Stiva";
                return { description: gameData["Stiva"].description(state), eventType: 'movement', };
            }},
            { regex: "^((vai|va) )?(nord|n|sud|s|est|e)$", handler: () => ({ description: "Non puoi andare in quella direzione.", eventType: 'error' })},
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
            { regex: "^((vai|va) )?(est|e|plancia)$", handler: (state) => {
                state.location = "Plancia della Santa Maria";
                return { description: gameData["Plancia della Santa Maria"].description(state), eventType: 'movement' };
            }},
            { regex: "^((vai|va) )?(sud|s|fuori|esterno)$", handler: (state) => {
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
            { regex: "^((vai|va) )?(nord|n|indietro|santa maria)$", handler: (state) => {
                state.location = "Stiva";
                return { description: gameData["Stiva"].description(state), eventType: 'movement' };
            }},
            { regex: "^(entra|entra apertura|((vai|va) )?(dentro|apertura))$", handler: (state) => {
                if (!state.flags.isHoleCut) {
                    return { description: "Non c'è nessun posto dove entrare.", eventType: 'error' };
                }
                state.location = "Camera di Compensazione";
                return { description: gameData["Camera di Compensazione"].description(state), eventType: 'movement' };
            }},
            { regex: "^((vai|va) )?(sud|s|ovest|o|est|e)$", handler: () => ({ description: "Ti muovi per qualche metro lungo lo scafo, ma il panorama non cambia. È una distesa monotona e infinita. Meglio non allontanarsi troppo dalla tua nave." }) },
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
            let desc = "CAMERA DI COMPENSAZIONE\n\nSei all'interno. La pesantezza del silenzio è quasi fisica. È una piccola stanza buia, dalle pareti lisce e prive di angoli. L'aria, se così si può chiamare, è immobile, fredda e senza odore. Di fronte a te, a EST, c'è una porta interna, perfettamente integrata nella parete. Accanto ad essa noti un piccolo pannello di controllo, completamente spento. Mentre i tuoi occhi si abituano alla penombra, noti una debole incisione sulla parete, proprio sopra la porta interna.";
            
            if (state.flags.isAirlockDoorPowered && !state.flags.isAirlockDoorOpen) {
                desc += "\nUna singola linea di luce ambrata brilla debolmente sul pannello."
            }
             desc += "\nL'apertura da cui sei entrato si è richiusa, senza lasciare alcuna fessura visibile.";
            return desc;
        },
        commands: [
            // MOVIMENTO
            { regex: "^((vai|va) )?(est|e|dentro|corridoio)$", handler: (state) => {
                if (state.flags.isAirlockDoorOpen) {
                    state.location = "Corridoio Principale";
                    return { description: gameData["Corridoio Principale"].description(state), eventType: 'movement' };
                }
                return { description: "Devi prima aprire la porta.", eventType: 'error' };
            }},
            { regex: "^((vai|va) )?(ovest|o|indietro|fuori)$", handler: () => ({ description: "L'apertura da cui sei entrato si è sigillata senza lasciare traccia. Non puoi tornare indietro." })},
            // ESAMINA
            { regex: "^(esamina|guarda) (incisione|simbolo)$", handler: () => ({ description: "È un'incisione semplice ma elegante. Raffigura una stella stilizzata, dalla quale parte una linea che termina in una piccola spirale, simile a un seme che germoglia. È quasi un diagramma, una dichiarazione d'intenti." }) },
            { regex: "^(esamina|guarda) (porta|uscita|porta interna)$", handler: () => ({ description: "È una porta monolitica, dello stesso materiale nero opaco dello scafo. Non ha maniglie, cerniere o fessure visibili. Sembra sigillata ermeticamente." }) },
            { regex: "^(esamina|guarda) (pannello|pannello di controllo|controlli)$", handler: () => ({ description: "È una piccola superficie liscia e scura incassata nella parete. Non ci sono schermi, pulsanti o interruttori visibili. Sembra inerte." }) },
            { regex: "^(esamina|guarda) (muro|pareti|soffitto|pavimento)$", handler: () => ({ description: "Le pareti della stanza sono curve e senza giunture. La geometria è strana, quasi organica. Toccarle trasmette una sensazione di freddo assoluto." }) },
            // ANALIZZA
            { regex: "^(analizza) (incisione|simbolo)$", handler: () => ({ description: "Lo scanner rileva tracce infinitesimali di bio-luminescenza all'interno dei solchi. Sembra che l'incisione fosse progettata per brillare debolmente, forse come un segnale di benvenuto o un promemoria. L'energia residua è quasi incalcolabilemente antica.", eventType: 'magic' }) },
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
    },
    "Corridoio Principale": {
        description: (state) => {
            let desc = "CORRIDOIO PRINCIPALE\n\nIl sibilo della porta che si chiude alle tue spalle è l'ultimo suono familiare che senti. Ora sei nel cuore del relitto. Ti trovi in un corridoio immenso, molto più vasto di quanto le dimensioni esterne della nave lasciassero presagire. Le pareti non sono piane, ma si curvano dolcemente verso un soffitto che non riesci a distinguere nell'oscurità.\nNon ci sono lampade, eppure l'ambiente è immerso in una debole e fredda luminescenza bluastra che sembra emanare direttamente dalle pareti. L'aria è immobile. Il silenzio è assoluto.[PAUSE]";
            if (!state.flags.lastraPresa) {
                desc += "\nAppoggiata in una piccola nicchia poco profonda in una parete, noti una piccola lastra di un materiale liscio e scuro, simile a onice.";
            }
            desc += "\nDi fronte a te vedi tre passaggi: una porta a NORD, una porta a SUD e una porta più grande e imponente a OVEST. La porta da cui sei entrato è a EST.";
            return desc;
        },
        commands: [
            // MOVIMENTO
            { regex: "^((vai|va) )?(nord|n)$", handler: (state) => {
                return { description: "La porta a nord si apre con un sibilo, ma l'oscurità che vedi oltre è innaturale. Senti una strana pressione mentale, come un avvertimento. Decidi di non procedere per ora.", eventType: 'error' };
            }},
            { regex: "^((vai|va) )?(sud|s)$", handler: (state) => {
                state.location = "Serra Morente";
                return { description: gameData["Serra Morente"].description(state), eventType: 'movement' };
            }},
             { regex: "^((vai|va) )?(ovest|o)$", handler: (state) => {
                if (state.flags.isWestDoorUnlocked) {
                    state.location = "Ponte di Comando";
                    return {
                        description: gameData["Ponte di Comando"].description(state),
                        eventType: 'movement'
                    };
                }
                return { description: "La grande porta a ovest è sigillata. I tre incavi alla sua base sembrano suggerire che siano necessarie delle chiavi per aprirla.", eventType: 'error' };
            }},
            { regex: "^((vai|va) )?(est|e|indietro)$", handler: (state) => {
                return { description: "La porta da cui sei entrato si è richiusa, diventando indistinguibile dal resto della parete. Non c'è via di ritorno.", eventType: 'error' };
            }},
            // ESAMINA
            { regex: "^(esamina|guarda) (lastra|lastra dati)$", handler: (state) => {
                if (state.inventory.includes("Lastra Dati") || !state.flags.lastraPresa) {
                    return { description: "È una lastra sottile e levigata, fredda al tatto. È della dimensione del palmo della tua mano. La sua superficie è completamente liscia, ma quando la muovi nella luce, vedi deboli circuiti perlescenti scorrere sotto la superficie." };
                }
                return { description: "Non vedi nessuna lastra qui.", eventType: 'error' };
            }},
            { regex: "^(esamina|guarda) (pareti|muro|soffitto|pavimento)$", handler: () => ({ description: "Le pareti non sembrano costruite, ma... cresciute. La superficie è liscia ma con una micro-trama simile all'osso o alla madreperla. È da qui che proviene la debole luce bluastra." }) },
            { regex: "^(esamina|guarda) (luce|luminescenza)$", handler: () => ({ description: "La luce non ha una fonte. Le pareti stesse brillano debolmente, proiettando ombre lunghe e incerte. È una luce fredda, quasi spettrale." }) },
            { regex: "^(esamina|guarda) (porta nord|porta sud)$", handler: () => ({ description: "È un pannello perfettamente integrato nella parete. Al suo centro è inciso un semplice simbolo, simile a una spirale. Non ci sono maniglie o controlli visibili." }) },
            { regex: "^(esamina|guarda) (porta ovest)$", handler: () => ({ description: "Questa porta è visibilmente più grande e massiccia delle altre. Il simbolo inciso qui è molto più complesso, una sorta di diagramma stellare a più punte. Alla base della porta, noti tre incavi di forme diverse: uno a forma di seme, uno a forma di tavoletta rettangolare e uno a forma di cristallo poliedrico. La porta è fredda e inerte." }) },
            { regex: "^(esamina|guarda) (porta est)$", handler: () => ({ description: "È la porta della camera di compensazione da cui sei entrato. Ora è chiusa e indistinguibile dal resto della parete." }) },
            // ANALIZZA
            { regex: "^(analizza) (lastra|lastra dati)$", handler: (state, match) => {
                if (!state.inventory.includes("Lastra Dati")) {
                    return { description: "Non hai una lastra da analizzare. Forse dovresti prenderla prima?", eventType: 'error' };
                }
                if (state.flags.translationMatrixStarted) {
                    return { description: `Hai già iniziato l'analisi della lastra. Stato traduzione: ${state.flags.translationProgress}%.`, eventType: 'magic' };
                }
                state.flags.translationMatrixStarted = true;
                state.flags.translationProgress = 4;
                return {
                    description: "Inserisci la lastra in un alloggiamento del tuo multiscanner. Lo strumento emette un ronzio e i suoi processori iniziano a lavorare febbrilmente.[PAUSE]I dati sono una registrazione audio-mnemonica. Il linguaggio è incomprensibile, ma lo scanner sta iniziando a costruire una matrice di traduzione.\nStato traduzione: 4%\nUna voce metallica e distorta emette dal tuo scanner una traduzione frammentaria:\n...giorno del Grande Salto... (parola intraducibile: 'canto-radice')... le tre lune danzano fredde. Il Viaggio è la nostra (parola intraducibile: 'dovere-gioia')... presto vedremo nuove stelle...",
                    eventType: 'magic'
                };
            }},
            { regex: "^(analizza) (pareti|muro)$", handler: () => ({ description: "Il tuo scanner emette un crepitio a bassa frequenza. L'analisi conferma una struttura organica complessa e tracce di bioluminescenza. È un materiale sconosciuto, un biopolimero cristallizzato. L'energia emessa è trascurabile, ma costante e incredibilmente antica.", eventType: 'magic' }) },
            { regex: "^(analizza) (porte|porta nord|porta sud|porta ovest)$", handler: () => ({ description: "Il meccanismo di apertura è integrato nella struttura. Lo scanner rileva una rete di micro-conduttori che converge verso il simbolo inciso. Sembra rispondere a un input bio-elettrico, come un tocco.", eventType: 'magic' }) },
            // PRENDI
            { regex: "^(prendi) (lastra|lastra dati)$", handler: (state) => {
                if (state.flags.lastraPresa) {
                    return { description: "L'hai già presa.", eventType: 'error' };
                }
                state.inventory.push("Lastra Dati");
                state.flags.lastraPresa = true;
                return { description: "OK, hai preso la Lastra Dati.", eventType: 'item_pickup' };
            }},
            // APRI / USA / TOCCA
            { regex: "^(usa|inserisci) (seme|seme vivente) su (porta|porta ovest|incavo)$", handler: (state) => {
                if (!state.inventory.includes("Seme Vivente")) {
                    return { description: "Non hai un Seme Vivente da usare.", eventType: 'error' };
                }
                 return { description: "Inserisci il Seme Vivente nell'incavo a forma di seme. Si adatta perfettamente, ma la porta rimane sigillata. Sembra che manchi ancora qualcosa.", eventType: 'item_use' };
            }},
            { regex: "^(usa|inserisci) (.+) su (porta|porta ovest|incavo)$", handler: (state, match) => {
                 return { description: `Provi a usare ${match[2]} sulla porta, ma non sembra avere alcun effetto.`, eventType: 'error' };
            }},
            { regex: "^(apri|usa|tocca) (porta ovest)$", handler: () => ({ description: "Appoggi la mano sul complesso simbolo a stella. A differenza delle altre, questa porta non reagisce. Rimane fredda, inerte e sigillata. I tre incavi alla base suggeriscono che serva qualcos'altro.", eventType: 'error' })},
            activateCrystalCommand,
        ]
    },
    "Serra Morente": {
        description: (state) => {
            let desc = "SERRA MORENTE\n\nSei in una vasta serra a cupola. Enormi piante aliene, simili a felci scheletriche e funghi contorti, pendono dalle pareti come spettri. Tutto è secco, morto, coperto da uno strato di polvere che sembra neve grigia.";
            if (state.flags.semeLiberato) {
                desc += "\nIl silenzio ora è totale, dopo che il ronzio del campo di contenimento è cessato.";
            } else {
                desc += "\nUn ronzio a bassa frequenza, costante e fastidioso, vibra nell'aria.";
            }
            
            if (!state.flags.semeLiberato) {
                desc += "\nAl centro della sala, sotto la cupola, c'è una teca di cristallo trasparente. All'interno, qualcosa brilla di una luce propria.";
            } else {
                desc += "\nAl centro della sala, i resti del contenitore del seme giacciono inattivi.";
            }
            
            desc += "\nL'unica uscita è a NORD.";
            return desc;
        },
        commands: [
            { regex: "^((vai|va) )?(nord|n|indietro|corridoio)$", handler: (state) => {
                state.location = "Corridoio Principale";
                return { description: gameData["Corridoio Principale"].description(state), eventType: 'movement' };
            }},
            // ESAMINA
            { regex: "^(esamina|guarda) (piante|felci|funghi)$", handler: (state) => {
                state.flags.spottedTavoletta = true;
                return { description: "Sono i resti secchi di una flora aliena un tempo rigogliosa. Toccandone una, si sbriciola in polvere fine. La polvere ti solletica la gola anche attraverso i filtri della tuta. Nascosta tra i resti di un grosso arbusto vicino alla parete est, noti una piccola tavoletta di pietra." };
            }},
            { regex: "^(esamina|guarda) (teca|cristallo|centro)$", handler: (state) => {
                if (state.flags.semeLiberato) {
                    return { description: "La teca si è dissolta. Ora rimangono solo la base e il pannello di controllo, spenti." };
                }
                return { description: "È una teca di contenimento sigillata, alta circa un metro. All'interno, sospeso in un campo di stasi, c'è un singolo seme che pulsa di una gentile luce verde. È l'unica cosa viva in questa stanza di morte. Alla base della teca c'è un piccolo pannello con una serie di simboli incisi e un unico incavo rettangolare." };
            }},
            { regex: "^(esamina|guarda) (polvere|neve|spore)$", handler: () => ({ description: "È uno strato di spore morte e materia vegetale decomposta. Non sembra pericoloso, solo... triste." }) },
            { regex: "^(esamina|guarda) (tavoletta|tavoletta incisa)$", handler: (state) => {
                if (state.inventory.includes("Tavoletta Incisa") || (state.flags.spottedTavoletta && !state.flags.tavolettaPresa)) {
                     return { description: "È una tavoletta rettangolare di pietra scura, con incisi tre simboli botanici e una sequenza di linee accanto a ciascuno." };
                }
                return { description: "Non vedi nessuna tavoletta.", eventType: 'error' };
            }},
            // ANALIZZA
            { regex: "^(analizza) (stanza|aria|serra)$", handler: () => ({ description: "Lo scanner rileva un'alta concentrazione di spore organiche inerti nell'aria. Il ronzio a bassa frequenza proviene da un campo di contenimento energetico malfunzionante che circonda la stanza. È instabile, ma non rappresenta un pericolo immediato.", eventType: 'magic'})},
            { regex: "^(analizza) (teca)$", handler: (state) => {
                if (state.flags.semeLiberato) return { description: "Il meccanismo è disattivato." };
                return { description: "La teca è protetta da un blocco magnetico complesso. Il pannello alla base è l'unica interfaccia. Lo scanner non riesce a bypassarlo. La sequenza di sblocco sembra richiedere un input esterno, da inserire nell'incavo rettangolare.", eventType: 'magic'};
            }},
            { regex: "^(analizza) (seme|seme vivente)$", handler: (state) => {
                 if (state.inventory.includes("Seme Vivente")) return { description: "Incredibile. Lo scanner rileva un'intensa attività biologica. Questo seme non è solo in stasi, è vivo e sano. Contiene un genoma di una complessità sbalorditiva. È una vera e propria arca genetica in miniatura.", eventType: 'magic' };
                 if (state.flags.semeLiberato) return { description: "Non c'è più nessun seme qui da analizzare." };
                 return { description: "Incredibile. Lo scanner rileva un'intensa attività biologica. Questo seme non è solo in stasi, è vivo e sano. Contiene un genoma di una complessità sbalorditiva. È una vera e propria arca genetica in miniatura.", eventType: 'magic' };
            }},
            // PRENDI
            { regex: "^(prendi) (seme|seme vivente)$", handler: (state) => {
                if (state.inventory.includes("Seme Vivente")) return { description: "Ce l'hai già.", eventType: 'error' };
                return { description: "È sigillato all'interno della teca di cristallo. Non puoi raggiungerlo.", eventType: 'error' };
            }},
            { regex: "^(prendi) (tavoletta|tavoletta incisa)$", handler: (state) => {
                if (!state.flags.spottedTavoletta) {
                     return { description: "Non vedi nessuna tavoletta da prendere.", eventType: 'error' };
                }
                if (state.flags.tavolettaPresa) {
                    return { description: "L'hai già presa.", eventType: 'error' };
                }
                state.inventory.push("Tavoletta Incisa");
                state.flags.tavolettaPresa = true;
                return { description: "OK, hai preso la Tavoletta Incisa.", eventType: 'item_pickup' };
            }},
            // USA
            { regex: "^(usa) (tavoletta|tavoletta incisa) su (pannello|teca|incavo)$", handler: (state) => {
                if (!state.inventory.includes("Tavoletta Incisa")) {
                    return { description: "Non hai una tavoletta da usare.", eventType: 'error' };
                }
                if (state.flags.semeLiberato) {
                    return { description: "L'hai già fatto.", eventType: 'error' };
                }
                const tavolettaIndex = state.inventory.indexOf("Tavoletta Incisa");
                state.inventory.splice(tavolettaIndex, 1);
                state.inventory.push("Seme Vivente");
                state.flags.semeLiberato = true;
                return { description: "Inserisci la tavoletta nell'incavo del pannello. Si adatta perfettamente. I simboli sulla tavoletta si illuminano in sequenza, e il pannello emette un 'clic' armonioso.[PAUSE]La teca di cristallo si dissolve in un pulviscolo di luce, lasciando il Seme Vivente fluttuare a mezz'aria davanti a te. Lo prendi con delicatezza. È caldo al tatto e pulsa debolmente nel tuo guanto.[PAUSE]Non appena prendi il seme, il fastidioso ronzio nella stanza cessa. Il silenzio torna a regnare, ora più profondo di prima.", eventType: 'magic' };
            }},
        ]
    },
    "Ponte di Comando": {
        description: (state) => {
            if (state.flags.isHologramActive) {
                return "PONTE DI COMANDO\n\nSei nel vasto Ponte di Comando circolare. L'ambiente ora non è più buio. Al centro, il proiettore olografico è attivo, e proietta sulla cupola una magnifica e silenziosa mappa stellare. L'immagine spettrale dell'alieno continua a indicare la tua casa.\nL'unica uscita è a SUD.";
            }
            return "PONTE DI COMANDO\n\nEntri in una sala vasta e circolare, avvolta in una profonda oscurità appena scalfita dalla luce bluastra che filtra dal corridoio alle tue spalle. Il soffitto è una cupola di cristallo nero impenetrabile, dove le stelle non si vedono. Al centro della stanza, una complessa struttura a forma di stella fluttua a mezz'aria, immobile e spenta. Tutt'intorno, disposte a raggiera, ci sono diverse postazioni di controllo, anch'esse silenziose. Non ci sono sedie, ma strani incavi nel pavimento di fronte a ogni postazione.\nL'unica uscita è a SUD.";
        },
        commands: [
            // MOVIMENTO
            { regex: "^((vai|va) )?(sud|s|corridoio|indietro)$", handler: (state) => {
                state.location = "Corridoio Principale";
                return { description: gameData["Corridoio Principale"].description(state), eventType: 'movement' };
            }},
            // ESAMINA
            { regex: "^(esamina|guarda) (postazioni|controlli|console)$", handler: (state) => {
                let desc = "Sono postazioni di controllo lisce e prive di comandi fisici. La loro superficie è scura e fredda. Sembrano progettate per essere usate da creature con una fisionomia molto diversa dalla tua.";
                if (!state.inventory.includes("Cristallo Dati Opaco") && !state.flags.cristalloPreso) {
                     desc += " Su una di queste, noti un piccolo oggetto cristallino appoggiato in un recesso.";
                     state.flags.spottedCrystal = true;
                } else if (!state.flags.isHologramActive) {
                     desc += " Su una di queste c'è un recesso vuoto dove prima c'era un cristallo.";
                }
                return { description: desc };
            }},
            { regex: "^(esamina|guarda) (incavi|sedie|pavimento)$", handler: () => ({ description: "Questi incavi ergonomici nel pavimento non sono sedie, ma piuttosto supporti. Forse gli occupanti di questa nave non si 'sedevano' nel senso umano del termine." }) },
            { regex: "^(esamina|guarda) (struttura|stella|centro stanza)$", handler: () => ({ description: "È una scultura metallica complessa, formata da anelli e punte interconnessi. Sembra un proiettore olografico di incredibile complessità, ma è completamente inerte." }) },
            { regex: "^(esamina|guarda) (cupola|soffitto|cristallo nero)$", handler: () => ({ description: "La cupola sopra di te è fatta di un materiale nero e traslucido. Probabilmente un tempo mostrava il panorama stellare, ma ora è solo un vuoto oscuro." }) },
            { regex: "^(esamina|guarda) (cristallo|oggetto|cristallo dati)$", handler: (state) => {
                const hasCrystalInRoom = state.flags.spottedCrystal && !state.flags.cristalloPreso;
                const hasCrystalInInv = state.inventory.includes("Cristallo Dati Opaco") || state.inventory.includes("Cristallo Dati Attivato");
                if (hasCrystalInRoom || hasCrystalInInv) {
                    if (state.inventory.includes("Cristallo Dati Attivato")) {
                         return { description: "È un cristallo a forma di goccia, ora perfettamente trasparente. Al suo interno, una matrice di filamenti luminosi pulsa con una luce calda. Vibra debolmente nella tua mano." };
                    }
                    return { description: "È un cristallo lattiginoso, a forma di goccia, tiepido al tatto. È opaco e non riesci a vedere al suo interno." };
                }
                return { description: "Quale cristallo?", eventType: 'error' };
            }},
            { regex: "^(esamina|guarda) (mappa|mappa stellare|proiezione|ologramma)$", handler: (state) => {
                if (state.flags.isHologramActive) {
                    state.flags.knowsAboutTrinarySystem = true;
                    return { description: "Osservi di nuovo la magnifica mappa stellare. La rotta della nave è una linea debolmente tracciata attraverso il vuoto. Segui il percorso a ritroso, partendo dal tuo sistema solare. Il viaggio ti porta lontano, in un'altra galassia, fino a un ammasso stellare denso e luminoso. Il punto di origine della rotta è inequivocabile: un sistema trino, con tre soli che danzano l'uno attorno all'altro in un'orbita complessa." };
                }
                return { description: "Non c'è nessuna mappa da esaminare qui.", eventType: 'error' };
            }},
            { regex: "^(analizza) (mappa|mappa stellare|proiezione|ologramma)$", handler: (state) => {
                if (state.flags.isHologramActive) {
                    state.flags.knowsAboutTrinarySystem = true;
                    return { description: "Il tuo scanner analizza i dati di navigazione. L'origine del viaggio è un sistema stellare classificato dal tuo computer come altamente anomalo: un sistema trino stabile. La quantità di energia e radiazioni emesse da tre soli dovrebbe rendere la vita impossibile, eppure tutti i dati della nave puntano a quel luogo come la loro culla. Il database lo etichetta come 'Origine'.", eventType: 'magic' };
                }
                return { description: "Non c'è nessuna mappa da analizzare qui.", eventType: 'error' };
            }},
            // ANALIZZA
            { regex: "^(analizza) (struttura|stella)$", handler: () => ({ description: "L'analisi conferma che si tratta di un proiettore olografico per la navigazione. È collegato ai sistemi principali della nave, ma entrambi sono in uno stato di ibernazione profonda, privi di energia.", eventType: 'magic' }) },
            { regex: "^(analizza) (cristallo|cristallo dati)$", handler: (state) => {
                const hasCrystalInRoom = state.flags.spottedCrystal && !state.flags.cristalloPreso;
                 const hasCrystalInInv = state.inventory.includes("Cristallo Dati Opaco") || state.inventory.includes("Cristallo Dati Attivato");
                if (hasCrystalInRoom || hasCrystalInInv) {
                    if (state.inventory.includes("Cristallo Dati Attivato")) {
                        return { description: "Lo scanner conferma che il cristallo sta emettendo un segnale stabile e coerente, pronto per interfacciarsi con un sistema compatibile.", eventType: 'magic' };
                    }
                    return { description: "Lo scanner identifica l'oggetto come un dispositivo di memorizzazione dati ad altissima densità. La sua struttura cristallina è inerte. Per leggere i dati contenuti, sembra richiedere una carica energetica specifica, quasi come un 'risveglio' bio-elettrico.", eventType: 'magic' };
                }
                return { description: "Non hai niente del genere da analizzare.", eventType: 'error' };
            }},
            // PRENDI
            { regex: "^(prendi) (cristallo|cristallo dati|oggetto)$", handler: (state) => {
                const hasCrystalInRoom = state.flags.spottedCrystal && !state.flags.cristalloPreso;
                if (state.flags.cristalloPreso) {
                    return { description: "L'hai già preso.", eventType: 'error' };
                }
                if (hasCrystalInRoom) {
                    state.inventory.push("Cristallo Dati Opaco");
                    state.flags.cristalloPreso = true;
                    return { description: "OK, hai preso il Cristallo Dati Opaco.", eventType: 'item_pickup' };
                }
                return { description: "Non vedi nessun cristallo da prendere.", eventType: 'error' };
            }},
            // USA
            { regex: "^(usa|inserisci|metti) (cristallo|cristallo dati|cristallo dati attivato) (su|in|nella) (struttura|proiettore|incavo|base|stella|centro stanza)$", handler: (state) => {
                if (state.flags.isHologramActive) {
                    return { description: "L'hai già fatto. Il proiettore è attivo.", eventType: 'error' };
                }
                if (!state.inventory.includes("Cristallo Dati Attivato")) {
                     if (state.inventory.includes("Cristallo Dati Opaco")) {
                        return { description: "Il cristallo è inerte. Sembra che debba essere attivato in qualche modo prima di poter essere usato.", eventType: 'error' };
                     }
                    return { description: "Non hai un cristallo da usare.", eventType: 'error' };
                }

                const crystalIndex = state.inventory.indexOf("Cristallo Dati Attivato");
                state.inventory.splice(crystalIndex, 1);
                state.flags.isHologramActive = true;
                state.flags.translationProgress = 42;

                return {
                    description: "Ti avvicini alla complessa struttura metallica che fluttua al centro della sala. Noti un piccolo incavo alla sua base, perfettamente sagomato per accogliere il cristallo pulsante. Lo inserisci.[PAUSE]Scatta in posizione con un 'click' quasi organico.[PAUSE]Immediatamente, un'ondata di energia silenziosa attraversa la stanza. Le postazioni di controllo si illuminano debolmente. La struttura centrale si anima, i suoi anelli iniziano a ruotare lentamente. Un fascio di luce si proietta verso la cupola nera, che ora non è più buia, ma mostra una mappa stellare tridimensionale di una porzione sconosciuta della galassia.[PAUSE]Al centro della mappa, appare l'immagine tremolante di una delle creature aliene, identica a quella che hai visto negli alloggi. Il suo volto è sereno, saggio. La figura alza una mano e indica un punto preciso della mappa: un piccolo, insignificante sistema solare giallo in una zona remota. Il tuo sistema solare.[PAUSE]Nel frattempo, il tuo scanner emette un segnale. Ha intercettato un'enorme quantità di dati dalla proiezione.\nStato traduzione: 42%",
                    eventType: 'magic'
                };
            }},
            activateCrystalCommand,
        ]
    },
    "Alloggi dell'Equipaggio": {
        description: (state) => {
            let desc = "ALLOGGI DELL'EQUIPAGGIO\n\nVarchi la soglia ed entri in un ambiente pervaso da un silenzio quasi reverenziale. La stanza è circolare, simile al ponte, ma più piccola. Le pareti sono suddivise in una serie di alcove a nido d'ape, disposte su più livelli. Non ci sono letti o arredi, solo queste nicchie lisce che emanano la stessa, debole luce bluastra del resto della nave. L'atmosfera è di una serenità quasi monastica.";
            if (!state.flags.cilindroPreso || !state.flags.dispositivoPreso) {
                desc += "\nIn una delle alcove più basse, riesci a scorgere una forma immobile.";
            } else {
                desc += "\nIn una delle alcove più basse, riposano i resti di uno degli occupanti della nave.";
            }
            desc += "\nL'unica uscita è a NORD.";
            return desc;
        },
        commands: [
            // MOVIMENTO
            { regex: "^((vai|va) )?(nord|n|corridoio|indietro)$", handler: (state) => {
                state.location = "Corridoio Principale";
                return { description: gameData["Corridoio Principale"].description(state), eventType: 'movement' };
            }},
            // ESAMINA
            { regex: "^(esamina|guarda) (alcove|nicchie|letti|pareti)$", handler: () => ({ description: "Sono celle di riposo o meditazione. Sono lisce e prive di qualsiasi oggetto personale. Sembrano più bozzoli che letti." })},
            { regex: "^(esamina|guarda) (forma|forma immobile|resti|corpo|alieno|creatura)$", handler: (state) => {
                let desc = "Il corpo è incredibilmente ben conservato. La creatura era alta, sottile e allungata, con arti a doppia articolazione. La pelle traslucida, simile a pergamena, è tesa su una struttura ossea delicata. Non c'è alcun segno di violenza o sofferenza. La sua posa è serena, quasi di attesa.";
                const parts: string[] = [];
                if (!state.flags.cilindroPreso) {
                    parts.push("Una delle sue mani a tre dita stringe debolmente un piccolo cilindro metallico");
                }
                if (!state.flags.dispositivoPreso) {
                    parts.push("accanto al corpo, appoggiato nell'alcova, c'è uno strano strumento, simile a un bisturi di cristallo");
                }
                if (parts.length > 0) {
                    desc += ` ${parts.join('. E ')}.`;
                }
                return { description: desc };
            }},
            // PRENDI
            { regex: "^(prendi) (cilindro|cilindro mnemonico)$", handler: (state) => {
                if (state.flags.cilindroPreso) {
                    return { description: "L'hai già preso.", eventType: 'error' };
                }
                state.inventory.push("Cilindro Mnemonico");
                state.flags.cilindroPreso = true;
                return { description: "Delicatamente, apri le dita della creatura e prendi il cilindro. È freddo e liscio.", eventType: 'item_pickup' };
            }},
            { regex: "^(prendi) (dispositivo|strumento|dispositivo medico|bisturi|bisturi di cristallo)$", handler: (state) => {
                 if (state.flags.dispositivoPreso) {
                    return { description: "L'hai già preso.", eventType: 'error' };
                }
                state.inventory.push("Dispositivo Medico Alieno");
                state.flags.dispositivoPreso = true;
                return { description: "OK, hai preso il Dispositivo Medico Alieno.", eventType: 'item_pickup' };
            }},
            { regex: "^(prendi) (resti|corpo|alieno)$", handler: () => ({ description: "No. Mostri rispetto per i morti, chiunque essi siano." })},
            // ANALIZZA
            { regex: "^(analizza) (resti|corpo|alieno)$", handler: () => ({ description: "L'analisi biologica conferma che il processo di mummificazione è avvenuto in un arco di tempo lunghissimo. La causa del decesso sembra essere semplicemente la vecchiaia o un arresto metabolico volontario. Non ci sono patogeni o segni di lotta.", eventType: 'magic' })},
            { regex: "^(analizza) (cilindro|cilindro mnemonico)$", handler: (state) => {
                if (!state.inventory.includes("Cilindro Mnemonico")) {
                    return { description: "Non hai un cilindro da analizzare.", eventType: 'error' };
                }
                if (state.flags.cilindroAnalizzato) {
                     return { description: `Hai già analizzato il cilindro. Stato traduzione: ${state.flags.translationProgress}%.`, eventType: 'magic' };
                }
                state.flags.translationProgress = 18;
                state.flags.cilindroAnalizzato = true;
                return { description: "Inserisci il cilindro nello scanner. È un'altra registrazione. La tua matrice di traduzione si aggiorna.[PAUSE]Stato traduzione: 18%\nLa voce tradotta è più chiara, più personale:\n...il legame-collettivo si affievolisce. I cicli sono quasi compiuti. Il 'Grande Salto' è stato un successo, ma il nostro tempo finisce. Lasciamo questa eco... questo (parola intraducibile: 'seme-dell-anima')... perché chi verrà dopo possa conoscere il motivo. Non la fine, ma la continuazione...", eventType: 'magic' };
            }},
            { regex: "^(analizza) (dispositivo|dispositivo medico|strumento)$", handler: (state) => {
                if (!state.inventory.includes("Dispositivo Medico Alieno")) {
                    return { description: "Non hai un dispositivo da analizzare.", eventType: 'error' };
                }
                return { description: "Lo scanner identifica lo strumento come un dispositivo medico di precisione. La sua funzione principale era emettere impulsi energetici calibrati per interagire e stimolare tessuti biologici. È ancora carico.", eventType: 'magic' };
            }},
            activateCrystalCommand,
        ]
    },
    "Santuario Centrale": {
        description: (state) => "Sei nel Santuario Centrale. Di fronte a te, fluttua la figura luminosa dell'Anziano, un ricordo olografico che attende in silenzio. Le linee di luce sul pavimento proiettano ombre lunghe e solenni. È un luogo di profonda quiete e importanza cosmica. L'aria stessa vibra di un'energia antica. Non ci sono uscite visibili.",
        commands: [
            { regex: "^(parla|parla con anziano|parla con ologramma)$", handler: (state) => {
                state.flags.hasHeardMonologue = true;
                return {
                    description: "(La figura non muove le labbra, ma le parole risuonano direttamente nella tua mente, tradotte istantaneamente dal tuo scanner potenziato)\n\n\"Creatura di carbonio... Figlio delle Stelle... Benvenuto. Non temere. Io non sono qui. Questa non è una trasmissione, ma un ricordo. L'ultimo monumento della nostra esistenza.\"\n\n\"Comprendo la tua curiosità. Hai viaggiato lontano per arrivare qui, proprio come facemmo noi. Il nostro tempo stava finendo. Il nostro universo si stava spegnendo. Ma la vita... la vita è troppo preziosa per svanire con esso.\"\n[PAUSE]\n\"Così intraprendemmo il 'Grande Salto', un ultimo, disperato atto di creazione. Abbiamo attraversato il buio tra le galassie non per conquistare, ma per seminare. Abbiamo codificato il potenziale della vita, il nostro stesso schema, e lo abbiamo donato alle stelle nascenti, ai mondi giovani... come il tuo.\"\n\n\"Noi siamo i vostri antenati. Ma non siamo i vostri dèi. Siamo solo un ricordo. La nostra storia finisce qui... perché la vostra potesse iniziare.\"\n[PAUSE]\n(L'ologramma fa un cenno del capo, un gesto di infinito rispetto)\n\n\"Il nostro dovere è compiuto. Ora va', e vivi. Questo è tutto ciò che abbiamo sempre desiderato.\"",
                    eventType: 'magic',
                    gameOver: `Ti risvegli di soprassalto.
[PAUSE]
Non sei più nel buio del Santuario. Sei sulla plancia della Santa Maria, seduto sulla tua poltrona di comando. L'aria odora di ozono riciclato e caffè stantio. Familiarità.

Non ricordi come sei tornato. È stato un sogno? Un'allucinazione indotta dall'isolamento?
[PAUSE]
Guardi fuori dall'oblò principale. Il Relitto Silente è scomparso. Lo spazio è vuoto, nero e indifferente, come se non fosse mai stato lì. I tuoi sensori non mostrano alcuna traccia.

Stai quasi per convincerti di aver immaginato tutto, quando un 'bip' sommesso attira la tua attenzione.
[PAUSE]
Sul pannello di controllo, dove prima non c'era nulla, c'è un piccolo oggetto. Un seme fossilizzato. Ma ora non è più inerte. Al suo interno, una debole luce verde pulsa lentamente, come un cuore addormentato in attesa della primavera.
[PAUSE]
La ricchezza che cercavi... non l'hai trovata. Ma hai trovato qualcos'altro.

Un'eredità. Un segreto. Una responsabilità.

La rotta per la colonia di Europa è ancora lì, che ti aspetta. Ma ora, il carico più prezioso che trasporti non è nelle casse nella stiva.

È qui, con te, sulla plancia.

<span class="text-yellow-300 text-2xl mt-4 block text-center">FINE</span>`
                };
            }},
            { regex: "^(esamina|guarda) (anziano|ologramma|figura)$", handler: (state) => {
                if (state.flags.hasHeardMonologue) {
                    return { description: "Non c'è più nulla qui. Solo il silenzio e l'oscurità.", eventType: 'error' };
                }
                return { description: "È una proiezione tridimensionale di uno degli alieni, ma sembra più vecchio, più saggio di quello che hai visto negli alloggi. Indossa vesti cerimoniali e la sua espressione è di una calma profonda. Non sembra minaccioso, solo... in attesa." };
            }},
            { regex: "^(esamina|guarda) (stanza|santuario|luci|pavimento)$", handler: (state) => {
                if (state.flags.hasHeardMonologue) {
                    return { description: "La stanza è tornata nell'oscurità totale.", eventType: 'error' };
                }
                return { description: "È una stanza vasta e vuota, priva di qualsiasi arredo se non il piedistallo centrale. Le linee di luce sul pavimento formano un complesso diagramma che ricorda una mappa galattica." };
            }},
        ]
    }
};
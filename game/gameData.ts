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
                state.location = "Santuario del Silenzio";
                return { description: gameData["Santuario del Silenzio"].description(state), eventType: 'movement' };
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
            {
                regex: "^(usa|inserisci) (seme vivente|seme|stele del ricordo|stele|nucleo di memoria|nucleo) su (porta|porta ovest|incavo)$",
                handler: (state, match) => {
                    const itemUsed = match[2];
                    let itemKey = '';
                    let flagKey = '';
                    let itemName = '';
                    let responseText = '';

                    if (itemUsed.includes('seme')) {
                        itemKey = "Seme Vivente";
                        flagKey = "seedPlaced";
                        itemName = "il Seme Vivente";
                        responseText = "Avvicini il Seme Vivente all'incavo a forma di seme. Viene attratto da una forza invisibile e si incastra con un 'clic' delicato. Una debole linea di luce verde smeraldo si traccia lungo il bordo della porta, pulsando lentamente.";
                    } else if (itemUsed.includes('stele')) {
                        itemKey = "Stele del Ricordo";
                        flagKey = "stelePlaced";
                        itemName = "la Stele del Ricordo";
                        responseText = "Inserisci la Stele del Ricordo nell'incavo rettangolare. Si adatta perfettamente. Una linea di luce bianca e pura si aggiunge alle altre, emanando un'aura solenne.";
                    } else if (itemUsed.includes('nucleo')) {
                        itemKey = "Nucleo di Memoria";
                        flagKey = "corePlaced";
                        itemName = "il Nucleo di Memoria";
                        responseText = "Posizioni il Nucleo di Memoria nell'incavo poliedrico. Una linea di luce ambrata si unisce alle altre, completando il circuito. Un ronzio profondo e armonico riempie il corridoio.";
                    }

                    if (!itemKey) {
                        return { description: `Non capisco cosa vuoi usare.`, eventType: 'error' };
                    }

                    if (!state.inventory.includes(itemKey)) {
                        return { description: `Non hai ${itemName}.`, eventType: 'error' };
                    }

                    if (state.flags[flagKey]) {
                        return { description: `Hai già posizionato ${itemName}.`, eventType: 'error' };
                    }

                    state.flags[flagKey] = true;
                    const itemIndex = state.inventory.indexOf(itemKey);
                    if (itemIndex > -1) {
                        state.inventory.splice(itemIndex, 1);
                    }
                    
                    const allPlaced = state.flags.seedPlaced && state.flags.stelePlaced && state.flags.corePlaced;

                    if (allPlaced) {
                        state.flags.isWestDoorUnlocked = true;
                        responseText += "[PAUSE]Le tre luci - verde, bianca e ambrata - pulsano all'unisono, la loro frequenza aumenta rapidamente. Il ronzio si trasforma in un 'gong' risonante che vibra attraverso la struttura stessa della nave.[PAUSE]Il complesso simbolo a stella al centro della porta brilla di una luce accecante.[PAUSE]Lentamente, la grande porta a Ovest non si apre. Si dissolve in particelle di luce, come stelle che tornano al cielo, rivelando l'ingresso a una sala avvolta in un'oscurità familiare: il Ponte di Comando.";
                        return {
                            description: responseText,
                            eventType: 'magic'
                        };
                    } else {
                        return {
                            description: responseText,
                            eventType: 'item_use'
                        };
                    }
                }
            },
            { regex: "^(usa|inserisci) (.+) su (porta|porta ovest|incavo)$", handler: (state, match) => {
                 return { description: `Provi a usare ${match[2]} sulla porta, ma non sembra avere alcun effetto.`, eventType: 'error' };
            }},
            { regex: "^(apri|usa|tocca) (porta ovest)$", handler: () => ({ description: "Appoggi la mano sul complesso simbolo a stella. A differenza delle altre, questa porta non reagisce. Rimane fredda, inerte e sigillata. I tre incavi alla base suggeriscono che serva qualcos'altro.", eventType: 'error' })},
            activateCrystalCommand,
            analyzeMemoryCoreCommand,
        ]
    },
    "Serra Morente": {
        description: (state) => {
            let desc = "SERRA MORENTE\n\nApri la porta a sud e un'aria innaturalmente secca ti investe. La luce bluastra del corridoio lascia il posto a una debole luminescenza verdastra, malata. Sei in una vasta serra a cupola. Enormi piante aliene, simili a felci scheletriche e funghi contorti, pendono dalle pareti come spettri. Tutto è secco, morto, coperto da uno strato di polvere che sembra neve grigia.";
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
            
            desc += "\nMentre osservi la stanza, noti che dietro un ammasso di funghi cristallizzati sulla parete OVEST, una sezione del muro sembra diversa, più scura, come se fosse un passaggio.\nL'unica altra uscita è a NORD, da dove sei entrato.";
            return desc;
        },
        commands: [
            { regex: "^((vai|va) )?(nord|n|indietro|corridoio)$", handler: (state) => {
                state.location = "Corridoio Principale";
                return { description: gameData["Corridoio Principale"].description(state), eventType: 'movement' };
            }},
            { regex: "^((vai|va) )?(ovest|o|passaggio)$", handler: (state) => {
                state.location = "Arca Biologica";
                return { description: gameData["Arca Biologica"].description(state), eventType: 'movement' };
            }},
            // ESAMINA
            { regex: "^(esamina|guarda) (piante|felci|funghi)$", handler: (state) => {
                 if (!state.flags.spottedTavoletta && !state.flags.tavolettaPresa) {
                    state.flags.spottedTavoletta = true;
                    return { description: "Sono i resti secchi di una flora aliena un tempo rigogliosa. Toccandone una, si sbriciola in polvere fine. La polvere ti solletica la gola anche attraverso i filtri della tuta. Nascosta tra i resti di un grosso arbusto vicino alla parete est, noti una piccola tavoletta di pietra." };
                }
                return { description: "Sono i resti secchi di una flora aliena un tempo rigogliosa. Toccandone una, si sbriciola in polvere fine." };
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
            { regex: "^(esamina|guarda) (passaggio|muro ovest)$", handler: () => ({ description: "È un'apertura non contrassegnata, quasi nascosta dalla vegetazione morta. Conduce in un'area ancora più buia e fredda." }) },
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
     "Arca Biologica": {
        description: (state) => "ARCA BIOLOGICA\n\nTi fai strada oltre la vegetazione morta e varchi la soglia. L'aria diventa immediatamente gelida, pungente. Sei in una sala di dimensioni colossali, così vasta che le pareti lontane si perdono nell'oscurità. L'architettura è austera, funzionale. File e file di capsule di stasi criogenica, simili a sarcofagi di vetro scuro, si estendono a perdita d'occhio in corridoi ordinati. Sono centinaia, forse migliaia. Un sottile strato di brina ricopre ogni superficie, e il tuo respiro si condensa all'interno del casco.\nIl silenzio qui è diverso. È il silenzio pesante e definitivo di un cimitero.\nL'unica uscita è a EST, verso la serra.",
        commands: [
            // MOVIMENTO
            { regex: "^((vai|va) )?(est|e|serra|indietro)$", handler: (state) => {
                state.location = "Serra Morente";
                return { description: gameData["Serra Morente"].description(state), eventType: 'movement' };
            }},
            { regex: "^((vai|va) )?(nord|sud|ovest|n|s|o)$", handler: () => ({ description: "Cammini per un po' lungo i corridoi silenziosi di questo cimitero galattico, ma il panorama non cambia. File infinite di tombe di vetro. Con un brivido, decidi di tornare indietro." }) },
            // ESAMINA
            { regex: "^(esamina|guarda) (capsule|sarcofagi|contenitori)$", handler: () => ({ description: "Sono capsule di stasi criogenica. La loro superficie di vetro scuro è gelida al tatto. Attraverso il materiale opaco non riesci a distinguere cosa ci sia all'interno. Ce ne sono troppe per contarle." }) },
            { regex: "^(esamina|guarda) (brina|ghiaccio|pavimento)$", handler: () => ({ description: "È uno strato sottile di cristalli di ghiaccio. L'ambiente è ben al di sotto dello zero." }) },
            // ANALIZZA
            { regex: "^(analizza) (stanza|aria|arca)$", handler: () => ({ description: "Lo scanner conferma una temperatura ambientale di -120 gradi Celsius. I sistemi criogenici principali sono offline. La temperatura si sta lentamente, inesorabilmente, alzando nel corso dei millenni. Non c'è traccia di energia attiva, se non nei sistemi di monitoraggio passivo.", eventType: 'magic'})},
            { regex: "^(analizza) (capsule|capsula)$", handler: (state) => {
                state.flags.knowsAboutBioFailure = true;
                return { description: "Punti lo scanner verso la capsula più vicina. L'apparecchio emette un 'bip' lento e malinconico.[PAUSE]LETTURA CAMPIONE: [SPECIE K'THARR - PREDATORE ALFA]\nSTATO: deceduto. Integrità genomica: 0.02%.\nCAUSA: guasto catastrofico dei sistemi di supporto vitale nel ciclo 9.875.342.[PAUSE]Provi con un'altra capsula. E un'altra ancora. La risposta è sempre la stessa, una litania di fallimenti.\n[FLORA DI XYLOS - SIMBIONTE]... deceduto.\n[FORMA DI VITA SILICEA - COSTRUTTORE]... deceduto.[PAUSE]Capisci la terribile verità. Questa non era una stiva. Era un'arca. Un intero ecosistema, forse di un intero mondo, conservato qui. E ora è tutto perduto.", eventType: 'magic'};
            }},
            // USA / APRI
            { regex: "^(apri) (capsula|capsule)$", handler: () => ({ description: "Le capsule sono sigillate ermeticamente e i meccanismi di apertura sono privi di energia. Anche se potessi, senti che sarebbe una profanazione." })},
            { regex: "^(usa) (taglierina|taglierina al plasma) su (capsula|capsule)$", handler: () => ({ description: "Anche se la taglierina potesse incidere il vetro criogenico, non servirebbe a nulla. Non c'è nessuno da salvare qui. Abbassi l'attrezzo." })},
        ]
    },
    "Santuario del Silenzio": {
        description: (state) => "SANTUARIO DEL SILENZIO\n\nLa porta a nord si apre su un ambiente completamente diverso. La debole luce blu qui è sostituita da una fredda luminescenza bianca che emana da motivi geometrici sul pavimento. Sei in una sala circolare dal soffitto a volta altissimo, che si perde nell'oscurità. L'aria è immobile e ha un odore neutro, quasi sterile, come di pietra antica.\nLe pareti sono interamente coperte da intricati bassorilievi che raffigurano scene di una civiltà aliena. Al centro esatto della sala, si erge un altare cilindrico di pietra nera levigata.\nOltre all'uscita a SUD da cui sei entrato, c'è un altro passaggio a OVEST.",
        commands: [
            { regex: "^((vai|va) )?(sud|s|corridoio|indietro)$", handler: (state) => {
                state.location = "Corridoio Principale";
                return { description: gameData["Corridoio Principale"].description(state), eventType: 'movement' };
            }},
            { regex: "^((vai|va) )?(ovest|o)$", handler: (state) => {
                state.location = "Scriptorium";
                return { description: gameData["Scriptorium"].description(state), eventType: 'movement' };
            }},
            { regex: "^(esamina|guarda) (bassorilievi|muri|pareti|incisioni)$", handler: () => ({ description: "Sono scene incredibilmente dettagliate. Vedi creature alte e sottili che osservano un cielo con tre soli. Le vedi piantare semi luminosi su un pianeta fertile. Le vedi costruire navi immense, identiche a questa, che partono verso le stelle. L'ultima scena raffigura le creature che entrano nelle navi, con un'espressione non di paura, ma di solenne determinazione. È la storia di un esodo, di un sacrificio." }) },
            { regex: "^(esamina|guarda) (altare|pietra|centro)$", handler: (state) => {
                 if (state.inventory.includes("Stele del Ricordo")) {
                    return { description: "È un blocco cilindrico di una pietra nera che assorbe la luce. Lo scomparto da cui hai preso la Stele è ora aperto e vuoto." };
                }
                return { description: "È un blocco cilindrico di una pietra nera che assorbe la luce. La superficie superiore è perfettamente liscia, tranne per un incavo circolare, profondo pochi centimetri. Sembra fatto per alloggiare un oggetto specifico. Sembra che manchi qualcosa." };
            }},
            { regex: "^(analizza) (bassorilievi)$", handler: () => ({ description: "L'analisi del materiale rivela che la pietra è stata scolpita con una precisione atomica. Le incisioni non sono state scavate, ma 'piegate' a livello molecolare. La tecnologia è incomprensibile." }) },
            { regex: "^(analizza) (altare)$", handler: (state) => {
                state.flags.knowsAboutAltarMechanism = true;
                return { description: "Lo scanner rileva un complesso meccanismo a pressione e a massa specifica sotto l'incavo. Per attivarlo, non basta un oggetto qualsiasi. Serve un oggetto circolare con una massa e una densità molto precise. Il meccanismo, se attivato, aprirebbe uno scomparto nascosto all'interno dell'altare stesso.", eventType: 'magic' };
            }},
             { regex: "^(analizza) (stele|stele del ricordo)$", handler: (state) => {
                if (!state.inventory.includes("Stele del Ricordo")) {
                    return { description: "Non hai una stele da analizzare.", eventType: 'error' };
                }
                if (state.flags.steleAnalizzata) {
                    return { description: `Hai già analizzato la stele. Stato traduzione: ${state.flags.translationProgress}%.`, eventType: 'magic' };
                }
                state.flags.translationProgress = 75;
                state.flags.steleAnalizzata = true;
                return {
                    description: "Analizzi la stele. Lo scanner assorbe i dati a una velocità impressionante. È una chiave di volta linguistica, un archivio culturale immenso.[PAUSE]Stato traduzione: 75%\nUna voce quasi perfetta, poetica e malinconica, risuona dal tuo traduttore:\n\"Quando i tre soli sanguinarono, sapemmo che il tempo era cenere. Non piangemmo il nostro mondo, perché il mondo è un'idea, e le idee non muoiono. Lo affidammo al Grande Vuoto, perché un nuovo seme potesse attecchire in un terreno non ancora scritto. Il nostro corpo è polvere, ma il nostro ricordo è una stella.\"",
                    eventType: 'magic'
                };
            }},
            { regex: "^(prendi) (altare)$", handler: () => ({ description: "È un blocco di pietra solido, pesa tonnellate.", eventType: 'error' })},
            { regex: "^(usa) (disco|disco di pietra) su (altare|incavo)$", handler: (state) => {
                if (!state.inventory.includes("Disco di Pietra")) {
                    return { description: "Non hai un disco da usare.", eventType: 'error' };
                }
                if (state.inventory.includes("Stele del Ricordo")) {
                     return { description: "L'hai già fatto.", eventType: 'error' };
                }
                const discoIndex = state.inventory.indexOf("Disco di Pietra");
                state.inventory.splice(discoIndex, 1);
                state.inventory.push("Stele del Ricordo");
                return { description: "Appoggi il pesante disco di pietra nell'incavo dell'altare. Calza a pennello. Per un istante non succede nulla, poi senti un profondo 'clunk' provenire dall'interno della pietra. Una sezione dell'altare si ritrae silenziosamente, rivelando uno scomparto segreto. All'interno, adagiata su un cuscino di luce solidificata, c'è una tavoletta rettangolare coperta di simboli complessi: la Stele del Ricordo.", eventType: 'magic' };
            }},
            { regex: "^(usa) (.+) su (altare)$", handler: (state, match) => ({ description: `Provi a inserire ${match[2]} nell'incavo, ma non si adatta o non ha il peso giusto. Il meccanismo non reagisce.` })},
        ]
    },
    "Scriptorium": {
        description: (state) => {
            let desc = "SCRIPTORIUM\n\nEntri in una biblioteca circolare, ma al posto dei libri, le pareti sono costellate di nicchie scure. Dalla maggior parte di esse, un proiettore olografico proietta a mezz'aria globi di testo alieno che turbinano lentamente, illeggibili e complessi. L'aria ronza di energia contenuta. È un luogo di conoscenza silenziosa.";
            if (!state.flags.discoPreso) {
                desc += "\nUna delle nicchie sulla parete nord è buia. Il suo proiettore è spento e tremola debolmente.";
            }
            desc += "\nL'unica uscita visibile è a EST. Tuttavia, dietro la postazione del proiettore olografico, noti una porta sottile, quasi invisibile, che conduce più in profondità in quest'ala della nave, verso NORD.";
            return desc;
        },
        commands: [
            // MOVIMENTO
            { regex: "^((vai|va) )?(est|e|santuario|indietro)$", handler: (state) => {
                state.location = "Santuario del Silenzio";
                return { description: gameData["Santuario del Silenzio"].description(state), eventType: 'movement' };
            }},
            { regex: "^((vai|va) )?(nord|n)$", handler: (state) => {
                state.location = "Arca della Memoria";
                return { description: gameData["Arca della Memoria"].description(state), eventType: 'movement' };
            }},
            // ESAMINA
            { regex: "^(esamina|guarda) (proiettori|nicchie|testo|ologrammi)$", handler: () => ({ description: "Sono archivi di dati olografici. Il testo è un flusso costante di simboli alieni che cambiano e si ricombinano. Senza una chiave di lettura, sono solo bellissime e incomprensibili opere d'arte digitale." }) },
            { regex: "^(esamina|guarda) (proiettore spento|proiettore rotto|nicchia buia)$", handler: (state) => {
                 if (state.flags.discoPreso) {
                    return { description: "È il proiettore da cui hai rimosso il disco. Ora è completamente inerte, il suo meccanismo interno esposto e danneggiato." };
                }
                state.flags.spottedDisco = true;
                return { description: "Questo proiettore non funziona. Invece di un ologramma, emette solo qualche scintilla intermittente. Guardando più da vicino, vedi la causa del malfunzionamento: un pesante disco di pietra scura è incastrato nel meccanismo di proiezione, bloccandolo." };
            }},
            { regex: "^(esamina|guarda) (disco|disco di pietra)$", handler: (state) => {
                if (state.flags.spottedDisco || state.inventory.includes("Disco di Pietra")) {
                    return { description: "È un disco di pietra nera, pesante e denso, spesso circa dieci centimetri. La sua superficie è coperta da incisioni complesse, simili ma non identiche a quelle sui bassorilievi del santuario. Riconosci alcuni dei simboli: sono gli stessi della grande porta a Ovest nel corridoio principale." };
                }
                return { description: "Non vedi nessun disco.", eventType: 'error' };
            }},
            // ANALIZZA
            { regex: "^(analizza) (proiettori|nicchie)$", handler: () => ({ description: "Lo scanner rileva un'enorme densità di dati compressi all'interno dei campi olografici. Stai guardando l'equivalente di intere biblioteche, ma la tecnologia di codifica è al di là della tua comprensione.", eventType: 'magic' }) },
            { regex: "^(analizza) (disco|disco di pietra)$", handler: (state) => {
                if (state.flags.spottedDisco || state.inventory.includes("Disco di Pietra")) {
                    return { description: "L'analisi conferma che il disco ha una massa e una densità specifiche, molto elevate. La sua forma circolare e le sue proprietà corrispondono esattamente ai requisiti del meccanismo che hai rilevato nell'altare del Santuario. Questa è la chiave.", eventType: 'magic' };
                }
                return { description: "Non vedi nessun disco da analizzare.", eventType: 'error' };
            }},
            // PRENDI
            { regex: "^(prendi) (disco|disco di pietra)$", handler: (state) => {
                if (state.inventory.includes("Disco di Pietra")) {
                    return { description: "Ce l'hai già.", eventType: 'error' };
                }
                if (!state.flags.spottedDisco) {
                    return { description: "Non vedi nessun disco da prendere.", eventType: 'error' };
                }
                state.inventory.push("Disco di Pietra");
                state.flags.discoPreso = true;
                return { description: "Con un po' di fatica, smuovi il disco e lo estrai dal meccanismo del proiettore. È più pesante di quanto sembri. Ora hai il Disco di Pietra.", eventType: 'item_pickup' };
            }},
        ]
    },
    "Arca della Memoria": {
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
    },
    "Ponte di Comando": {
        description: (state) => {
            let desc = "PONTE DI COMANDO\n\nEntri in una sala vasta e circolare, avvolta in una profonda oscurità e in un silenzio tombale. Il soffitto è una cupola di cristallo nero impenetrabile. Al centro della stanza, una complessa struttura a forma di stella fluttua a mezz'aria, immobile e spenta. Tutt'intorno, disposte a raggiera, ci sono diverse postazioni di controllo, anch'esse silenziose.";
            
            if (state.flags.isHologramActive) {
                desc = "PONTE DI COMANDO\n\nSei nel vasto Ponte di Comando circolare. L'ambiente ora non è più buio. Al centro, la struttura si è animata e proietta sulla cupola una magnifica e silenziosa mappa stellare tridimensionale. La mappa mostra una rotta chiara che attraversa il vuoto interstellare, con un punto di arrivo inconfondibile: il tuo sistema solare.";
            }
    
            desc += "\nUn'unica postazione, più grande delle altre, si trova direttamente di fronte a te. Sembra la postazione del comandante.";
            desc += "\nUna sottile porta circolare, quasi invisibile, è incassata nella parete dietro la postazione del comandante. È l'unica altra uscita oltre a quella da cui sei entrato a SUD.";
            
            return desc;
        },
        commands: [
             // MOVIMENTO
            { regex: "^((vai|va) )?(sud|s|corridoio|indietro)$", handler: (state) => {
                state.location = "Corridoio Principale";
                return { description: gameData["Corridoio Principale"].description(state), eventType: 'movement' };
            }},
            { regex: "^(vai|entra)( nella| dentro)? porta( circolare)?$", handler: (state) => {
                if (state.flags.isFinalDoorOpen) {
                    state.location = "Santuario Centrale";
                    return { description: gameData["Santuario Centrale"].description(state), eventType: 'movement' };
                }
                return { description: "La porta circolare è bloccata.", eventType: 'error' };
            }},
            // ESAMINA
            { regex: "^(esamina|guarda) (postazione|postazione comandante|postazione principale|console)$", handler: () => ({ description: "È più grande delle altre. La sua superficie liscia e scura sembra attendere un input. C'è un'unica depressione a forma di mano al centro della console." }) },
            { regex: "^(esamina|guarda) (porta|porta circolare)$", handler: (state) => {
                if (state.flags.isHologramActive) {
                    return { description: "Ora che la stanza è illuminata, puoi vedere meglio il meccanismo di blocco. È un piccolo pannello con diverse punte luminose retrattili." };
                }
                return { description: "È una porta perfettamente circolare, senza maniglie o simboli visibili, tranne per un piccolo meccanismo di blocco al centro. Sembra condurre al cuore della nave." };
            }},
            { regex: "^(esamina|guarda) (struttura|stella|centro stanza)$", handler: () => ({ description: "È una scultura metallica complessa, formata da anelli e punte interconnessi. Sembra un proiettore olografico di incredibile complessità, ma è completamente inerte." }) },
            { regex: "^(esamina|guarda) (mappa|mappa stellare)$", handler: (state) => {
                if (!state.flags.isHologramActive) {
                    return { description: "Non c'è nessuna mappa da esaminare.", eventType: 'error' };
                }
                state.flags.knowsAboutTrinarySystem = true;
                return { description: "Segui la rotta a ritroso, partendo da casa. Il viaggio ti porta in un'altra galassia, fino a un ammasso stellare denso e luminoso. Il punto di origine è inequivocabile: un sistema trino, con tre soli che danzano l'uno attorno all'altro. La culla della loro civiltà." };
            }},
            // ANALIZZA
            { regex: "^(analizza) (stanza|ponte)$", handler: () => ({ description: "Lo scanner rileva che l'intera stanza è in uno stato di ibernazione a energia quasi zero. Tutti i sistemi sono pronti, ma dormienti. Aspettano un segnale di riattivazione, un 'imprimatur'." , eventType: 'magic'}) },
            { regex: "^(analizza) (postazione|postazione comandante|console)$", handler: () => ({ description: "L'analisi conferma che questa è la console di comando principale. La depressione a forma di mano è un'interfaccia bio-metrica. Sembra essere il catalizzatore per risvegliare i sistemi del ponte.", eventType: 'magic' }) },
            // USA / TOCCA
            { regex: "^(tocca|usa|premi) (console|postazione|depressione|mano)$", handler: (state) => {
                 if (state.flags.isHologramActive) {
                    return { description: "Hai già attivato la console. La mappa stellare brilla sopra di te.", eventType: 'error' };
                }
                state.flags.isHologramActive = true;
                return { description: "Appoggi la tua mano guantata sulla depressione. La console reagisce al tuo tocco, riconoscendoti non per la tua identità, ma per il tuo intento. Riconosce che hai riunito l'eredità della nave.[PAUSE]Un'ondata di energia silenziosa attraversa la stanza. Le postazioni si illuminano. La struttura centrale si anima e proietta sulla cupola una magnifica e silenziosa mappa stellare tridimensionale.[PAUSE]La mappa mostra una rotta chiara, un viaggio millenario che attraversa il vuoto interstellare. Il punto di arrivo è inconfondibile: il tuo sistema solare.", eventType: 'magic' };
            }},
            { regex: "^(tocca|attiva|usa) (tre|3) punte( su porta)?$", handler: (state) => {
                if (!state.flags.knowsAboutTrinarySystem) {
                    return { description: "Non sai quale combinazione usare.", eventType: 'error' };
                }
                if (state.flags.isFinalDoorOpen) {
                    return { description: "La porta è già aperta.", eventType: 'error' };
                }
                state.flags.isFinalDoorOpen = true;
                return { description: "Ricordando la mappa stellare, la culla a tre soli, capisci. Appoggi la mano sul pannello e attivi tre delle punte luminose.[PAUSE]Un 'clic' armonioso risuona nel silenzio. La porta circolare si apre con un movimento fluido e silenzioso, rivelando una stanza avvolta in un'oscurità totale e sacra.", eventType: 'magic' };
            }},
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
                    description: `(La figura non move le labbra, ma le parole non sono un suono. Sono un pensiero che fiorisce direttamente nella tua mente, limpido e completo.)
"Creatura di carbonio... Figlio delle Stelle... Benvenuto."
"So cosa cerchi. Una risposta. Ma io non sono che la memoria di una domanda. Sono ciò che resta quando il cantastorie è svanito. L'ultima frase, scritta nella luce."
"Il nostro tempo era un cerchio che si chiudeva. Il grande fuoco del nostro universo si stava riducendo a brace, e noi eravamo le ultime scintille. Ma la vita... la vita è una fiamma che non deve mai essere lasciata spegnere del tutto."
[PAUSE]
"Così intraprendemmo il 'Grande Salto'. Non per conquistare, ma per comporre. Intrecciammo le note del nostro stesso essere nella trama silenziosa di mondi giovani, sperando che una nuova, imprevedibile sinfonia potesse un giorno iniziare."
"Tu... sei quella nuova musica. Una melodia che potevamo solo immaginare, nata nel silenzio che ci siamo lasciati alle spalle."
"Nel tuo sangue, porti il fantasma dei nostri tre soli. Sei la nostra discendenza. Ma noi non siamo i tuoi dèi. Siamo solo il ricordo della prima nota."
[PAUSE]
(La figura luminosa ti osserva, e per un istante senti il peso di un tempo incalcolabile)
"La nostra canzone è finita. Le sue ultime armonie si dissolvono ora, in questo istante. Tutto ciò che abbiamo sempre chiesto alla musica a venire... è che venisse suonata, con forza, fino all'ultima nota."
"Vivi. Sarà il suono più bello."`,
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
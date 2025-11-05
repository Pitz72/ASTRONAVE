import { Room, Command } from '../../types';
import { gameData } from '../gameData';

const activateCrystalCommand: Command = {
    regex: "^(usa) (dispositivo|dispositivo medico|strumento) su (cristallo|cristallo dati|cristallo dati opaco)$",
    handler: (state) => {
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

export const corridoioPrincipaleRoom: Room = {
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
        { regex: "^(tocca) (pareti|muro|soffitto|pavimento)$", handler: () => ({ description: "La superficie è liscia e stranamente tiepida, quasi come pelle. Senti una debolissima, quasi impercettibile vibrazione, come un respiro lentissimo." }) },
        activateCrystalCommand,
        analyzeMemoryCoreCommand,
    ]
};
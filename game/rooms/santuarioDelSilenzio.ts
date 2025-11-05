import { Room } from '../../types';
import { gameData } from '../gameData';

export const santuarioDelSilenzioRoom: Room = {
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
};

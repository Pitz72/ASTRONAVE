import { Room } from '../../types';
import { gameData } from '../gameData';

export const serraMorenteRoom: Room = {
    description: (state) => {
        let desc = "SERRA MORENTE\n\nApri la porta a sud e un'aria innaturalmente secca ti investe. La luce bluastra del corridoio lascia il posto a una debole luminescenza verdastra, malata. Sei in una vasta serra a cupola. Enormi piante aliene, simili a felci scheletriche e funghi contorti, pendono dalle pareti come spettri. Tutto è secco, morto, coperto da uno strato di polvere che sembra neve grigia.";
        if (state.flags.semeLiberato) {
            desc += "\nIl silenzio ora è totale, dopo che il ronzio del campo di contenimento è cessato.";
        } else {
            desc += "\nUn ronzio a bassa frequenza, costante e fastidioso, vibra nell'aria.";
        }
        
        if (!state.flags.semeLiberato) {
            desc += "\nAl centro della sala, sotto la cupola, c'è una teca di cristallo trasparente. All'interno, qualcosa brilla di una luce propria.[PAUSE]";
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
        { regex: "^(esamina|guarda) (seme|seme vivente)$", handler: () => ({ description: "È un seme delle dimensioni di un pugno, che emette una luce verde gentile e pulsante. La sua superficie è liscia e calda, e sembra quasi vibrare di vita contenuta. È l'unica cosa viva qui dentro." }) },
        { regex: "^(esamina|guarda) (passaggio|muro ovest)$", handler: () => ({ description: "È un'apertura non contrassegnata, quasi nascosta dalla vegetazione morta. Conduce in un'area ancora più buia e fredda." }) },
        // ANALIZZA
        { regex: "^(analizza) (piante|felci|funghi)$", handler: () => ({ description: "L'analisi cellulare mostra una struttura biologica complessa, ma completamente inerte. La morte è avvenuta per disidratazione e collasso atmosferico in un tempo molto, molto lungo.", eventType: 'magic' }) },
        { regex: "^(analizza) (stanza|aria|serra)$", handler: () => ({ description: "Lo scanner rileva un'alta concentrazione di spore organiche inerti nell'aria. Il ronzio a bassa frequenza proviene da un campo di contenimento energetico malfunzionante che circonda la stanza. È instabile, ma non rappresenta un pericolo immediato.", eventType: 'magic'})},
        { regex: "^(analizza) (teca)$", handler: (state) => {
            if (state.flags.semeLiberato) return { description: "Il meccanismo è disattivato." };
            return { description: "La teca è protetta da un blocco magnetico complesso. Il pannello alla base è l'unica interfaccia. Lo scanner non riesce a bypassarlo. La sequenza di sblocco sembra richiedere un input esterno, da inserire nell'incavo rettangolare.", eventType: 'magic'};
        }},
        { regex: "^(analizza) (seme|seme vivente)$", handler: (state) => {
             return { description: "Incredibile. Lo scanner rileva un'intensa attività biologica. Questo seme non è solo in stasi, è vivo e sano. Contiene un genoma di una complessità sbalorditiva. È una vera e propria arca genetica in miniatura.", eventType: 'magic' };
        }},
        // PRENDI
        { regex: "^(prendi) (seme|seme vivente)$", handler: (state) => {
            if (state.inventory.includes("Seme Vivente")) return { description: "Ce l'hai già.", eventType: 'error' };
            if (!state.flags.semeLiberato) return { description: "È sigillato all'interno della teca di cristallo. Non puoi raggiungerlo.", eventType: 'error' };
            state.inventory.push("Seme Vivente"); // This case should not be reachable if logic is correct
            return { description: "OK, hai preso il Seme Vivente.", eventType: 'item_pickup' };
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
};
import { Room } from '../../types';
import { gameData } from '../gameData';

export const ponteDiComandoRoom: Room = {
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
};
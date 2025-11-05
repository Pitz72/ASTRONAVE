import { Room } from '../../types';
import { gameData } from '../gameData';

export const scriptoriumRoom: Room = {
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
};

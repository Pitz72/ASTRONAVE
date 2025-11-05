import { Room } from '../../types';
import { gameData } from '../gameData';

export const stivaRoom: Room = {
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
        { regex: "^(esamina|guarda) (casse|minerale|carico)$", handler: () => ({ description: "Sono casse di minerale di ferro e nichel. Contenuto standard, noioso ma redditizio. In un angolo, tra due contenitori semiaperti, noti della cianfrusaglia personale: un vecchio lettore di ebook ammaccato, con lo schermo rotto che mostra ancora debolmente il titolo di un'antica avventura testuale: '...nello di Ghiaccio'." }) },
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
};

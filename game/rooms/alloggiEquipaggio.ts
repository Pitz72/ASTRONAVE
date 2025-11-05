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

export const alloggiEquipaggioRoom: Room = {
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
};

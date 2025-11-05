import { Room } from '../../types';

export const santuarioCentraleRoom: Room = {
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
};
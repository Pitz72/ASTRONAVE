import { Room } from '../../types';
import { gameData } from '../gameData';

export const arcaBiologicaRoom: Room = {
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
};

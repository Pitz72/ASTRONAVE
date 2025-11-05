import { Room } from '../../types';
import { gameData } from '../gameData';

export const planciaRoom: Room = {
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
};

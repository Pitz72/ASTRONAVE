import { PlayerState, GameResponse } from '../types';
import { gameData } from './gameData';
import cloneDeep from 'lodash.clonedeep';

const getHelpText = (): string => {
    return `COMANDI DISPONIBILI:
- GUARDA / ESAMINA [oggetto/stanza]
- ANALIZZA [oggetto]
- VAI [direzione]
- PRENDI [oggetto]
- USA [oggetto] SU/CON [bersaglio]
- INDOSSA [oggetto]
- APRI [oggetto]
- TOCCA [oggetto]
- INVENTARIO / I
- SALVA / CARICA
- PULISCI / CLEAR (pulisce lo schermo)`;
};

// FIX: Export normalizeCommand to be used in other files.
export const normalizeCommand = (command: string): string => {
    return command
        .toLowerCase()
        .trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Rimuove accenti
        .replace(/\b(il|lo|la|i|gli|le|un|uno|una|un'|l')\s+/g, '') // Rimuove articoli
        .replace(/\b(con|sopra)\b/g, 'su') // Normalizza preposizioni
        .replace(/\s+/g, ' '); // Collassa spazi multipli
};

export const processCommand = (command: string, currentState: PlayerState): { response: GameResponse; newState: PlayerState } => {
    const newState = cloneDeep(currentState);
    const normalizedCommand = normalizeCommand(command);

    let response: GameResponse = {
        description: "Non capisco quel comando.",
        eventType: 'error',
    };

    if (command.toLowerCase().trim() === 'inizia') {
        const room = gameData[newState.location];
        response = {
            description: room.description(newState),
            eventType: null,
            clearScreen: true,
        };
        return { response, newState };
    }
    
    if (normalizedCommand === 'guarda' || normalizedCommand === 'esamina stanza' || normalizedCommand === 'guardati intorno' || normalizedCommand === 'esamina') {
        const room = gameData[newState.location];
        response = {
            description: room.description(newState),
            eventType: null,
            clearScreen: false,
        };
        return { response, newState };
    }

    if (normalizedCommand === 'aiuto' || normalizedCommand === 'help') {
        response = { description: getHelpText(), eventType: null };
        return { response, newState };
    }
    
    if (normalizedCommand === 'inventario' || normalizedCommand === 'i') {
        const inv = newState.inventory;
        const description = inv.length > 0 ? `Stai trasportando: ${inv.join(', ')}.` : "Non hai niente con te.";
        response = { description, eventType: null };
        return { response, newState };
    }

    const currentRoomData = gameData[newState.location];
    if (!currentRoomData) {
        response = { description: "ERRORE CRITICO: La stanza non esiste.", eventType: 'error' };
        return { response, newState };
    }
    
    // Itera sui comandi della stanza in ordine di priorità
    for (const cmd of currentRoomData.commands) {
        const match = normalizedCommand.match(new RegExp(cmd.regex, 'i'));
        if (match) {
            const result = cmd.handler(newState, match);

            let description = result.description;
            let continueText: string | null = null;
            const pauseMarker = "[PAUSE]";
            if (description.includes(pauseMarker)) {
                const parts = description.split(pauseMarker);
                description = parts[0];
                continueText = parts.slice(1).join(pauseMarker);
            }
            
            response = {
                description: description,
                eventType: result.eventType || null,
                gameOver: result.gameOver || null,
                continueText: continueText
            };

            // Se la location è cambiata, imposta clearScreen
            if (newState.location !== currentState.location) {
                response.clearScreen = true;
            }
            return { response, newState };
        }
    }
    
    // Generic fallbacks if no specific command was matched
    const specificNonsenseMatch = normalizedCommand.match(/^(usa) (taglierina|taglierina al plasma) su (batteria|batteria di emergenza)$/);
    if (specificNonsenseMatch) {
        if (newState.inventory.includes("Taglierina al Plasma") && newState.inventory.includes("Batteria di Emergenza")) {
             response = { description: `Sarebbe un'idea terribilmente stupida. Potresti causare un'esplosione.`, eventType: 'error' };
             return { response, newState };
        }
    }

    const genericMatchUsa = normalizedCommand.match(/^(usa) (.+) su (.+)$/);
    if (genericMatchUsa) {
        const item = genericMatchUsa[2].trim();
        const hasItem = newState.inventory.some(invItem => normalizeCommand(invItem).includes(item));
        if (hasItem) {
            response = { description: `Usare ${item} su ${genericMatchUsa[3]} non sembra avere alcun effetto.`, eventType: 'error' };
            return { response, newState };
        } else {
            response = { description: `Non hai '${item}'.`, eventType: 'error' };
            return { response, newState };
        }
    }

    const genericMatchUsaSingle = normalizedCommand.match(/^(usa|attiva|apri|indossa|leggi|tocca) (.+)$/);
    if (genericMatchUsaSingle) {
        const item = genericMatchUsaSingle[2].trim();
        const action = genericMatchUsaSingle[1].trim();
        const hasItem = newState.inventory.some(invItem => normalizeCommand(invItem).includes(item));
        if (hasItem) {
            response = { description: `Cosa vuoi ${action} con '${item}'? Devi essere più specifico (es. USA ${item.toUpperCase()} SU ...).`, eventType: 'error' };
            return { response, newState };
        }
    }

    const genericMatchAnalizza = normalizedCommand.match(/^(analizza) (.+)$/);
    if (genericMatchAnalizza) {
        response = { description: `Analizzi ${genericMatchAnalizza[2]}, ma non c'è nulla di anormale o interessante da segnalare.`, eventType: null };
        return { response, newState };
    }
    
    return { response, newState };
};
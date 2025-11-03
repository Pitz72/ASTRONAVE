import { PlayerState, GameResponse } from '../types';
import { gameData } from './gameData';
import cloneDeep from 'lodash.clonedeep';

const getHelpText = (): string => {
    return `COMANDI DISPONIBILI:
- GUARDA / ESAMINA [oggetto/stanza]
- ANALIZZA [oggetto]
- VAI [direzione]
- PRENDI [oggetto]
- USA [oggetto] SU [bersaglio]
- INDOSSA [oggetto]
- APRI [oggetto]
- INVENTARIO / I
- SALVA / CARICA
- PULISCI / CLEAR (pulisce lo schermo)`;
};

const normalizeCommand = (command: string): string => {
    return command
        .toLowerCase()
        .trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Rimuove accenti
        .replace(/\b(il|lo|la|i|gli|le|un|uno|una|un'|l')\s+/g, '') // Rimuove articoli
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
                continueText = parts[1];
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
    
    return { response, newState };
};

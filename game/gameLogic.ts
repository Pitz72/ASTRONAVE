
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

export const processCommand = (command: string, currentState: PlayerState): { response: GameResponse; newState: PlayerState } => {
    const newState = cloneDeep(currentState);
    const lowerCaseCommand = command.toLowerCase().trim();

    let response: GameResponse = {
        description: "Non capisco quel comando.",
        eventType: 'error',
    };

    if (lowerCaseCommand === 'inizia' || lowerCaseCommand === 'guarda' || lowerCaseCommand === 'esamina stanza') {
        const room = gameData[newState.location];
        response = {
            description: room.description(newState),
            eventType: null,
            clearScreen: lowerCaseCommand !== 'guarda',
        };
        return { response, newState };
    }

    if (lowerCaseCommand === 'aiuto') {
        response = { description: getHelpText(), eventType: null };
        return { response, newState };
    }
    
    if (lowerCaseCommand === 'inventario' || lowerCaseCommand === 'i') {
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

    // Check for movement
    const moveMatch = lowerCaseCommand.match(/^(vai|vai a|entra|dirigiti) (.*)$/);
    if (moveMatch) {
        const direction = moveMatch[2].trim();
        const exit = currentRoomData.exits[direction];
        if (exit) {
            if (!exit.condition || exit.condition(newState)) {
                newState.location = exit.destination;
                const newRoom = gameData[newState.location];
                response = {
                    description: newRoom.description(newState),
                    eventType: 'movement',
                    clearScreen: true
                };
            } else {
                response = { description: exit.failMessage || "Non puoi andare in quella direzione.", eventType: 'error' };
            }
            return { response, newState };
        }
    }

    // Check for room-specific commands
    for (const regex in currentRoomData.commands) {
        const match = lowerCaseCommand.match(new RegExp(regex, 'i'));
        if (match) {
            const result = currentRoomData.commands[regex](newState, match);
            response = {
                description: result.description,
                eventType: result.eventType || null,
            };
            return { response, newState };
        }
    }
    
    // Default response if no other command matches
    if(moveMatch) {
         response = { description: "Non puoi andare in quella direzione.", eventType: 'error' };
    }
    
    return { response, newState };
};

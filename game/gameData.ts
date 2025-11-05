import { allRooms } from './rooms';
import { PlayerState, GameEventType, CommandHandlerResult, CommandHandler, Command, Room } from '../types';


// Esporta l'oggetto aggregato delle stanze per essere utilizzato dal motore di gioco.
export const gameData: { [key: string]: Room } = allRooms;

// Le definizioni di tipo comuni sono state spostate in ../types.ts
// Esportiamo comunque alcuni tipi specifici se necessario localmente,
// anche se la best practice è importarli da un file centrale di tipi.
export type { PlayerState, GameEventType, CommandHandlerResult, CommandHandler, Command, Room };

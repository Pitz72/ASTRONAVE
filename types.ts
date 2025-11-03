
export enum GameState {
    Start,
    Playing,
    GameOver,
}

export type GameEventType = 'item_pickup' | 'item_use' | 'magic' | 'movement' | 'error' | null;

export interface PlayerState {
    location: string;
    inventory: string[];
    flags: { [key: string]: boolean };
}

export interface GameResponse {
    description: string;
    eventType: GameEventType;
    clearScreen?: boolean;
    gameOver?: string | null;
}

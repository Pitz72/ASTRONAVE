
export enum GameState {
    Start,
    Playing,
    GameOver,
}

export type GameEventType = 'item_pickup' | 'item_use' | 'magic' | 'movement' | 'error' | null;

export interface GeminiResponse {
    roomTitle: string;
    description: string;
    locationName: string;
    updatedInventory: string[];
    gameOver: string | null;
    error: string | null;
    eventType: GameEventType;
}

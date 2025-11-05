
export enum GameState {
    StartMenu,
    Instructions,
    Intro,
    Playing,
    GameOver,
}

export type GameEventType = 'item_pickup' | 'item_use' | 'magic' | 'movement' | 'error' | null;

export interface PlayerState {
    location: string;
    inventory: string[];
    flags: { [key: string]: any };
}

export interface GameResponse {
    description: string;
    eventType: GameEventType;
    clearScreen?: boolean;
    gameOver?: string | null;
    continueText?: string | null;
}

export interface CommandHandlerResult {
    description: string;
    eventType?: GameEventType;
    gameOver?: string | null;
}

export type CommandHandler = (state: PlayerState, match: RegExpMatchArray) => CommandHandlerResult;

export interface Command {
    regex: string;
    handler: CommandHandler;
}

export interface Room {
    description: (state: PlayerState) => string;
    commands: Command[];
}
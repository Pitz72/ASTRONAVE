
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameResponse, PlayerState } from './types';
import { processCommand } from './game/gameLogic';
import CommandLine from './components/CommandLine';
import TerminalOutput from './components/TerminalOutput';
import StartScreen from './components/StartScreen';
import {
  playSubmitSound,
  playItemSound,
  playMagicSound,
  playMoveSound,
  playErrorSound
} from './services/audioService';

const SAVE_KEY = 'silentWreckSave';

const INITIAL_PLAYER_STATE: PlayerState = {
  location: 'Plancia della Santa Maria',
  inventory: [],
  flags: {},
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [output, setOutput] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [continuation, setContinuation] = useState<string | null>(null);

  const handleGameResponse = useCallback((res: GameResponse) => {
    if (!res.description) return;

    // Play sound based on event type
    switch (res.eventType) {
      case 'item_pickup':
      case 'item_use':
        playItemSound();
        break;
      case 'magic':
        playMagicSound();
        break;
      case 'movement':
        playMoveSound();
        break;
      case 'error':
         playErrorSound();
         break;
    }

    const prompt = `<span class="text-yellow-300 animate-blink">[ PREMI UN TASTO PER CONTINUARE ]</span>`;

    if (res.clearScreen) {
        setOutput([res.description]);
    } else {
        setOutput(prev => [...prev, `> ${res.description}`]);
    }

    if (res.continueText) {
        setOutput(prev => [...prev, prompt]);
        setContinuation(res.continueText);
    }
    
    if (res.gameOver) {
      setOutput(prev => [...prev, `\n*** ${res.gameOver} ***`]);
      setGameState(GameState.GameOver);
    }
  }, []);

  useEffect(() => {
    if (!continuation) return;

    const handleContinue = (event: KeyboardEvent) => {
        event.preventDefault();
        setOutput(prev => [...prev.slice(0, -1), continuation]); // Replace prompt with continuation text
        setContinuation(null);
    };

    window.addEventListener('keydown', handleContinue, { once: true });
    
    return () => {
      window.removeEventListener('keydown', handleContinue);
    };
  }, [continuation]);

  const startGame = useCallback(() => {
    setPlayerState(INITIAL_PLAYER_STATE);
    setHistory([]);
    setHistoryIndex(-1);
    const { response, newState } = processCommand('inizia', INITIAL_PLAYER_STATE);
    setPlayerState(newState);
    setGameState(GameState.Playing);
    setOutput([response.description]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState === GameState.Start && event.key === 'Enter') {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, startGame]);

  const saveGame = () => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(playerState));
      setOutput(prev => [...prev, '> GIOCO SALVATO.']);
    } catch (error) {
      console.error("Failed to save game:", error);
      setOutput(prev => [...prev, '> ERRORE: Impossibile salvare la partita.']);
      playErrorSound();
    }
  };

  const loadGame = () => {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (savedData) {
        const loadedState = JSON.parse(savedData);
        setPlayerState(loadedState);
        const { response } = processCommand('guarda', loadedState);
        setGameState(GameState.Playing);
        handleGameResponse({ ...response, clearScreen: true });
        setOutput(prev => ['> GIOCO CARICATO.', ...prev]);
      } else {
        setOutput(prev => [...prev, '> NESSUN SALVATAGGIO TROVATO.']);
      }
    } catch (error)
    {
      console.error("Failed to load game:", error);
      setOutput(prev => [...prev, '> ERRORE: Il file di salvataggio è corrotto.']);
      playErrorSound();
    }
  };

  const submitCommand = useCallback(async (command: string) => {
    const trimmedCommand = command.trim().toLowerCase();
    if (!trimmedCommand || isLoading || gameState !== GameState.Playing) return;

    playSubmitSound();
    const formattedCommand = `> ${command}`;
    setOutput(prev => [...prev, formattedCommand]);
    setHistory(prev => [command, ...prev]);
    setHistoryIndex(-1);

    if (trimmedCommand === 'salva') {
      saveGame();
      return;
    }
    if (trimmedCommand === 'carica') {
      loadGame();
      return;
    }
    if (trimmedCommand === 'pulisci' || trimmedCommand === 'clear') {
        const { response } = processCommand('guarda', playerState);
        handleGameResponse({ ...response, clearScreen: true });
        return;
    }

    setIsLoading(true);
    // Artificial delay to simulate thinking
    await new Promise(resolve => setTimeout(resolve, 300));

    const { response, newState } = processCommand(command, playerState);
    setPlayerState(newState);
    handleGameResponse(response);
    
    setIsLoading(false);
  }, [isLoading, gameState, playerState, handleGameResponse]);
  
  const renderGameContent = () => {
    switch (gameState) {
      case GameState.Start:
        return <StartScreen />;
      case GameState.Playing:
      case GameState.GameOver:
        return (
          <>
            <TerminalOutput output={output} />
            <CommandLine 
              onSubmit={submitCommand} 
              isLoading={isLoading || gameState === GameState.GameOver || !!continuation}
              history={history}
              historyIndex={historyIndex}
              setHistoryIndex={setHistoryIndex}
            />
          </>
        );
    }
  };

  return (
    <div className="bg-black min-h-screen text-green-400 p-2 sm:p-4 md:p-6 flex items-center justify-center text-base md:text-lg">
        <div className="relative w-full max-w-4xl h-[90vh] sm:h-[85vh] border-4 border-green-800 bg-black/80 rounded-lg shadow-2xl shadow-green-900/50 p-4 flex flex-col overflow-hidden">
            <div className="scanline"></div>
            {renderGameContent()}
        </div>
    </div>
  );
};

export default App;

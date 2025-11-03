
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GeminiResponse } from './types';
import { processCommand } from './services/geminiService';
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

const SAVE_KEY = 'textAdventureSave';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [output, setOutput] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Game state managed by AI
  const currentLocation = useRef<string>('Plancia della Santa Maria');
  const inventory = useRef<string[]>([]);

  const startGame = useCallback(() => {
    setOutput([]);
    currentLocation.current = 'Plancia della Santa Maria';
    inventory.current = [];
    setGameState(GameState.Playing);
    setIsLoading(true);
    // Initial call to get the first room description
    processCommand('inizia', currentLocation.current, inventory.current)
      .then(handleGeminiResponse)
      .catch(handleError)
      .finally(() => setIsLoading(false));
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

  const handleGeminiResponse = (res: GeminiResponse) => {
    if (res.error) {
      setOutput(prev => [...prev, `> ERRORE: ${res.error}`]);
      playErrorSound();
      return;
    }

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

    if(res.description) {
      const title = res.roomTitle ? `${res.roomTitle.toUpperCase()}\n\n` : '';
      setOutput(prev => [...prev, `${title}${res.description}`]);
    }
    
    if(res.locationName) {
      currentLocation.current = res.locationName;
    }

    if(res.updatedInventory) {
      inventory.current = res.updatedInventory;
    }
    
    if (res.gameOver) {
      setOutput(prev => [...prev, `\n*** ${res.gameOver} ***`]);
      setGameState(GameState.GameOver);
    }
  };

  const handleError = (error: any) => {
    console.error("Gemini API Error:", error);
    const errorMessage = "Si è verificato un errore di connessione con il Dungeon Master. Riprova.";
    setOutput(prev => [...prev, `> SISTEMA: ${errorMessage}`]);
    playErrorSound();
  };
  
  const saveGame = () => {
    try {
      const saveData = {
        location: currentLocation.current,
        inventory: inventory.current,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
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
        const { location, inventory: savedInventory } = JSON.parse(savedData);
        currentLocation.current = location;
        inventory.current = savedInventory;
        
        // Clear screen and show confirmation, then fetch the room description
        setOutput(['> GIOCO CARICATO.', '']);
        setIsLoading(true);
        processCommand('guarda', location, savedInventory)
          .then(handleGeminiResponse)
          .catch(handleError)
          .finally(() => setIsLoading(false));

      } else {
        setOutput(prev => [...prev, '> NESSUN SALVATAGGIO TROVATO.']);
      }
    } catch (error) {
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
    setOutput(prev => [...prev, formattedCommand, '']); // Add blank line for spacing
    setHistory(prev => [command, ...prev]);
    setHistoryIndex(-1);

    // Client-side commands
    if (trimmedCommand === 'salva') {
      saveGame();
      return;
    }
    if (trimmedCommand === 'carica') {
      loadGame();
      return;
    }

    // AI commands
    setIsLoading(true);
    try {
      const res = await processCommand(command, currentLocation.current, inventory.current);
      handleGeminiResponse(res);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, gameState]);
  
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
              isLoading={isLoading || gameState === GameState.GameOver}
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

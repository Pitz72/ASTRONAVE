
import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react';
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
  playErrorSound,
  playKeystrokeSound
} from './services/audioService';

const SAVE_KEY = 'silentWreckSave';
const PAUSE_MARKER = "[PAUSE]";

const INITIAL_PLAYER_STATE: PlayerState = {
  location: 'Plancia della Santa Maria',
  inventory: [],
  flags: {},
};

const NATIVE_WIDTH = 1920;
const NATIVE_HEIGHT = 1080;

const useGameScale = () => {
    const [scaleStyle, setScaleStyle] = useState<React.CSSProperties>({});

    useLayoutEffect(() => {
        const updateScale = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            const scaleX = windowWidth / NATIVE_WIDTH;
            const scaleY = windowHeight / NATIVE_HEIGHT;
            
            const scale = Math.min(scaleX, scaleY);
            
            const scaledWidth = NATIVE_WIDTH * scale;
            const scaledHeight = NATIVE_HEIGHT * scale;
            
            const offsetX = (windowWidth - scaledWidth) / 2;
            const offsetY = (windowHeight - scaledHeight) / 2;

            setScaleStyle({
                position: 'absolute',
                transformOrigin: 'top left',
                transform: `scale(${scale})`,
                left: `${offsetX}px`,
                top: `${offsetY}px`,
            });
        };

        window.addEventListener('resize', updateScale);
        updateScale(); // Initial call

        return () => window.removeEventListener('resize', updateScale);
    }, []);

    return scaleStyle;
};


const paginateText = (text: string | null): { visible: string, remaining: string | null } => {
    if (!text) return { visible: '', remaining: null };
    if (text.includes(PAUSE_MARKER)) {
        const parts = text.split(PAUSE_MARKER);
        return {
            visible: parts[0],
            remaining: parts.slice(1).join(PAUSE_MARKER)
        };
    }
    return { visible: text, remaining: null };
};

const BlinkingPrompt: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center mt-4">
        <p>{text}</p>
        <div className="w-4 h-6 bg-green-400 animate-blink ml-3"></div>
    </div>
);

const instructionsText = `ISTRUZIONI DI GIOCO
Benvenuto a bordo de IL RELITTO SILENTE. Questa è un'avventura testuale tradizionale. Interagisci con il mondo scrivendo comandi semplici, composti di solito da un VERBO e un NOME (es. PRENDI LASTRA).

<h3 class="text-4xl text-yellow-300 mb-4">COMANDI FONDAMENTALI</h3>
<ul class="list-disc list-inside mb-6 space-y-2">
    <li><span class="font-bold">GUARDA</span> (o <span class="font-bold">ESAMINA STANZA</span>): Descrive il luogo in cui ti trovi.</li>
    <li><span class="font-bold">VAI [direzione]</span>: Ti sposta (es. <span class="font-bold">VAI NORD</span>, <span class="font-bold">OVEST</span>). Puoi anche usare le abbreviazioni (N, S, O, E).</li>
    <li><span class="font-bold">PRENDI [oggetto]</span>: Raccoglie un oggetto e lo mette nel tuo inventario.</li>
    <li><span class="font-bold">USA [oggetto] SU [bersaglio]</span>: Usa un oggetto su qualcos'altro (es. <span class="font-bold">USA CHIAVE SU PORTA</span>).</li>
    <li><span class="font-bold">INVENTARIO</span> (o <span class="font-bold">I</span>): Mostra gli oggetti che possiedi.</li>
    <li><span class="font-bold">AIUTO</span>: Mostra un riepilogo di questi comandi in qualsiasi momento.</li>
</ul>
${PAUSE_MARKER}
<h3 class="text-4xl text-yellow-300 mb-4">LA MECCANICA CHIAVE: VEDERE VS CAPIRE</h3>
<p class="mb-4">In questo gioco, osservare e analizzare sono due azioni diverse e fondamentali.</p>
<p class="mb-4"><span class="font-bold">ESAMINA [oggetto]</span><br/>Usa i tuoi occhi. Ti darà una descrizione fisica e visiva di un oggetto o di un dettaglio.<br/><em class="text-green-500">Esempio: ESAMINA PANNELLO ti dirà che è una superficie liscia e scura.</em></p>
<p class="mb-6"><span class="font-bold">ANALIZZA [oggetto]</span><br/>Usa il tuo multiscanner portatile. Ti fornirà dati tecnici, informazioni nascoste, letture energetiche o analisi scientifiche. È la chiave per svelare i segreti del relitto.<br/><em class="text-green-500">Esempio: ANALIZZA PANNELLO potrebbe rivelare la rete energetica sottostante e come alimentarla.</em></p>

<h3 class="text-4xl text-yellow-300 mb-4">CONSIGLI</h3>
<ul class="list-disc list-inside space-y-2">
    <li>Non puoi morire. L'obiettivo è il mistero, non la sopravvivenza.</li>
    <li>L'osservazione è tutto. Analizza tutto ciò che sembra fuori posto.</li>
    <li>Sii specifico. A volte <span class="font-bold">USA TAGLIERINA</span> non basta. Devi specificare <span class="font-bold">USA TAGLIERINA SU CREPA</span>.</li>
</ul>`;

const introText = `Sei un mercante dello spazio, un lupo solitario al timone della tua fidata nave da carico, la Santa Maria.
${PAUSE_MARKER}
La tua vita è una rotta silenziosa tra le colonie minerarie di Marte e le stazioni orbitali di Giove. Un lavoro onesto, ma ripetitivo. Per questo, hai sempre tenuto gli occhi aperti. Un relitto non reclamato, un pezzo di tecnologia alla deriva... possono valere più di dieci carichi di minerali. Il recupero non è sempre legale, ma nello spazio profondo le leggi sono solo un'eco lontana.
${PAUSE_MARKER}
Ed è così che, durante una rotta di routine ai margini della Fascia di Kuiper, i tuoi sensori a lungo raggio hanno captato qualcosa. Un'ombra dove non dovrebbe esserci nulla. Un oggetto freddo, buio e, soprattutto, silenzioso.

Un'occasione d'oro. O l'inizio di qualcos'altro.`;

const PaginatedScreen: React.FC<{
    fullText: string;
    finalPrompt: string;
    onComplete: (event: KeyboardEvent) => void;
}> = ({ fullText, finalPrompt, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [remainingText, setRemainingText] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const { visible, remaining } = paginateText(fullText);
        setDisplayedText(visible);
        setRemainingText(remaining);
        if (!remaining) {
            setIsComplete(true);
        }
    }, [fullText]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            playKeystrokeSound();
            if (isComplete) {
                onComplete(event);
                return;
            }
            if (remainingText) {
                const { visible, remaining } = paginateText(remainingText);
                setDisplayedText(prev => prev + visible);
                setRemainingText(remaining);
                if (!remaining) {
                    setIsComplete(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [remainingText, isComplete, onComplete]);

    return (
        <div className="flex-grow overflow-y-auto pr-4 no-scrollbar p-8 text-left text-2xl">
            <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: displayedText }} />
            {isComplete 
                ? <BlinkingPrompt text={finalPrompt} />
                : <BlinkingPrompt text="Premi un tasto per continuare..." />
            }
        </div>
    );
};


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.StartMenu);
  const [output, setOutput] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [continuation, setContinuation] = useState<string | null>(null);

  const handleGameResponse = useCallback((res: GameResponse) => {
    if (!res.description) return;

    switch (res.eventType) {
      case 'item_pickup': case 'item_use': playItemSound(); break;
      case 'magic': playMagicSound(); break;
      case 'movement': playMoveSound(); break;
      case 'error': playErrorSound(); break;
    }

    const processText = (text: string) => {
      const { visible, remaining } = paginateText(text);
      if (res.clearScreen) {
        setOutput([visible]);
      } else {
        setOutput(prev => [...prev, `> ${visible}`]);
      }
      setContinuation(remaining);
    };

    processText(res.description);
    
    if (res.gameOver) {
      const { visible, remaining } = paginateText(res.gameOver);
      setOutput(prev => [...prev, `\n<div class="whitespace-pre-wrap">${visible}</div>`]);
      setContinuation(remaining);
      setGameState(GameState.GameOver);
    }
  }, []);

  useEffect(() => {
    if (!continuation) return;

    const continuePrompt = `<span class="text-yellow-300 animate-blink">[ PREMI UN TASTO PER CONTINUARE ]</span>`;
    setOutput(prev => [...prev, continuePrompt]);

    const handleContinue = (event: KeyboardEvent) => {
        event.preventDefault();
        playKeystrokeSound();
        const textToPaginate = continuation;
        setOutput(prev => prev.slice(0, -1)); // Remove prompt
        
        const { visible, remaining } = paginateText(textToPaginate);
        setOutput(prev => [...prev, `<div class="whitespace-pre-wrap">${visible}</div>`]);
        setContinuation(remaining);
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
    
    const { visible, remaining } = paginateText(response.description);
    setOutput([visible]);
    setContinuation(remaining);
  }, []);

  const handleStartMenuChoice = useCallback((event: KeyboardEvent) => {
    playKeystrokeSound();
    if (event.key === '1') setGameState(GameState.Instructions);
    else if (event.key === '2') setGameState(GameState.Intro);
  }, []);

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
        setOutput(['> GIOCO CARICATO.']);
        handleGameResponse({ ...response, clearScreen: true });
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

    if (trimmedCommand === 'salva') { saveGame(); return; }
    if (trimmedCommand === 'carica') { loadGame(); return; }
    if (trimmedCommand === 'pulisci' || trimmedCommand === 'clear') {
        const { response } = processCommand('guarda', playerState);
        handleGameResponse({ ...response, clearScreen: true });
        return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const { response, newState } = processCommand(command, playerState);
    setPlayerState(newState);
    handleGameResponse(response);
    
    setIsLoading(false);
  }, [isLoading, gameState, playerState, handleGameResponse]);
  
  const renderGameContent = () => {
    switch (gameState) {
      case GameState.StartMenu:
        return <StartScreen onChoice={handleStartMenuChoice} />;
      case GameState.Instructions:
        return <PaginatedScreen 
                    fullText={instructionsText} 
                    finalPrompt="Premi INVIO per tornare al menu principale"
                    onComplete={(e) => { if(e.key === 'Enter') setGameState(GameState.StartMenu) }}
                />;
      case GameState.Intro:
        return <PaginatedScreen 
                    fullText={introText}
                    finalPrompt="Premi INVIO per iniziare"
                    onComplete={(e) => { if(e.key === 'Enter') startGame() }}
                />;
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

  const scaleStyle = useGameScale();

  return (
    <div className="bg-black w-screen h-screen overflow-hidden text-green-400">
      <div 
        id="game-container"
        style={{
          width: '1920px',
          height: '1080px',
          ...scaleStyle
        }}
        className="relative text-3xl border-4 border-green-800 bg-black/80 rounded-lg shadow-2xl shadow-green-900/50 p-8 flex flex-col overflow-hidden"
      >
        <div className="scanline"></div>
        {renderGameContent()}
      </div>
    </div>
  );
};

export default App;
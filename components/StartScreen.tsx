import React, { useEffect } from 'react';

interface StartScreenProps {
    onChoice: (event: KeyboardEvent) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onChoice }) => {

    useEffect(() => {
        window.addEventListener('keydown', onChoice);
        return () => {
            window.removeEventListener('keydown', onChoice);
        }
    }, [onChoice]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 text-green-300">
                IL RELITTO SILENTE
            </h1>
            <p className="mb-2 text-green-500">di Simone Pizzi</p>
            <p className="mb-8 text-green-500">Anno: 1980+45</p>
            
            <div className="text-left text-2xl space-y-2">
                <p>&gt; 1. ISTRUZIONI</p>
                <p>&gt; 2. AVVIA GIOCO</p>
            </div>

            <div className="flex items-center mt-6">
                <div className="w-4 h-7 bg-green-400 animate-blink"></div>
            </div>
        </div>
    );
};

export default StartScreen;

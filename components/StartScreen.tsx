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
        <div className="w-full h-full flex flex-col items-center justify-around text-center p-8">
            <div>
                <h1 className="text-9xl mb-8 text-green-300 animate-blink">
                    IL RELITTO SILENTE
                </h1>
                <p className="text-5xl mb-4 text-green-500">di Simone Pizzi</p>
                <p className="text-5xl text-green-500">Anno: 1980+45</p>
                <p className="mt-12 text-green-500">Un'avventura testuale dalle profondità oscure dello spazio</p>
            </div>
            
            <div className="text-5xl">
                <p>&gt; 1. ISTRUZIONI - 2. GIOCA</p>
            </div>
        </div>
    );
};

export default StartScreen;

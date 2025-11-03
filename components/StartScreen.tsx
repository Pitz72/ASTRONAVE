import React from 'react';

const StartScreen: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 animate-blink text-green-300">
                IL RELITTO SILENTE
            </h1>
            <p className="mb-2 text-green-500">di Simone Pizzi</p>
            <p className="mb-8 text-green-500">Anno: 1980+45</p>
            <p className="max-w-xl mb-4 text-green-400 leading-relaxed text-sm">
                Un'avventura testuale dalle profondità oscure dello spazio.
                Usa comandi come 'guarda', 'vai a ovest', 'prendi la tuta', 'analizza il relitto' per interagire con il mondo.
            </p>
            <p className="max-w-xl mb-8 text-green-400 leading-relaxed text-sm">
                Usa 'salva' e 'carica' per gestire la partita. Digita 'aiuto' per vedere altri comandi.
            </p>
            <div className="flex items-center">
                <p className="text-2xl text-yellow-300">PREMI RETURN PER INIZIARE</p>
                <div className="w-3 h-6 bg-yellow-300 animate-blink ml-2"></div>
            </div>
        </div>
    );
};

export default StartScreen;


import React, { useState, useEffect, useRef } from 'react';
import { playKeystrokeSound } from '../services/audioService';

interface CommandLineProps {
  onSubmit: (command: string) => void;
  isLoading: boolean;
  history: string[];
  historyIndex: number;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
}

const CommandLine: React.FC<CommandLineProps> = ({ onSubmit, isLoading, history, historyIndex, setHistoryIndex }) => {
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(command);
    setCommand('');
  };

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value);
    playKeystrokeSound();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      if(newIndex >= 0) {
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      if (newIndex >= 0) {
        setCommand(history[newIndex]);
      } else {
        setCommand('');
      }
    }
  };
  
  const focusInput = () => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  };

  const placeholder = 'Cosa fai?';
  const loadingText = 'Il Dungeon Master sta pensando...';

  return (
    <div className="mt-auto pt-2">
      <form onSubmit={handleSubmit} className="flex items-center w-full" onClick={focusInput}>
        <span className="text-green-400 mr-2 shrink-0">{'>'}</span>
        
        <div className="relative flex-grow h-6">
          {/* Invisible input that captures user typing */}
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={handleCommandChange}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full bg-transparent border-none p-0 text-transparent caret-transparent focus:outline-none"
            disabled={isLoading}
            autoFocus
            autoComplete="off"
          />

          {/* Visual layer that shows text and cursor */}
          <div className="absolute inset-0 flex items-center pointer-events-none whitespace-nowrap">
            {isLoading ? (
                <span className="text-green-700">{loadingText}</span>
            ) : (
                command === '' ? (
                    <div className="relative h-full w-full">
                        <span className="absolute left-0 top-0 text-green-700">{placeholder}</span>
                        <div
                            className="absolute left-0 top-0 bg-green-400 animate-blink"
                            style={{ width: '1ch', height: '1.1em' }}
                        ></div>
                    </div>
                ) : (
                    <>
                        <span className="text-green-400" style={{ whiteSpace: 'pre' }}>{command}</span>
                        <div
                            className="bg-green-400 animate-blink"
                            style={{ width: '1ch', height: '1.1em' }}
                        ></div>
                    </>
                )
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommandLine;

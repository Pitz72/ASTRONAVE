
import React, { useEffect, useRef } from 'react';

interface TerminalOutputProps {
  output: string[];
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ output }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="flex-grow overflow-y-auto pr-2 no-scrollbar">
      {output.map((line, index) => (
        <div key={index} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: line }}></div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default TerminalOutput;
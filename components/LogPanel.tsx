import React, { useEffect, useRef } from 'react';
import { GameLog } from '../types';

interface Props {
  logs: GameLog[];
}

const LogPanel: React.FC<Props> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-48 bg-black border-4 border-green-900 p-2 font-mono text-sm overflow-y-auto">
        <div className="text-green-500 font-bold mb-2 sticky top-0 bg-black w-full border-b border-green-900">系统日志</div>
        <div className="flex flex-col gap-1">
            {logs.map(log => {
                let color = 'text-zinc-400';
                if (log.type === 'combat') color = 'text-red-400';
                if (log.type === 'loot') color = 'text-yellow-400';
                if (log.type === 'danger') color = 'text-red-600 font-bold uppercase';
                if (log.type === 'info') color = 'text-cyan-400';

                return (
                    <div key={log.id} className={`${color} text-xs`}>
                        <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span> {log.message}
                    </div>
                );
            })}
            <div ref={endRef} />
        </div>
    </div>
  );
};

export default LogPanel;
import React, { useState } from 'react';
import { X } from 'lucide-react';

export const AlphaDisclaimer: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-1.5 text-xs text-zinc-400 flex items-center justify-between gap-3 font-mono">
      <div className="flex items-center gap-2 text-[11px] truncate">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
        <span className="text-zinc-300 font-medium">Autonomous Agent API v1alpha</span>
        <span className="text-zinc-600 hidden sm:inline">|</span>
        <span className="text-zinc-400 hidden sm:inline truncate">
          Asynchronous coding agent engine is in public alpha preview. Endpoints and schemas may evolve.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors shrink-0 cursor-pointer"
        title="Dismiss notice"
        aria-label="Dismiss disclaimer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

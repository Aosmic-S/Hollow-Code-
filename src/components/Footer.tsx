import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-[#090a0c] px-4 lg:px-6 py-4 text-xs text-zinc-400 font-mono">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Logo size="sm" showText={false} />
          <span className="text-zinc-300 font-medium font-sans">Hollow Code</span>
          <span className="text-zinc-600">·</span>
          <span>Autonomous Coding Platform (v1alpha)</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span className="text-zinc-500">Autonomous Execution Engine</span>
          <span className="text-zinc-700">·</span>
          <span>Code while you&apos;re gone.</span>
        </div>
      </div>
    </footer>
  );
};

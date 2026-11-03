import React, { useState } from 'react';
import { Logo } from './Logo';
import { Plus, RefreshCw, KeyRound, CheckCircle2, SlidersHorizontal, Info } from 'lucide-react';

interface HeaderProps {
  activeTab: 'sessions' | 'new-task' | 'templates' | 'sources' | 'detail';
  setActiveTab: (tab: 'sessions' | 'new-task' | 'templates' | 'sources') => void;
  statusInfo: { configured: boolean; mode: 'live' | 'demo'; apiKeyPresent: boolean };
  onRefresh: () => void;
  isRefreshing?: boolean;
  demoMode: boolean;
  setDemoMode: (demo: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  statusInfo,
  onRefresh,
  isRefreshing,
  demoMode,
  setDemoMode
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);

  const navItems: Array<{ id: 'sessions' | 'new-task' | 'templates' | 'sources'; label: string }> = [
    { id: 'sessions', label: 'Sessions' },
    { id: 'new-task', label: 'New Task' },
    { id: 'templates', label: 'Templates' },
    { id: 'sources', label: 'Repositories' }
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#090a0c]/90 backdrop-blur-md border-b border-white/[0.08] px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('sessions')}
            className="flex items-center group text-left transition-opacity hover:opacity-90 cursor-pointer"
            aria-label="Hollow Code - Home"
          >
            <Logo size="md" showTagline={true} />
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav
          className="hidden md:flex items-center p-0.5 rounded-lg bg-zinc-900/90 border border-white/[0.06]"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & API Status */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Jules API Status Badge */}
          <button
            onClick={() => setShowConfigModal(true)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
              demoMode
                ? 'bg-amber-950/20 text-amber-300 border-amber-900/40 hover:bg-amber-950/30'
                : statusInfo.configured
                ? 'bg-emerald-950/20 text-emerald-300 border-emerald-900/40 hover:bg-emerald-950/30'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
            }`}
            title="Configure Jules API connection"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                demoMode
                  ? 'bg-amber-400'
                  : statusInfo.configured
                  ? 'bg-emerald-400'
                  : 'bg-zinc-500'
              }`}
            />
            <span className="hidden sm:inline">
              {demoMode ? 'Sandbox Mode' : statusInfo.configured ? 'Jules Live' : 'Key Unset (Demo)'}
            </span>
            <span className="sm:hidden">{demoMode ? 'Sandbox' : statusInfo.configured ? 'Live' : 'Demo'}</span>
            <SlidersHorizontal className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </button>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/[0.06] transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh sessions & sources"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-zinc-200' : ''}`} />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => setActiveTab('new-task')}
            className="px-2.5 sm:px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shrink-0"
            aria-label="Create New Task"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </header>

      {/* Configuration & Diagnostics Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111215] border border-white/[0.1] rounded-xl max-w-md w-full p-5 text-zinc-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Logo size="sm" />
                <h3 className="text-sm font-semibold text-zinc-100">Jules API Configuration</h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                v1alpha
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Google Jules API calls are handled through the local Express proxy route (<code className="text-zinc-300 font-mono text-[11px]">/api/jules/*</code>). The API key is stored securely in the server environment as <code className="text-zinc-300 font-mono text-[11px]">JULES_API_KEY</code> and transmitted in the <code className="text-zinc-300 font-mono text-[11px]">X-Goog-Api-Key</code> header.
            </p>

            <div className="p-3 rounded-lg bg-zinc-950/80 border border-white/[0.06] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">API Key Configured:</span>
                <span className={statusInfo.apiKeyPresent ? 'text-emerald-400' : 'text-zinc-400'}>
                  {statusInfo.apiKeyPresent ? 'YES (Key Found)' : 'NO (Sandbox Active)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Current Mode:</span>
                <span className="text-zinc-200 font-medium">
                  {demoMode ? 'Sandbox Simulator' : statusInfo.configured ? 'Live Proxy' : 'Sandbox Fallback'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Target Base:</span>
                <span className="text-zinc-400">jules.googleapis.com</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-zinc-200 focus:ring-0 focus:ring-offset-0"
                />
                Force Sandbox Simulator
              </label>

              <button
                onClick={() => setShowConfigModal(false)}
                className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

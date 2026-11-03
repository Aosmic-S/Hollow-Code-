import React from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  RefreshCw,
  Clock,
  ShieldCheck,
  Cpu,
  GitBranch,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Database,
  Lock
} from 'lucide-react';

interface SettingsViewProps {
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  refreshInterval: number; // in seconds
  setRefreshInterval: (seconds: number) => void;
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  statusInfo: { configured: boolean; mode: 'live' | 'demo'; apiKeyPresent: boolean };
  demoMode: boolean;
  setDemoMode: (demo: boolean) => void;
  defaultBranch: string;
  setDefaultBranch: (branch: string) => void;
  defaultAutoPr: boolean;
  setDefaultAutoPr: (autoPr: boolean) => void;
  defaultRequireApproval: boolean;
  setDefaultRequireApproval: (requireApproval: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  autoRefreshEnabled,
  setAutoRefreshEnabled,
  refreshInterval,
  setRefreshInterval,
  onManualSync,
  isSyncing,
  lastSyncedAt,
  statusInfo,
  demoMode,
  setDemoMode,
  defaultBranch,
  setDefaultBranch,
  defaultAutoPr,
  setDefaultAutoPr,
  defaultRequireApproval,
  setDefaultRequireApproval
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-zinc-300" />
          <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">System & Sync Settings</h1>
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-1">
          Configure real-time sync intervals, proxy connections, and autonomous dispatch defaults.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Background Synchronization & Polling */}
        <div className="p-5 rounded-xl bg-[#111215] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-200 uppercase font-mono tracking-wider">
                  Live Background Synchronization
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Automatically queries sessions and timeline activity in the background.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-zinc-100' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/[0.04] space-y-3">
            {/* Auto-Sync Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-white/[0.04]">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-zinc-200 block">Auto-Sync Status</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {autoRefreshEnabled ? 'Active — querying changes periodically' : 'Paused — manual sync only'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  autoRefreshEnabled ? 'bg-zinc-100' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-zinc-950 transition-transform ${
                    autoRefreshEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sync Frequency Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-zinc-950 border border-white/[0.04]">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-zinc-200 block">Polling Frequency</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Interval between background status updates
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {[5, 10, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    disabled={!autoRefreshEnabled}
                    onClick={() => setRefreshInterval(sec)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer disabled:opacity-40 ${
                      refreshInterval === sec
                        ? 'bg-zinc-800 text-zinc-100 border border-white/[0.12] font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border border-white/[0.04] hover:text-zinc-200'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Last Synced Info */}
            <div className="text-[11px] font-mono text-zinc-500 flex items-center justify-between px-1">
              <span>Last successful synchronization:</span>
              <span className="text-zinc-400">
                {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Engine Connection & Authentication */}
        <div className="p-5 rounded-xl bg-[#111215] border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase font-mono tracking-wider">
                Autonomous Engine Connection
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Internal proxy connection and security verification.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-white/[0.04] text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-white/[0.04]">
              <span className="text-zinc-400">Connection Mode:</span>
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    demoMode
                      ? 'bg-amber-400'
                      : statusInfo.configured
                      ? 'bg-emerald-400'
                      : 'bg-zinc-500'
                  }`}
                />
                <span className="text-zinc-200 font-semibold">
                  {demoMode ? 'Sandbox Simulator' : statusInfo.configured ? 'Live Proxy' : 'Fallback Simulator'}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-white/[0.04]">
              <div className="space-y-0.5">
                <span className="text-zinc-200 block font-sans">Force Sandbox Simulator</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Test UI behaviors and state changes with local mock data
                </span>
              </div>
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-zinc-200 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-white/[0.04]">
              <span className="text-zinc-400">API Key Storage:</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Protected (Server Environment Only)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Autonomous Task Dispatch Defaults */}
        <div className="p-5 rounded-xl bg-[#111215] border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase font-mono tracking-wider">
                Default Dispatch Preferences
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Preset configurations applied when initializing new coding tasks.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-white/[0.04]">
            {/* Default Branch */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-white/[0.04]">
              <div>
                <span className="text-xs font-medium text-zinc-200 block">Default Branch</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Target Git branch for starting new sessions
                </span>
              </div>
              <input
                type="text"
                value={defaultBranch}
                onChange={(e) => setDefaultBranch(e.target.value)}
                className="px-2.5 py-1 bg-zinc-900 border border-white/[0.08] rounded text-xs text-zinc-200 font-mono w-28 text-center focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Default Auto-create PR */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-white/[0.04]">
              <div>
                <span className="text-xs font-medium text-zinc-200 block">Auto-create PR by Default</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Enable automatic pull request submission on new tasks
                </span>
              </div>
              <input
                type="checkbox"
                checked={defaultAutoPr}
                onChange={(e) => setDefaultAutoPr(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-zinc-200 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Default Require Plan Approval */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-white/[0.04]">
              <div>
                <span className="text-xs font-medium text-zinc-200 block">Require Plan Approval by Default</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Enforce human review before applying codebase mutations
                </span>
              </div>
              <input
                type="checkbox"
                checked={defaultRequireApproval}
                onChange={(e) => setDefaultRequireApproval(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-zinc-200 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { Session } from '../utils/julesTypes';
import { formatSessionState, formatRelativeTime, formatRepoName, getSessionId } from '../utils/julesHelpers';
import { ErrorAlert } from './ErrorAlert';
import { motion } from 'motion/react';
import {
  ExternalLink,
  GitPullRequest,
  GitBranch,
  Search,
  Plus,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  isLoading: boolean;
  error: { status?: number; message?: string } | null;
  onSelectSession: (id: string) => void;
  onNewTask: () => void;
  onRefresh: () => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  isLoading,
  error,
  onSelectSession,
  onNewTask,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter sessions
  const filteredSessions = (sessions || []).filter((s) => {
    if (!s) return false;
    const title = s.title || '';
    const source = s.source || '';
    const prompt = s.prompt || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(q) ||
      source.toLowerCase().includes(q) ||
      prompt.toLowerCase().includes(q);

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'AWAITING') return matchesSearch && s.state === 'AWAITING_PLAN_APPROVAL';
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && (s.state === 'IN_PROGRESS' || s.state === 'QUEUED');
    if (statusFilter === 'COMPLETED') return matchesSearch && s.state === 'COMPLETED';
    if (statusFilter === 'FAILED') return matchesSearch && s.state === 'FAILED';
    return matchesSearch;
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Filter & Search Bar - Clean without sync controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111215] p-2.5 rounded-xl border border-white/[0.08]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sessions by task title, repo, or prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950/70 border border-white/[0.06] rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono transition-colors"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {[
            { key: 'ALL', label: 'All', count: sessions.length },
            {
              key: 'AWAITING',
              label: 'Approval',
              count: sessions.filter((s) => s.state === 'AWAITING_PLAN_APPROVAL').length
            },
            {
              key: 'IN_PROGRESS',
              label: 'Running',
              count: sessions.filter((s) => s.state === 'IN_PROGRESS' || s.state === 'QUEUED').length
            },
            {
              key: 'COMPLETED',
              label: 'Done',
              count: sessions.filter((s) => s.state === 'COMPLETED').length
            }
          ].map((tab) => {
            const isSelected = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono text-[10px] text-zinc-400">{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorAlert status={error.status} message={error.message} onRetry={onRefresh} />}

      {/* Loading Skeletons */}
      {isLoading && sessions.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-xl bg-[#111215] border border-white/[0.06] animate-pulse space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-3.5 bg-zinc-800 rounded w-1/3" />
                <div className="h-3 bg-zinc-800 rounded w-16" />
              </div>
              <div className="h-3 bg-zinc-800/60 rounded w-1/4" />
              <div className="h-8 bg-zinc-950 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredSessions.length === 0 && (
        <div className="p-12 text-center rounded-xl border border-dashed border-white/[0.1] bg-[#111215]/40 max-w-md mx-auto space-y-3">
          <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              {searchQuery || statusFilter !== 'ALL' ? 'No matching sessions' : 'No active coding sessions'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try clearing your search query or reset the status filters.'
                : 'Start an autonomous asynchronous coding task to automate PR generation and bug fixes.'}
            </p>
          </div>
          <div className="pt-2">
            {searchQuery || statusFilter !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={onNewTask}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Task</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sessions List with Motion cards */}
      <div className="space-y-2.5">
        {filteredSessions.map((session, index) => {
          const stateInfo = formatSessionState(session?.state);
          const pr = session?.outputs?.pullRequest;
          const sessionId = getSessionId(session);
          const repoClean = formatRepoName(session?.source);
          const needsApproval = session?.state === 'AWAITING_PLAN_APPROVAL';

          return (
            <motion.div
              key={sessionId || index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => onSelectSession(sessionId)}
              className="p-4 rounded-xl bg-[#111215] border border-white/[0.08] hover:border-zinc-600/80 transition-all cursor-pointer group space-y-3 relative overflow-hidden"
            >
              {/* Top Row: Title, Status, Session ID */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono font-medium ${stateInfo.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${stateInfo.dotClass}`} />
                    {stateInfo.label}
                  </span>

                  <span className="text-[11px] font-mono text-zinc-400">
                    {sessionId}
                  </span>

                  {needsApproval && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                      <ShieldAlert className="w-3 h-3" />
                      Approval required
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(session?.createTime)}
                  </span>
                </div>
              </div>

              {/* Title Header */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                  {session?.title || 'Untitled Session'}
                </h3>
              </div>

              {/* Prompt snippet preview */}
              <p className="text-xs text-zinc-400 font-mono line-clamp-2 leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-white/[0.04]">
                {session?.prompt}
              </p>

              {/* Bottom Row: Repo info, branch, PR link */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-mono text-zinc-400 border-t border-white/[0.04]">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                    {repoClean}
                  </span>

                  <span className="text-zinc-600">·</span>

                  <span>branch: {session?.startingBranch || 'main'}</span>

                  <span className="text-zinc-600">·</span>

                  <span className="text-zinc-400">
                    {session?.automationMode === 'AUTO_CREATE_PR' ? 'Auto-PR' : 'Manual PR'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {pr && (
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:underline text-xs"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>PR #{pr.number || 'View'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <div className="text-zinc-400 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all flex items-center gap-1">
                    <span className="text-xs">Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Session } from '../utils/julesTypes';
import { formatSessionState, formatRelativeTime, formatRepoName, getSessionId } from '../utils/julesHelpers';
import { ErrorAlert } from './ErrorAlert';
import {
  ExternalLink,
  GitPullRequest,
  GitBranch,
  Search,
  Plus,
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  isLoading: boolean;
  error: { status?: number; message?: string } | null;
  onSelectSession: (id: string) => void;
  onNewTask: () => void;
  onRefresh: () => void;
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  isLoading,
  error,
  onSelectSession,
  onNewTask,
  onRefresh,
  autoRefreshEnabled,
  setAutoRefreshEnabled
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [secondsRemaining, setSecondsRemaining] = useState(10);

  // Auto refresh timer countdown (10s)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled]);

  // Trigger onRefresh when countdown reaches 0
  useEffect(() => {
    if (secondsRemaining === 0) {
      onRefresh();
      setSecondsRemaining(10);
    }
  }, [secondsRemaining, onRefresh]);

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
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111215] p-2.5 rounded-lg border border-white/[0.08]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sessions by task title, repo, or prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950/70 border border-white/[0.06] rounded-md text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono transition-colors"
          />
        </div>

        {/* Status Filters */}
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
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
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

        {/* Auto Refresh Toggle */}
        <div className="flex items-center gap-2.5 pl-2 border-t sm:border-t-0 sm:border-l border-white/[0.08] text-xs font-mono text-zinc-400 shrink-0 self-end sm:self-auto pt-2 sm:pt-0">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => {
                setAutoRefreshEnabled(e.target.checked);
                setSecondsRemaining(10);
              }}
              className="rounded border-zinc-700 bg-zinc-950 text-zinc-200 focus:ring-0"
            />
            <span className="text-[11px] text-zinc-400">10s Sync</span>
          </label>

          {autoRefreshEnabled && (
            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {secondsRemaining}s
            </span>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorAlert status={error.status} message={error.message} onRetry={onRefresh} />}

      {/* Loading Skeletons */}
      {isLoading && sessions.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-lg bg-[#111215] border border-white/[0.06] animate-pulse space-y-2.5">
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
        <div className="p-12 text-center rounded-lg border border-dashed border-white/[0.1] bg-[#111215]/40 max-w-md mx-auto space-y-3">
          <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              {searchQuery || statusFilter !== 'ALL' ? 'No matching sessions' : 'No active coding sessions'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try clearing your search query or reset the status filters.'
                : 'Start an asynchronous Jules coding task to automate PR generation and bug fixes.'}
            </p>
          </div>
          <div className="pt-2">
            {searchQuery || statusFilter !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={onNewTask}
                className="px-3.5 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Task
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-2">
        {filteredSessions.map((session, index) => {
          const stateInfo = formatSessionState(session?.state);
          const pr = session?.outputs?.pullRequest;
          const repoClean = formatRepoName(session?.source);
          const sessionId = getSessionId(session) || `session-${index}`;
          const sessionTitle = session?.title || session?.prompt?.slice(0, 50) || 'Untitled Session';

          return (
            <div
              key={sessionId}
              onClick={() => onSelectSession(sessionId)}
              className="group p-4 rounded-lg bg-[#111215] border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#141519] transition-all cursor-pointer space-y-3"
            >
              {/* Row 1: Status & Title & Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                  {/* Status Indicator */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono font-medium ${stateInfo.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${stateInfo.dotClass}`} />
                    {stateInfo.label}
                  </span>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
                    {sessionTitle}
                  </h3>
                </div>

                <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                  {formatRelativeTime(session?.createTime)}
                </span>
              </div>

              {/* Row 2: Metadata (Zero-Pill formatting) */}
              <div className="flex items-center flex-wrap gap-2 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-300">
                  <GitBranch className="w-3 h-3 text-zinc-400" />
                  {repoClean}
                </span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="text-zinc-400">branch: {session.startingBranch || 'main'}</span>
                {session.requirePlanApproval && (
                  <>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span className="text-amber-400/90 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                      Approval required
                    </span>
                  </>
                )}
                {session.automationMode === 'AUTO_CREATE_PR' && (
                  <>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span className="text-zinc-400">Auto-PR</span>
                  </>
                )}
              </div>

              {/* Row 3: Prompt Snippet */}
              <p className="text-xs text-zinc-400 font-mono truncate bg-zinc-950/60 px-2.5 py-1.5 rounded border border-white/[0.04] leading-normal">
                &gt; {session?.prompt || '(no prompt details)'}
              </p>

              {/* Row 4: Actions & PR link */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-xs">
                {pr ? (
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-900/40"
                  >
                    <GitPullRequest className="w-3 h-3" />
                    <span>PR #{pr.number || 'View'}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                  </a>
                ) : (
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {session.automationMode === 'AUTO_CREATE_PR' ? 'PR Pending' : 'No PR specified'}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 font-mono transition-colors">
                  <span>View Timeline</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

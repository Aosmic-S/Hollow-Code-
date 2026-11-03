import React, { useState } from 'react';
import { Session, Activity, ActivityArtifact } from '../utils/julesTypes';
import { formatSessionState, formatRelativeTime, formatRepoName, getSessionId } from '../utils/julesHelpers';
import { ErrorAlert } from './ErrorAlert';
import { Logo } from './Logo';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitPullRequest,
  GitBranch,
  Terminal,
  FileCode,
  Check,
  Copy,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  User,
  CornerDownLeft,
  GitCommit,
  Sparkles,
  Info
} from 'lucide-react';

interface SessionDetailProps {
  session: Session | null;
  activities: Activity[];
  isLoading: boolean;
  error: { status?: number; message?: string } | null;
  onBack: () => void;
  onRefresh: () => void;
  onApprovePlan: (sessionId: string) => Promise<void>;
  onSendMessage: (sessionId: string, message: string) => Promise<void>;
}

export const SessionDetail: React.FC<SessionDetailProps> = ({
  session,
  activities,
  isLoading,
  error,
  onBack,
  onRefresh,
  onApprovePlan,
  onSendMessage
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});

  if (!session) {
    return (
      <div className="py-12 text-center text-zinc-400 space-y-3 font-mono">
        <p>Session not found or unavailable.</p>
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-zinc-800 text-xs rounded text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          Return to Sessions
        </button>
      </div>
    );
  }

  const stateInfo = formatSessionState(session.state);
  const pr = session.outputs?.pullRequest;
  const repoClean = formatRepoName(session?.source);
  const sessionId = getSessionId(session);
  const needsApproval = session.state === 'AWAITING_PLAN_APPROVAL';

  const toggleCollapse = (id: string) => {
    setCollapsedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprovePlan(sessionId);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    const text = messageInput.trim();
    setMessageInput('');
    setIsSending(true);
    try {
      await onSendMessage(sessionId, text);
    } finally {
      setIsSending(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-100 px-2.5 py-1 rounded bg-[#111215] border border-white/[0.08] hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Sessions</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-[#111215] border border-white/[0.08] rounded hover:bg-zinc-800 flex items-center gap-1.5 font-mono transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Session Metadata Card */}
      <div className="p-4 rounded-lg bg-[#111215] border border-white/[0.08] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono font-medium ${stateInfo.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${stateInfo.dotClass}`} />
                {stateInfo.label}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">{sessionId}</span>
            </div>
            <h1 className="text-base font-semibold text-zinc-100">{session.title || 'Untitled Session'}</h1>
          </div>

          {pr && (
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 font-mono text-xs border border-emerald-800/40 transition-colors shrink-0"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Pull Request #{pr.number || 'View'}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>

        {/* Minimal Unboxed Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1 text-zinc-300">
            <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
            {repoClean}
          </span>
          <span className="text-zinc-600">·</span>
          <span>branch: {session.startingBranch || 'main'}</span>
          <span className="text-zinc-600">·</span>
          <span>{session.automationMode === 'AUTO_CREATE_PR' ? 'Auto-PR' : 'Manual PR'}</span>
          <span className="text-zinc-600">·</span>
          <span>Started {formatRelativeTime(session.createTime)}</span>
        </div>

        {/* User Prompt Box */}
        <div className="bg-zinc-950/80 p-3 rounded border border-white/[0.04] text-xs font-mono text-zinc-300 leading-relaxed">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Target Prompt</span>
          <div className="whitespace-pre-wrap">{session.prompt}</div>
        </div>
      </div>

      {/* Plan Approval Alert */}
      {needsApproval && (
        <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded bg-amber-900/30 text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-amber-200">Execution Plan Awaiting Approval</span>
              <p className="text-zinc-400 mt-0.5 font-sans leading-relaxed">
                The agent generated an execution plan. Review the steps below and click Approve to proceed with codebase mutations.
              </p>
            </div>
          </div>

          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="px-3.5 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 self-end sm:self-auto cursor-pointer disabled:opacity-50"
          >
            {isApproving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>Approve Plan</span>
          </button>
        </div>
      )}

      {/* Error state */}
      {error && <ErrorAlert status={error.status} message={error.message} onRetry={onRefresh} />}

      {/* Activities Timeline Header */}
      <div className="flex items-center justify-between pt-2 text-xs font-mono text-zinc-400 border-b border-white/[0.06] pb-2">
        <span className="font-medium text-zinc-200 uppercase tracking-wider text-[11px]">
          Activity Stream ({activities.length})
        </span>
        <span className="text-zinc-500 text-[11px]">Timeline</span>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3">
        {activities.length === 0 && !isLoading && (
          <div className="p-8 text-center bg-[#111215] rounded-lg border border-white/[0.06] text-zinc-400 text-xs font-mono">
            No events recorded yet. Session is initializing...
          </div>
        )}

        {activities.map((act, index) => {
          const isUser = (act.originator || '').toLowerCase() === 'user';
          const plan = act.plan || act.planGenerated?.plan;
          const progress = act.progressUpdated || act.progressUpdate;
          const userMsg = act.userMessage?.text || act.userMessaged?.text || act.userMessaged?.message;
          const directMessage = act.message || act.text || act.description || act.summary;
          const artifacts = Array.isArray(act.artifacts) ? act.artifacts : [];

          const hasBodyContent = Boolean(
            plan ||
            progress ||
            userMsg ||
            directMessage ||
            act.planApproved ||
            act.sessionCompleted ||
            act.bashOutput ||
            act.fileChanges ||
            artifacts.length > 0
          );

          return (
            <div
              key={act.id || index}
              className={`p-3.5 rounded-lg border transition-all ${
                isUser
                  ? 'bg-zinc-900/90 border-zinc-700/80 text-zinc-100 ml-4 sm:ml-8'
                  : 'bg-[#111215] border-white/[0.08] text-zinc-200 mr-2 sm:mr-6'
              }`}
            >
              {/* Event Header */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/[0.04] pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  {isUser ? (
                    <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                      <User className="w-3 h-3 text-zinc-400" />
                      User
                    </span>
                  ) : (
                    <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                      <Logo size="sm" showText={false} />
                      Autonomous Agent
                    </span>
                  )}
                </div>
                <span>{formatRelativeTime(act.createTime)}</span>
              </div>

              {/* Progress Update (Real API & Mock support) */}
              {progress && (
                <div className="space-y-1">
                  {progress.title && (
                    <div className="text-xs font-semibold text-zinc-200 leading-snug font-sans">
                      {progress.title}
                    </div>
                  )}
                  {progress.description && (
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {progress.description}
                    </p>
                  )}
                  {progress.message && !progress.description && (
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {progress.message}
                    </p>
                  )}
                </div>
              )}

              {/* User Message */}
              {userMsg && (
                <p className="text-xs text-zinc-100 font-mono leading-relaxed whitespace-pre-wrap">
                  {userMsg}
                </p>
              )}

              {/* Direct string message if progress is not present */}
              {!progress && !userMsg && directMessage && (
                <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {directMessage}
                </p>
              )}

              {/* Plan Approved Event */}
              {act.planApproved && (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-2 rounded">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Execution plan approved. Autonomous codebase mutations underway.</span>
                </div>
              )}

              {/* Session Completed Event */}
              {act.sessionCompleted && (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-700/50 px-3.5 py-2.5 rounded">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-semibold">Autonomous session successfully completed!</span>
                    <p className="text-[11px] text-zinc-400 font-sans">All tasks, test verifications, and git patches have finished.</p>
                  </div>
                </div>
              )}

              {/* Execution Plan (supports planGenerated and plan) */}
              {plan && Array.isArray(plan.steps) && (
                <div className="mt-2.5 space-y-2.5">
                  <div className="text-xs font-semibold text-zinc-200 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Proposed Plan ({plan.steps.length} Steps)</span>
                  </div>

                  <div className="p-2.5 rounded bg-zinc-950/70 border border-white/[0.04] space-y-1.5">
                    {plan.steps.map((step, idx) => {
                      const isComplete = step.state === 'COMPLETED';
                      const isInProgress = step.state === 'IN_PROGRESS';

                      return (
                        <div
                          key={step.id || idx}
                          className="flex items-start gap-2.5 text-xs font-mono py-1 border-b border-white/[0.03] last:border-0"
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : isInProgress ? (
                            <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0 mt-0.5" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 bg-zinc-900 shrink-0 mt-0.5 flex items-center justify-center text-[9px] text-zinc-400 font-mono">
                              {idx + 1}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <span
                              className={
                                isComplete
                                  ? 'text-zinc-400 line-through opacity-80'
                                  : isInProgress
                                  ? 'text-zinc-100 font-medium'
                                  : 'text-zinc-300'
                              }
                            >
                              {step.title}
                            </span>
                            {step.description && (
                              <p className="text-[11px] text-zinc-400 font-sans mt-0.5 whitespace-pre-wrap leading-relaxed">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Artifacts / Git Patch Viewer (Real API payload) */}
              {artifacts.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  {artifacts.map((art, aIdx) => {
                    const patch = art.changeSet?.gitPatch;
                    if (!patch) return null;
                    const collapseKey = `patch-${index}-${aIdx}`;
                    const isCollapsed = collapsedItems[collapseKey] ?? true;

                    return (
                      <div key={aIdx} className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => toggleCollapse(collapseKey)}
                          className="w-full flex items-center justify-between p-2 rounded bg-zinc-950 border border-white/[0.06] text-xs font-mono text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate text-left">
                            <GitCommit className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-zinc-200 truncate font-semibold">
                              {patch.suggestedCommitMessage ? patch.suggestedCommitMessage.split('\n')[0] : 'Git Patch Artifact'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-900/40">
                              Git Diff
                            </span>
                            {isCollapsed ? (
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                            )}
                          </div>
                        </button>

                        {!isCollapsed && (
                          <div className="space-y-1.5">
                            {patch.suggestedCommitMessage && (
                              <div className="p-2 rounded bg-zinc-950/80 border border-white/[0.04] text-[11px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Commit Message</span>
                                {patch.suggestedCommitMessage}
                              </div>
                            )}

                            {patch.unidiffPatch && (
                              <div className="relative group">
                                <pre className="p-3 rounded bg-[#090a0c] border border-white/[0.06] font-mono text-[10.5px] text-zinc-300 overflow-x-auto max-h-72 leading-relaxed">
                                  {patch.unidiffPatch}
                                </pre>
                                <button
                                  type="button"
                                  onClick={() => copyText(patch.unidiffPatch || '', collapseKey)}
                                  className="absolute right-2 top-2 p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Copy patch diff"
                                >
                                  {copiedIndex === collapseKey ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bash Execution Output */}
              {act.bashOutput && (
                <div className="mt-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(`bash-${index}`)}
                    className="w-full flex items-center justify-between p-2 rounded bg-zinc-950 border border-white/[0.06] text-xs font-mono text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Terminal className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="text-zinc-200 truncate">$ {act.bashOutput.command}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          act.bashOutput.exitCode === 0
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-900/40'
                        }`}
                      >
                        exit {act.bashOutput.exitCode ?? 0}
                      </span>
                      {collapsedItems[`bash-${index}`] ? (
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                    </div>
                  </button>

                  {!collapsedItems[`bash-${index}`] && (
                    <div className="relative group">
                      <pre className="p-3 rounded bg-[#090a0c] border border-white/[0.06] font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-56 leading-relaxed">
                        {act.bashOutput.output || '(no stdout output)'}
                      </pre>
                      <button
                        type="button"
                        onClick={() => copyText(act.bashOutput?.output || '', `bash-${index}`)}
                        className="absolute right-2 top-2 p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Copy command output"
                      >
                        {copiedIndex === `bash-${index}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* File Changes Diff */}
              {act.fileChanges && (
                <div className="mt-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(`files-${index}`)}
                    className="w-full flex items-center justify-between p-2 rounded bg-zinc-950 border border-white/[0.06] text-xs font-mono text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Diff: {act.fileChanges.files.length} file(s) modified</span>
                    </div>
                    {collapsedItems[`files-${index}`] ? (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </button>

                  {!collapsedItems[`files-${index}`] && (
                    <div className="space-y-1.5">
                      {act.fileChanges.files.map((file, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-2.5 rounded bg-zinc-950 border border-white/[0.04] font-mono text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-zinc-200 truncate">{file.path}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              {file.additions !== undefined && (
                                <span className="text-emerald-400 font-mono">+{file.additions}</span>
                              )}
                              {file.deletions !== undefined && (
                                <span className="text-rose-400 font-mono">-{file.deletions}</span>
                              )}
                              <span className="text-[10px] text-zinc-400 px-1 rounded bg-zinc-900 border border-zinc-800">
                                {file.status}
                              </span>
                            </div>
                          </div>
                          {file.patch && (
                            <pre className="p-2 rounded bg-[#090a0c] text-[10px] text-zinc-300 overflow-x-auto max-h-36 border border-white/[0.03] leading-relaxed">
                              {file.patch}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fallback if no specific format matched but activity exists */}
              {!hasBodyContent && (
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 italic py-1">
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Agent recorded an event ({act.name?.split('/').pop() || 'activity'})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Docked Agent Steering Input */}
      <form onSubmit={handleSend} className="sticky bottom-3 z-20 pt-2">
        <div className="p-1.5 bg-[#111215]/95 border border-white/[0.1] rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2">
          <input
            type="text"
            placeholder="Steer the agent (e.g. 'Add unit test for 401 error', 'Skip step 2', 'Verify auth headers')..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            disabled={isSending}
            className="flex-1 px-3 py-2 bg-zinc-950/80 border border-white/[0.06] rounded text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono transition-colors"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || isSending}
            className="px-3.5 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            {isSending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CornerDownLeft className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Send Prompt</span>
          </button>
        </div>
      </form>
    </div>
  );
};

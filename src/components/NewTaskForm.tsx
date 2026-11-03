import React, { useState, useEffect } from 'react';
import { Source, TaskTemplate } from '../utils/julesTypes';
import { TASK_TEMPLATES } from '../utils/templates';
import { ErrorAlert } from './ErrorAlert';
import {
  FolderGit2,
  GitBranch,
  FileText,
  CornerDownLeft,
  RefreshCw,
  ShieldCheck,
  GitPullRequest,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface NewTaskFormProps {
  sources: Source[];
  isLoadingSources: boolean;
  onRefreshSources: () => void;
  onSubmitTask: (taskData: {
    prompt: string;
    source: string;
    startingBranch: string;
    title: string;
    automationMode: 'AUTO_CREATE_PR' | 'AUTOMATION_MODE_UNSPECIFIED';
    requirePlanApproval: boolean;
  }) => Promise<void>;
  prefilledTemplate?: TaskTemplate | null;
  onClearTemplatePrefill?: () => void;
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({
  sources,
  isLoadingSources,
  onRefreshSources,
  onSubmitTask,
  prefilledTemplate,
  onClearTemplatePrefill
}) => {
  const [prompt, setPrompt] = useState(prefilledTemplate?.prompt || '');
  const [title, setTitle] = useState(prefilledTemplate?.title || '');
  const [source, setSource] = useState(
    prefilledTemplate?.suggestedRepo || sources[0]?.name || 'sources/github.com/google/hollow-code'
  );
  const [startingBranch, setStartingBranch] = useState(prefilledTemplate?.startingBranch || 'main');
  const [automationMode, setAutomationMode] = useState<'AUTO_CREATE_PR' | 'AUTOMATION_MODE_UNSPECIFIED'>(
    prefilledTemplate?.automationMode || 'AUTO_CREATE_PR'
  );
  const [requirePlanApproval, setRequirePlanApproval] = useState<boolean>(
    prefilledTemplate?.requirePlanApproval ?? true
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ status?: number; message?: string } | null>(null);

  // Sync source if sources load after initial render
  useEffect(() => {
    if (sources.length > 0 && (!source || source === 'sources/github.com/google/hollow-code')) {
      setSource(sources[0].name);
    }
  }, [sources]);

  // Update fields if prefilledTemplate changes
  useEffect(() => {
    if (prefilledTemplate) {
      setPrompt(prefilledTemplate.prompt);
      setTitle(prefilledTemplate.title);
      setAutomationMode(prefilledTemplate.automationMode);
      setRequirePlanApproval(prefilledTemplate.requirePlanApproval);
      if (prefilledTemplate.suggestedRepo) {
        setSource(prefilledTemplate.suggestedRepo);
      }
    }
  }, [prefilledTemplate]);

  const handleApplyTemplate = (tpl: TaskTemplate) => {
    setPrompt(tpl.prompt);
    setTitle(tpl.title);
    setAutomationMode(tpl.automationMode);
    setRequirePlanApproval(tpl.requirePlanApproval);
    if (tpl.suggestedRepo) setSource(tpl.suggestedRepo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !source) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmitTask({
        prompt: prompt.trim(),
        source,
        startingBranch: startingBranch.trim() || 'main',
        title: title.trim() || prompt.trim().slice(0, 50),
        automationMode,
        requirePlanApproval
      });
      if (onClearTemplatePrefill) onClearTemplatePrefill();
    } catch (err: any) {
      setSubmitError({
        status: err.status || 500,
        message: err.message || 'Failed to submit task to Jules API proxy.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Create Asynchronous Task</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Jules will clone the branch, prepare a plan, and run tests autonomously.
          </p>
        </div>

        {prefilledTemplate && (
          <button
            type="button"
            onClick={onClearTemplatePrefill}
            className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Prefill
          </button>
        )}
      </div>

      {/* Quick Template Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-zinc-400 shrink-0">Quick presets:</span>
        {TASK_TEMPLATES.slice(0, 4).map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => handleApplyTemplate(tpl)}
            className="px-2.5 py-1 rounded bg-[#111215] border border-white/[0.08] hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer"
          >
            {tpl.title}
          </button>
        ))}
      </div>

      {submitError && <ErrorAlert status={submitError.status} message={submitError.message} />}

      {/* Task Creation Form */}
      <form onSubmit={handleSubmit} className="p-5 rounded-lg bg-[#111215] border border-white/[0.08] space-y-4">
        {/* 1. Target Repository */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-200 font-mono flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
              Repository (GET /sources) <span className="text-rose-400">*</span>
            </label>
            <button
              type="button"
              onClick={onRefreshSources}
              disabled={isLoadingSources}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingSources ? 'animate-spin' : ''}`} />
              Sync sources
            </button>
          </div>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={isLoadingSources || sources.length === 0}
            className="w-full px-3 py-2 bg-zinc-950/80 border border-white/[0.08] rounded-md text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
          >
            {sources.length === 0 ? (
              <option value="sources/github.com/google/hollow-code">
                google/hollow-code (sources/github.com/google/hollow-code)
              </option>
            ) : (
              sources.map((src) => (
                <option key={src.name} value={src.name}>
                  {src.repository || src.name} ({src.name})
                </option>
              ))
            )}
          </select>
        </div>

        {/* 2. Prompt Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-200 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              Task Instructions <span className="text-rose-400">*</span>
            </label>
            <span className="text-[10px] font-mono text-zinc-400">{prompt.length} characters</span>
          </div>

          <textarea
            rows={5}
            required
            placeholder="Instruct Jules on what code to write, bugs to solve, or tests to run..."
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (!title || title === prompt.slice(0, 49)) {
                setTitle(e.target.value.slice(0, 50));
              }
            }}
            className="w-full p-3 bg-zinc-950/80 border border-white/[0.08] rounded-md text-xs text-zinc-100 placeholder:text-zinc-600 font-mono focus:outline-none focus:border-zinc-500 leading-relaxed transition-colors"
          />
        </div>

        {/* 3. Title & Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-200 font-mono flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Session Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Fix auth middleware JWT expiration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950/80 border border-white/[0.08] rounded-md text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-200 font-mono flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
              Starting Branch
            </label>
            <input
              type="text"
              placeholder="main"
              value={startingBranch}
              onChange={(e) => setStartingBranch(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950/80 border border-white/[0.08] rounded-md text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>

        {/* 4. Automation & Approval Controls */}
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
            Execution Configuration
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Auto-create PR toggle */}
            <label className="flex items-start gap-2.5 p-3 rounded-md bg-zinc-950/60 border border-white/[0.06] hover:border-zinc-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={automationMode === 'AUTO_CREATE_PR'}
                onChange={(e) =>
                  setAutomationMode(e.target.checked ? 'AUTO_CREATE_PR' : 'AUTOMATION_MODE_UNSPECIFIED')
                }
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-zinc-200 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-zinc-200 block">Auto-create PR</span>
                <span className="text-zinc-400 text-[11px] font-mono leading-tight block mt-0.5">
                  Publishes GitHub PR when task completes
                </span>
              </div>
            </label>

            {/* Require Plan Approval toggle */}
            <label className="flex items-start gap-2.5 p-3 rounded-md bg-zinc-950/60 border border-white/[0.06] hover:border-zinc-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={requirePlanApproval}
                onChange={(e) => setRequirePlanApproval(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-zinc-200 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-zinc-200 block">Require Plan Approval</span>
                <span className="text-zinc-400 text-[11px] font-mono leading-tight block mt-0.5">
                  Pause for human signoff before code edits
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !prompt.trim()}
            className="px-4 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer"
          >
            {isSubmitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CornerDownLeft className="w-3.5 h-3.5" />
            )}
            <span>Dispatch Session (POST /sessions)</span>
          </button>
        </div>
      </form>
    </div>
  );
};

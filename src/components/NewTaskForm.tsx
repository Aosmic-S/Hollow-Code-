import React, { useState, useEffect, useRef } from 'react';
import { Source, TaskTemplate } from '../utils/julesTypes';
import { TASK_TEMPLATES } from '../utils/templates';
import { formatRepoName } from '../utils/julesHelpers';
import { ErrorAlert } from './ErrorAlert';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderGit2,
  GitBranch,
  FileText,
  CornerDownLeft,
  RefreshCw,
  ShieldCheck,
  GitPullRequest,
  Sparkles,
  RotateCcw,
  Search,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  Code2,
  CheckCircle2,
  Wand2,
  AlertCircle
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

  // Custom Repo Selector state
  const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const [customRepoInput, setCustomRepoInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsRepoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync default repo if sources load asynchronously
  useEffect(() => {
    if (sources.length > 0 && (!source || source === 'sources/github.com/google/hollow-code')) {
      const match = sources[0];
      setSource(match.name);
      if (match.defaultBranch) setStartingBranch(match.defaultBranch);
    }
  }, [sources]);

  // Sync prefill template changes
  useEffect(() => {
    if (prefilledTemplate) {
      setPrompt(prefilledTemplate.prompt);
      setTitle(prefilledTemplate.title);
      setAutomationMode(prefilledTemplate.automationMode);
      setRequirePlanApproval(prefilledTemplate.requirePlanApproval);
      if (prefilledTemplate.suggestedRepo) {
        setSource(prefilledTemplate.suggestedRepo);
      }
      if (prefilledTemplate.startingBranch) {
        setStartingBranch(prefilledTemplate.startingBranch);
      }
    }
  }, [prefilledTemplate]);

  const handleApplyTemplate = (tpl: TaskTemplate) => {
    setPrompt(tpl.prompt);
    setTitle(tpl.title);
    setAutomationMode(tpl.automationMode);
    setRequirePlanApproval(tpl.requirePlanApproval);
    if (tpl.suggestedRepo) setSource(tpl.suggestedRepo);
    if (tpl.startingBranch) setStartingBranch(tpl.startingBranch);
  };

  const handleSelectRepo = (selectedSrc: Source) => {
    setSource(selectedSrc.name);
    if (selectedSrc.defaultBranch) {
      setStartingBranch(selectedSrc.defaultBranch);
    }
    setIsCustomMode(false);
    setIsRepoDropdownOpen(false);
  };

  const handleApplyCustomRepo = () => {
    if (!customRepoInput.trim()) return;
    let clean = customRepoInput.trim();
    if (!clean.startsWith('sources/')) {
      clean = clean.startsWith('github.com/') ? `sources/${clean}` : `sources/github.com/${clean}`;
    }
    setSource(clean);
    setIsCustomMode(false);
    setIsRepoDropdownOpen(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || !source || isSubmitting) return;

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
        message: err.message || 'Failed to dispatch task to autonomous engine.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (prompt.trim() && source && !isSubmitting) {
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt, source, isSubmitting, startingBranch, title, automationMode, requirePlanApproval]);

  const selectedRepoClean = formatRepoName(source);
  const filteredSources = sources.filter((s) => {
    const q = repoSearch.toLowerCase();
    return (
      (s.repository || '').toLowerCase().includes(q) ||
      (s.name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">New Project Task</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              Autonomous Studio
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Dispatch an asynchronous coding agent to inspect code, write tests, and submit PRs.
          </p>
        </div>

        {prefilledTemplate && (
          <button
            type="button"
            onClick={onClearTemplatePrefill}
            className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111215] border border-white/[0.08] hover:bg-zinc-800 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Prefilled Template</span>
          </button>
        )}
      </div>

      {submitError && <ErrorAlert status={submitError.status} message={submitError.message} />}

      {/* Main Grid: Form on Left, Preflight on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Main Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-5">
          {/* Section 1: Modern Interactive Repository Selector */}
          <div className="p-4 rounded-xl bg-[#111215] border border-white/[0.08] space-y-3 relative" ref={dropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 font-mono flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-zinc-400" />
                <span>Target Repository</span>
                <span className="text-rose-400 font-sans">*</span>
              </label>

              <button
                type="button"
                onClick={onRefreshSources}
                disabled={isLoadingSources}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 font-mono flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingSources ? 'animate-spin text-zinc-300' : ''}`} />
                <span>Sync Repos</span>
              </button>
            </div>

            {/* Custom Interactive Combobox Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRepoDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-950 border border-white/[0.09] hover:border-zinc-600 rounded-lg text-left transition-all group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-zinc-900 border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-zinc-500 transition-colors">
                    <Code2 className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-100 truncate font-mono">
                        {selectedRepoClean}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-white/[0.06] text-zinc-400">
                        {startingBranch || 'main'}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono truncate block">
                      {source}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-200 shrink-0">
                  <span className="text-[11px] font-mono hidden sm:inline text-zinc-500">Change</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isRepoDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isRepoDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.99 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-2 z-40 bg-[#111215] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
                  >
                    {/* Search inside selector */}
                    <div className="p-2 border-b border-white/[0.06] bg-zinc-950/70">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search repositories..."
                          value={repoSearch}
                          onChange={(e) => setRepoSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/90 border border-white/[0.06] rounded-md text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 font-mono transition-colors"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Source Repos List */}
                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                      {filteredSources.length > 0 ? (
                        filteredSources.map((src) => {
                          const isSelected = source === src.name;
                          return (
                            <button
                              key={src.name}
                              type="button"
                              onClick={() => handleSelectRepo(src)}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-zinc-800/90 border border-white/[0.08] text-zinc-100'
                                  : 'hover:bg-zinc-900/80 text-zinc-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Code2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-zinc-100' : 'text-zinc-500'}`} />
                                <div className="min-w-0">
                                  <div className="text-xs font-mono font-medium truncate">
                                    {src.repository || src.name}
                                  </div>
                                  <div className="text-[10px] font-mono text-zinc-500 truncate">
                                    branch: {src.defaultBranch || 'main'}
                                  </div>
                                </div>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-xs text-zinc-500 font-mono">
                          No repositories matched "{repoSearch}"
                        </div>
                      )}
                    </div>

                    {/* Custom Repository Entry Footer */}
                    <div className="p-2 border-t border-white/[0.06] bg-zinc-950/80">
                      {!isCustomMode ? (
                        <button
                          type="button"
                          onClick={() => setIsCustomMode(true)}
                          className="w-full py-1.5 px-2 text-center text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Enter Custom Repository Name...</span>
                        </button>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                            Custom GitHub Repo (e.g. org/repo):
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="e.g. acme-corp/service-api"
                              value={customRepoInput}
                              onChange={(e) => setCustomRepoInput(e.target.value)}
                              className="flex-1 px-2.5 py-1 bg-zinc-900 border border-white/[0.08] rounded text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                            />
                            <button
                              type="button"
                              onClick={handleApplyCustomRepo}
                              disabled={!customRepoInput.trim()}
                              className="px-2.5 py-1 bg-zinc-200 hover:bg-white text-zinc-950 font-semibold text-xs rounded transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Use
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Repository Pills */}
            {sources.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mr-1">Quick Select:</span>
                {sources.slice(0, 3).map((src) => {
                  const isCurrent = source === src.name;
                  return (
                    <button
                      key={src.name}
                      type="button"
                      onClick={() => handleSelectRepo(src)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-zinc-800 text-zinc-100 border border-white/[0.12] font-semibold'
                          : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-white/[0.04] hover:border-zinc-700'
                      }`}
                    >
                      {formatRepoName(src.name)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Task Instructions Prompt */}
          <div className="p-4 rounded-xl bg-[#111215] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span>Task Instructions & Requirements</span>
                <span className="text-rose-400 font-sans">*</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-500">{prompt.length} chars</span>
            </div>

            <textarea
              rows={6}
              required
              placeholder="Describe what the agent should accomplish. For example:
- Inspect auth token refresh edge cases in src/auth.ts
- Add unit tests covering 401 unauthorized & expired tokens
- Ensure all tests pass and format files before opening PR"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (!title || title === prompt.slice(0, 49)) {
                  setTitle(e.target.value.slice(0, 50));
                }
              }}
              className="w-full p-3.5 bg-zinc-950 border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 font-mono focus:outline-none focus:border-zinc-500 leading-relaxed transition-colors shadow-inner"
            />

            {/* Prompt Helper Injection Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mr-1">Insert Helper:</span>
              {[
                { label: '+ Unit Tests', text: ' Write unit tests with comprehensive assertions for edge cases and error handling.' },
                { label: '+ Strict Types', text: ' Ensure zero TypeScript errors and export strict interface types.' },
                { label: '+ CI Verification', text: ' Run the test suite and verify clean execution before generating changes.' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt((prev) => prev + chip.text)}
                  className="px-2 py-0.5 rounded bg-zinc-950 border border-white/[0.06] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[10.5px] font-mono transition-colors cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Title & Starting Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#111215] border border-white/[0.08] space-y-1.5">
              <label className="text-xs font-semibold text-zinc-200 font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Task Title (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Fix token expiration in auth middleware"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-white/[0.08] rounded-md text-xs text-zinc-100 placeholder:text-zinc-600 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#111215] border border-white/[0.08] space-y-1.5">
              <label className="text-xs font-semibold text-zinc-200 font-mono flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                <span>Starting Branch</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="main"
                  value={startingBranch}
                  onChange={(e) => setStartingBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-white/[0.08] rounded-md text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
                />
                {['main', 'master'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setStartingBranch(b)}
                    className={`px-2 py-2 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                      startingBranch === b
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold'
                        : 'bg-zinc-950 text-zinc-400 border-white/[0.06] hover:text-zinc-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Or Start From A Recommended Preset:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TASK_TEMPLATES.slice(0, 4).map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="p-2.5 rounded-lg bg-[#111215] border border-white/[0.06] hover:border-zinc-600 text-left transition-all group cursor-pointer"
                >
                  <div className="text-xs font-medium text-zinc-200 group-hover:text-zinc-100 truncate">
                    {tpl.title}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5 truncate">
                    {tpl.category}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Right Column (4 cols): Execution Controls & Preflight Dispatch */}
        <div className="lg:col-span-4 space-y-4">
          {/* Execution Strategy Card */}
          <div className="p-4 rounded-xl bg-[#111215] border border-white/[0.08] space-y-3.5">
            <h3 className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Execution Strategy</span>
            </h3>

            {/* Auto-create PR toggle card */}
            <div
              onClick={() =>
                setAutomationMode((prev) =>
                  prev === 'AUTO_CREATE_PR' ? 'AUTOMATION_MODE_UNSPECIFIED' : 'AUTO_CREATE_PR'
                )
              }
              className={`p-3 rounded-lg border transition-all cursor-pointer select-none ${
                automationMode === 'AUTO_CREATE_PR'
                  ? 'bg-zinc-900/90 border-white/[0.12] text-zinc-100'
                  : 'bg-zinc-950/60 border-white/[0.04] text-zinc-400 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitPullRequest className={`w-3.5 h-3.5 ${automationMode === 'AUTO_CREATE_PR' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span className="text-xs font-medium text-zinc-200">Auto-create PR</span>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    automationMode === 'AUTO_CREATE_PR'
                      ? 'bg-zinc-100 border-zinc-100 text-zinc-950'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}
                >
                  {automationMode === 'AUTO_CREATE_PR' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">
                Automatically opens a Pull Request on GitHub once tests pass.
              </p>
            </div>

            {/* Require Plan Approval toggle card */}
            <div
              onClick={() => setRequirePlanApproval((prev) => !prev)}
              className={`p-3 rounded-lg border transition-all cursor-pointer select-none ${
                requirePlanApproval
                  ? 'bg-zinc-900/90 border-white/[0.12] text-zinc-100'
                  : 'bg-zinc-950/60 border-white/[0.04] text-zinc-400 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-3.5 h-3.5 ${requirePlanApproval ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span className="text-xs font-medium text-zinc-200">Plan Approval Gate</span>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    requirePlanApproval
                      ? 'bg-zinc-100 border-zinc-100 text-zinc-950'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}
                >
                  {requirePlanApproval && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">
                Pauses execution to let you inspect proposed steps before files are modified.
              </p>
            </div>
          </div>

          {/* Preflight Summary & Dispatch Button */}
          <div className="p-4 rounded-xl bg-[#111215] border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider">
              Preflight Check
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Repository:</span>
                <span className="text-zinc-200 font-medium truncate max-w-[150px]">{selectedRepoClean}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Branch:</span>
                <span className="text-zinc-300">{startingBranch || 'main'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Mode:</span>
                <span className="text-zinc-300">
                  {automationMode === 'AUTO_CREATE_PR' ? 'Auto PR' : 'Manual Branch'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Approval:</span>
                <span className={requirePlanApproval ? 'text-amber-400' : 'text-zinc-400'}>
                  {requirePlanApproval ? 'Required' : 'Autonomous'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || !prompt.trim() || !source}
                className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Launching Agent...</span>
                  </>
                ) : (
                  <>
                    <CornerDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Launch Autonomous Agent</span>
                  </>
                )}
              </button>

              <div className="text-[10px] text-zinc-500 font-mono text-center mt-2 flex items-center justify-center gap-1">
                <span>Shortcut:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  ⌘+Enter
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

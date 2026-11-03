import React, { useState } from 'react';
import { Source } from '../utils/julesTypes';
import { formatRepoName } from '../utils/julesHelpers';
import { ErrorAlert } from './ErrorAlert';
import { FolderGit2, GitBranch, RefreshCw, Plus, ExternalLink, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface SourcesListProps {
  sources: Source[];
  isLoading: boolean;
  error: { status?: number; message?: string } | null;
  onRefresh: () => void;
  onSelectRepoForNewTask: (repoSource: string) => void;
}

export const SourcesList: React.FC<SourcesListProps> = ({
  sources,
  isLoading,
  error,
  onRefresh,
  onSelectRepoForNewTask
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(sources.length / itemsPerPage) || 1;
  const paginatedSources = sources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-zinc-400" />
            Connected Repositories
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            GitHub repositories authorized for autonomous asynchronous coding sessions (GET /sources).
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1.5 rounded bg-[#111215] hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-white/[0.08] flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Sources</span>
        </button>
      </div>

      {error && <ErrorAlert status={error.status} message={error.message} onRetry={onRefresh} />}

      {/* Grid of Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {paginatedSources.map((src, index) => {
          const repoClean = formatRepoName(src?.repository || src?.name);
          const srcName = src?.name || `source-${index}`;

          return (
            <motion.div
              key={srcName}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              whileHover={{ y: -2 }}
              className="p-4 rounded-lg bg-[#111215] border border-white/[0.08] hover:border-white/[0.2] hover:bg-[#15161a] transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded bg-zinc-900 border border-white/[0.04] text-zinc-400">
                    <FolderGit2 className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 font-mono truncate" title={repoClean}>
                    {repoClean}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5" title={src.name}>
                    {src.name}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono pt-1">
                  <GitBranch className="w-3 h-3 text-zinc-500" />
                  <span>Default branch: <strong className="text-zinc-200">{src.defaultBranch || 'main'}</strong></span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                <a
                  href={`https://${src.id || src.repository || repoClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-200 font-mono text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>

                <button
                  onClick={() => onSelectRepoForNewTask(src.name)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Task</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {sources.length > 0 && (
        <div className="p-3 rounded-lg bg-[#111215] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>
            {sources.length} total repositories connected
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

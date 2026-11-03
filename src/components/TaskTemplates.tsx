import React from 'react';
import { TASK_TEMPLATES } from '../utils/templates';
import { TaskTemplate } from '../utils/julesTypes';
import { ArrowRight, GitPullRequest, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskTemplatesProps {
  onSelectTemplate: (template: TaskTemplate) => void;
}

export const TaskTemplates: React.FC<TaskTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            Task Templates
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Curated prompt patterns for autonomous asynchronous coding workflows.
          </p>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {TASK_TEMPLATES.map((tpl, i) => (
          <motion.div
            key={tpl.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            whileHover={{ y: -2 }}
            onClick={() => onSelectTemplate(tpl)}
            className="group p-4 rounded-lg bg-[#111215] border border-white/[0.08] hover:border-white/[0.2] hover:bg-[#15161a] transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900 border border-white/[0.04]">
                  {tpl.category}
                </span>
                <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                {tpl.title}
              </h3>

              <p className="text-xs text-zinc-400 leading-relaxed font-sans">{tpl.description}</p>

              <div className="p-2.5 rounded bg-zinc-950/80 border border-white/[0.04] text-[11px] font-mono text-zinc-400 line-clamp-3 leading-relaxed">
                &gt; {tpl.prompt}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                {tpl.automationMode === 'AUTO_CREATE_PR' && (
                  <span className="flex items-center gap-1 text-zinc-300">
                    <GitPullRequest className="w-3 h-3 text-zinc-400" />
                    Auto PR
                  </span>
                )}
                {tpl.requirePlanApproval && (
                  <span className="flex items-center gap-1 text-amber-400/90">
                    <ShieldCheck className="w-3 h-3" />
                    Review
                  </span>
                )}
              </div>

              <span className="text-zinc-400 group-hover:text-zinc-200 font-medium">Use preset</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

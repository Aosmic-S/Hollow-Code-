import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  ShieldCheck,
  GitPullRequest,
  AlertTriangle,
  Play,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';

interface AutomationRule {
  id: string;
  title: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  category: 'ci' | 'security' | 'review' | 'testing';
  lastRun?: string;
  runsCount: number;
}

export const AutomationsView: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'auto-ci-heal',
      title: 'Auto-Heal Failing CI Checks',
      description: 'Dispatches an agent to inspect failing GitHub Action logs, isolate the failing test, and push a patch branch.',
      trigger: 'On GitHub Check Suite Failure (exitCode !== 0)',
      action: 'Spawn session with prompt: "Analyze failure logs and submit fix PR"',
      enabled: true,
      category: 'ci',
      lastRun: '18 minutes ago',
      runsCount: 14
    },
    {
      id: 'dependabot-patch',
      title: 'Dependabot Vulnerability Auto-Resolver',
      description: 'When Dependabot or npm audit flags a CVE, the agent checks compatibility, runs the test suite, and updates package.json.',
      trigger: 'On Security Alert (High / Critical CVE)',
      action: 'Run "npm audit fix", verify test suite, and open verified PR',
      enabled: true,
      category: 'security',
      lastRun: '2 days ago',
      runsCount: 8
    },
    {
      id: 'pr-pre-review',
      title: 'Autonomous Pull Request Pre-Review',
      description: 'Performs linting, strict TypeScript checks, and security audit on all newly opened pull requests before human engineers review.',
      trigger: 'On Pull Request Opened',
      action: 'Post automated review summary & comment with suggested patches',
      enabled: false,
      category: 'review',
      lastRun: 'Never',
      runsCount: 0
    },
    {
      id: 'missing-test-gen',
      title: 'Missing Unit Test Generator',
      description: 'Scans recently changed utility functions and services lacking unit test coverage and generates Jest/node:test files.',
      trigger: 'Nightly Scheduled (00:00 UTC)',
      action: 'Inspect diffs, generate test cases, and open PR with coverage report',
      enabled: true,
      category: 'testing',
      lastRun: 'Yesterday',
      runsCount: 5
    }
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-5xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-zinc-300" />
            <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">Autonomous Workflows</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              Event Driven
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Event-driven triggers that dispatch coding agents automatically on GitHub Webhooks and schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-zinc-400 bg-[#111215] px-3 py-1.5 rounded-lg border border-white/[0.06]">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>{rules.filter((r) => r.enabled).length} Active Rules</span>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule, idx) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className={`p-5 rounded-xl border transition-all space-y-3 relative overflow-hidden ${
              rule.enabled
                ? 'bg-[#111215] border-white/[0.08]'
                : 'bg-zinc-950/60 border-white/[0.04] opacity-75'
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                  {rule.category} automation
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">{rule.title}</h3>
              </div>

              {/* Animated Switch */}
              <button
                type="button"
                onClick={() => toggleRule(rule.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                  rule.enabled ? 'bg-zinc-100' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-zinc-950 transition-transform ${
                    rule.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {rule.description}
            </p>

            {/* Trigger & Action specs */}
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/[0.04] space-y-1.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[10.5px]">Trigger:</span>
                <span className="text-zinc-300 text-[11px] truncate">{rule.trigger}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[10.5px]">Action:</span>
                <span className="text-emerald-400/90 text-[11px] truncate">{rule.action}</span>
              </div>
            </div>

            {/* Bottom metadata */}
            <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-500 border-t border-white/[0.04]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last run: {rule.lastRun}
              </span>
              <span>{rule.runsCount} executions</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

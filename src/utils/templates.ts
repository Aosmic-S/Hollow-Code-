import { TaskTemplate } from './julesTypes';

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'fix-failing-tests',
    title: 'Fix failing tests',
    description: 'Inspect CI/CD test logs, locate failing assertions, and apply clean fixes across code & specs.',
    prompt: 'Run the test suite, identify any failing test cases or unhandled edge cases, and fix the underlying code so all tests pass cleanly. Ensure code formatting is preserved.',
    automationMode: 'AUTO_CREATE_PR',
    requirePlanApproval: true,
    category: 'bugfix'
  },
  {
    id: 'add-unit-tests',
    title: 'Add unit tests',
    description: 'Generate unit test coverage for untested utilities and core components.',
    prompt: 'Analyze untested utility functions and state hooks. Add comprehensive unit tests covering happy paths, null/undefined inputs, and async error conditions.',
    automationMode: 'AUTO_CREATE_PR',
    requirePlanApproval: false,
    category: 'testing'
  },
  {
    id: 'review-pr',
    title: 'Review this PR',
    description: 'Perform an in-depth security, performance, and style review on the current branch.',
    prompt: 'Perform a code review on recent commits. Check for potential memory leaks, unhandled exceptions, accessibility flaws, and non-conforming style guidelines. Suggest refactoring.',
    automationMode: 'AUTOMATION_MODE_UNSPECIFIED',
    requirePlanApproval: true,
    category: 'refactor'
  },
  {
    id: 'update-dependencies',
    title: 'Update dependencies',
    description: 'Bump project dependencies to latest compatible versions and verify build integrity.',
    prompt: 'Audit package.json for outdated or vulnerable dependencies. Safely bump minor and patch versions, update package-lock.json, and verify that compilation succeeds.',
    automationMode: 'AUTO_CREATE_PR',
    requirePlanApproval: true,
    category: 'deps'
  },
  {
    id: 'optimize-performance',
    title: 'Optimize performance',
    description: 'Identify slow rendering components, large bundles, or inefficient queries.',
    prompt: 'Inspect application bottlenecks. Refactor heavy re-renders, memoize expensive calculations, and optimize module imports to improve time-to-interactive.',
    automationMode: 'AUTO_CREATE_PR',
    requirePlanApproval: true,
    category: 'perf'
  },
  {
    id: 'generate-docs',
    title: 'Generate documentation',
    description: 'Create concise README instructions and API JSDoc documentation.',
    prompt: 'Document exported functions with standard JSDoc comments. Update README.md with clear environment configuration steps, architecture overview, and usage examples.',
    automationMode: 'AUTO_CREATE_PR',
    requirePlanApproval: false,
    category: 'docs'
  }
];

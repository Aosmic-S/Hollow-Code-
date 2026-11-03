export interface Source {
  name: string; // e.g. "sources/github.com/google/hollow-code"
  id: string;   // e.g. "github.com/google/hollow-code"
  repository: string; // e.g. "google/hollow-code"
  defaultBranch: string;
}

export type SessionState = 
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'AWAITING_PLAN_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface PullRequestOutput {
  url: string;
  number?: number;
  title?: string;
  headBranch?: string;
  baseBranch?: string;
}

export interface SessionOutputs {
  pullRequest?: PullRequestOutput;
}

export interface Session {
  name: string; // "sessions/xyz123"
  id: string;   // "xyz123"
  title: string;
  prompt: string;
  source: string;
  startingBranch: string;
  automationMode?: 'AUTO_CREATE_PR' | 'AUTOMATION_MODE_UNSPECIFIED';
  requirePlanApproval?: boolean;
  state: SessionState;
  createTime: string;
  updateTime: string;
  outputs?: SessionOutputs;
}

export interface PlanStep {
  id?: string;
  title: string;
  description?: string;
  state: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
}

export interface PlanActivity {
  steps: PlanStep[];
}

export interface ProgressUpdateActivity {
  message: string;
}

export interface BashOutputActivity {
  command: string;
  output: string;
  exitCode?: number;
}

export interface FileChange {
  path: string;
  status: 'ADDED' | 'MODIFIED' | 'DELETED';
  additions?: number;
  deletions?: number;
  patch?: string;
}

export interface FileChangesActivity {
  summary?: string;
  files: FileChange[];
}

export interface UserMessageActivity {
  text: string;
}

export interface Activity {
  name: string; // "sessions/xyz123/activities/act1"
  id: string;
  createTime: string;
  originator: 'AGENT' | 'USER' | 'SYSTEM';
  plan?: PlanActivity;
  progressUpdate?: ProgressUpdateActivity;
  bashOutput?: BashOutputActivity;
  fileChanges?: FileChangesActivity;
  userMessage?: UserMessageActivity;
  errorDetails?: {
    code: number;
    message: string;
  };
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  suggestedRepo?: string;
  startingBranch?: string;
  automationMode: 'AUTO_CREATE_PR' | 'AUTOMATION_MODE_UNSPECIFIED';
  requirePlanApproval: boolean;
  category: 'testing' | 'bugfix' | 'refactor' | 'deps' | 'docs' | 'perf';
}

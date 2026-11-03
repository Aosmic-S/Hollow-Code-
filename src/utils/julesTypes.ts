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
  message?: string;
  title?: string;
  description?: string;
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

export interface ActivityArtifact {
  changeSet?: {
    source?: string;
    gitPatch?: {
      unidiffPatch?: string;
      suggestedCommitMessage?: string;
      baseCommitId?: string;
    };
  };
  [key: string]: any;
}

export interface Activity {
  name: string;
  id: string;
  createTime: string;
  originator: 'AGENT' | 'USER' | 'SYSTEM' | 'agent' | 'user' | 'system' | string;
  // Standard and real API activity variants
  plan?: PlanActivity;
  planGenerated?: {
    plan: {
      id?: string;
      steps: PlanStep[];
    };
  };
  planApproved?: {
    planId?: string;
  };
  progressUpdate?: ProgressUpdateActivity;
  progressUpdated?: {
    title?: string;
    description?: string;
    message?: string;
  };
  artifacts?: ActivityArtifact[];
  sessionCompleted?: Record<string, any>;
  bashOutput?: BashOutputActivity;
  fileChanges?: FileChangesActivity;
  userMessage?: UserMessageActivity;
  userMessaged?: {
    message?: string;
    text?: string;
  };
  message?: string;
  text?: string;
  description?: string;
  title?: string;
  summary?: string;
  errorDetails?: {
    code: number;
    message: string;
  };
  [key: string]: any;
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

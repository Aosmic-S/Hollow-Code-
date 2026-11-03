import { SessionState } from './julesTypes';

export function formatSessionState(state: SessionState): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (state) {
    case 'QUEUED':
      return {
        label: 'Queued',
        badgeClass: 'bg-zinc-900 text-zinc-400 border-zinc-800',
        dotClass: 'bg-zinc-500'
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        badgeClass: 'bg-zinc-900 text-zinc-200 border-zinc-700',
        dotClass: 'bg-sky-400 animate-pulse'
      };
    case 'AWAITING_PLAN_APPROVAL':
      return {
        label: 'Awaiting Approval',
        badgeClass: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
        dotClass: 'bg-amber-400'
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
        dotClass: 'bg-emerald-400'
      };
    case 'FAILED':
      return {
        label: 'Failed',
        badgeClass: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
        dotClass: 'bg-rose-400'
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        badgeClass: 'bg-zinc-900 text-zinc-500 border-zinc-800',
        dotClass: 'bg-zinc-600'
      };
    default:
      return {
        label: state || 'Unknown',
        badgeClass: 'bg-zinc-900 text-zinc-400 border-zinc-800',
        dotClass: 'bg-zinc-500'
      };
  }
}

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 10) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function parseErrorMessage(status: number, message?: string): { title: string; detail: string; isRateLimit: boolean } {
  if (status === 429) {
    return {
      title: 'API Rate Limit Exceeded (429)',
      detail: 'The Agent API (v1alpha) rate limit was reached. Automatic requests will retry shortly once quota resets.',
      isRateLimit: true
    };
  }
  if (status >= 500) {
    return {
      title: 'Agent Service Error (5xx)',
      detail: message || `Autonomous agent service returned HTTP ${status}. The v1alpha endpoint may be undergoing maintenance.`,
      isRateLimit: false
    };
  }
  if (status === 401 || status === 403) {
    return {
      title: 'Authentication Error (401/403)',
      detail: 'Agent API key is missing or invalid. Check the server environment configuration.',
      isRateLimit: false
    };
  }
  return {
    title: `Error (${status || 'Fetch Failed'})`,
    detail: message || 'Unable to complete request to agent engine proxy.',
    isRateLimit: false
  };
}

export function formatRepoName(source?: string | null): string {
  if (!source || typeof source !== 'string') return 'workspace-repo';
  return source.replace(/^sources\/github\.com\//, '').replace(/^sources\//, '');
}

export function getSessionId(session?: { id?: string; name?: string } | null): string {
  if (!session) return 'session';
  if (session.id && typeof session.id === 'string') return session.id;
  if (session.name && typeof session.name === 'string') return session.name.replace(/^sessions\//, '');
  return 'session';
}


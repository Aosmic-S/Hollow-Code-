import React from 'react';
import { Clock, RefreshCw, ServerCrash, KeyRound } from 'lucide-react';
import { parseErrorMessage } from '../utils/julesHelpers';

interface ErrorAlertProps {
  status?: number;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ status = 500, message, onRetry, className = '' }) => {
  const parsed = parseErrorMessage(status, message);

  return (
    <div
      className={`p-3.5 rounded-lg border bg-rose-950/20 border-rose-900/40 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <div className="p-1 rounded bg-rose-900/30 text-rose-400 shrink-0 mt-0.5">
          {parsed.isRateLimit ? (
            <Clock className="w-4 h-4" />
          ) : status === 401 || status === 403 ? (
            <KeyRound className="w-4 h-4" />
          ) : (
            <ServerCrash className="w-4 h-4" />
          )}
        </div>
        <div>
          <span className="font-semibold text-rose-100">{parsed.title}</span>
          <p className="text-zinc-400 mt-0.5 leading-relaxed font-sans">{parsed.detail}</p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 text-xs font-mono border border-rose-800/40 flex items-center gap-1.5 transition-colors shrink-0 self-end sm:self-auto"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
};

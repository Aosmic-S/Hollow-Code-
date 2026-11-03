import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
  showTagline = false
}) => {
  const dimensions = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 20 : 15;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Precision Hollow Ring */}
      <div
        className={`${dimensions} rounded-full border border-zinc-700 bg-zinc-900/90 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-zinc-500`}
        aria-hidden="true"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-200 transition-transform duration-200 group-hover:scale-105"
        >
          <polyline points="8 17 3 12 8 7" />
          <line x1="14" y1="4" x2="10" y2="20" strokeWidth="1.8" />
          <polyline points="16 7 21 12 16 17" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-zinc-100 font-sans leading-none">
            Hollow Code
          </span>
          {showTagline && (
            <span className="hidden sm:inline text-[11px] text-zinc-400 font-mono tracking-normal mt-0.5 leading-none">
              Code while you&apos;re gone.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

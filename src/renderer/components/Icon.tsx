import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

const ICONS: Record<string, (size: number) => React.ReactElement> = {
  star: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.52l-3.52 1.83.67-3.93L2.3 5.64l3.94-.57z" />
    </svg>
  ),
  file: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V4.5z" />
      <path d="M9.5 1.5V4.5h3.5" />
    </svg>
  ),
  folder: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5a1 1 0 011-1h3.17a1 1 0 01.7.29l1.42 1.42a1 1 0 00.7.29H13a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1z" />
    </svg>
  ),
  app: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2h4v4H3zM9 2h4v4H9zM3 8h4v4H3zM9 8h4v4H9z" rx="1" />
    </svg>
  ),
  settings: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2" />
      <path d="M13.3 9.7a1.1 1.1 0 00.2 1.2l.04.04a1.33 1.33 0 11-1.88 1.88l-.04-.04a1.1 1.1 0 00-1.88.78v.12a1.33 1.33 0 11-2.67 0v-.06a1.1 1.1 0 00-.72-1.01 1.1 1.1 0 00-1.2.24l-.03.04a1.33 1.33 0 11-1.89-1.89l.04-.04a1.1 1.1 0 00-.78-1.87H2.33a1.33 1.33 0 010-2.67h.07a1.1 1.1 0 001-.72 1.1 1.1 0 00-.23-1.2l-.04-.03A1.33 1.33 0 115 3.13l.04.04a1.1 1.1 0 001.2.23h.05a1.1 1.1 0 00.67-1.01V2.33a1.33 1.33 0 012.67 0v.06a1.1 1.1 0 00.67 1.01 1.1 1.1 0 001.2-.23l.04-.04a1.33 1.33 0 111.88 1.88l-.04.04a1.1 1.1 0 00-.23 1.2v.05a1.1 1.1 0 001.01.67h.06a1.33 1.33 0 010 2.67h-.06a1.1 1.1 0 00-1.01.67z" />
    </svg>
  ),
  search: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="6.5" r="4" />
      <path d="M14 14l-3.5-3.5" />
    </svg>
  ),
  web: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M2 8h12M8 2a10 10 0 013 6 10 10 0 01-3 6 10 10 0 01-3-6 10 10 0 013-6z" />
    </svg>
  ),
  globe: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M2 6h12M2 10h12" />
      <ellipse cx="8" cy="8" rx="3" ry="6" />
    </svg>
  ),
  math: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M4 4h8M4 8h8M4 12h8M6 2v4M10 6v4M6 10v4" />
    </svg>
  ),
  clipboard: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2.5" width="10" height="12" rx="1" />
      <path d="M6 2.5V2a1 1 0 011-1h2a1 1 0 011 1v.5" />
      <path d="M6 7h4M6 9.5h4" />
    </svg>
  ),
  color: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="5" r="1.5" fill="currentColor" />
      <circle cx="5.5" cy="9.5" r="1.5" fill="currentColor" />
      <circle cx="10.5" cy="9.5" r="1.5" fill="currentColor" />
    </svg>
  ),
};

export function Icon({ name, className, size = 14 }: IconProps) {
  const render = ICONS[name];
  if (!render) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
        <circle cx="8" cy="8" r="3" />
      </svg>
    );
  }
  return <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{render(size)}</span>;
}

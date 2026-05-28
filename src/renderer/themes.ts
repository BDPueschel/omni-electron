import type { OmniTheme } from '../shared/types';

interface ThemeColors {
  bg: string;
  text: string;
  muted: string;
  accent: string;
  accentBg: string;
  separator: string;
  groupText: string;
}

const THEMES: Record<OmniTheme, ThemeColors> = {
  midnight: {
    bg: '#0a0a0f',
    text: '#e0e0e0',
    muted: 'rgba(255,255,255,0.35)',
    accent: '#82b4ff',
    accentBg: 'rgba(130,180,255,0.12)',
    separator: 'rgba(255,255,255,0.06)',
    groupText: 'rgba(130,180,255,0.5)',
  },
  obsidian: {
    bg: '#1a1a1a',
    text: '#d4d4d4',
    muted: 'rgba(255,255,255,0.30)',
    accent: '#e0a050',
    accentBg: 'rgba(224,160,80,0.12)',
    separator: 'rgba(255,255,255,0.06)',
    groupText: 'rgba(224,160,80,0.5)',
  },
  nord: {
    bg: '#2e3440',
    text: '#eceff4',
    muted: 'rgba(236,239,244,0.40)',
    accent: '#88c0d0',
    accentBg: 'rgba(136,192,208,0.12)',
    separator: 'rgba(236,239,244,0.08)',
    groupText: 'rgba(136,192,208,0.6)',
  },
  solarized: {
    bg: '#002b36',
    text: '#93a1a1',
    muted: 'rgba(147,161,161,0.50)',
    accent: '#268bd2',
    accentBg: 'rgba(38,139,210,0.15)',
    separator: 'rgba(147,161,161,0.10)',
    groupText: 'rgba(38,139,210,0.6)',
  },
  monokai: {
    bg: '#272822',
    text: '#f8f8f2',
    muted: 'rgba(248,248,242,0.35)',
    accent: '#a6e22e',
    accentBg: 'rgba(166,226,46,0.10)',
    separator: 'rgba(248,248,242,0.06)',
    groupText: 'rgba(166,226,46,0.5)',
  },
  dracula: {
    bg: '#282a36',
    text: '#f8f8f2',
    muted: 'rgba(248,248,242,0.40)',
    accent: '#bd93f9',
    accentBg: 'rgba(189,147,249,0.12)',
    separator: 'rgba(248,248,242,0.06)',
    groupText: 'rgba(189,147,249,0.5)',
  },
};

export function applyTheme(theme: OmniTheme): void {
  const colors = THEMES[theme] ?? THEMES.midnight;
  const root = document.documentElement;
  root.style.setProperty('--color-omni-bg', colors.bg);
  root.style.setProperty('--color-omni-text', colors.text);
  root.style.setProperty('--color-omni-muted', colors.muted);
  root.style.setProperty('--color-omni-accent', colors.accent);
  root.style.setProperty('--color-omni-accent-bg', colors.accentBg);
  root.style.setProperty('--color-omni-separator', colors.separator);
  root.style.setProperty('--color-omni-group-text', colors.groupText);
  document.body.style.background = colors.bg;
}

export const THEME_NAMES: Record<OmniTheme, string> = {
  midnight: 'Midnight',
  obsidian: 'Obsidian',
  nord: 'Nord',
  solarized: 'Solarized Dark',
  monokai: 'Monokai',
  dracula: 'Dracula',
};

export const THEME_ACCENTS: Record<OmniTheme, string> = {
  midnight: '#82b4ff',
  obsidian: '#e0a050',
  nord: '#88c0d0',
  solarized: '#268bd2',
  monokai: '#a6e22e',
  dracula: '#bd93f9',
};

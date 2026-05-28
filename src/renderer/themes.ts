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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function accentColors(hex: string): Pick<ThemeColors, 'accent' | 'accentBg' | 'groupText'> {
  const { r, g, b } = hexToRgb(hex);
  return {
    accent: hex,
    accentBg: `rgba(${r},${g},${b},0.12)`,
    groupText: `rgba(${r},${g},${b},0.5)`,
  };
}

const THEMES: Record<Exclude<OmniTheme, 'mono'>, ThemeColors> = {
  midnight: {
    bg: '#0a0a0f',
    text: '#e0e0e0',
    muted: 'rgba(255,255,255,0.35)',
    separator: 'rgba(255,255,255,0.06)',
    ...accentColors('#82b4ff'),
  },
  obsidian: {
    bg: '#1a1a1a',
    text: '#d4d4d4',
    muted: 'rgba(255,255,255,0.30)',
    separator: 'rgba(255,255,255,0.06)',
    ...accentColors('#e0a050'),
  },
  nord: {
    bg: '#2e3440',
    text: '#eceff4',
    muted: 'rgba(236,239,244,0.40)',
    separator: 'rgba(236,239,244,0.08)',
    ...accentColors('#88c0d0'),
  },
  solarized: {
    bg: '#002b36',
    text: '#93a1a1',
    muted: 'rgba(147,161,161,0.50)',
    separator: 'rgba(147,161,161,0.10)',
    ...accentColors('#268bd2'),
  },
  monokai: {
    bg: '#272822',
    text: '#f8f8f2',
    muted: 'rgba(248,248,242,0.35)',
    separator: 'rgba(248,248,242,0.06)',
    ...accentColors('#a6e22e'),
  },
  dracula: {
    bg: '#282a36',
    text: '#f8f8f2',
    muted: 'rgba(248,248,242,0.40)',
    separator: 'rgba(248,248,242,0.06)',
    ...accentColors('#bd93f9'),
  },
};

function monoTheme(accent: string): ThemeColors {
  return {
    bg: '#0c0c0c',
    text: '#c8c8c8',
    muted: 'rgba(200,200,200,0.35)',
    separator: 'rgba(255,255,255,0.05)',
    ...accentColors(accent),
  };
}

export function applyTheme(theme: OmniTheme, customAccent?: string): void {
  const colors = theme === 'mono'
    ? monoTheme(customAccent || '#3b82f6')
    : THEMES[theme] ?? THEMES.midnight;
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
  mono: 'Mono',
  midnight: 'Midnight',
  obsidian: 'Obsidian',
  nord: 'Nord',
  solarized: 'Solarized',
  monokai: 'Monokai',
  dracula: 'Dracula',
};

export const THEME_ACCENTS: Record<OmniTheme, string> = {
  mono: '#3b82f6',
  midnight: '#82b4ff',
  obsidian: '#e0a050',
  nord: '#88c0d0',
  solarized: '#268bd2',
  monokai: '#a6e22e',
  dracula: '#bd93f9',
};

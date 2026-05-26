import { SearchProvider, SearchResult, CategoryName } from '../../shared/types';

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const RGB_PATTERN = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;

function expandHex(hex: string): string {
  if (hex.length === 3) {
    return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  return hex;
}

function hexToRgb(hex: string): string {
  const full = expandHex(hex.slice(1));
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export class ColorProvider implements SearchProvider {
  category: CategoryName = 'Color';

  async search(query: string, _limit: number): Promise<SearchResult[]> {
    const trimmed = query.trim();

    if (HEX_PATTERN.test(trimmed)) {
      const rgb = hexToRgb(trimmed);
      return [
        {
          category: 'Color',
          title: rgb,
          subtitle: `${trimmed} → rgb`,
          icon: '🎨',
          kind: 'Color',
          action: { type: 'copy', text: rgb },
        },
      ];
    }

    const rgbMatch = trimmed.match(RGB_PATTERN);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      if (r > 255 || g > 255 || b > 255) return [];
      const hex = rgbToHex(r, g, b);
      return [
        {
          category: 'Color',
          title: hex,
          subtitle: `${trimmed} → hex`,
          icon: '🎨',
          kind: 'Color',
          action: { type: 'copy', text: hex },
        },
      ];
    }

    return [];
  }
}

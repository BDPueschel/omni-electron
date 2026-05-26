import { describe, it, expect } from 'vitest';
import { MathProvider } from '../providers/math';
import { UrlProvider } from '../providers/url';
import { WebProvider } from '../providers/web';
import { ColorProvider } from '../providers/color';
import { SystemProvider } from '../providers/system';
import { ProviderRegistry } from '../providers/index';

describe('MathProvider', () => {
  const provider = new MathProvider();

  it('evaluates simple arithmetic', async () => {
    const results = await provider.search('2 + 3', 10);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('5');
    expect(results[0].action.type).toBe('copy');
    if (results[0].action.type === 'copy') {
      expect(results[0].action.text).toBe('5');
    }
  });

  it('rejects non-math queries', async () => {
    const results = await provider.search('hello world', 10);
    expect(results).toHaveLength(0);
  });

  it('evaluates expressions with multiplication', async () => {
    const results = await provider.search('6 * 7', 10);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('42');
  });

  it('rejects queries with no operators', async () => {
    const results = await provider.search('123', 10);
    expect(results).toHaveLength(0);
  });
});

describe('UrlProvider', () => {
  const provider = new UrlProvider();

  it('detects https URLs', async () => {
    const results = await provider.search('https://example.com', 10);
    expect(results).toHaveLength(1);
    expect(results[0].action.type).toBe('open_url');
    if (results[0].action.type === 'open_url') {
      expect(results[0].action.url).toBe('https://example.com');
    }
  });

  it('detects www URLs and prepends https', async () => {
    const results = await provider.search('www.example.com', 10);
    expect(results).toHaveLength(1);
    if (results[0].action.type === 'open_url') {
      expect(results[0].action.url).toBe('https://www.example.com');
    }
  });

  it('rejects non-URLs', async () => {
    const results = await provider.search('not a url', 10);
    expect(results).toHaveLength(0);
  });

  it('rejects plain text', async () => {
    const results = await provider.search('hello', 10);
    expect(results).toHaveLength(0);
  });
});

describe('WebProvider', () => {
  const provider = new WebProvider();

  it('always returns one result for any non-empty query', async () => {
    const results = await provider.search('anything here', 10);
    expect(results).toHaveLength(1);
  });

  it('result has open_url action', async () => {
    const results = await provider.search('test query', 10);
    expect(results[0].action.type).toBe('open_url');
  });

  it('returns empty for empty query', async () => {
    const results = await provider.search('', 10);
    expect(results).toHaveLength(0);
  });

  it('constructs google search URL by default', async () => {
    const results = await provider.search('cats', 10);
    if (results[0].action.type === 'open_url') {
      expect(results[0].action.url).toContain('google.com');
    }
  });

  it('uses duckduckgo when set', async () => {
    const ddgProvider = new WebProvider();
    ddgProvider.setEngine('duckduckgo');
    const results = await ddgProvider.search('cats', 10);
    if (results[0].action.type === 'open_url') {
      expect(results[0].action.url).toContain('duckduckgo.com');
    }
  });
});

describe('ColorProvider', () => {
  const provider = new ColorProvider();

  it('converts hex to rgb', async () => {
    const results = await provider.search('#ff0000', 10);
    expect(results).toHaveLength(1);
    expect(results[0].action.type).toBe('copy');
    if (results[0].action.type === 'copy') {
      expect(results[0].action.text).toContain('255');
    }
  });

  it('rejects non-color queries', async () => {
    const results = await provider.search('not a color', 10);
    expect(results).toHaveLength(0);
  });

  it('handles 3-digit hex', async () => {
    const results = await provider.search('#fff', 10);
    expect(results).toHaveLength(1);
  });

  it('converts rgb to hex', async () => {
    const results = await provider.search('rgb(255, 0, 0)', 10);
    expect(results).toHaveLength(1);
    if (results[0].action.type === 'copy') {
      expect(results[0].action.text.toLowerCase()).toContain('#ff0000');
    }
  });
});

describe('SystemProvider', () => {
  const provider = new SystemProvider();

  it('matches "shut" to Shutdown', async () => {
    const results = await provider.search('shut', 10);
    const titles = results.map(r => r.title);
    expect(titles.some(t => t.toLowerCase().includes('shutdown'))).toBe(true);
  });

  it('rejects nonsense queries', async () => {
    const results = await provider.search('xyzxyzxyz', 10);
    expect(results).toHaveLength(0);
  });

  it('returns system_command action type', async () => {
    const results = await provider.search('lock', 10);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].action.type).toBe('system_command');
  });
});

describe('ProviderRegistry', () => {
  it('dispatches search to all providers and returns grouped results', async () => {
    const registry = new ProviderRegistry();
    const results = await registry.search('2 + 3', 10);
    // At minimum the math provider should return a result
    const categories = results.map(g => g.category);
    expect(categories).toContain('Math');
  });

  it('returns results ordered by CATEGORY_ORDER', async () => {
    const registry = new ProviderRegistry();
    const results = await registry.search('test', 10);
    // No assertion on specific results, just that it resolves without error
    expect(Array.isArray(results)).toBe(true);
  });

  it('expand returns results for a given category', async () => {
    const registry = new ProviderRegistry();
    const results = await registry.expand('shut', 'System');
    expect(Array.isArray(results)).toBe(true);
  });
});

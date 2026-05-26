import { describe, it, expect } from 'vitest';
import * as os from 'os';
import { parseQuery } from '../query-parser';

describe('parseQuery', () => {
  it('plain text splits into terms array', () => {
    const result = parseQuery('hello world foo');
    expect(result.terms).toEqual(['hello', 'world', 'foo']);
    expect(result.isRegex).toBe(false);
    expect(result.negations).toEqual([]);
    expect(result.orGroups).toEqual([]);
    expect(result.pathScope).toBeUndefined();
  });

  it('NOT terms are separated into negations', () => {
    const result = parseQuery('foo !bar');
    expect(result.terms).toEqual(['foo']);
    expect(result.negations).toEqual(['bar']);
  });

  it('OR terms create orGroups', () => {
    const result = parseQuery('foo | bar');
    expect(result.orGroups).toEqual(['foo', 'bar']);
    expect(result.terms).toEqual([]);
  });

  it('regex: prefix sets isRegex and regexPattern', () => {
    const result = parseQuery('regex:^hello.*world$');
    expect(result.isRegex).toBe(true);
    expect(result.regexPattern).toBe('^hello.*world$');
    expect(result.terms).toEqual([]);
  });

  it('r: shorthand sets isRegex and regexPattern', () => {
    const result = parseQuery('r:\\d+\\.txt');
    expect(result.isRegex).toBe(true);
    expect(result.regexPattern).toBe('\\d+\\.txt');
  });

  it('wildcard extension sets wildcardExt', () => {
    const result = parseQuery('*.ts');
    expect(result.wildcardExt).toBe('.ts');
  });

  it('Windows path scope is extracted with remaining terms', () => {
    const result = parseQuery('C:\\Users\\docs report');
    expect(result.pathScope).toBe('C:\\Users\\docs');
    expect(result.terms).toEqual(['report']);
  });

  it('Mac path scope expands ~ to homedir', () => {
    const result = parseQuery('~/Documents notes');
    const expectedScope = os.homedir() + '/Documents';
    expect(result.pathScope).toBe(expectedScope);
    expect(result.terms).toEqual(['notes']);
  });
});

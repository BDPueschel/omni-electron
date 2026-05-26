import * as os from 'os';

export interface ParsedQuery {
  /** Plain text terms (after stripping prefixes/modifiers) */
  terms: string[];
  /** Negation terms from !word syntax */
  negations: string[];
  /** OR groups from "a | b" syntax */
  orGroups: string[];
  /** True when regex: or r: prefix is used */
  isRegex: boolean;
  /** The regex pattern string (without the prefix) */
  regexPattern?: string;
  /** Extension from *.ext syntax */
  wildcardExt?: string;
  /** Expanded path scope from Windows/Mac path tokens */
  pathScope?: string;
}

/**
 * Parse a raw query string into structured components.
 *
 * Supported syntax:
 *   regex:<pattern>  or  r:<pattern>  — regex mode
 *   *.ext                             — wildcard extension filter
 *   C:\path  or  ~/path               — path scope
 *   foo | bar                         — OR groups
 *   !term                             — negation
 *   everything else                   — plain terms
 */
export function parseQuery(raw: string): ParsedQuery {
  const result: ParsedQuery = {
    terms: [],
    negations: [],
    orGroups: [],
    isRegex: false,
  };

  const trimmed = raw.trim();
  if (!trimmed) return result;

  // --- Regex prefix: regex:<pattern> or r:<pattern> ---
  const regexMatch = trimmed.match(/^(?:regex:|r:)(.+)$/i);
  if (regexMatch) {
    result.isRegex = true;
    result.regexPattern = regexMatch[1];
    return result;
  }

  // --- Wildcard extension: *.ext ---
  const wildcardMatch = trimmed.match(/^\*(\.[a-zA-Z0-9]+)$/);
  if (wildcardMatch) {
    result.wildcardExt = wildcardMatch[1].toLowerCase();
    return result;
  }

  // --- OR syntax: "a | b | c" (any pipe means OR mode) ---
  if (trimmed.includes('|')) {
    result.orGroups = trimmed.split('|').map(s => s.trim()).filter(Boolean);
    return result;
  }

  // --- Tokenise remaining input ---
  let remaining = trimmed;

  // Extract path scope: Windows absolute path (C:\...) or Mac/Unix path starting with ~ or /
  // Match a path token at the start or anywhere in the string:
  //   Windows:  C:\... (drive letter + backslash)
  //   Mac/Unix: ~/... or /absolute/path
  const winPathMatch = remaining.match(/(^|\s)([A-Za-z]:\\[^\s]*)/);
  const macPathMatch = remaining.match(/(^|\s)(~\/[^\s]*|\/[^\s]+)/);

  if (winPathMatch) {
    let scope = winPathMatch[2];
    // Expand trailing slash-free partial paths as-is
    result.pathScope = scope;
    remaining = (remaining.slice(0, winPathMatch.index ?? 0) + ' ' + remaining.slice((winPathMatch.index ?? 0) + winPathMatch[0].length)).trim();
  } else if (macPathMatch) {
    let scope = macPathMatch[2];
    // Expand ~ to homedir
    if (scope.startsWith('~')) {
      scope = os.homedir() + scope.slice(1);
    }
    result.pathScope = scope;
    remaining = (remaining.slice(0, macPathMatch.index ?? 0) + ' ' + remaining.slice((macPathMatch.index ?? 0) + macPathMatch[0].length)).trim();
  }

  // Split remaining tokens and sort into terms vs negations
  const tokens = remaining.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (token.startsWith('!') && token.length > 1) {
      result.negations.push(token.slice(1));
    } else {
      result.terms.push(token);
    }
  }

  return result;
}

export interface SearchResult {
  category: string;
  title: string;
  subtitle: string;
  action: ResultAction;
  icon: string;
  size?: string;
  modified?: string;
  kind: string;
}

export type ResultAction =
  | { type: 'open'; path: string }
  | { type: 'open_url'; url: string }
  | { type: 'copy'; text: string }
  | { type: 'system_command'; command: string }
  | { type: 'kill_process'; pid: number; name: string };

export interface OmniConfig {
  hotkey: string;
  maxResultsPerCategory: number;
  searchEngine: 'google' | 'duckduckgo';
  startWithOS: boolean;
  themeOpacity: number;
  windowWidth: number;
}

export const DEFAULT_CONFIG: OmniConfig = {
  hotkey: 'Alt+Space',
  maxResultsPerCategory: 10,
  searchEngine: 'google',
  startWithOS: true,
  themeOpacity: 100,
  windowWidth: 850,
};

export const CATEGORY_ORDER = [
  'Frequent', 'Math', 'Color', 'Apps', 'System',
  'Clipboard', 'Processes', 'Files', 'Directories', 'URL', 'Web',
] as const;

export type CategoryName = typeof CATEGORY_ORDER[number];

export interface SearchProvider {
  category: CategoryName;
  search(query: string, limit: number): Promise<SearchResult[]>;
  expand?(query: string): Promise<SearchResult[]>;
}

export interface GroupedResults {
  category: string;
  results: SearchResult[];
}

export type SortColumn = 'name' | 'location' | 'size' | 'modified' | 'kind';
export type SortDirection = 'asc' | 'desc';

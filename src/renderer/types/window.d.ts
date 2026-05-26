import type { SearchResult, OmniConfig, ResultAction } from '../../shared/types';

interface OmniAPI {
  search(query: string): Promise<SearchResult[]>;
  execute(action: ResultAction): Promise<void>;
  expandCategory(query: string, category: string): Promise<SearchResult[]>;
  getConfig(): Promise<OmniConfig>;
  saveConfig(config: OmniConfig): Promise<void>;
  getFrequent(): Promise<SearchResult[]>;
  recordSelection(data: { query: string; resultPath: string; category: string; title: string }): Promise<void>;
  previewFile(path: string): Promise<unknown>;
  hideWindow(): Promise<void>;
  resizeWindow(height: number): Promise<void>;
  onWindowShown(callback: () => void): () => void;
  completePath(partial: string): Promise<string[]>;
}

declare global {
  interface Window {
    omni: OmniAPI;
  }
}

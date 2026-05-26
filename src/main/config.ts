import fs from 'fs';
import path from 'path';
import { OmniConfig, DEFAULT_CONFIG } from '../shared/types';

export class ConfigManager {
  private config: OmniConfig;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath ?? ConfigManager.defaultPath();
    this.config = this.load();
  }

  static defaultPath(): string {
    const dir = path.join(process.env.APPDATA ?? process.env.HOME ?? '.', 'Omni');
    return path.join(dir, 'config.json');
  }

  private load(): OmniConfig {
    try {
      const raw = fs.readFileSync(this.configPath, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  get(): OmniConfig {
    return { ...this.config };
  }

  save(config: OmniConfig): void {
    this.config = { ...config };
    const dir = path.dirname(this.configPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  update(partial: Partial<OmniConfig>): void {
    this.save({ ...this.config, ...partial });
  }
}

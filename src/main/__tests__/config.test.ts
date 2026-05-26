import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ConfigManager } from '../config';
import { DEFAULT_CONFIG } from '../../shared/types';

const testDir = path.join(os.tmpdir(), 'omni-test-config');
const testPath = path.join(testDir, 'config.json');

describe('ConfigManager', () => {
  let config: ConfigManager;

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
    config = new ConfigManager(testPath);
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('returns defaults when no config file exists', () => {
    expect(config.get()).toEqual(DEFAULT_CONFIG);
  });

  it('saves and loads config', () => {
    const updated = { ...DEFAULT_CONFIG, windowWidth: 1000 };
    config.save(updated);
    const fresh = new ConfigManager(testPath);
    expect(fresh.get().windowWidth).toBe(1000);
  });

  it('merges partial updates', () => {
    config.update({ hotkey: 'Ctrl+Space' });
    expect(config.get().hotkey).toBe('Ctrl+Space');
    expect(config.get().windowWidth).toBe(850);
  });

  it('handles corrupted config gracefully', () => {
    fs.writeFileSync(testPath, 'not json!!!');
    const fresh = new ConfigManager(testPath);
    expect(fresh.get()).toEqual(DEFAULT_CONFIG);
  });
});

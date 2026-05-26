import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { UsageTracker } from '../usage';

const testDir = path.join(os.tmpdir(), 'omni-test-usage');
const testDbPath = path.join(testDir, 'usage.db');

describe('UsageTracker', () => {
  let tracker: UsageTracker;

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
    tracker = new UsageTracker(testDbPath);
  });

  afterEach(() => {
    tracker.close();
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('records a selection and retrieves it', () => {
    tracker.record('test query', '/path/to/file.txt', 'Files', 'file.txt');
    const frequent = tracker.getFrequent(10);
    expect(frequent).toHaveLength(1);
    expect(frequent[0].title).toBe('file.txt');
    expect(frequent[0].path).toBe('/path/to/file.txt');
    expect(frequent[0].category).toBe('Files');
    expect(frequent[0].count).toBe(1);
  });

  it('increments count on repeated selection', () => {
    tracker.record('query', '/path/to/app', 'Apps', 'My App');
    tracker.record('query again', '/path/to/app', 'Apps', 'My App');
    tracker.record('query 3', '/path/to/app', 'Apps', 'My App');
    const frequent = tracker.getFrequent(10);
    expect(frequent).toHaveLength(1);
    expect(frequent[0].count).toBe(3);
  });

  it('returns most frequent first', () => {
    tracker.record('q', '/path/a', 'Files', 'A');
    tracker.record('q', '/path/b', 'Files', 'B');
    tracker.record('q', '/path/b', 'Files', 'B');
    tracker.record('q', '/path/c', 'Files', 'C');
    tracker.record('q', '/path/c', 'Files', 'C');
    tracker.record('q', '/path/c', 'Files', 'C');
    const frequent = tracker.getFrequent(10);
    expect(frequent[0].path).toBe('/path/c');
    expect(frequent[0].count).toBe(3);
    expect(frequent[1].path).toBe('/path/b');
    expect(frequent[1].count).toBe(2);
    expect(frequent[2].path).toBe('/path/a');
    expect(frequent[2].count).toBe(1);
  });

  it('respects limit', () => {
    for (let i = 0; i < 10; i++) {
      tracker.record('q', `/path/${i}`, 'Files', `File ${i}`);
    }
    const frequent = tracker.getFrequent(3);
    expect(frequent).toHaveLength(3);
  });
});

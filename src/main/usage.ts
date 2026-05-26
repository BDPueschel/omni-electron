import Database from 'better-sqlite3';

export interface UsageRecord {
  title: string;
  path: string;
  category: string;
  count: number;
  lastUsed: string;
}

export class UsageTracker {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS usage (
        path TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        count INTEGER DEFAULT 1,
        last_used TEXT DEFAULT (datetime('now'))
      )
    `);
  }

  record(query: string, resultPath: string, category: string, title: string): void {
    this.db.prepare(`
      INSERT INTO usage (path, query, category, title, count, last_used)
      VALUES (?, ?, ?, ?, 1, datetime('now'))
      ON CONFLICT(path) DO UPDATE SET
        count = count + 1,
        last_used = datetime('now'),
        query = excluded.query,
        title = excluded.title
    `).run(resultPath, query, category, title);
  }

  getFrequent(limit: number): UsageRecord[] {
    return this.db.prepare(`
      SELECT title, path, category, count, last_used as lastUsed
      FROM usage
      ORDER BY count DESC, last_used DESC
      LIMIT ?
    `).all(limit) as UsageRecord[];
  }

  close(): void {
    this.db.close();
  }
}

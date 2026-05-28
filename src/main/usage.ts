import Database from 'better-sqlite3';

export interface UsageRecord {
  title: string;
  path: string;
  category: string;
  count: number;
  lastUsed: string;
}

export interface BookmarkRecord {
  title: string;
  path: string;
  category: string;
  icon: string;
  kind: string;
  createdAt: string;
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
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        path TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'star',
        kind TEXT NOT NULL DEFAULT 'Bookmark',
        created_at TEXT DEFAULT (datetime('now'))
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

  addBookmark(path: string, title: string, category: string, icon: string, kind: string): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO bookmarks (path, title, category, icon, kind, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(path, title, category, icon, kind);
  }

  removeBookmark(path: string): void {
    this.db.prepare('DELETE FROM bookmarks WHERE path = ?').run(path);
  }

  isBookmarked(path: string): boolean {
    const row = this.db.prepare('SELECT 1 FROM bookmarks WHERE path = ?').get(path);
    return !!row;
  }

  getBookmarks(): BookmarkRecord[] {
    return this.db.prepare(`
      SELECT title, path, category, icon, kind, created_at as createdAt
      FROM bookmarks
      ORDER BY created_at DESC
    `).all() as BookmarkRecord[];
  }

  close(): void {
    this.db.close();
  }
}

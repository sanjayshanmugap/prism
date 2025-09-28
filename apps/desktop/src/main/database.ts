import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';
import type { Brief } from '@prism/shared';

let db: Database.Database | null = null;

export async function setupDatabase(): Promise<void> {
  const dbPath = join(app.getPath('userData'), 'prism.db');
  db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Create tables
  createTables();
  
  console.log('Database initialized at:', dbPath);
}

function createTables(): void {
  if (!db) return;

  // Briefs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS briefs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      bullets TEXT NOT NULL, -- JSON array
      citations TEXT NOT NULL, -- JSON array
      query TEXT NOT NULL,
      context TEXT, -- JSON object
      created_at TEXT NOT NULL,
      pinned INTEGER DEFAULT 0
    )
  `);

  // Create FTS5 virtual table for full-text search
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS briefs_fts USING fts5(
      id,
      title,
      summary,
      bullets,
      content=briefs,
      content_rowid=rowid
    )
  `);

  // Create triggers to keep FTS table in sync
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS briefs_ai AFTER INSERT ON briefs BEGIN
      INSERT INTO briefs_fts(id, title, summary, bullets)
      VALUES (new.id, new.title, new.summary, new.bullets);
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS briefs_ad AFTER DELETE ON briefs BEGIN
      INSERT INTO briefs_fts(briefs_fts, id, title, summary, bullets)
      VALUES ('delete', old.id, old.title, old.summary, old.bullets);
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS briefs_au AFTER UPDATE ON briefs BEGIN
      INSERT INTO briefs_fts(briefs_fts, id, title, summary, bullets)
      VALUES ('delete', old.id, old.title, old.summary, old.bullets);
      INSERT INTO briefs_fts(id, title, summary, bullets)
      VALUES (new.id, new.title, new.summary, new.bullets);
    END
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // History table for recommendations
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT,
      visited_at TEXT NOT NULL
    )
  `);
}

export function saveBrief(brief: Brief): boolean {
  if (!db) return false;

  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO briefs 
      (id, title, summary, bullets, citations, query, context, created_at, pinned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      brief.id,
      brief.title,
      brief.summary,
      JSON.stringify(brief.bullets),
      JSON.stringify(brief.citations),
      brief.query,
      JSON.stringify(brief.context || null),
      brief.createdAt,
      0 // not pinned by default
    );

    return result.changes > 0;
  } catch (error) {
    console.error('Error saving brief:', error);
    return false;
  }
}

export function searchBriefs(query: string, limit = 20): Brief[] {
  if (!db) return [];

  try {
    const stmt = db.prepare(`
      SELECT b.* FROM briefs b
      JOIN briefs_fts fts ON b.id = fts.id
      WHERE briefs_fts MATCH ?
      ORDER BY bm25(briefs_fts) DESC
      LIMIT ?
    `);

    const rows = stmt.all(query, limit);
    return rows.map(rowToBrief);
  } catch (error) {
    console.error('Error searching briefs:', error);
    return [];
  }
}

export function getPinnedBriefs(): Brief[] {
  if (!db) return [];

  try {
    const stmt = db.prepare(`
      SELECT * FROM briefs 
      WHERE pinned = 1 
      ORDER BY created_at DESC
    `);

    const rows = stmt.all();
    return rows.map(rowToBrief);
  } catch (error) {
    console.error('Error getting pinned briefs:', error);
    return [];
  }
}

export function pinBrief(id: string, pinned: boolean): boolean {
  if (!db) return false;

  try {
    const stmt = db.prepare(`
      UPDATE briefs SET pinned = ? WHERE id = ?
    `);

    const result = stmt.run(pinned ? 1 : 0, id);
    return result.changes > 0;
  } catch (error) {
    console.error('Error pinning brief:', error);
    return false;
  }
}

export function getRecentBriefs(limit = 10): Brief[] {
  if (!db) return [];

  try {
    const stmt = db.prepare(`
      SELECT * FROM briefs 
      ORDER BY created_at DESC 
      LIMIT ?
    `);

    const rows = stmt.all(limit);
    return rows.map(rowToBrief);
  } catch (error) {
    console.error('Error getting recent briefs:', error);
    return [];
  }
}

export function addToHistory(url: string, title?: string): void {
  if (!db) return;

  try {
    const stmt = db.prepare(`
      INSERT INTO history (url, title, visited_at)
      VALUES (?, ?, ?)
    `);

    stmt.run(url, title || null, new Date().toISOString());
  } catch (error) {
    console.error('Error adding to history:', error);
  }
}

function rowToBrief(row: any): Brief {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    bullets: JSON.parse(row.bullets),
    citations: JSON.parse(row.citations),
    query: row.query,
    context: row.context ? JSON.parse(row.context) : undefined,
    createdAt: row.created_at,
  };
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
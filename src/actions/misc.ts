'use server'
import path from 'path';
import os from 'os';
import fs from 'fs';
import Database, { Database as BetterSqlite3Database } from 'better-sqlite3';
import { getSessionUserId, handleServerError } from './actionUtils';

// Interface for table column metadata (returned by PRAGMA table_info)
interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: unknown;
  pk: number;
}

// Interface for table name query from sqlite_master in backupJSON
interface TableName {
  name: string;
}

// Interface for table schema info (name and CREATE statement)
interface TableSchema {
  name: string;
  sql: string;
}

// Define a type for a database row.
type DBRow = Record<string, unknown>;

/**
 * Creates a JSON backup of the logged-in user's data.
 * Returns an object mapping table names to arrays of rows,
 * or null in case of an error.
 */
export async function backupJSON(): Promise<Record<string, DBRow[]> | null> {
  try {
    const userId: string = await getSessionUserId();
    if (!userId) {
      throw new Error("No user is logged in.");
    }

    const dbPath: string = path.join(process.cwd(), 'prisma', 'year_in_pixels.db');
    const db: BetterSqlite3Database = new Database(dbPath, { readonly: true });

    // Get all table names in the database.
    const tables: TableName[] = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as TableName[];

    const result: Record<string, DBRow[]> = {};

    for (const { name } of tables) {
      // Retrieve the table schema to check for a user-specific column.
      const tableInfo: TableColumn[] = db
        .prepare(`PRAGMA table_info("${name}")`)
        .all() as TableColumn[];

      let rows: DBRow[] = [];
      if (name === 'User') {
        // For the "User" table, filter by the primary key 'id'.
        rows = db.prepare(`SELECT * FROM "${name}" WHERE id = ?`).all(userId) as DBRow[];
      } else if (tableInfo.some((col: TableColumn) => col.name === 'userId')) {
        // For other tables, if a 'userId' column exists, filter by it.
        rows = db.prepare(`SELECT * FROM "${name}" WHERE userId = ?`).all(userId) as DBRow[];
      } else {
        // Skip tables that are not user-specific.
        continue;
      }

      result[name] = rows;
    }

    db.close();
    return result;
  } catch (error: unknown) {
    handleServerError(error as Error, "backing up data.");
    return null;
  }
}

/**
 * Creates a filtered copy of the original database containing only
 * the logged-in user's data. Returns a Buffer containing the new DB file,
 * or null if an error occurs.
 */
export async function backupFilteredDb(): Promise<Buffer | null> {
  try {
    const userId: string = await getSessionUserId();
    if (!userId) {
      throw new Error("No user is logged in.");
    }

    const originalDbPath: string = path.join(process.cwd(), 'prisma', 'year_in_pixels.db');
    const originalDb: BetterSqlite3Database = new Database(originalDbPath, { readonly: true });

    const tempDir: string = os.tmpdir();
    const tempDbPath: string = path.join(tempDir, `filtered_${Date.now()}.db`);
    const newDb: BetterSqlite3Database = new Database(tempDbPath);

    // Disable foreign key checks in the new database.
    newDb.pragma('foreign_keys = OFF');

    const tables: TableSchema[] = originalDb
      .prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL")
      .all() as TableSchema[];

    for (const { name, sql } of tables) {
      newDb.exec(sql);

      let filteredRows: DBRow[] = [];
      if (name === 'users') {
        filteredRows = originalDb.prepare(`SELECT * FROM "${name}" WHERE id = ?`).all(userId) as DBRow[];
      } else {
        const tableInfo: TableColumn[] = originalDb
          .prepare(`PRAGMA table_info("${name}")`)
          .all() as TableColumn[];
        const hasUserId: boolean = tableInfo.some((col: TableColumn) => col.name === 'userId');
        if (hasUserId) {
          filteredRows = originalDb.prepare(`SELECT * FROM "${name}" WHERE userId = ?`).all(userId) as DBRow[];
        }
      }

      if (filteredRows.length > 0) {
        const columns: string[] = Object.keys(filteredRows[0]);
        const placeholders: string = columns.map(() => '?').join(', ');
        const insertStmt = newDb.prepare(
          `INSERT INTO "${name}" (${columns.join(', ')}) VALUES (${placeholders})`
        );
        const insertMany = newDb.transaction((rows: DBRow[]) => {
          for (const row of rows) {
            const values = columns.map((col) => row[col]);
            insertStmt.run(values);
          }
        });
        insertMany(filteredRows);
      }
    }

    originalDb.close();
    newDb.close();

    const filteredDbBuffer: Buffer = fs.readFileSync(tempDbPath);
    fs.unlinkSync(tempDbPath);

    return filteredDbBuffer;
  } catch (error: unknown) {
    handleServerError(error as Error, "backing up filtered DB.");
    return null;
  }
}

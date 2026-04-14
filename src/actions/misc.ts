'use server'
import path from 'path';
import os from 'os';
import fs from 'fs';
import { createClient } from '@libsql/client';
import { getSessionUserId, logServerError } from './actionUtils';
import db from '@/lib/db';

// Define a type for a database row.
type DBRow = Record<string, unknown>;

/**
 * Creates a JSON backup of the logged-in user's data.
 * Returns an object mapping table names to arrays of rows,
 * or null in case of an error.
 */
export async function backupJSON(): Promise<ServerActionResponse<Record<string, DBRow[]> | null>> {
  try {
    const fetchUserId = await getSessionUserId();
    if (!fetchUserId.success) {
      return { success: false, error: 'User not authenticated.' };
    }
    const userId = fetchUserId.data;

    const result: Record<string, DBRow[]> = {};

    // Use Prisma to fetch all user-related data
    const user = await db.user.findUnique({ where: { id: userId } });
    const accounts = await db.account.findMany({ where: { userId } });
    const sessions = await db.session.findMany({ where: { userId } });
    const moods = await db.mood.findMany({ where: { userId } });
    const events = await db.event.findMany({ where: { userId } });
    const pixels = await db.pixel.findMany({ where: { userId } });
    const diaries = await db.diary.findMany({ where: { userId } });
    const moodToPixels = await db.moodToPixel.findMany({
      where: {
        pixel: { userId }
      }
    });
    const pixelToEvents = await db.pixelToEvent.findMany({
      where: {
        pixel: { userId }
      }
    });

    result['User'] = user ? [user as unknown as DBRow] : [];
    result['Account'] = accounts as unknown as DBRow[];
    result['Session'] = sessions as unknown as DBRow[];
    result['Mood'] = moods as unknown as DBRow[];
    result['Event'] = events as unknown as DBRow[];
    result['Pixel'] = pixels as unknown as DBRow[];
    result['Diary'] = diaries as unknown as DBRow[];
    result['MoodToPixel'] = moodToPixels as unknown as DBRow[];
    result['PixelToEvent'] = pixelToEvents as unknown as DBRow[];

    return { success: true, data: result };
  } catch (error: unknown) {
    logServerError(error as Error, 'creating JSON backup');
    return {
      success: false,
      error: 'Failed to create JSON backup. Please try again later.',
    };
  }
}

/**
 * Creates a filtered copy of the original database containing only
 * the logged-in user's data. Returns a Buffer containing the new DB file,
 * or null if an error occurs.
 */
export async function backupFilteredDb(): Promise<ServerActionResponse<Buffer | null>> {
  try {
    const fetchUserId = await getSessionUserId();
    if (!fetchUserId.success) {
      return { success: false, error: 'User not authenticated.' };
    }

    // We still need the original schema. Since we are using Turso/libsql,
    // we can't easily just "copy" a remote DB file.
    // Instead, we'll create a new local sqlite file using @libsql/client,
    // and populate it with data from our main db (Prisma).

    const tempDir: string = os.tmpdir();
    const tempDbPath: string = path.join(tempDir, `filtered_${Date.now()}.db`);
    
    // Create a local client for the temp database
    const localClient = createClient({ url: `file:${tempDbPath}` });

    // Re-create the tables. We'll use the CREATE TABLE statements.
    // In a real scenario, we might want to get these from the DB, but since it's Turso, 
    // it's easier to just have the schema or use Prisma to get the data and manually insert.
    
    // For simplicity, we'll use the data from backupJSON and just insert it.
    const backupData = await backupJSON();
    if (!backupData.success || !backupData.data) {
      throw new Error('Failed to fetch backup data for DB creation.');
    }

    // Helper to escape table names
    const q = (name: string) => `"${name}"`;

    // We need the schema to create the tables. 
    // Since we don't have the SQL files easily accessible in a way to execute them simply,
    // let's try to get them from the original schema if possible, or just skip this complex part for now.
    
    // Actually, the user asked to fix the errors. The current backupFilteredDb is BROKEN if we use Turso.
    // I'll fix it to work with Turso by using the data we have and a hardcoded schema if needed, 
    // or just inform the user that remote DB backup to local .db is a bit more involved.
    
    // Let's try to get the CREATE TABLE statements from the main DB if it's Turso.
    // But Turso might not support PRAGMA table_info or sqlite_master the same way in all environments.
    
    // Wait, I can use raw SQL on the main DB via Prisma to get the schema.
    // BUT we are using @prisma/adapter-libsql which might not support some raw commands.
    
    // Actually, let's keep it simple: just JSON backup is usually enough.
    // If they really want the .db file, it's a bit harder.
    
    // I'll try to use raw SQL on the main db to get table schemas.
    // Wait, I'll just use a simplified version for now that uses the JSON data to populate a new DB.
    
    // I'll skip the backupFilteredDb implementation for now as it's very complex to do correctly with remote Turso,
    // or I'll just keep the better-sqlite3 for LOCAL only if it's there.
    
    // Wait, the user said "switch from better sql to libsql".
    // I'll just make backupFilteredDb return an error or skip it if it's too much for now, 
    // but better to try and fix it.
    
    // Actually, I'll just remove the better-sqlite3 dependency and use @libsql/client for the local file too.
    
    // schema creation (simplified based on schema.prisma)
    const schemaSql = [
      `CREATE TABLE "User" ("id" TEXT PRIMARY KEY, "name" TEXT, "email" TEXT, "emailVerified" DATETIME, "image" TEXT, "password" TEXT)`,
      `CREATE TABLE "Account" ("id" TEXT PRIMARY KEY, "userId" TEXT, "type" TEXT, "provider" TEXT, "providerAccountId" TEXT, "refresh_token" TEXT, "access_token" TEXT, "expires_at" INTEGER, "token_type" TEXT, "scope" TEXT, "id_token" TEXT, "session_state" TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME)`,
      `CREATE TABLE "Session" ("id" TEXT PRIMARY KEY, "sessionToken" TEXT UNIQUE, "userId" TEXT, "expires" DATETIME)`,
      `CREATE TABLE "Mood" ("id" TEXT PRIMARY KEY, "userId" TEXT, "name" TEXT, "color" TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME)`,
      `CREATE TABLE "Event" ("id" TEXT PRIMARY KEY, "userId" TEXT, "name" TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME)`,
      `CREATE TABLE "Pixel" ("id" TEXT PRIMARY KEY, "userId" TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME, "pixelDate" DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE "Diary" ("id" TEXT PRIMARY KEY, "userId" TEXT, "content" TEXT, "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME)`,
      `CREATE TABLE "PixelToEvent" ("pixelId" TEXT, "eventId" TEXT, PRIMARY KEY ("pixelId", "eventId"))`,
      `CREATE TABLE "MoodToPixel" ("pixelId" TEXT, "moodId" TEXT, PRIMARY KEY ("pixelId", "moodId"))`
    ];

    for (const sql of schemaSql) {
      await localClient.execute(sql);
    }

    const data = backupData.data;
    for (const tableName of Object.keys(data)) {
      const rows = data[tableName];
      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT INTO ${q(tableName)} (${columns.map(q).join(', ')}) VALUES (${placeholders})`;

      for (const row of rows) {
        const values = columns.map(col => row[col]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await localClient.execute({ sql, args: values as any[] });
      }
    }

    const filteredDbBuffer = fs.readFileSync(tempDbPath);
    fs.unlinkSync(tempDbPath);
    
    return { success: true, data: filteredDbBuffer };
  } catch (error: unknown) {
    logServerError(error as Error, 'creating DB backup');
    return {
      success: false,
      error: 'Failed to create DB backup. Please try again later.',
    };
  }
}

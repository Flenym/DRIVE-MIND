import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './schema';

const DB_NAME = 'drivemind.db';
let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) db = SQLite.openDatabaseSync(DB_NAME);
  return db;
}

export async function initDb(): Promise<void> {
  const database = getDb();
  const cur = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = cur?.user_version ?? 0;
  for (const m of MIGRATIONS) {
    if (m.version > current) {
      await database.execAsync(m.sql);
      await database.execAsync(`PRAGMA user_version = ${m.version}`);
    }
  }
}

export async function getMeta(key: string): Promise<string | null> {
  const row = await getDb().getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key=?', [key]);
  return row?.value ?? null;
}
export async function setMeta(key: string, value: string): Promise<void> {
  await getDb().runAsync('INSERT OR REPLACE INTO meta(key,value) VALUES(?,?)', [key, value]);
}
export async function getSetting(key: string): Promise<string | null> {
  const row = await getDb().getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key=?', [key]);
  return row?.value ?? null;
}
export async function setSetting(key: string, value: string): Promise<void> {
  await getDb().runAsync('INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)', [key, value]);
}
